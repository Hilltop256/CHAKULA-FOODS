import { NextRequest, NextResponse } from "next/server";
import { getAdminOrTestUser } from "@/lib/test-mode";
import { ProductCategory } from "@prisma/client";

const demoProducts = [
  { id: "1", name: "Chicken Burger", description: "Crispy chicken fillet with lettuce, tomato and special sauce", price: 15000, category: "FAST_FOOD", isFeatured: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { id: "2", name: "Beef Burger", description: "Juicy beef patty with cheese, onions and pickles", price: 18000, category: "FAST_FOOD", isFeatured: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { id: "3", name: "Shawarma", description: "Marinated meat, garlic sauce, pickles & fresh veggies", price: 10000, category: "FAST_FOOD", isFeatured: true, isAvailable: true, preparationTime: 10, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop" },
  { id: "4", name: "Rolex", description: "Uganda's favourite street food - egg rolled in chapati", price: 5000, category: "FAST_FOOD", isFeatured: true, isAvailable: true, preparationTime: 8, image: "https://images.unsplash.com/photo-1626804475297-411d863b7608?w=400&h=300&fit=crop" },
  { id: "5", name: "Bread Loaf", description: "Freshly baked white bread loaf", price: 6000, category: "BAKERY", isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
  { id: "6", name: "Mandazi", description: "Traditional East African fried dough", price: 2000, category: "BAKERY", isAvailable: true, preparationTime: 5, unit: "piece", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop" },
  { id: "7", name: "Fresh Mango Juice", description: "100% fresh mango blended to order", price: 7000, category: "JUICE_BAR", isFeatured: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop" },
  { id: "8", name: "Avocado Smoothie", description: "Creamy avocado blended with milk and honey", price: 9000, category: "JUICE_BAR", isFeatured: true, isAvailable: true, preparationTime: 7, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop" },
  { id: "9", name: "Matooke (bunch)", description: "Fresh green bananas", price: 10000, category: "FRESH_MARKET", isFeatured: true, isAvailable: true, unit: "bunch", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop" },
  { id: "10", name: "Tomatoes (1kg)", description: "Fresh local tomatoes", price: 3000, category: "FRESH_MARKET", isAvailable: true, unit: "kg", image: "https://images.unsplash.com/photo-1546470427-227c7369a9b4?w=400&h=300&fit=crop" },
  { id: "11", name: "Rice (2kg)", description: "Premium Uganda long grain white rice", price: 12000, category: "DRY_MARKET", isAvailable: true, unit: "2kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" },
  { id: "12", name: "Beans (1kg)", description: "Dried red kidney beans", price: 6000, category: "DRY_MARKET", isAvailable: true, unit: "kg", image: "https://images.unsplash.com/photo-1574484284002-6d44f0b5d74c?w=400&h=300&fit=crop" },
  { id: "13", name: "Half Chicken", description: "Golden flame-roasted half chicken", price: 25000, category: "ROASTS", isFeatured: true, isAvailable: true, preparationTime: 25, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop" },
  { id: "14", name: "Goat Skewer", description: "Tender goat pieces grilled over open flame", price: 12000, category: "ROASTS", isFeatured: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop" },
  { id: "15", name: "Pork Ribs", description: "Slow-cooked pork ribs with smoky BBQ glaze", price: 22000, category: "ROASTS", isFeatured: true, isAvailable: true, preparationTime: 25, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
  { id: "16", name: "Grilled Fish", description: "Fresh whole fish, seasoned and grilled", price: 32000, category: "ROASTS", isAvailable: true, preparationTime: 30, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop" },
  { id: "17", name: "Chicken + Matooke", description: "Stewed chicken with Matooke and groundnut sauce", price: 16000, category: "SPECIALS", isFeatured: true, isAvailable: true, preparationTime: 20, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop" },
  { id: "18", name: "Loaded Fries", description: "Crispy fries loaded with chicken/beef, cheese", price: 14000, category: "SPECIALS", isAvailable: true, preparationTime: 12, image: "https://images.unsplash.com/photo-1573080496219-bb080dd6f877?w=400&h=300&fit=crop" },
  { id: "19", name: "Small Platter", description: "Serves 2-3 people", price: 45000, category: "PLATTERS", isAvailable: true, preparationTime: 30, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
  { id: "20", name: "Medium Platter", description: "Serves 3-5 people", price: 75000, category: "PLATTERS", isFeatured: true, isAvailable: true, preparationTime: 40, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
  { id: "21", name: "Large Platter", description: "Serves 6-8 people", price: 130000, category: "PLATTERS", isAvailable: true, preparationTime: 60, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
  { id: "22", name: "Fresh Juices", description: "Mango, Avocado, Banana - freshly blended", price: 5000, category: "DRINKS", isFeatured: true, isAvailable: true, preparationTime: 5, unit: "glass", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop" },
  { id: "23", name: "Coffee", description: "Iced coffee, latte, cappuccino", price: 5000, category: "DRINKS", isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop" },
  { id: "24", name: "Tea", description: "Hot and iced tea varieties", price: 3000, category: "DRINKS", isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1564890369478-c5c3563533e2?w=400&h=300&fit=crop" },
  { id: "25", name: "Water & Sodas", description: "Still water, sparkling water and sodas", price: 2000, category: "DRINKS", isAvailable: true, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop" },
  { id: "26", name: "Red Wine", description: "A smooth, full-bodied red wine", price: 35000, category: "WINES_SPIRITS", isFeatured: true, isAvailable: true, unit: "bottle", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop" },
  { id: "27", name: "White Wine", description: "A crisp, refreshing white wine", price: 35000, category: "WINES_SPIRITS", isAvailable: true, unit: "bottle", image: "https://images.unsplash.com/photo-1566754436893-a5fc3af4eb33?w=400&h=300&fit=crop" },
  { id: "28", name: "Whisky", description: "Premium whisky served neat or on rocks", price: 25000, category: "WINES_SPIRITS", isFeatured: true, isAvailable: true, unit: "shot", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop" },
  { id: "29", name: "Beer", description: "Chilled local and imported beers", price: 8000, category: "WINES_SPIRITS", isAvailable: true, unit: "bottle", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop" },
  { id: "30", name: "Vodka", description: "Premium vodka", price: 20000, category: "WINES_SPIRITS", isAvailable: true, unit: "shot", image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=300&fit=crop" },
];

const hasDatabase = !!(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10);

function getFilteredProducts(products: typeof demoProducts, category: string | null, featured: string | null, search: string | null, includeUnavailable: string | null) {
  let filtered = [...products];
  if (category) filtered = filtered.filter(p => p.category === category);
  if (featured === "true") filtered = filtered.filter(p => p.isFeatured);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
  }
  if (includeUnavailable !== "true") filtered = filtered.filter(p => p.isAvailable);
  return NextResponse.json(filtered);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("search");
  const includeUnavailable = searchParams.get("includeUnavailable");

  // Return demo products if database is not available
  if (!hasDatabase) {
    return getFilteredProducts(demoProducts, category, featured, search, includeUnavailable);
  }

  const { prisma } = await import("@/lib/prisma");
  
  // Try database, fallback to demo on error
  try {
    await prisma.$connect();
    
    const where: Record<string, unknown> = {};
    
    if (includeUnavailable !== "true") {
      where.isAvailable = true;
    }

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
      include: { categoryRef: true, variants: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products GET error:", error);
    return getFilteredProducts(demoProducts, category, featured, search, includeUnavailable);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.length < 10) {
    return NextResponse.json({ error: "Demo mode - create disabled" }, { status: 400 });
  }

  try {
    const user = await getAdminOrTestUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
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
      availableFrom,
      availableTo,
      availableDays,
      variants,
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price and category are required" },
        { status: 400 }
      );
    }

    // Create product
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
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
        availableDays: availableDays || [],
      },
    });

    // Create variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variant.name,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: variant.stock ? parseInt(variant.stock) : null,
          },
        });
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true },
    });

    return NextResponse.json(fullProduct, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.length < 10) {
    return NextResponse.json({ error: "Demo mode - edit disabled" }, { status: 400 });
  }

  try {
    const user = await getAdminOrTestUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // If image is being updated (including clearing to empty), try to delete old image from storage
    if (updates.image !== undefined) {
      try {
        const currentProduct = await prisma.product.findUnique({ where: { id } });
        if (currentProduct?.image) {
          const oldUrl = currentProduct.image;
          if (oldUrl.includes("/storage/v1/object/public/")) {
            const path = oldUrl.split("/media/")[1];
            if (path) {
              const { deleteImage } = await import("@/lib/storage");
              await deleteImage(path).catch((err) => console.warn("Failed to delete old image:", err));
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch old product for image cleanup:", err);
      }
    }

    // Extract scheduling and variants
    const { availableFrom, availableTo, availableDays, variants } = updates;
    const productUpdates: Record<string, unknown> = { ...updates };

    delete productUpdates.variants;

    if (productUpdates.price !== undefined) productUpdates.price = parseFloat(String(productUpdates.price));
    if (productUpdates.stock !== undefined && productUpdates.stock !== null)
      productUpdates.stock = parseInt(String(productUpdates.stock));
    if (productUpdates.preparationTime !== undefined && productUpdates.preparationTime !== null)
      productUpdates.preparationTime = parseInt(String(productUpdates.preparationTime));
    if (productUpdates.calories !== undefined && productUpdates.calories !== null)
      productUpdates.calories = parseInt(String(productUpdates.calories));
    if (availableFrom !== undefined) productUpdates.availableFrom = availableFrom || null;
    if (availableTo !== undefined) productUpdates.availableTo = availableTo || null;
    if (availableDays !== undefined) productUpdates.availableDays = Array.isArray(availableDays) ? availableDays : [];

    const product = await prisma.product.update({
      where: { id },
      data: productUpdates,
    });

    // Handle variants if provided
    if (variants && Array.isArray(variants)) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({ where: { productId: id } });

      // Create new variants
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: id,
            name: String(variant.name),
            price: variant.price ? parseFloat(String(variant.price)) : null,
            stock: variant.stock ? parseInt(String(variant.stock)) : null,
          },
        });
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    return NextResponse.json(fullProduct);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.length < 10) {
    return NextResponse.json({ error: "Demo mode - delete disabled" }, { status: 400 });
  }

  try {
    const user = await getAdminOrTestUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Get product to delete image from storage
    const product = await prisma.product.findUnique({ where: { id } });

    // Soft delete product
    await prisma.product.update({
      where: { id },
      data: { isAvailable: false },
    });

    // Delete image from storage if exists
    if (product?.image) {
      try {
        if (product.image.includes("/storage/v1/object/public/")) {
          const path = product.image.split("/media/")[1];
          if (path) {
            const { deleteImage } = await import("@/lib/storage");
            await deleteImage(path).catch((err) => console.warn("Failed to delete product image:", err));
          }
        }
      } catch (err) {
        console.warn("Image deletion error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}