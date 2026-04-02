import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(offers);
  } catch (error) {
    console.error("Offers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, value, code, image, startDate, endDate, usageLimit, productId } = body;

    if (!name || !type || value === undefined) {
      return NextResponse.json({ error: "Name, type, and value are required" }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        name,
        description,
        type,
        value: parseFloat(value),
        code: code || null,
        image: image || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        productId: productId || null,
      },
      include: { product: { select: { id: true, name: true } } },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Offer create error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Offer ID required" }, { status: 400 });
    }

    if (updates.value !== undefined) updates.value = parseFloat(updates.value);
    if (updates.usageLimit !== undefined) updates.usageLimit = parseInt(updates.usageLimit);
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.productId === "") updates.productId = null;

    const offer = await prisma.offer.update({
      where: { id },
      data: updates,
      include: { product: { select: { id: true, name: true } } },
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Offer update error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Offer ID required" }, { status: 400 });
    }

    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Offer delete error:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
