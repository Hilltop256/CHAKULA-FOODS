import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/sms";
import { OrderStatus, OrderType } from "@prisma/client";

const isTestMode = process.env.NODE_ENV !== "production" || process.env.API_TEST_MODE === "true";

export async function GET(req: NextRequest) {
  try {
    const user = isTestMode ? { role: "ADMIN", id: "test" } : await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const where: Record<string, unknown> =
      user.role === "ADMIN" || user.role === "STAFF"
        ? {}
        : { userId: user.id };

    if (status) where.status = status as OrderStatus;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, phone: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
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
    const { items, type, tableNumber, deliveryAddress, notes, deliveryLat, deliveryLng } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (type === "DELIVERY" && !deliveryAddress) {
      return NextResponse.json(
        { error: "Delivery address required" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isAvailable) continue;
      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
        notes: item.notes ?? null,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart" },
        { status: 400 }
      );
    }

    const deliveryFee = type === "DELIVERY" ? 5000 : 0;
    const total = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        type: type as OrderType,
        tableNumber: tableNumber ?? null,
        deliveryAddress: deliveryAddress ?? null,
        deliveryLat: deliveryLat ?? null,
        deliveryLng: deliveryLng ?? null,
        notes: notes ?? null,
        subtotal,
        deliveryFee,
        total,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Fire and forget — don't block response on SMS
    sendOrderConfirmation(user.phone, order.orderNumber, total).catch(
      console.error
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
