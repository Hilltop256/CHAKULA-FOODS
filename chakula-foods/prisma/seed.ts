import { PrismaClient, ProductCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@chakulafoods.ug" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@chakulafoods.ug",
      phone: "+256700000000",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Create categories
  const categories: { name: string; type: ProductCategory; sortOrder: number }[] = [
    { name: "Fast Food", type: "FAST_FOOD", sortOrder: 1 },
    { name: "Bakery", type: "BAKERY", sortOrder: 2 },
    { name: "Juice Bar", type: "JUICE_BAR", sortOrder: 3 },
    { name: "Fresh Market", type: "FRESH_MARKET", sortOrder: 4 },
    { name: "Dry Market", type: "DRY_MARKET", sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.type },
      update: {},
      create: { name: cat.name, type: cat.type, sortOrder: cat.sortOrder },
    });
  }
  console.log("Created categories");

  // Create products
  const products: { name: string; description: string; price: number; category: ProductCategory; isFeatured?: boolean; preparationTime?: number; tags: string[]; unit?: string; stock?: number }[] = [
    { name: "Chicken Burger", description: "Juicy chicken patty with fresh veggies", price: 15000, category: "FAST_FOOD", isFeatured: true, preparationTime: 15, tags: ["burger", "chicken"] },
    { name: "Beef Burger", description: "Premium beef patty with cheese", price: 18000, category: "FAST_FOOD", isFeatured: true, preparationTime: 15, tags: ["burger", "beef"] },
    { name: "French Fries (Large)", description: "Crispy golden fries", price: 8000, category: "FAST_FOOD", isFeatured: true, preparationTime: 10, tags: ["fries", "sides"] },
    { name: "Grilled Chicken", description: "Grilled chicken with herbs", price: 25000, category: "FAST_FOOD", preparationTime: 20, tags: ["chicken", "grilled"] },
    { name: "Pizza (Medium)", description: "Cheese pizza with toppings", price: 35000, category: "FAST_FOOD", isFeatured: true, preparationTime: 25, tags: ["pizza"] },
    { name: "Soda (500ml)", description: "Assorted soft drinks", price: 3000, category: "FAST_FOOD", preparationTime: 1, tags: ["drinks", "soda"] },
    
    { name: "Croissant", description: "Buttery French pastry", price: 6000, category: "BAKERY", isFeatured: true, preparationTime: 5, tags: ["pastry", "breakfast"] },
    { name: "Bread Loaf", description: "Freshly baked bread", price: 5000, category: "BAKERY", isFeatured: true, preparationTime: 5, tags: ["bread"] },
    { name: "Chelsea Bun", description: "Sweet bun with cinnamon", price: 4500, category: "BAKERY", preparationTime: 5, tags: ["bun", "sweet"] },
    { name: "Cake Slice", description: "Chocolate cake slice", price: 8000, category: "BAKERY", isFeatured: true, preparationTime: 5, tags: ["cake", "dessert"] },
    { name: "Mandazi", description: "Ugandan fried dough", price: 2000, category: "BAKERY", preparationTime: 5, tags: ["mandazi", "local"] },
    { name: "Scones", description: "Plain and fruit scones", price: 4000, category: "BAKERY", preparationTime: 5, tags: ["scones", "tea"] },

    { name: "Fresh Orange Juice", description: "Freshly squeezed", price: 8000, category: "JUICE_BAR", isFeatured: true, preparationTime: 5, tags: ["juice", "orange"] },
    { name: "Mango Juice", description: "Sweet mango blend", price: 8000, category: "JUICE_BAR", isFeatured: true, preparationTime: 5, tags: ["juice", "mango"] },
    { name: "Passion Fruit Juice", description: "Tropical passion fruit", price: 10000, category: "JUICE_BAR", preparationTime: 5, tags: ["juice", "passion"] },
    { name: "Smoothie Bowl", description: "Fruit smoothie with toppings", price: 15000, category: "JUICE_BAR", preparationTime: 10, tags: ["smoothie", "healthy"] },
    { name: "Milkshake (Chocolate)", description: "Creamy chocolate milkshake", price: 10000, category: "JUICE_BAR", preparationTime: 5, tags: ["milkshake", "drinks"] },

    { name: "Bananas (Bunch)", description: "Fresh local bananas", price: 5000, category: "FRESH_MARKET", unit: "bunch", stock: 50, tags: ["fruit", "local"] },
    { name: "Mangoes (kg)", description: "Sweet ripe mangoes", price: 8000, category: "FRESH_MARKET", unit: "kg", stock: 30, tags: ["fruit", "seasonal"] },
    { name: "Avocados (pcs)", description: "Ripe Hass avocados", price: 3000, category: "FRESH_MARKET", unit: "pc", stock: 40, tags: ["fruit", "healthy"] },
    { name: "Tomatoes (kg)", description: "Fresh red tomatoes", price: 6000, category: "FRESH_MARKET", unit: "kg", stock: 25, tags: ["vegetable", "local"] },
    { name: "Onions (kg)", description: "Red onions", price: 5000, category: "FRESH_MARKET", unit: "kg", stock: 30, tags: ["vegetable", "local"] },
    { name: "Spinach (bunch)", description: "Fresh Nakati/spinach", price: 2000, category: "FRESH_MARKET", unit: "bunch", stock: 20, tags: ["vegetable", "local"] },

    { name: "Rice (kg)", description: "Super rice", price: 6000, category: "DRY_MARKET", unit: "kg", stock: 100, tags: ["grain", "staple"] },
    { name: "Beans (kg)", description: "Kahura beans", price: 7000, category: "DRY_MARKET", unit: "kg", stock: 80, tags: ["legume", "protein"] },
    { name: "Groundnuts (kg)", description: "Roasted groundnuts", price: 12000, category: "DRY_MARKET", unit: "kg", stock: 40, tags: ["nuts", "local"] },
    { name: "Cassava (kg)", description: "Fresh cassava", price: 4000, category: "DRY_MARKET", unit: "kg", stock: 50, tags: ["staple", "local"] },
    { name: "Maize Flour (kg)", description: "Corn flour for posho", price: 3500, category: "DRY_MARKET", unit: "kg", stock: 60, tags: ["flour", "staple"] },
    { name: "Cooking Oil (L)", description: "Vegetable oil 1L", price: 8000, category: "DRY_MARKET", unit: "litre", stock: 50, tags: ["oil", "cooking"] },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log("Created products");

  // Create tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({ data: { number: `T${i}`, capacity: i <= 4 ? 2 : i <= 7 ? 4 : 6 } });
  }
  console.log("Created tables");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
