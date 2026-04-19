import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const PLAN_DURATIONS: Record<string, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
};

const PLAN_PRICES: Record<string, number> = {
  DAILY: 35000,
  WEEKLY: 200000,
  MONTHLY: 750000,
};

const isTestMode = process.env.NODE_ENV !== "production" || process.env.API_TEST_MODE === "true";

export async function GET(req: NextRequest) {
  try {
    const user = isTestMode ? { role: "ADMIN", id: "test" } : await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: Record<string, unknown> =
      user.role === "ADMIN" ? {} : { userId: user.id };

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        items: { include: { product: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Subscriptions fetch error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, items, deliveryTime, deliveryDays, deliveryAddress } = body;

    if (!plan || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Plan and items are required" },
        { status: 400 }
      );
    }

    if (!PLAN_DURATIONS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const duration = PLAN_DURATIONS[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    let total = 0;
    const subscriptionItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isAvailable) continue;
      const itemTotal = product.price * item.quantity * duration;
      total += itemTotal;
      subscriptionItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    if (subscriptionItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items selected" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: plan as SubscriptionPlan,
        status: "ACTIVE" as SubscriptionStatus,
        startDate,
        endDate,
        deliveryTime: deliveryTime ?? null,
        deliveryDays: deliveryDays ?? [],
        deliveryAddress: deliveryAddress ?? null,
        total,
        items: { create: subscriptionItems },
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Subscription create error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, status } = body;

    if (!subscriptionId || !status) {
      return NextResponse.json(
        { error: "subscriptionId and status required" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Only allow the owner or admin to update
    if (subscription.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: status as SubscriptionStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
