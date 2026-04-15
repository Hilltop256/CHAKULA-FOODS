import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const demoPackages = [
  { id: "1", name: "Family Feast", description: "Perfect for 4-5 people", price: 85000, isActive: true, items: [{ id: "1", quantity: 2, product: { id: "13", name: "Half Chicken", price: 25000, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop" } }, { id: "2", quantity: 1, product: { id: "9", name: "Matooke (bunch)", price: 10000, image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop" } }] },
  { id: "2", name: "Office Lunch Combo", description: "Quick lunch for the team", price: 45000, isActive: true, items: [{ id: "3", quantity: 3, product: { id: "3", name: "Shawarma", price: 10000, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop" } }] },
];

const hasDatabase = !!process.env.DATABASE_URL;

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json(demoPackages);
  }

  try {
    await prisma.$connect();
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
    return NextResponse.json(demoPackages);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Demo mode" }, { status: 400 });
  }

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
  if (!hasDatabase) {
    return NextResponse.json({ error: "Demo mode" }, { status: 400 });
  }

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
  if (!hasDatabase) {
    return NextResponse.json({ error: "Demo mode" }, { status: 400 });
  }

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