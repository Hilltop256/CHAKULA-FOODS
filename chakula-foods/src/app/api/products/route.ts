import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";

const demoProducts = [
  { id: "1", name: "Chicken Burger", description: "Crispy chicken fillet with lettuce, tomato and special sauce", price: 15000, category: "FAST_FOOD", isFeatured: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { id: "2", name: "Beef Burger", description: "Juicy beef patty with cheese, onions and pickles", price: 18000, category: "FAST_FOOD", isFeatured: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { id: "3", name: "Rolex", description: "Uganda's favourite street food", price: 5000, category: "FAST_FOOD", isAvailable: true, preparationTime: 8, image: "https://images.unsplash.com/photo-1626804475297-411d863b7608?w=400&h=300&fit=crop" },
];

const hasDatabase = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10);

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json(demoProducts);
  }
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(demoProducts);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, image, category, preparationTime, isFeatured, unit } = body;
    
    if (!name || !price || !category) {
      return NextResponse.json({ error: "Name, price, category required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category: category as ProductCategory,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        isFeatured: isFeatured ?? false,
        unit,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock) updates.stock = parseInt(updates.stock);
    if (updates.preparationTime) updates.preparationTime = parseInt(updates.preparationTime);
    if (updates.calories) updates.calories = parseInt(updates.calories);

    const product = await prisma.product.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}