import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== "chakula-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Test connection
    await prisma.$connect();
    
    // Create categories
    const categories: { name: string; type: ProductCategory; sortOrder: number }[] = [
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
          create: { name: cat.name, type: cat.type, sortOrder: cat.sortOrder, isActive: true },
        });
        catCount++;
      } catch (e: any) {
        console.log("Category error:", e.message);
      }
    }

    // Create products
    const products: { name: string; description: string; price: number; category: ProductCategory; preparationTime?: number; isFeatured?: boolean; unit?: string; image?: string }[] = [
      { name: "Chicken Burger", description: "Crispy chicken fillet with lettuce, tomato and special sauce", price: 15000, category: "FAST_FOOD", preparationTime: 15, isFeatured: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
      { name: "Beef Burger", description: "Juicy beef patty with cheese, onions and pickles", price: 18000, category: "FAST_FOOD", preparationTime: 15, isFeatured: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
      { name: "Shawarma", description: "Marinated meat, garlic sauce, pickles & fresh veggies", price: 10000, category: "FAST_FOOD", preparationTime: 10, isFeatured: true, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop" },
      { name: "Rolex", description: "Uganda's favourite street food - egg rolled in chapati", price: 5000, category: "FAST_FOOD", preparationTime: 8, isFeatured: true, image: "https://images.unsplash.com/photo-1626804475297-411d863b7608?w=400&h=300&fit=crop" },
      { name: "Bread Loaf", description: "Freshly baked white bread loaf", price: 6000, category: "BAKERY", preparationTime: 5, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
      { name: "Mandazi", description: "Traditional East African fried dough", price: 2000, category: "BAKERY", preparationTime: 5, unit: "piece", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop" },
      { name: "Fresh Mango Juice", description: "100% fresh mango blended to order", price: 7000, category: "JUICE_BAR", preparationTime: 5, isFeatured: true, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop" },
      { name: "Avocado Smoothie", description: "Creamy avocado blended with milk and honey", price: 9000, category: "JUICE_BAR", preparationTime: 7, isFeatured: true, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop" },
      { name: "Matooke (bunch)", description: "Fresh green bananas", price: 10000, category: "FRESH_MARKET", unit: "bunch", isFeatured: true, image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop" },
      { name: "Tomatoes (1kg)", description: "Fresh local tomatoes", price: 3000, category: "FRESH_MARKET", unit: "kg", image: "https://images.unsplash.com/photo-1546470427-227c7369a9b4?w=400&h=300&fit=crop" },
      { name: "Rice (2kg)", description: "Premium Uganda long grain white rice", price: 12000, category: "DRY_MARKET", unit: "2kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" },
      { name: "Beans (1kg)", description: "Dried red kidney beans", price: 6000, category: "DRY_MARKET", unit: "kg", image: "https://images.unsplash.com/photo-1574484284002-6d44f0b5d74c?w=400&h=300&fit=crop" },
      { name: "Half Chicken", description: "Golden flame-roasted half chicken", price: 25000, category: "ROASTS", preparationTime: 25, isFeatured: true, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop" },
      { name: "Goat Skewer", description: "Tender goat pieces grilled over open flame", price: 12000, category: "ROASTS", preparationTime: 15, isFeatured: true, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop" },
      { name: "Pork Ribs", description: "Slow-cooked pork ribs with smoky BBQ glaze", price: 22000, category: "ROASTS", preparationTime: 25, isFeatured: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
      { name: "Grilled Fish", description: "Fresh whole fish, seasoned and grilled", price: 32000, category: "ROASTS", preparationTime: 30, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop" },
      { name: "Chicken + Matooke", description: "Stewed chicken with Matooke and groundnut sauce", price: 16000, category: "SPECIALS", preparationTime: 20, isFeatured: true, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop" },
      { name: "Loaded Fries", description: "Crispy fries loaded with chicken/beef, cheese", price: 14000, category: "SPECIALS", preparationTime: 12, image: "https://images.unsplash.com/photo-1573080496219-bb080dd6f877?w=400&h=300&fit=crop" },
      { name: "Small Platter", description: "Serves 2-3 people", price: 45000, category: "PLATTERS", preparationTime: 30, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { name: "Medium Platter", description: "Serves 3-5 people", price: 75000, category: "PLATTERS", preparationTime: 40, isFeatured: true, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { name: "Large Platter", description: "Serves 6-8 people", price: 130000, category: "PLATTERS", preparationTime: 60, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { name: "Fresh Juices", description: "Mango, Avocado, Banana - freshly blended", price: 5000, category: "DRINKS", preparationTime: 5, unit: "glass", isFeatured: true, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop" },
      { name: "Coffee", description: "Iced coffee, latte, cappuccino", price: 5000, category: "DRINKS", preparationTime: 5, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop" },
      { name: "Tea", description: "Hot and iced tea varieties", price: 3000, category: "DRINKS", preparationTime: 5, image: "https://images.unsplash.com/photo-1564890369478-c5c3563533e2?w=400&h=300&fit=crop" },
      { name: "Water & Sodas", description: "Still water, sparkling water and sodas", price: 2000, category: "DRINKS", image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop" },
      { name: "Red Wine", description: "A smooth, full-bodied red wine", price: 35000, category: "WINES_SPIRITS", unit: "bottle", isFeatured: true, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop" },
      { name: "White Wine", description: "A crisp, refreshing white wine", price: 35000, category: "WINES_SPIRITS", unit: "bottle", image: "https://images.unsplash.com/photo-1566754436893-a5fc3af4eb33?w=400&h=300&fit=crop" },
      { name: "Whisky", description: "Premium whisky served neat or on rocks", price: 25000, category: "WINES_SPIRITS", unit: "shot", isFeatured: true, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop" },
      { name: "Beer", description: "Chilled local and imported beers", price: 8000, category: "WINES_SPIRITS", unit: "bottle", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop" },
      { name: "Vodka", description: "Premium vodka", price: 20000, category: "WINES_SPIRITS", unit: "shot", image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=300&fit=crop" },
    ];

    let prodCount = 0;
    let errors: string[] = [];
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
            image: product.image || null,
          },
        });
        prodCount++;
      } catch (e: any) {
        errors.push(`${product.name}: ${e.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      categories: catCount, 
      products: prodCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}