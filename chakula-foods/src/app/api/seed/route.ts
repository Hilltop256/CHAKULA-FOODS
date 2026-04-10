import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== "chakula-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = [
      { name: "Chicken Burger", description: "Crispy chicken fillet with lettuce, tomato and special sauce", price: 15000, category: "FAST_FOOD" as const, preparationTime: 15, isFeatured: true, tags: ["popular", "chicken"] },
      { name: "Beef Burger", description: "Juicy beef patty with cheese, onions and pickles", price: 18000, category: "FAST_FOOD" as const, preparationTime: 15, isFeatured: true, tags: ["popular", "beef"] },
      { name: "Shawarma", description: "Marinated meat, garlic sauce, pickles & fresh veggies wrapped in soft flatbread", price: 10000, category: "FAST_FOOD" as const, preparationTime: 10, isFeatured: true },
      { name: "Rolex", description: "Uganda's favourite street food - egg rolled in chapati with vegetables", price: 5000, category: "FAST_FOOD" as const, preparationTime: 8, isFeatured: true, tags: ["local", "popular"] },
      { name: "Bread Loaf", description: "Freshly baked white bread loaf", price: 6000, category: "BAKERY" as const, preparationTime: 5 },
      { name: "Mandazi", description: "Traditional East African fried dough, lightly sweet", price: 2000, category: "BAKERY" as const, preparationTime: 5, unit: "piece" },
      { name: "Fresh Mango Juice", description: "100% fresh mango blended to order", price: 7000, category: "JUICE_BAR" as const, preparationTime: 5, isFeatured: true },
      { name: "Avocado Smoothie", description: "Creamy avocado blended with milk and honey", price: 9000, category: "JUICE_BAR" as const, preparationTime: 7, isFeatured: true },
      { name: "Matooke (bunch)", description: "Fresh green bananas (matooke)", price: 10000, category: "FRESH_MARKET" as const, unit: "bunch", isFeatured: true },
      { name: "Tomatoes (1kg)", description: "Fresh local tomatoes, farm picked", price: 3000, category: "FRESH_MARKET" as const, unit: "kg" },
      { name: "Rice (2kg)", description: "Premium Uganda long grain white rice", price: 12000, category: "DRY_MARKET" as const, unit: "2kg" },
      { name: "Beans (1kg)", description: "Dried red kidney beans", price: 6000, category: "DRY_MARKET" as const, unit: "kg" },
      { name: "Half Chicken", description: "Golden flame-roasted half chicken with fries or matooke", price: 25000, category: "ROASTS" as const, preparationTime: 25, isFeatured: true },
      { name: "Goat Skewer", description: "Tender goat pieces grilled over open flame", price: 12000, category: "ROASTS" as const, preparationTime: 15, isFeatured: true },
      { name: "Pork Ribs", description: "Slow-cooked pork ribs with smoky BBQ glaze", price: 22000, category: "ROASTS" as const, preparationTime: 25, isFeatured: true },
      { name: "Grilled Fish", description: "Fresh whole fish, seasoned and grilled to perfection", price: 32000, category: "ROASTS" as const, preparationTime: 30 },
      { name: "Chicken + Matooke", description: "Stewed chicken with steamed Matooke and groundnut sauce", price: 16000, category: "SPECIALS" as const, preparationTime: 20, isFeatured: true },
      { name: "Loaded Fries", description: "Crispy fries loaded with chicken/beef, cheese and Chakula sauce", price: 14000, category: "SPECIALS" as const, preparationTime: 12 },
      { name: "Small Platter", description: "Serves 2–3 people with chicken, beef, fries", price: 45000, category: "PLATTERS" as const, preparationTime: 30 },
      { name: "Medium Platter", description: "Serves 3–5 people with premium cuts", price: 75000, category: "PLATTERS" as const, preparationTime: 40, isFeatured: true },
      { name: "Large Platter", description: "Serves 6–8 people with everything", price: 130000, category: "PLATTERS" as const, preparationTime: 60 },
      { name: "Fresh Juices", description: "Mango, Avocado, Banana, Watermelon, Orange - freshly blended", price: 5000, category: "DRINKS" as const, preparationTime: 5, unit: "glass", isFeatured: true },
      { name: "Coffee", description: "Iced coffee, latte, cappuccino and more", price: 5000, category: "DRINKS" as const, preparationTime: 5 },
      { name: "Tea", description: "Hot and iced tea varieties", price: 3000, category: "DRINKS" as const, preparationTime: 5 },
      { name: "Water & Sodas", description: "Still water, sparkling water and sodas", price: 2000, category: "DRINKS" as const },
      { name: "Red Wine", description: "A smooth, full-bodied red wine", price: 35000, category: "WINES_SPIRITS" as const, unit: "bottle", isFeatured: true },
      { name: "White Wine", description: "A crisp, refreshing white wine", price: 35000, category: "WINES_SPIRITS" as const, unit: "bottle" },
      { name: "Whisky", description: "Premium whisky served neat or on rocks", price: 25000, category: "WINES_SPIRITS" as const, unit: "shot", isFeatured: true },
      { name: "Beer", description: "Chilled local and imported beers", price: 8000, category: "WINES_SPIRITS" as const, unit: "bottle" },
      { name: "Vodka", description: "Premium vodka", price: 20000, category: "WINES_SPIRITS" as const, unit: "shot" },
    ];

    let count = 0;
    for (const product of products) {
      try {
        await prisma.product.create({
          data: {
            ...product,
            allergens: [],
            isAvailable: true,
          },
        });
        count++;
      } catch (e) {
        // Skip duplicates
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}