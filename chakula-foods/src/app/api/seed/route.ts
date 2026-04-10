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
    // First create categories
    const categories = [
      { name: "Fast Food", type: "FAST_FOOD", sortOrder: 1 },
      { name: "Bakery", type: "BAKERY", sortOrder: 2 },
      { name: "Juice Bar", type: "JUICE_BAR", sortOrder: 3 },
      { name: "Fresh Market", type: "FRESH_MARKET", sortOrder: 4 },
      { name: "Dry Market", type: "DRY_MARKET", sortOrder: 5 },
      { name: "Roasts & Grills", type: "ROASTS", sortOrder: 6 },
      { name: "Specials & Toppings", type: "SPECIALS", sortOrder: 7 },
      { name: "Party & Group Platters", type: "PLATTERS", sortOrder: 8 },
      { name: "Drinks & Beverages", type: "DRINKS", sortOrder: 9 },
      { name: "Wines & Spirits", type: "WINES_SPIRITS", sortOrder: 10 },
    ];

    let catCount = 0;
    for (const cat of categories) {
      try {
        await prisma.category.upsert({
          where: { type: cat.type },
          update: {},
          create: { ...cat, isActive: true },
        });
        catCount++;
      } catch (e) { /* skip */ }
    }

    // Then create products
    const products = [
      { name: "Chicken Burger", description: "Crispy chicken fillet with lettuce, tomato and special sauce", price: 15000, category: "FAST_FOOD", preparationTime: 15, isFeatured: true },
      { name: "Beef Burger", description: "Juicy beef patty with cheese, onions and pickles", price: 18000, category: "FAST_FOOD", preparationTime: 15, isFeatured: true },
      { name: "Shawarma", description: "Marinated meat, garlic sauce, pickles & fresh veggies", price: 10000, category: "FAST_FOOD", preparationTime: 10, isFeatured: true },
      { name: "Rolex", description: "Uganda's favourite street food - egg rolled in chapati", price: 5000, category: "FAST_FOOD", preparationTime: 8, isFeatured: true },
      { name: "Bread Loaf", description: "Freshly baked white bread loaf", price: 6000, category: "BAKERY", preparationTime: 5 },
      { name: "Mandazi", description: "Traditional East African fried dough", price: 2000, category: "BAKERY", preparationTime: 5, unit: "piece" },
      { name: "Fresh Mango Juice", description: "100% fresh mango blended to order", price: 7000, category: "JUICE_BAR", preparationTime: 5, isFeatured: true },
      { name: "Avocado Smoothie", description: "Creamy avocado blended with milk and honey", price: 9000, category: "JUICE_BAR", preparationTime: 7, isFeatured: true },
      { name: "Matooke (bunch)", description: "Fresh green bananas", price: 10000, category: "FRESH_MARKET", unit: "bunch", isFeatured: true },
      { name: "Tomatoes (1kg)", description: "Fresh local tomatoes", price: 3000, category: "FRESH_MARKET", unit: "kg" },
      { name: "Rice (2kg)", description: "Premium Uganda long grain white rice", price: 12000, category: "DRY_MARKET", unit: "2kg" },
      { name: "Beans (1kg)", description: "Dried red kidney beans", price: 6000, category: "DRY_MARKET", unit: "kg" },
      { name: "Half Chicken", description: "Golden flame-roasted half chicken", price: 25000, category: "ROASTS", preparationTime: 25, isFeatured: true },
      { name: "Goat Skewer", description: "Tender goat pieces grilled over open flame", price: 12000, category: "ROASTS", preparationTime: 15, isFeatured: true },
      { name: "Pork Ribs", description: "Slow-cooked pork ribs with smoky BBQ glaze", price: 22000, category: "ROASTS", preparationTime: 25, isFeatured: true },
      { name: "Grilled Fish", description: "Fresh whole fish, seasoned and grilled", price: 32000, category: "ROASTS", preparationTime: 30 },
      { name: "Chicken + Matooke", description: "Stewed chicken with Matooke and groundnut sauce", price: 16000, category: "SPECIALS", preparationTime: 20, isFeatured: true },
      { name: "Loaded Fries", description: "Crispy fries loaded with chicken/beef, cheese", price: 14000, category: "SPECIALS", preparationTime: 12 },
      { name: "Small Platter", description: "Serves 2-3 people", price: 45000, category: "PLATTERS", preparationTime: 30 },
      { name: "Medium Platter", description: "Serves 3-5 people", price: 75000, category: "PLATTERS", preparationTime: 40, isFeatured: true },
      { name: "Large Platter", description: "Serves 6-8 people", price: 130000, category: "PLATTERS", preparationTime: 60 },
      { name: "Fresh Juices", description: "Mango, Avocado, Banana - freshly blended", price: 5000, category: "DRINKS", preparationTime: 5, unit: "glass", isFeatured: true },
      { name: "Coffee", description: "Iced coffee, latte, cappuccino", price: 5000, category: "DRINKS", preparationTime: 5 },
      { name: "Tea", description: "Hot and iced tea varieties", price: 3000, category: "DRINKS", preparationTime: 5 },
      { name: "Water & Sodas", description: "Still water, sparkling water and sodas", price: 2000, category: "DRINKS" },
      { name: "Red Wine", description: "A smooth, full-bodied red wine", price: 35000, category: "WINES_SPIRITS", unit: "bottle", isFeatured: true },
      { name: "White Wine", description: "A crisp, refreshing white wine", price: 35000, category: "WINES_SPIRITS", unit: "bottle" },
      { name: "Whisky", description: "Premium whisky served neat or on rocks", price: 25000, category: "WINES_SPIRITS", unit: "shot", isFeatured: true },
      { name: "Beer", description: "Chilled local and imported beers", price: 8000, category: "WINES_SPIRITS", unit: "bottle" },
      { name: "Vodka", description: "Premium vodka", price: 20000, category: "WINES_SPIRITS", unit: "shot" },
    ];

    let prodCount = 0;
    for (const product of products) {
      try {
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category as any,
            preparationTime: product.preparationTime || null,
            isFeatured: product.isFeatured || false,
            isAvailable: true,
            tags: [],
            allergens: [],
            unit: product.unit || null,
          },
        });
        prodCount++;
      } catch (e) { /* skip duplicates */ }
    }

    return NextResponse.json({ success: true, categories: catCount, products: prodCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}