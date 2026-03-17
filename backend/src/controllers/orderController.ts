import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { generateOrderNumber, paginate } from '../utils/response';
import { OrderStatus, OrderType, Role } from '@prisma/client';

export async function createOrder(req: Request, res: Response) {
  const {
    type,
    items,
    notes,
    deliveryAddress,
    deliveryCity,
    deliveryPhone,
    tableId,
  } = req.body;

  if (!items || items.length === 0) throw new AppError('Order must have at least one item', 400);

  // Validate products and calculate totals
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isAvailable: true },
    include: { addons: true },
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products are unavailable', 400);
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;

  const orderItems = items.map((item: any) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = parseFloat(product.price.toString());
    const addonTotal = (item.addonIds || []).reduce((sum: number, addonId: string) => {
      const addon = product.addons.find((a) => a.id === addonId);
      return sum + (addon ? parseFloat(addon.price.toString()) : 0);
    }, 0);
    const itemTotal = (unitPrice + addonTotal) * item.quantity;
    subtotal += itemTotal;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: unitPrice + addonTotal,
      subtotal: itemTotal,
      notes: item.notes,
      addons: item.addonIds || [],
    };
  });

  const deliveryFee = type === OrderType.DELIVERY ? 150 : 0; // KES 150 delivery
  const total = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: req.user!.userId,
      type,
      status: OrderStatus.PENDING,
      subtotal,
      deliveryFee,
      total,
      notes,
      deliveryAddress,
      deliveryCity,
      deliveryPhone,
      tableId,
      items: {
        create: orderItems.map((oi: any) => ({
          productId: oi.productId,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
          subtotal: oi.subtotal,
          notes: oi.notes,
          addons: {
            create: oi.addons.map((addonId: string) => {
              const product = productMap.get(oi.productId)!;
              const addon = product.addons.find((a) => a.id === addonId)!;
              return { addonId, name: addon.name, price: addon.price };
            }),
          },
        })),
      },
      statusHistory: {
        create: { status: OrderStatus.PENDING, note: 'Order placed' },
      },
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
          addons: true,
        },
      },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  // Clear cart after successful order
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });

  return sendSuccess(res, order, 'Order placed successfully', 201);
}

export async function getMyOrders(req: Request, res: Response) {
  const { page = '1', limit = '10', status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const { skip, take } = paginate(pageNum, limitNum);

  const where: any = { userId: req.user!.userId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return sendSuccess(res, orders, 'Orders fetched', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function getOrderById(req: Request, res: Response) {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      ...(req.user!.role !== 'ADMIN' && req.user!.role !== 'STAFF'
        ? { userId: req.user!.userId }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true, price: true } },
          addons: true,
        },
      },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      table: true,
    },
  });
  if (!order) throw new AppError('Order not found', 404);
  return sendSuccess(res, order);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { status, note } = req.body;
  const { id } = req.params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError('Order not found', 404);

  // Status transition validation
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    PREPARING: [OrderStatus.READY],
    READY: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED],
    OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
    DELIVERED: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
    COMPLETED: [],
    CANCELLED: [OrderStatus.REFUNDED],
    REFUNDED: [],
  };

  if (!allowedTransitions[order.status].includes(status)) {
    throw new AppError(`Cannot transition from ${order.status} to ${status}`, 400);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
      statusHistory: {
        create: { status, note: note || `Order ${status.toLowerCase()}` },
      },
    },
    include: {
      items: { include: { product: { select: { id: true, name: true } } } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  return sendSuccess(res, updated, 'Order status updated');
}

// Admin: get all orders
export async function getAllOrders(req: Request, res: Response) {
  const { page = '1', limit = '20', status, type, search } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const { skip, take } = paginate(pageNum, limitNum);

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string, mode: 'insensitive' } },
      { user: { name: { contains: search as string, mode: 'insensitive' } } },
      { user: { email: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return sendSuccess(res, orders, 'Orders fetched', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function cancelOrder(req: Request, res: Response) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!order) throw new AppError('Order not found', 404);

  if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: OrderStatus.CANCELLED,
      statusHistory: { create: { status: OrderStatus.CANCELLED, note: 'Cancelled by customer' } },
    },
  });

  return sendSuccess(res, updated, 'Order cancelled');
}
