import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { supabaseQuery, supabaseCount } from "@/lib/supabase";
import { ProductCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");

  try {
    const where: Record<string, unknown> = { isAvailable: true };

    if (category && Object.values(ProductCategory).includes(category as ProductCategory)) {
      where.category = category as ProductCategory;
    }
    if (featured === "true") where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { categoryRef: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(products);
  } catch {
    // Fallback: Supabase REST API (works on IPv4 via Supabase gateway)
    try {
      const params: Record<string, string> = {
        isAvailable: "eq.true",
        select: "id,name,description,price,image,category,isAvailable,isFeatured,preparationTime,unit,tags,allergens,calories,stock,createdAt",
        order: "isFeatured.desc,createdAt.desc",
      };

      if (category && Object.values(ProductCategory).includes(category as ProductCategory)) {
        params.category = `eq.${category}`;
      }
      if (featured === "true") {
        params.isFeatured = "eq.true";
      }
      if (search) {
        params.or = `(name.ilike.*${search}*,description.ilike.*${search}*)`;
      }

      const products = await supabaseQuery("Product", params);

      return NextResponse.json(
        products.map((p) => ({
          ...(p as Record<string, unknown>),
          categoryRef: null,
        }))
      );
    } catch (restError) {
      const msg = restError instanceof Error ? restError.message : "Unknown error";
      console.error("Products fetch error (both Prisma and REST failed):", msg);
      return NextResponse.json(
        { error: "Failed to fetch products", details: msg },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      image,
      category,
      stock,
      unit,
      preparationTime,
      isFeatured,
      tags,
      calories,
      allergens,
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price and category are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category: category as ProductCategory,
        stock: stock ? parseInt(stock) : null,
        unit,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        isFeatured: isFeatured ?? false,
        tags: tags ?? [],
        allergens: allergens ?? [],
        calories: calories ? parseInt(calories) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    if (updates.price !== undefined) updates.price = parseFloat(updates.price);
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock);
    if (updates.preparationTime !== undefined)
      updates.preparationTime = parseInt(updates.preparationTime);
    if (updates.calories !== undefined)
      updates.calories = parseInt(updates.calories);

    const product = await prisma.product.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id },
      data: { isAvailable: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
