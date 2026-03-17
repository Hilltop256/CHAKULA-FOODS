import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, paginate } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { CustomMealStatus } from '@prisma/client';

export async function submitCustomMealOrder(req: Request, res: Response) {
  const { title, description, servings, eventDate, budget, notes, imageUrls } = req.body;

  const order = await prisma.customisedMealOrder.create({
    data: {
      userId: req.user!.userId,
      title,
      description,
      servings: servings || 1,
      eventDate: eventDate ? new Date(eventDate) : null,
      budget,
      notes,
      imageUrls: imageUrls || [],
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return sendSuccess(res, order, 'Custom meal order submitted', 201);
}

export async function getMyCustomMealOrders(req: Request, res: Response) {
  const orders = await prisma.customisedMealOrder.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  return sendSuccess(res, orders);
}

export async function getCustomMealOrderById(req: Request, res: Response) {
  const order = await prisma.customisedMealOrder.findFirst({
    where: {
      id: req.params.id,
      ...(req.user!.role !== 'ADMIN' && req.user!.role !== 'STAFF'
        ? { userId: req.user!.userId }
        : {}),
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!order) throw new AppError('Custom meal order not found', 404);
  return sendSuccess(res, order);
}

export async function updateCustomMealStatus(req: Request, res: Response) {
  const { status, quotedPrice, adminNotes } = req.body;

  const order = await prisma.customisedMealOrder.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(quotedPrice !== undefined && { quotedPrice }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return sendSuccess(res, order, 'Custom meal order updated');
}

export async function getAllCustomMealOrders(req: Request, res: Response) {
  const { page = '1', limit = '20', status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const { skip, take } = paginate(pageNum, limitNum);

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.customisedMealOrder.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.customisedMealOrder.count({ where }),
  ]);

  return sendSuccess(res, orders, 'Custom meal orders fetched', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function acceptQuote(req: Request, res: Response) {
  const order = await prisma.customisedMealOrder.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!order) throw new AppError('Custom meal order not found', 404);
  if (order.status !== CustomMealStatus.QUOTED) {
    throw new AppError('No quote to accept', 400);
  }

  const updated = await prisma.customisedMealOrder.update({
    where: { id: req.params.id },
    data: { status: CustomMealStatus.ACCEPTED },
  });
  return sendSuccess(res, updated, 'Quote accepted');
}
