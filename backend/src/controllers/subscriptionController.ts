import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, slugify } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { SubscriptionStatus } from '@prisma/client';

function addDaysFromDate(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonthFromDate(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

// ===== PLANS =====

export async function getSubscriptionPlans(req: Request, res: Response) {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } },
      },
      _count: { select: { subscriptions: { where: { status: SubscriptionStatus.ACTIVE } } } },
    },
    orderBy: { price: 'asc' },
  });
  return sendSuccess(res, plans);
}

export async function getSubscriptionPlanById(req: Request, res: Response) {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, imageUrl: true, price: true, description: true } } },
      },
    },
  });
  if (!plan) throw new AppError('Subscription plan not found', 404);
  return sendSuccess(res, plan);
}

export async function createSubscriptionPlan(req: Request, res: Response) {
  const { name, description, interval, price, deliveries, features, items } = req.body;

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      slug: slugify(name),
      description,
      interval,
      price,
      deliveries,
      features: features || [],
      ...(items && {
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity || 1,
            isOptional: i.isOptional || false,
          })),
        },
      }),
    },
    include: { items: { include: { product: true } } },
  });
  return sendSuccess(res, plan, 'Subscription plan created', 201);
}

export async function updateSubscriptionPlan(req: Request, res: Response) {
  const { name, ...rest } = req.body;
  const data: any = { ...rest };
  if (name) {
    data.name = name;
    data.slug = slugify(name);
  }

  const plan = await prisma.subscriptionPlan.update({
    where: { id: req.params.id },
    data,
    include: { items: true },
  });
  return sendSuccess(res, plan, 'Plan updated');
}

// ===== USER SUBSCRIPTIONS =====

export async function createSubscription(req: Request, res: Response) {
  const { planId, deliveryAddress, deliveryCity, deliveryPhone, notes, startDate } = req.body;

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan) throw new AppError('Subscription plan not found', 404);

  // Check for active subscription on same plan
  const existing = await prisma.subscription.findFirst({
    where: {
      userId: req.user!.userId,
      planId,
      status: SubscriptionStatus.ACTIVE,
    },
  });
  if (existing) throw new AppError('You already have an active subscription for this plan', 409);

  const start = startDate ? new Date(startDate) : new Date();
  const nextDelivery =
    plan.interval === 'WEEKLY' ? addDaysFromDate(start, 7) : addMonthFromDate(start);

  const subscription = await prisma.subscription.create({
    data: {
      userId: req.user!.userId,
      planId,
      interval: plan.interval,
      startDate: start,
      nextDeliveryDate: nextDelivery,
      deliveryAddress,
      deliveryCity,
      deliveryPhone,
      notes,
    },
    include: {
      plan: {
        include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
      },
    },
  });

  return sendSuccess(res, subscription, 'Subscription created', 201);
}

export async function getMySubscriptions(req: Request, res: Response) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.user!.userId },
    include: {
      plan: {
        include: { items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return sendSuccess(res, subscriptions);
}

export async function getSubscriptionById(req: Request, res: Response) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: req.params.id,
      ...(req.user!.role !== 'ADMIN' ? { userId: req.user!.userId } : {}),
    },
    include: {
      plan: {
        include: {
          items: { include: { product: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!subscription) throw new AppError('Subscription not found', 404);
  return sendSuccess(res, subscription);
}

export async function pauseSubscription(req: Request, res: Response) {
  const subscription = await prisma.subscription.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!subscription) throw new AppError('Subscription not found', 404);
  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new AppError('Only active subscriptions can be paused', 400);
  }

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: SubscriptionStatus.PAUSED },
  });
  return sendSuccess(res, updated, 'Subscription paused');
}

export async function resumeSubscription(req: Request, res: Response) {
  const subscription = await prisma.subscription.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!subscription) throw new AppError('Subscription not found', 404);
  if (subscription.status !== SubscriptionStatus.PAUSED) {
    throw new AppError('Only paused subscriptions can be resumed', 400);
  }

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: SubscriptionStatus.ACTIVE },
  });
  return sendSuccess(res, updated, 'Subscription resumed');
}

export async function cancelSubscription(req: Request, res: Response) {
  const subscription = await prisma.subscription.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!subscription) throw new AppError('Subscription not found', 404);
  if (subscription.status === SubscriptionStatus.CANCELLED) {
    throw new AppError('Subscription already cancelled', 400);
  }

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: SubscriptionStatus.CANCELLED, endDate: new Date() },
  });
  return sendSuccess(res, updated, 'Subscription cancelled');
}

// Admin: get all subscriptions
export async function getAllSubscriptions(req: Request, res: Response) {
  const { status, interval } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (interval) where.interval = interval;

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return sendSuccess(res, subscriptions);
}

export async function updateSubscriptionDelivery(req: Request, res: Response) {
  const { deliveryAddress, deliveryCity, deliveryPhone } = req.body;
  const subscription = await prisma.subscription.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!subscription) throw new AppError('Subscription not found', 404);

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { deliveryAddress, deliveryCity, deliveryPhone },
  });
  return sendSuccess(res, updated, 'Delivery details updated');
}
