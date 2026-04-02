import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Packages fetch error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, image, items } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || null,
        items: items && items.length > 0
          ? {
              create: items.map((item: { productId: string; quantity: number }) => ({
                productId: item.productId,
                quantity: item.quantity || 1,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Package create error:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, items, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    if (updates.price !== undefined) updates.price = parseFloat(updates.price);

    // If items are provided, replace all items
    if (items !== undefined) {
      await prisma.packageItem.deleteMany({ where: { packageId: id } });
      if (items.length > 0) {
        await prisma.packageItem.createMany({
          data: items.map((item: { productId: string; quantity: number }) => ({
            packageId: id,
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
        });
      }
    }

    const pkg = await prisma.package.update({
      where: { id },
      data: updates,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Package update error:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
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
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Package delete error:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
