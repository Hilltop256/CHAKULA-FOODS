import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { OrderStatus, SubscriptionStatus } from '@prisma/client';

export async function getDashboardStats(req: Request, res: Response) {
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

  const [
    totalUsers,
    newUsersToday,
    totalOrders,
    ordersToday,
    pendingOrders,
    activeSubscriptions,
    revenueThisMonth,
    revenueLastMonth,
    popularProducts,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfToday } } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] } } }),
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  // Enrich popular products with product names
  const productIds = popularProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, imageUrl: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const enrichedPopular = popularProducts.map((p) => ({
    ...p,
    product: productMap.get(p.productId),
  }));

  const revenueThisMonthVal = parseFloat(revenueThisMonth._sum.total?.toString() || '0');
  const revenueLastMonthVal = parseFloat(revenueLastMonth._sum.total?.toString() || '0');
  const revenueGrowth =
    revenueLastMonthVal > 0
      ? (((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100).toFixed(1)
      : '0';

  return sendSuccess(res, {
    users: { total: totalUsers, newToday: newUsersToday },
    orders: {
      total: totalOrders,
      today: ordersToday,
      pending: pendingOrders,
      byStatus: ordersByStatus,
    },
    subscriptions: { active: activeSubscriptions },
    revenue: {
      thisMonth: revenueThisMonthVal,
      lastMonth: revenueLastMonthVal,
      growth: revenueGrowth,
    },
    popularProducts: enrichedPopular,
    recentOrders,
  });
}

export async function getAllUsers(req: Request, res: Response) {
  const { page = '1', limit = '20', role, search } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true, subscriptions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  return sendSuccess(res, users, 'Users fetched', 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function updateUserRole(req: Request, res: Response) {
  const { role } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  return sendSuccess(res, user, 'User role updated');
}

export async function toggleUserStatus(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    return sendSuccess(res, null, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
  return sendSuccess(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
}
