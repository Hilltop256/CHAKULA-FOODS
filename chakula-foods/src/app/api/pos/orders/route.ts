import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { OrderStatus, OrderType } from "@prisma/client";

async function getPosOrders(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | undefined;
    const type = searchParams.get("type") as OrderType | undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    const where: Record<string, unknown> = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    // Only show dine-in and takeaway orders in POS
    if (!type && !status) {
      where.type = { in: ["DINE_IN", "TAKEAWAY"] };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        staff: { select: { id: true, name: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("POS orders fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

async function createPosOrder(req: NextRequest) {
  try {
    const staff = await requireAuth(["ADMIN", "STAFF"]);
    const body = await req.json();
    const { items, type, tableNumber, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
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
        staffNotes: item.staffNotes ?? null,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart" },
        { status: 400 }
      );
    }

    const total = subtotal;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        type: (type || "DINE_IN") as OrderType,
        tableNumber: tableNumber ?? null,
        notes: notes ?? null,
        subtotal,
        total,
        staffId: staff.id,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POS order create error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return getPosOrders(req);
}

export async function POST(req: NextRequest) {
  return createPosOrder(req);
}