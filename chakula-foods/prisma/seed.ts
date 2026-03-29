import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@chakulafoods.ug" },
    update: {},
    create: {
      name: "Chakula Admin",
      email: "admin@chakulafoods.ug",
      phone: "0700000001",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── Demo customer ───────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Jane Nakato",
      email: "customer@example.com",
      phone: "0771234567",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });
  console.log("✅ Demo customer:", customer.email);

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = [
    { name: "Fast Food", type: "FAST_FOOD" as const, sortOrder: 1 },
    { name: "Bakery", type: "BAKERY" as const, sortOrder: 2 },
    { name: "Juice Bar", type: "JUICE_BAR" as const, sortOrder: 3 },
    { name: "Fresh Market", type: "FRESH_MARKET" as const, sortOrder: 4 },
    { name: "Dry Market", type: "DRY_MARKET" as const, sortOrder: 5 },
    { name: "Roasts & Grills", type: "ROASTS" as const, sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { type: cat.type },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // ── Products ────────────────────────────────────────────────────────────────
  const products = [
    // Fast Food
    {
      name: "Chicken Burger",
      description: "Crispy chicken fillet with lettuce, tomato and special sauce",
      price: 15000,
      category: "FAST_FOOD" as const,
      preparationTime: 15,
      isFeatured: true,
      tags: ["popular", "chicken"],
    },
    {
      name: "Beef Burger",
      description: "Juicy beef patty with cheese, onions and pickles",
      price: 18000,
      category: "FAST_FOOD" as const,
      preparationTime: 15,
      isFeatured: true,
      tags: ["popular", "beef"],
    },
    {
      name: "Chips (French Fries)",
      description: "Golden crispy chips served with ketchup",
      price: 8000,
      category: "FAST_FOOD" as const,
      preparationTime: 10,
      tags: ["sides"],
    },
    {
      name: "Grilled Chicken",
      description: "Whole grilled chicken seasoned with Ugandan spices",
      price: 35000,
      category: "FAST_FOOD" as const,
      preparationTime: 25,
      isFeatured: true,
      tags: ["chicken", "grilled"],
    },
    {
      name: "Pizza Margherita",
      description: "Classic tomato sauce with mozzarella and fresh basil",
      price: 25000,
      category: "FAST_FOOD" as const,
      preparationTime: 20,
      tags: ["pizza"],
    },
    {
      name: "Rolex",
      description: "Uganda's favourite street food - egg rolled in chapati with vegetables",
      price: 5000,
      category: "FAST_FOOD" as const,
      preparationTime: 8,
      isFeatured: true,
      tags: ["local", "popular"],
    },

    // Bakery
    {
      name: "Bread Loaf",
      description: "Freshly baked white bread loaf",
      price: 6000,
      category: "BAKERY" as const,
      preparationTime: 5,
      isFeatured: true,
      tags: ["bread"],
    },
    {
      name: "Banana Cake",
      description: "Moist banana cake with cream cheese frosting",
      price: 30000,
      category: "BAKERY" as const,
      preparationTime: 5,
      isFeatured: true,
      tags: ["cake", "sweet"],
    },
    {
      name: "Croissant",
      description: "Buttery flaky croissant, baked fresh daily",
      price: 5000,
      category: "BAKERY" as const,
      preparationTime: 3,
      tags: ["pastry"],
    },
    {
      name: "Mandazi",
      description: "Traditional East African fried dough, lightly sweet",
      price: 2000,
      category: "BAKERY" as const,
      preparationTime: 5,
      unit: "piece",
      tags: ["local", "fried"],
    },

    // Juice Bar
    {
      name: "Fresh Mango Juice",
      description: "100% fresh mango blended to order",
      price: 7000,
      category: "JUICE_BAR" as const,
      preparationTime: 5,
      isFeatured: true,
      tags: ["mango", "fresh"],
    },
    {
      name: "Passion Fruit Juice",
      description: "Freshly squeezed passion fruit",
      price: 6000,
      category: "JUICE_BAR" as const,
      preparationTime: 5,
      tags: ["passion", "fresh"],
    },
    {
      name: "Avocado Smoothie",
      description: "Creamy avocado blended with milk and honey",
      price: 9000,
      category: "JUICE_BAR" as const,
      preparationTime: 7,
      isFeatured: true,
      tags: ["smoothie", "avocado"],
    },
    {
      name: "Watermelon Juice",
      description: "Fresh watermelon juice, chilled and refreshing",
      price: 5000,
      category: "JUICE_BAR" as const,
      preparationTime: 5,
      tags: ["watermelon"],
    },

    // Fresh Market
    {
      name: "Tomatoes (1kg)",
      description: "Fresh local tomatoes, farm picked",
      price: 3000,
      category: "FRESH_MARKET" as const,
      unit: "kg",
      tags: ["vegetables"],
    },
    {
      name: "Matooke (bunch)",
      description: "Fresh green bananas (matooke)",
      price: 10000,
      category: "FRESH_MARKET" as const,
      unit: "bunch",
      isFeatured: true,
      tags: ["local", "staple"],
    },
    {
      name: "Avocado (3 pieces)",
      description: "Ripe Ugandan avocados",
      price: 5000,
      category: "FRESH_MARKET" as const,
      unit: "3 pieces",
      tags: ["fruit"],
    },

    // Dry Market
    {
      name: "Rice (2kg)",
      description: "Premium Uganda long grain white rice",
      price: 12000,
      category: "DRY_MARKET" as const,
      unit: "2kg",
      tags: ["staple"],
    },
    {
      name: "Beans (1kg)",
      description: "Dried red kidney beans",
      price: 6000,
      category: "DRY_MARKET" as const,
      unit: "kg",
      tags: ["protein"],
    },
    {
      name: "Posho (2kg)",
      description: "Fine maize flour for making posho",
      price: 8000,
      category: "DRY_MARKET" as const,
      unit: "2kg",
      tags: ["staple"],
    },

    // Roasts & Grills — Chicken
    {
      name: "Half Chicken",
      description: "A golden, flame-roasted half bird — crispy skin, juicy meat, served with your choice of fries or matooke and kachumbari.",
      price: 25000,
      category: "ROASTS" as const,
      preparationTime: 25,
      isFeatured: true,
      tags: ["popular", "chicken"],
    },
    {
      name: "Whole Chicken",
      description: "The full bird — slow-roasted to perfection with African spices. Perfect for sharing. Comes with two sides.",
      price: 40000,
      category: "ROASTS" as const,
      preparationTime: 35,
      tags: ["chicken", "sharing"],
    },

    // Roasts & Grills — Goat
    {
      name: "Goat Skewer",
      description: "Tender goat pieces threaded on skewers and grilled over open flame. Served with kachumbari and sauce.",
      price: 12000,
      category: "ROASTS" as const,
      preparationTime: 15,
      isFeatured: true,
      tags: ["goat", "skewer"],
    },
    {
      name: "Goat Leg",
      description: "A magnificent slow-roasted goat leg, herb-crusted with rosemary, lemon and garlic. Built for a feast.",
      price: 180000,
      category: "ROASTS" as const,
      preparationTime: 45,
      tags: ["goat", "premium"],
    },
    {
      name: "Whole Goat",
      description: "The ultimate centrepiece — a whole goat spit-roasted to smoky perfection. Ideal for large events and celebrations.",
      price: 550000,
      category: "ROASTS" as const,
      preparationTime: 120,
      tags: ["goat", "event"],
    },

    // Roasts & Grills — Pork
    {
      name: "Pork Skewer",
      description: "Juicy pork pieces skewered and grilled over charcoal, served with chilli sauce and kachumbari.",
      price: 12000,
      category: "ROASTS" as const,
      preparationTime: 15,
      tags: ["pork", "skewer"],
    },
    {
      name: "Pork Ribs",
      description: "Slow-cooked pork ribs with our smoky BBQ glaze, falling off the bone and full of flavour.",
      price: 22000,
      category: "ROASTS" as const,
      preparationTime: 25,
      isFeatured: true,
      tags: ["pork", "ribs"],
    },
    {
      name: "Pork Chops",
      description: "Thick-cut seasoned pork chops, grilled to a beautiful char and served with your choice of side.",
      price: 25000,
      category: "ROASTS" as const,
      preparationTime: 20,
      tags: ["pork"],
    },

    // Roasts & Grills — Fish
    {
      name: "Grilled Fish",
      description: "Fresh whole fish, seasoned with lemon, herbs and spices, grilled to perfection and served on a bed of roasted vegetables.",
      price: 32000,
      category: "ROASTS" as const,
      preparationTime: 30,
      isFeatured: true,
      tags: ["fish", "fresh"],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        allergens: [],
        tags: product.tags,
        isAvailable: true,
      },
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\nAdmin login:");
  console.log("  Email: admin@chakulafoods.ug");
  console.log("  Password: admin123");
  console.log("\nDemo customer login:");
  console.log("  Email: customer@example.com");
  console.log("  Password: customer123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
