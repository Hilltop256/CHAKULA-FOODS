import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/sms";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: user.role === "ADMIN" || user.role === "STAFF" ? {} : { userId: user.id },
      include: { items: { include: { product: true } }, user: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, type, tableNumber, deliveryAddress, notes, deliveryLat, deliveryLng } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
        notes: item.notes,
      });
    }

    const deliveryFee = type === "DELIVERY" ? 5000 : 0;
    const total = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        type,
        tableNumber,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        notes,
        subtotal,
        deliveryFee,
        total,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    await sendOrderConfirmation(user.phone, order.orderNumber, total);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
