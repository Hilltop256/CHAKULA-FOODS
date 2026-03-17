import { PrismaClient, ServiceCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CHAKULA-FOODS database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chakulafoods.com' },
    update: {},
    create: {
      email: 'admin@chakulafoods.com',
      name: 'Admin User',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user:', admin.email);

  // Staff user
  const staffHash = await bcrypt.hash('Staff@1234', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@chakulafoods.com' },
    update: {},
    create: {
      email: 'staff@chakulafoods.com',
      name: 'Staff Member',
      passwordHash: staffHash,
      role: 'STAFF',
      isVerified: true,
    },
  });
  console.log('✅ Staff user:', staff.email);

  // Demo customer
  const customerHash = await bcrypt.hash('Customer@1234', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Customer',
      phone: '+254700000000',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      isVerified: true,
      address: '123 Westlands Road',
      city: 'Nairobi',
    },
  });
  console.log('✅ Customer user:', customer.email);

  // Categories
  const categoriesData = [
    { name: 'Burgers & Sandwiches', service: ServiceCategory.FAST_FOOD, description: 'Juicy burgers, wraps and sandwiches' },
    { name: 'Fried Chicken', service: ServiceCategory.FAST_FOOD, description: 'Crispy golden fried chicken pieces & platters' },
    { name: 'Pizza', service: ServiceCategory.FAST_FOOD, description: 'Stone-baked artisan pizzas' },
    { name: 'Fries & Sides', service: ServiceCategory.FAST_FOOD, description: 'Crispy fries, onion rings, and more' },
    { name: 'Artisan Bread', service: ServiceCategory.BAKERY, description: 'Freshly baked loaves and rolls' },
    { name: 'Cakes & Pastries', service: ServiceCategory.BAKERY, description: 'Custom cakes, cupcakes, and pastries' },
    { name: 'Biscuits & Cookies', service: ServiceCategory.BAKERY, description: 'Handcrafted biscuits and cookies' },
    { name: 'Fresh Juices', service: ServiceCategory.JUICE, description: 'Cold-pressed 100% natural fruit juices' },
    { name: 'Smoothies & Bowls', service: ServiceCategory.JUICE, description: 'Power-packed smoothies and acai bowls' },
    { name: 'Coffee Classics', service: ServiceCategory.COFFEE_TEA, description: 'Espresso, cappuccino, latte and more' },
    { name: 'Tea & Infusions', service: ServiceCategory.COFFEE_TEA, description: 'Masala chai, herbal teas, and infusions' },
    { name: 'Custom Meals', service: ServiceCategory.CUSTOMISED_MEALS, description: 'Request a fully customised meal for any occasion' },
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const slug = cat.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...cat, slug },
    });
    categories.push(category);
  }
  console.log(`✅ ${categories.length} categories seeded`);

  const getCat = (name: string) => categories.find((c) => c.name === name)!;

  // Products
  const productsData = [
    // Fast Food
    {
      name: 'Classic Beef Burger',
      description: 'Juicy 150g beef patty, lettuce, tomato, cheese, caramelized onions, and our special sauce in a brioche bun',
      price: 550,
      isFeatured: true,
      preparationTime: 15,
      calories: 650,
      categoryId: getCat('Burgers & Sandwiches').id,
      tags: ['popular', 'beef', 'burger'],
      allergens: ['gluten', 'dairy'],
    },
    {
      name: 'Chicken Avocado Wrap',
      description: 'Grilled chicken breast, fresh avocado, mixed greens, and garlic mayo in a toasted tortilla',
      price: 480,
      isFeatured: false,
      preparationTime: 12,
      calories: 520,
      categoryId: getCat('Burgers & Sandwiches').id,
      tags: ['chicken', 'healthy', 'wrap'],
      allergens: ['gluten'],
    },
    {
      name: 'Crispy Chicken Bucket (6pcs)',
      description: 'Six pieces of our signature crispy golden fried chicken with homestyle coleslaw and dipping sauce',
      price: 1200,
      isFeatured: true,
      preparationTime: 20,
      calories: 1800,
      categoryId: getCat('Fried Chicken').id,
      tags: ['popular', 'chicken', 'bucket', 'sharing'],
      allergens: ['gluten'],
    },
    {
      name: 'Spicy Margherita Pizza',
      description: 'Stone-baked pizza with San Marzano tomato sauce, fresh mozzarella, basil, and a kick of chili',
      price: 900,
      isFeatured: true,
      preparationTime: 25,
      calories: 780,
      categoryId: getCat('Pizza').id,
      tags: ['pizza', 'vegetarian', 'spicy'],
      allergens: ['gluten', 'dairy'],
    },
    {
      name: 'Loaded Fries',
      description: 'Golden crispy fries topped with nacho cheese, jalapeños, sour cream, and crispy bacon bits',
      price: 350,
      isFeatured: false,
      preparationTime: 10,
      calories: 680,
      categoryId: getCat('Fries & Sides').id,
      tags: ['fries', 'side', 'cheese'],
      allergens: ['gluten', 'dairy'],
    },
    // Bakery
    {
      name: 'Sourdough Loaf',
      description: 'Traditional 24-hour fermented sourdough with crispy crust and soft chewy interior',
      price: 380,
      isFeatured: true,
      preparationTime: 5,
      calories: 250,
      categoryId: getCat('Artisan Bread').id,
      tags: ['sourdough', 'artisan', 'fresh'],
      allergens: ['gluten'],
    },
    {
      name: 'Birthday Celebration Cake',
      description: 'Moist vanilla or chocolate sponge layered with cream and fresh fruit. Customizable design (order 48hrs ahead)',
      price: 2500,
      isFeatured: true,
      preparationTime: 1440, // 24hrs
      calories: 350,
      categoryId: getCat('Cakes & Pastries').id,
      tags: ['cake', 'celebration', 'custom'],
      allergens: ['gluten', 'dairy', 'eggs'],
    },
    {
      name: 'Chocolate Chip Cookies (12pcs)',
      description: 'Freshly baked chunky chocolate chip cookies with sea salt flakes — perfectly crisp outside, gooey inside',
      price: 350,
      isFeatured: false,
      preparationTime: 5,
      calories: 180,
      categoryId: getCat('Biscuits & Cookies').id,
      tags: ['cookies', 'chocolate', 'snack'],
      allergens: ['gluten', 'dairy', 'eggs'],
    },
    // Juices
    {
      name: 'Tropical Paradise Juice',
      description: 'Cold-pressed blend of mango, pineapple, passion fruit, and orange — 100% natural, no added sugar',
      price: 280,
      isFeatured: true,
      preparationTime: 5,
      calories: 180,
      categoryId: getCat('Fresh Juices').id,
      tags: ['juice', 'tropical', 'cold-pressed', 'healthy'],
      allergens: [],
    },
    {
      name: 'Green Power Smoothie',
      description: 'Spinach, banana, mango, chia seeds, and almond milk — the perfect energy boost',
      price: 350,
      isFeatured: true,
      preparationTime: 5,
      calories: 220,
      categoryId: getCat('Smoothies & Bowls').id,
      tags: ['smoothie', 'healthy', 'green', 'vegan'],
      allergens: ['nuts'],
    },
    // Coffee & Tea
    {
      name: 'Classic Cappuccino',
      description: 'Rich double espresso with steamed whole milk and velvety microfoam — made with single-origin Kenyan beans',
      price: 250,
      isFeatured: true,
      preparationTime: 5,
      calories: 120,
      categoryId: getCat('Coffee Classics').id,
      tags: ['coffee', 'espresso', 'cappuccino'],
      allergens: ['dairy'],
    },
    {
      name: 'Masala Chai',
      description: 'Traditional East African spiced milk tea with cardamom, ginger, cinnamon, and black pepper',
      price: 180,
      isFeatured: true,
      preparationTime: 8,
      calories: 150,
      categoryId: getCat('Tea & Infusions').id,
      tags: ['chai', 'tea', 'spiced', 'traditional'],
      allergens: ['dairy'],
    },
  ];

  for (const productData of productsData) {
    const slug = productData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: { ...productData, slug, images: [] },
    });
  }
  console.log(`✅ ${productsData.length} products seeded`);

  // Tables for in-house dining
  const tablesData = [
    { number: 'T01', capacity: 2, location: 'Indoor - Window' },
    { number: 'T02', capacity: 2, location: 'Indoor - Window' },
    { number: 'T03', capacity: 4, location: 'Indoor - Central' },
    { number: 'T04', capacity: 4, location: 'Indoor - Central' },
    { number: 'T05', capacity: 4, location: 'Indoor - Central' },
    { number: 'T06', capacity: 6, location: 'Indoor - Corner' },
    { number: 'T07', capacity: 6, location: 'Indoor - Corner' },
    { number: 'T08', capacity: 8, location: 'Private Room' },
    { number: 'OT01', capacity: 2, location: 'Outdoor Terrace' },
    { number: 'OT02', capacity: 4, location: 'Outdoor Terrace' },
    { number: 'OT03', capacity: 4, location: 'Outdoor Terrace' },
    { number: 'OT04', capacity: 6, location: 'Outdoor Terrace' },
  ];

  for (const tableData of tablesData) {
    await prisma.table.upsert({
      where: { number: tableData.number },
      update: {},
      create: tableData,
    });
  }
  console.log(`✅ ${tablesData.length} tables seeded`);

  // Subscription Plans
  const plansData = [
    {
      name: 'Weekly Bakery Box',
      description: 'Fresh bakery items delivered every week — sourdough, pastries, and seasonal baked goods',
      interval: 'WEEKLY' as const,
      price: 1800,
      deliveries: 1,
      features: ['Fresh sourdough loaf', 'Assorted pastries (4pcs)', 'Seasonal cookies (6pcs)', 'Free delivery', 'Flexible scheduling'],
    },
    {
      name: 'Monthly Coffee & Tea Bundle',
      description: 'Your daily coffee and tea essentials delivered monthly with premium Kenyan blends',
      interval: 'MONTHLY' as const,
      price: 3500,
      deliveries: 4,
      features: ['4 weekly deliveries', 'Premium Kenyan coffee beans (500g)', 'Assorted teas (20 bags)', 'Monthly new flavor discovery', 'Free delivery'],
    },
    {
      name: 'Weekly Family Meal Plan',
      description: 'A wholesome weekly meal delivery for families — mix of fast food, fresh juices, and bakery',
      interval: 'WEEKLY' as const,
      price: 4500,
      deliveries: 1,
      features: ['Serves 4 people', 'Main meals (5 days)', 'Fresh juices (5 bottles)', 'Artisan bread loaf', 'Priority delivery', '10% off additional orders'],
    },
    {
      name: 'Monthly Juice Cleanse',
      description: 'Cold-pressed juice cleanse plan delivered every month — boost your health naturally',
      interval: 'MONTHLY' as const,
      price: 5200,
      deliveries: 4,
      features: ['7 cold-pressed juices per delivery', '4 deliveries per month', 'Customizable juice selections', 'Nutritionist-approved blends', 'Free delivery'],
    },
  ];

  for (const planData of plansData) {
    const slug = planData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    await prisma.subscriptionPlan.upsert({
      where: { slug },
      update: {},
      create: { ...planData, slug },
    });
  }
  console.log(`✅ ${plansData.length} subscription plans seeded`);

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:    admin@chakulafoods.com / Admin@1234');
  console.log('   Staff:    staff@chakulafoods.com / Staff@1234');
  console.log('   Customer: customer@example.com / Customer@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
