import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscriptions = await prisma.subscription.findMany({
      where: user.role === "ADMIN" ? {} : { userId: user.id },
      include: { user: true, items: { include: { product: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { plan, items, deliveryTime, deliveryDays, deliveryAddress } = body;

    const planDurations: Record<string, number> = { DAILY: 1, WEEKLY: 7, MONTHLY: 30 };
    const planPrices: Record<string, number> = { DAILY: 35000, WEEKLY: 200000, MONTHLY: 750000 };

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDurations[plan]);

    let total = 0;
    const subscriptionItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const itemTotal = product.price * item.quantity * planDurations[plan];
      total += itemTotal;
      subscriptionItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan,
        status: "ACTIVE",
        startDate,
        endDate,
        deliveryTime,
        deliveryDays,
        deliveryAddress,
        total,
        items: { create: subscriptionItems },
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Subscription create error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
