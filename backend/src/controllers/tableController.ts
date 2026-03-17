import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { TableStatus, ReservationStatus } from '@prisma/client';
import { generateConfirmationCode } from '../utils/response';

// ===== TABLES =====

export async function getTables(req: Request, res: Response) {
  const { status, location } = req.query;
  const tables = await prisma.table.findMany({
    where: {
      isActive: true,
      ...(status && { status: status as TableStatus }),
      ...(location && { location: { contains: location as string, mode: 'insensitive' } }),
    },
    include: {
      _count: {
        select: {
          reservations: { where: { status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] } } },
        },
      },
    },
    orderBy: { number: 'asc' },
  });
  return sendSuccess(res, tables);
}

export async function createTable(req: Request, res: Response) {
  const { number, capacity, location } = req.body;
  const table = await prisma.table.create({ data: { number, capacity, location } });
  return sendSuccess(res, table, 'Table created', 201);
}

export async function updateTable(req: Request, res: Response) {
  const table = await prisma.table.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return sendSuccess(res, table, 'Table updated');
}

export async function updateTableStatus(req: Request, res: Response) {
  const { status } = req.body;
  const table = await prisma.table.update({
    where: { id: req.params.id },
    data: { status },
  });
  return sendSuccess(res, table, 'Table status updated');
}

// ===== RESERVATIONS =====

export async function getAvailableTables(req: Request, res: Response) {
  const { date, partySize } = req.query;
  if (!date || !partySize) throw new AppError('date and partySize are required', 400);

  const reservationDate = new Date(date as string);
  const startOfDay = new Date(reservationDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(reservationDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Find tables with reservations on this date
  const reservedTableIds = await prisma.reservation.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
    },
    select: { tableId: true },
  });

  const reservedIds = reservedTableIds.map((r) => r.tableId);

  const tables = await prisma.table.findMany({
    where: {
      isActive: true,
      status: TableStatus.AVAILABLE,
      capacity: { gte: parseInt(partySize as string, 10) },
      id: { notIn: reservedIds },
    },
    orderBy: { capacity: 'asc' },
  });

  return sendSuccess(res, tables);
}

export async function createReservation(req: Request, res: Response) {
  const { tableId, date, partySize, specialNotes, occasion } = req.body;

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table || !table.isActive) throw new AppError('Table not found', 404);
  if (table.capacity < partySize) throw new AppError('Table capacity insufficient for party size', 400);

  const reservationDate = new Date(date);
  const startOfDay = new Date(reservationDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(reservationDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Check for conflicts
  const conflict = await prisma.reservation.findFirst({
    where: {
      tableId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
    },
  });
  if (conflict) throw new AppError('Table is already reserved for this date', 409);

  const reservation = await prisma.reservation.create({
    data: {
      userId: req.user!.userId,
      tableId,
      date: reservationDate,
      partySize,
      specialNotes,
      occasion,
      confirmationCode: generateConfirmationCode(),
    },
    include: { table: true },
  });

  return sendSuccess(res, reservation, 'Reservation created', 201);
}

export async function getMyReservations(req: Request, res: Response) {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user!.userId },
    include: { table: true },
    orderBy: { date: 'desc' },
  });
  return sendSuccess(res, reservations);
}

export async function getReservationById(req: Request, res: Response) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: req.params.id,
      ...(req.user!.role !== 'ADMIN' && req.user!.role !== 'STAFF'
        ? { userId: req.user!.userId }
        : {}),
    },
    include: {
      table: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!reservation) throw new AppError('Reservation not found', 404);
  return sendSuccess(res, reservation);
}

export async function updateReservationStatus(req: Request, res: Response) {
  const { status } = req.body;
  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status },
    include: { table: true, user: { select: { id: true, name: true, email: true } } },
  });
  return sendSuccess(res, reservation, 'Reservation updated');
}

export async function cancelReservation(req: Request, res: Response) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!reservation) throw new AppError('Reservation not found', 404);
  if (reservation.status === ReservationStatus.CANCELLED) {
    throw new AppError('Reservation already cancelled', 400);
  }

  const updated = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status: ReservationStatus.CANCELLED },
  });
  return sendSuccess(res, updated, 'Reservation cancelled');
}

// Admin: Get all reservations
export async function getAllReservations(req: Request, res: Response) {
  const { date, status } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (date) {
    const d = new Date(date as string);
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      table: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { date: 'asc' },
  });
  return sendSuccess(res, reservations);
}
