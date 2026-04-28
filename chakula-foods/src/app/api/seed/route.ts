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
      { name: "Bakery & Breakfast", type: "BREAKFAST", sortOrder: 8 },
      { name: "Party & Group Platters", type: "PLATTERS", sortOrder: 9 },
      { name: "Drinks & Beverages", type: "DRINKS", sortOrder: 10 },
      { name: "Wines & Spirits", type: "WINES_SPIRITS", sortOrder: 11 },
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

    // Full product list (78+ items with scheduling)
    const products: { name: string; description: string; price: number; category: ProductCategory; preparationTime?: number; isFeatured?: boolean; unit?: string; availableFrom?: string; availableTo?: string; availableDays?: string[]; tags?: string[] }[] = [
      // Fast Food
      { name: "Chicken Burger", description: "Crispy chicken fillet with lettuce, tomato and special sauce", price: 15000, category: "FAST_FOOD", preparationTime: 15, isFeatured: true, availableFrom: "07:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["popular","chicken"] },
      { name: "Beef Burger", description: "Juicy beef patty with cheese, onions and pickles", price: 18000, category: "FAST_FOOD", preparationTime: 15, isFeatured: true, availableFrom: "07:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["popular","beef"] },
      { name: "Shawarma", description: "Marinated meat, garlic sauce, pickles & fresh veggies", price: 10000, category: "FAST_FOOD", preparationTime: 10, isFeatured: true, availableFrom: "07:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["popular"] },
      { name: "Rolex", description: "Uganda's favourite street food - egg rolled in chapati with vegetables", price: 5000, category: "FAST_FOOD", preparationTime: 8, isFeatured: true, availableFrom: "06:00", availableTo: "10:00", availableDays: ["mon","tue","wed","thu","fri","sat"], tags: ["local","popular"] },
      { name: "Chips (French Fries)", description: "Golden crispy chips served with ketchup", price: 8000, category: "FAST_FOOD", preparationTime: 10, availableFrom: "07:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["sides"] },
      { name: "Grilled Chicken", description: "Whole grilled chicken seasoned with Ugandan spices", price: 35000, category: "FAST_FOOD", preparationTime: 25, isFeatured: true, availableFrom: "10:00", availableTo: "20:00", availableDays: ["wed","thu","fri","sat","sun"], tags: ["chicken","grilled"] },
      { name: "Pizza Margherita", description: "Classic tomato sauce with mozzarella and fresh basil", price: 25000, category: "FAST_FOOD", preparationTime: 20, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pizza"] },

      // Bakery
      { name: "Bread Loaf", description: "Freshly baked white bread loaf", price: 6000, category: "BAKERY", preparationTime: 5, isFeatured: true, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["bread"] },
      { name: "Banana Cake", description: "Moist banana cake with cream cheese frosting", price: 30000, category: "BAKERY", preparationTime: 5, isFeatured: true, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["cake","sweet"] },
      { name: "Croissant", description: "Buttery flaky croissant, baked fresh daily", price: 5000, category: "BAKERY", preparationTime: 3, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pastry"] },
      { name: "Mandazi", description: "Traditional East African fried dough, lightly sweet", price: 2000, category: "BAKERY", preparationTime: 5, unit: "piece", availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["local","fried"] },

      // Juice Bar
      { name: "Fresh Mango Juice", description: "100% fresh mango blended to order", price: 7000, category: "JUICE_BAR", preparationTime: 5, isFeatured: true, availableFrom: "07:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["mango","fresh"] },
      { name: "Passion Fruit Juice", description: "Freshly squeezed passion fruit", price: 6000, category: "JUICE_BAR", preparationTime: 5, availableFrom: "07:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["passion","fresh"] },
      { name: "Avocado Smoothie", description: "Creamy avocado blended with milk and honey", price: 9000, category: "JUICE_BAR", preparationTime: 7, isFeatured: true, availableFrom: "07:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["smoothie","avocado"] },
      { name: "Watermelon Juice", description: "Fresh watermelon juice, chilled and refreshing", price: 5000, category: "JUICE_BAR", preparationTime: 5, availableFrom: "07:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["watermelon"] },

      // Fresh Market
      { name: "Tomatoes (1kg)", description: "Fresh local tomatoes, farm picked", price: 3000, category: "FRESH_MARKET", unit: "kg", availableFrom: "07:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["vegetables"] },
      { name: "Matooke (bunch)", description: "Fresh green bananas (matooke)", price: 10000, category: "FRESH_MARKET", unit: "bunch", isFeatured: true, availableFrom: "07:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["local","staple"] },
      { name: "Avocado (3 pieces)", description: "Ripe Ugandan avocados", price: 5000, category: "FRESH_MARKET", unit: "3 pieces", availableFrom: "07:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["fruit"] },

      // Dry Market
      { name: "Rice (2kg)", description: "Premium Uganda long grain white rice", price: 12000, category: "DRY_MARKET", unit: "2kg", availableFrom: "08:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat"], tags: ["staple"] },
      { name: "Beans (1kg)", description: "Dried red kidney beans", price: 6000, category: "DRY_MARKET", unit: "kg", availableFrom: "08:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat"], tags: ["protein"] },
      { name: "Posho (2kg)", description: "Fine maize flour for making posho", price: 8000, category: "DRY_MARKET", unit: "2kg", availableFrom: "08:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat"], tags: ["staple"] },

      // Roasts & Grills - Chicken
      { name: "Half Chicken", description: "A golden, flame-roasted half bird - crispy skin, juicy meat, served with your choice of fries or matooke and kachumbari", price: 25000, category: "ROASTS", preparationTime: 25, isFeatured: true, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["popular","chicken"] },
      { name: "Whole Chicken", description: "The full bird - slow-roasted to perfection with African spices. Perfect for sharing. Comes with two sides", price: 40000, category: "ROASTS", preparationTime: 35, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["chicken","sharing"] },

      // Roasts & Grills - Goat
      { name: "Goat Skewer", description: "Tender goat pieces threaded on skewers and grilled over open flame. Served with kachumbari and sauce", price: 12000, category: "ROASTS", preparationTime: 15, isFeatured: true, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["goat","skewer"] },
      { name: "Goat Leg", description: "A magnificent slow-roasted goat leg, herb-crusted with rosemary, lemon and garlic. Built for a feast", price: 180000, category: "ROASTS", preparationTime: 45, availableFrom: "12:00", availableTo: "20:00", availableDays: ["fri","sat","sun"], tags: ["goat","premium"] },
      { name: "Whole Goat", description: "The ultimate centrepiece - a whole goat spit-roasted to smoky perfection. Ideal for large events and celebrations", price: 550000, category: "ROASTS", preparationTime: 120, availableFrom: "10:00", availableTo: "20:00", availableDays: ["sat","sun"], tags: ["goat","event"] },

      // Roasts & Grills - Pork
      { name: "Pork Skewer", description: "Juicy pork pieces skewered and grilled over charcoal, served with chilli sauce and kachumbari", price: 12000, category: "ROASTS", preparationTime: 15, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pork","skewer"] },
      { name: "Pork Ribs", description: "Slow-cooked pork ribs with our smoky BBQ glaze, falling off the bone and full of flavour", price: 22000, category: "ROASTS", preparationTime: 25, isFeatured: true, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pork","ribs"] },
      { name: "Pork Chops", description: "Thick-cut seasoned pork chops, grilled to a beautiful char and served with your choice of side", price: 25000, category: "ROASTS", preparationTime: 20, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pork"] },

      // Roasts & Grills - Fish
      { name: "Grilled Fish", description: "Fresh whole fish, seasoned with lemon, herbs and spices, grilled to perfection and served on a bed of roasted vegetables", price: 32000, category: "ROASTS", preparationTime: 30, isFeatured: true, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["fish","fresh"] },

      // Specials & Toppings
      { name: "Chicken + Matooke", description: "Stewed chicken with steamed Matooke - a Ugandan household favourite, served with groundnut sauce", price: 16000, category: "SPECIALS", preparationTime: 20, isFeatured: true, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["local","chicken","popular"] },
      { name: "Beef + Rice", description: "Juicy stewed beef served alongside fragrant steamed rice, with fresh kachumbari", price: 14000, category: "SPECIALS", preparationTime: 15, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["beef","rice"] },
      { name: "Loaded Fries", description: "Crispy golden fries loaded with your choice of chicken or beef, smothered in cheese sauce and our signature Chakula drizzle", price: 14000, category: "SPECIALS", preparationTime: 12, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["fries","loaded"] },
      { name: "Beans + Posho", description: "Creamy stewed beans with smooth posho - affordable, filling and full of East African comfort", price: 8000, category: "SPECIALS", preparationTime: 10, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["local","value"] },
      { name: "Wrap + Fries + Drink", description: "Any wrap paired with crispy fries and your choice of fresh juice or soda. The ultimate meal deal", price: 20000, category: "SPECIALS", preparationTime: 15, availableFrom: "11:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["combo","deal"] },
      { name: "Loaded Rolex", description: "The classic Ugandan Rolex taken to the next level - extra filling, premium toppings and our special sauce", price: 11000, category: "SPECIALS", preparationTime: 10, isFeatured: true, availableFrom: "06:00", availableTo: "11:00", availableDays: ["mon","tue","wed","thu","fri","sat"], tags: ["local","rolex","loaded"] },

      // Bakery & Breakfast
      { name: "Bread", description: "Soft, fluffy loaves baked fresh every morning. White, brown or whole grain", price: 6000, category: "BREAKFAST", preparationTime: 5, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["bread","daily"] },
      { name: "Rose Buns", description: "Beautifully shaped soft buns, golden on the outside, pillowy on the inside", price: 2000, category: "BREAKFAST", preparationTime: 5, isFeatured: true, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["bread","signature"] },
      { name: "Cinnamon Rolls", description: "Spiral rolls loaded with cinnamon sugar, drizzled with warm cream cheese icing", price: 4000, category: "BREAKFAST", preparationTime: 5, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pastry","sweet"] },
      { name: "Sausages", description: "Grilled or pan-fried sausages - juicy, smoky and full of flavour", price: 5000, category: "BREAKFAST", preparationTime: 8, availableFrom: "07:00", availableTo: "10:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["sausage","grilled"] },
      { name: "Muffins", description: "Moist, fluffy muffins in rotating flavours - blueberry, chocolate chip, banana and more", price: 3000, category: "BREAKFAST", preparationTime: 3, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pastry","sweet"] },
      { name: "Cake & Cake Slice", description: "Rich, moist celebration cakes - chocolate, vanilla, carrot and more. Order whole or grab a slice", price: 15000, category: "BREAKFAST", preparationTime: 5, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["cake","celebration"] },
      { name: "Chicken / Beef Pie", description: "Golden flaky pastry filled with creamy chicken or rich beef filling. Baked to perfection", price: 4000, category: "BREAKFAST", preparationTime: 5, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pie","savoury"] },
      { name: "Cookies", description: "Chunky, chewy cookies loaded with chocolate chips, nuts or raisins", price: 2000, category: "BREAKFAST", preparationTime: 3, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["cookies","sweet"] },
      { name: "Daddies", description: "Classic East African mandazi-style fried dough - lightly sweet, perfectly fluffy and great with tea", price: 1000, category: "BREAKFAST", preparationTime: 5, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["local","fried"] },
      { name: "Egg Roll", description: "Crispy golden egg rolls stuffed with seasoned vegetables and meat", price: 2000, category: "BREAKFAST", preparationTime: 8, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["snack","egg"] },
      { name: "Meat Balls", description: "Tender, seasoned meatballs in a rich tomato or BBQ sauce", price: 3000, category: "BREAKFAST", preparationTime: 10, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["meat","snack"] },
      { name: "Spring Rolls", description: "Light, crunchy spring rolls packed with veggies and your choice of chicken or beef", price: 2500, category: "BREAKFAST", preparationTime: 10, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["snack","crispy"] },
      { name: "Pan Cakes", description: "Fluffy stacked pancakes with maple syrup, fresh fruit and butter", price: 5000, category: "BREAKFAST", preparationTime: 10, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["breakfast","pancakes"] },
      { name: "Doughnuts", description: "Soft, pillowy doughnuts - glazed, iced or filled with jam or cream", price: 2000, category: "BREAKFAST", preparationTime: 5, isFeatured: true, availableFrom: "06:00", availableTo: "19:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["pastry","sweet"] },

      // Party & Group Platters
      { name: "Small Platter", description: "Serves 2-3 people - Chicken, beef, fries, wrap slices, sauces", price: 45000, category: "PLATTERS", preparationTime: 30, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["platter","sharing"] },
      { name: "Medium Platter", description: "Serves 3-5 people - Full spread with premium cuts and extra sauces", price: 75000, category: "PLATTERS", preparationTime: 40, isFeatured: true, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["platter","sharing","premium"] },
      { name: "Large Platter", description: "Serves 6-8 people - Everything on the menu, built to impress", price: 130000, category: "PLATTERS", preparationTime: 60, availableFrom: "11:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["platter","sharing","event"] },

      // Drinks & Beverages
      { name: "Fresh Juices & Blends", description: "Freshly blended to order - Mango, Avocado, Banana, Watermelon, Orange, Pineapple, Passion Fruit. Also available: Weight Loss blends, Digestion mixes, Detox and Metabolism boosters", price: 5000, category: "DRINKS", preparationTime: 5, unit: "glass", isFeatured: true, availableFrom: "07:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["juice","fresh","healthy"] },
      { name: "Smoothies", description: "Thick, creamy blended smoothies - Mixed fruit, Banana + Peanut, Tropical blend and more", price: 8000, category: "DRINKS", preparationTime: 5, unit: "cup", availableFrom: "07:00", availableTo: "21:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["smoothie","creamy"] },
      { name: "Coffee", description: "Iced coffee (Americano, Latte, Spanish Latte, Caramel Macchiato, Oreo Latte and more), Milky series (Matcha, Strawberry, Chocolate, Taro) and Hot coffee. Available in 16oz and 22oz", price: 5000, category: "DRINKS", preparationTime: 5, isFeatured: true, availableFrom: "06:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["coffee","hot","iced"] },
      { name: "Tea", description: "Hot tea (African Tea, Spiced Chai, Black, Green, Ginger, Lemon, Mint) and Iced tea (Lemon, Peach, Passion, Hibiscus, Green)", price: 3000, category: "DRINKS", preparationTime: 5, availableFrom: "06:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["tea","hot","iced"] },
      { name: "Mocktails & Cocktails", description: "Mocktails (Virgin Mojito, Shirley Temple, Pin-a Colada), Cocktails (Mojito, Cosmopolitan, Margarita, Gin & Tonic), plus Wine & Beer selection", price: 10000, category: "DRINKS", preparationTime: 8, availableFrom: "11:00", availableTo: "23:59", availableDays: ["tue","wed","thu","fri","sat","sun"], tags: ["cocktail","mocktail","wine","beer"] },
      { name: "Water & Sodas", description: "Still water, sparkling water and a range of chilled sodas to go with your meal", price: 2000, category: "DRINKS", availableFrom: "07:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["water","soda"] },

      // Wines & Spirits
      { name: "Red Wine", description: "A smooth, full-bodied red wine - perfect with grilled meats and hearty meals", price: 35000, category: "WINES_SPIRITS", unit: "bottle", isFeatured: true, availableFrom: "11:00", availableTo: "23:59", availableDays: ["tue","wed","thu","fri","sat","sun"], tags: ["wine","red"] },
      { name: "White Wine", description: "A crisp, refreshing white wine - ideal with seafood, chicken and light dishes", price: 35000, category: "WINES_SPIRITS", unit: "bottle", availableFrom: "11:00", availableTo: "23:59", availableDays: ["tue","wed","thu","fri","sat","sun"], tags: ["wine","white"] },
      { name: "Whisky", description: "Premium whisky - smooth, rich and warming. Served neat, on the rocks or with a mixer", price: 25000, category: "WINES_SPIRITS", unit: "shot", isFeatured: true, availableFrom: "11:00", availableTo: "23:59", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["whisky","spirits"] },
      { name: "Gin & Tonic", description: "Classic gin and tonic with fresh lime and premium botanicals", price: 15000, category: "WINES_SPIRITS", availableFrom: "11:00", availableTo: "23:59", availableDays: ["tue","wed","thu","fri","sat","sun"], tags: ["gin","cocktail"] },
      { name: "Beer", description: "Chilled local and imported beers - the perfect companion to any meal", price: 8000, category: "WINES_SPIRITS", unit: "bottle", availableFrom: "10:00", availableTo: "22:00", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["beer","lager"] },
      { name: "Vodka", description: "Premium vodka - smooth and versatile. Enjoy it straight or in your favourite cocktail", price: 20000, category: "WINES_SPIRITS", unit: "shot", availableFrom: "11:00", availableTo: "23:59", availableDays: ["mon","tue","wed","thu","fri","sat","sun"], tags: ["vodka","spirits"] },
    ];

    let prodCount = 0;
    let errors: string[] = [];
    const createdProducts: { id: string; name: string }[] = [];

    for (const product of products) {
      try {
        const created = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category as any,
            preparationTime: product.preparationTime || null,
            isFeatured: product.isFeatured || false,
            isAvailable: true,
            tags: product.tags ?? [],
            allergens: [],
            unit: product.unit || null,
            availableFrom: product.availableFrom || null,
            availableTo: product.availableTo || null,
            availableDays: product.availableDays ?? [],
          },
        });
        createdProducts.push({ id: created.id, name: created.name });
        prodCount++;
      } catch (e: any) {
        errors.push(`${product.name}: ${e.message}`);
      }
    }

    // Seed variants for select products
    let variantCount = 0;
    try {
      const coffee = createdProducts.find(p => p.name.includes("Coffee"));
      if (coffee) {
        await prisma.productVariant.createMany({
          data: [
            { productId: coffee.id, name: "Small (16oz)", price: 4000, stock: 50, isActive: true },
            { productId: coffee.id, name: "Large (22oz)", price: 6000, stock: 50, isActive: true },
          ],
        });
        variantCount += 2;
      }
      const juice = createdProducts.find(p => p.name.includes("Fresh Juices"));
      if (juice) {
        await prisma.productVariant.createMany({
          data: [
            { productId: juice.id, name: "Regular (500ml)", price: 5000, stock: 30, isActive: true },
            { productId: juice.id, name: "Large (750ml)", price: 7000, stock: 30, isActive: true },
          ],
        });
        variantCount += 2;
      }
      const smoothie = createdProducts.find(p => p.name.includes("Smoothie"));
      if (smoothie) {
        await prisma.productVariant.createMany({
          data: [
            { productId: smoothie.id, name: "Regular (500ml)", price: 8000, stock: 30, isActive: true },
            { productId: smoothie.id, name: "Large (750ml)", price: 10000, stock: 30, isActive: true },
          ],
        });
        variantCount += 2;
      }
    } catch (e: any) {
      console.log("Variants skipped:", e.message);
    }

    return NextResponse.json({
      success: true,
      categories: catCount,
      products: prodCount,
      variants: variantCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
