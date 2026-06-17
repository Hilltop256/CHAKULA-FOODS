-- ============================================================
-- Chakula Foods — Sample Menu Items for All Departments
-- Departments: Restaurant, Confectionary, Juice Bar,
--              Wine & Liquor, Market Specials
-- ============================================================

DO $$
BEGIN

-- ============================================================
-- RESTAURANT — Categories: Meals, Combo Offers, Breakfast,
--              Lunch, Dinner, Meal Plans
-- ============================================================

INSERT INTO public.products (id, name, description, department, category, price, original_price, image_url, tag, rating, prep_time, available, featured, orders_count)
VALUES
  -- Meals
  (gen_random_uuid(), 'Chicken Stew & Matooke', 'Tender chicken slow-cooked in rich tomato sauce served with steamed matooke', 'Restaurant', 'Meals', 18000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_1cfc51ef2-1765187011661.png', 'Best Seller', 4.9, '25 min', true, true, 320),
  (gen_random_uuid(), 'Rolex (Chapati & Egg Roll)', 'Freshly made chapati rolled with seasoned eggs, tomatoes and onions', 'Restaurant', 'Meals', 6500, NULL, 'https://images.unsplash.com/photo-1691112683306-f971c67cd69e', 'Local Fav', 4.8, '10 min', true, true, 280),
  (gen_random_uuid(), 'Beef Stew & Rice', 'Slow-cooked beef in aromatic tomato and onion stew, served with steamed white rice', 'Restaurant', 'Meals', 16000, NULL, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 'Hearty', 4.7, '30 min', true, false, 190),
  (gen_random_uuid(), 'Posho & Beans', 'Ugandan staple — smooth maize meal served with seasoned kidney beans', 'Restaurant', 'Meals', 8000, NULL, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 'Classic', 4.5, '15 min', true, false, 150),
  -- Combo Offers
  (gen_random_uuid(), 'Beef & Pork Combo Meal', 'Grilled beef ribs + pork chops with chips, coleslaw and a soft drink', 'Restaurant', 'Combo Offers', 28000, 34000, 'https://images.unsplash.com/photo-1664761044412-777bb099a6d0', 'Combo Deal', 4.6, '30 min', true, true, 210),
  (gen_random_uuid(), 'Family Feast Combo (4 pax)', 'Feeds 4 — includes 2 stews, rice, matooke, chapati and 4 drinks', 'Restaurant', 'Combo Offers', 85000, 108000, 'https://img.rocket.new/generatedImages/rocket_gen_img_152440786-1767129340814.png', 'Save 21%', 4.7, '45 min', true, true, 175),
  (gen_random_uuid(), 'Couple Combo', 'Two full meals of your choice + 2 drinks + shared dessert', 'Restaurant', 'Combo Offers', 42000, 52000, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 'Date Night', 4.8, '35 min', true, false, 130),
  -- Breakfast
  (gen_random_uuid(), 'Ugandan Breakfast Plate', 'Eggs, fried plantain, beans, chapati and a cup of black tea', 'Restaurant', 'Breakfast', 14000, NULL, 'https://images.unsplash.com/photo-1733024451049-b9f36d6eb4be', 'Morning Pick', 4.8, '20 min', true, true, 240),
  (gen_random_uuid(), 'Katogo (Offal & Matooke)', 'Traditional Ugandan morning stew with offal and green matooke', 'Restaurant', 'Breakfast', 12000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_1cfc51ef2-1765187011661.png', 'Traditional', 4.5, '15 min', true, false, 160),
  (gen_random_uuid(), 'Mandazi & Chai', 'Freshly fried mandazi served with a pot of spiced masala tea', 'Restaurant', 'Breakfast', 7000, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 'Light Start', 4.6, '10 min', true, false, 200),
  -- Lunch
  (gen_random_uuid(), 'Grilled Tilapia & Rice', 'Whole tilapia grilled with herbs, served with steamed rice and salad', 'Restaurant', 'Lunch', 22000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_1ec37d2b6-1772798873768.png', 'Fresh', 4.7, '35 min', true, true, 185),
  (gen_random_uuid(), 'Matoke & Groundnut Sauce', 'Steamed green bananas in rich groundnut sauce, a Ugandan classic', 'Restaurant', 'Lunch', 11000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_1c950f9b3-1772057293469.png', 'Veg-Friendly', 4.6, '20 min', true, false, 140),
  (gen_random_uuid(), 'Luwombo (Chicken)', 'Chicken steamed in banana leaves with groundnut sauce — a Buganda delicacy', 'Restaurant', 'Lunch', 25000, NULL, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445', 'Delicacy', 4.9, '40 min', true, false, 110),
  -- Dinner
  (gen_random_uuid(), 'Nyama Choma (Goat)', 'Slow-roasted goat meat with kachumbari salad and ugali', 'Restaurant', 'Dinner', 35000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_12303aac5-1766231845831.png', 'Evening Special', 4.8, '40 min', true, true, 220),
  (gen_random_uuid(), 'Pork Muchomo Platter', 'Skewered pork muchomo with roasted cassava and pepper sauce', 'Restaurant', 'Dinner', 28000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_118f02f93-1779095229402.png', 'Weekend Fav', 4.7, '35 min', true, false, 170),
  (gen_random_uuid(), 'Grilled Whole Chicken', 'Marinated whole chicken grilled over charcoal, served with chips and coleslaw', 'Restaurant', 'Dinner', 45000, NULL, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c8', 'Crowd Pleaser', 4.8, '50 min', true, false, 145),
  -- Meal Plans
  (gen_random_uuid(), 'Weekly Meal Plan — 5 Days', 'Breakfast + lunch + dinner for 5 days, customized to your preferences', 'Restaurant', 'Meal Plans', 175000, NULL, 'https://images.unsplash.com/photo-1592111300500-e893c1447151', 'Best Value', 4.9, 'Scheduled', true, true, 95),
  (gen_random_uuid(), 'Office Lunch Plan (10 days)', '10 working-day lunch deliveries to your office, minimum 5 people', 'Restaurant', 'Meal Plans', 280000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_186637692-1773505144986.png', 'Office Pack', 4.8, 'Scheduled', true, false, 60)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CONFECTIONARY — Categories: Cakes, Birthday Packages, Pastries
-- ============================================================

INSERT INTO public.products (id, name, description, department, category, price, original_price, image_url, tag, rating, prep_time, available, featured, orders_count)
VALUES
  -- Cakes
  (gen_random_uuid(), 'Classic Vanilla Birthday Cake (1kg)', 'Light vanilla sponge with buttercream frosting, custom message included', 'Confectionary', 'Cakes', 65000, NULL, 'https://images.unsplash.com/photo-1583834096166-540450cbc928', 'Bestseller', 4.9, '24h notice', true, true, 310),
  (gen_random_uuid(), 'Chocolate Fudge Cake (1.5kg)', 'Triple-layer chocolate fudge cake with ganache drip, serves 10-12', 'Confectionary', 'Cakes', 85000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_15321a258-1772464596437.png', 'Rich & Dark', 4.8, '24h notice', true, true, 265),
  (gen_random_uuid(), 'Red Velvet Cake (1kg)', 'Vibrant red velvet layers with cream cheese frosting, custom decorations', 'Confectionary', 'Cakes', 72000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_11b4e1d9f-1772985545370.png', 'Popular', 4.7, '24h notice', true, false, 230),
  (gen_random_uuid(), 'Carrot & Walnut Cake (1kg)', 'Moist carrot cake with walnuts and cream cheese frosting, naturally sweet', 'Confectionary', 'Cakes', 68000, NULL, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729', 'Wholesome', 4.6, '24h notice', true, false, 120),
  (gen_random_uuid(), 'Black Forest Gateau (1.5kg)', 'Classic German cake with cherries, whipped cream and dark chocolate shavings', 'Confectionary', 'Cakes', 90000, NULL, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62', 'German Classic', 4.8, '24h notice', true, false, 145),
  -- Birthday Packages
  (gen_random_uuid(), 'Birthday Deluxe Package', '2kg cake + 12 cupcakes + 20 cake pops + personalized decoration & candles', 'Confectionary', 'Birthday Packages', 185000, NULL, 'https://images.unsplash.com/photo-1708707048055-a3f3691b25f6', 'Complete Package', 5.0, '48h notice', true, true, 180),
  (gen_random_uuid(), 'Kids Birthday Package', '1kg themed cake + 10 cupcakes + party favors + balloon set', 'Confectionary', 'Birthday Packages', 120000, NULL, 'https://images.unsplash.com/photo-1624027390997-d4dc600fa432', 'Kids Fav', 4.9, '36h notice', true, true, 210),
  (gen_random_uuid(), 'Corporate Event Package', '3kg cake + 50 mini pastries + branded packaging for events of 30+ people', 'Confectionary', 'Birthday Packages', 350000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_1935e7062-1779095230262.png', 'Corporate', 4.8, '72h notice', true, false, 75),
  (gen_random_uuid(), 'Sweet 16 Package', '1.5kg cake + 16 cupcakes + custom banner + sparkler candles', 'Confectionary', 'Birthday Packages', 155000, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 'Teen Special', 4.7, '48h notice', true, false, 90),
  -- Pastries
  (gen_random_uuid(), 'Cinnamon Croissants (6 pack)', 'Flaky, buttery croissants with cinnamon filling, baked fresh daily', 'Confectionary', 'Pastries', 22000, NULL, 'https://images.unsplash.com/photo-1591521771366-061035830132', 'Fresh Baked', 4.6, '3h notice', true, false, 195),
  (gen_random_uuid(), 'Assorted Pastry Box (12 pcs)', 'Mix of croissants, pain au chocolat, danish pastries and cinnamon rolls', 'Confectionary', 'Pastries', 45000, NULL, 'https://images.unsplash.com/photo-1733108948784-a4fecc17b8b7', 'Variety Pack', 4.7, '4h notice', true, true, 160),
  (gen_random_uuid(), 'Red Velvet Cupcakes (6 pack)', 'Moist red velvet cupcakes topped with cream cheese frosting', 'Confectionary', 'Pastries', 32000, NULL, 'https://images.unsplash.com/photo-1614707267785-109d783758ea', 'Popular', 4.8, '3h notice', true, false, 175),
  (gen_random_uuid(), 'Chocolate Eclairs (8 pcs)', 'Classic French eclairs filled with vanilla cream and topped with chocolate glaze', 'Confectionary', 'Pastries', 38000, NULL, 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 'French Style', 4.7, '4h notice', true, false, 130)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- JUICE BAR — Categories: Fresh Juices, Smoothies,
--             Detox Blends, Milkshakes
-- ============================================================

INSERT INTO public.products (id, name, description, department, category, price, original_price, image_url, tag, rating, prep_time, available, featured, orders_count)
VALUES
  -- Fresh Juices
  (gen_random_uuid(), 'Fresh Passion Fruit Juice (500ml)', 'Freshly squeezed passion fruit juice, lightly sweetened with natural cane sugar', 'Juice Bar', 'Fresh Juices', 8000, NULL, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b', 'Local Fav', 4.8, '5 min', true, true, 350),
  (gen_random_uuid(), 'Watermelon Mint Juice (500ml)', 'Chilled watermelon blended with fresh mint leaves, zero added sugar', 'Juice Bar', 'Fresh Juices', 7500, NULL, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38', 'Refreshing', 4.7, '5 min', true, true, 290),
  (gen_random_uuid(), 'Fresh Orange Juice (500ml)', 'Hand-squeezed Valencia oranges, served chilled — pure and natural', 'Juice Bar', 'Fresh Juices', 9000, NULL, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', 'Classic', 4.9, '5 min', true, false, 310),
  (gen_random_uuid(), 'Pineapple & Ginger Juice (500ml)', 'Tropical pineapple blended with fresh ginger for a zesty kick', 'Juice Bar', 'Fresh Juices', 8500, NULL, 'https://images.unsplash.com/photo-1546173159-315724a31696', 'Zesty', 4.6, '5 min', true, false, 220),
  (gen_random_uuid(), 'Mixed Tropical Juice (500ml)', 'Blend of mango, pineapple, passion fruit and orange — a tropical fiesta', 'Juice Bar', 'Fresh Juices', 10000, NULL, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8', 'Tropical', 4.8, '7 min', true, false, 260),
  -- Smoothies
  (gen_random_uuid(), 'Mango & Banana Smoothie (400ml)', 'Creamy blend of ripe mango and banana with a splash of milk', 'Juice Bar', 'Smoothies', 12000, NULL, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888', 'Creamy', 4.8, '7 min', true, true, 280),
  (gen_random_uuid(), 'Avocado & Honey Smoothie (400ml)', 'Rich avocado blended with honey and milk — thick, filling and nutritious', 'Juice Bar', 'Smoothies', 14000, NULL, 'https://images.unsplash.com/photo-1638176066959-e349b1d5b8c5', 'Nutritious', 4.7, '7 min', true, false, 195),
  (gen_random_uuid(), 'Strawberry & Yoghurt Smoothie (400ml)', 'Fresh strawberries blended with Greek yoghurt and a drizzle of honey', 'Juice Bar', 'Smoothies', 13000, NULL, 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82', 'Probiotic', 4.6, '7 min', true, false, 170),
  (gen_random_uuid(), 'Green Power Smoothie (400ml)', 'Spinach, cucumber, apple and lemon — packed with vitamins and minerals', 'Juice Bar', 'Smoothies', 13500, NULL, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec', 'Super Green', 4.5, '8 min', true, false, 140),
  -- Detox Blends
  (gen_random_uuid(), 'Beetroot & Carrot Detox (500ml)', 'Earthy beetroot and sweet carrot with a hint of ginger — great for cleansing', 'Juice Bar', 'Detox Blends', 11000, NULL, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8', 'Cleanse', 4.7, '8 min', true, true, 165),
  (gen_random_uuid(), 'Lemon & Turmeric Detox (500ml)', 'Lemon juice with turmeric, black pepper and honey — anti-inflammatory boost', 'Juice Bar', 'Detox Blends', 10000, NULL, 'https://images.unsplash.com/photo-1546173159-315724a31696', 'Anti-Inflam', 4.6, '5 min', true, false, 130),
  (gen_random_uuid(), 'Cucumber & Aloe Vera Cooler (500ml)', 'Hydrating cucumber blended with aloe vera gel and mint — skin glow blend', 'Juice Bar', 'Detox Blends', 12000, NULL, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38', 'Glow Blend', 4.5, '8 min', true, false, 110),
  -- Milkshakes
  (gen_random_uuid(), 'Chocolate Milkshake (400ml)', 'Thick and creamy chocolate milkshake made with real cocoa and vanilla ice cream', 'Juice Bar', 'Milkshakes', 15000, NULL, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', 'Indulgent', 4.9, '5 min', true, true, 300),
  (gen_random_uuid(), 'Vanilla Bean Milkshake (400ml)', 'Classic vanilla milkshake with real vanilla bean and whipped cream topping', 'Juice Bar', 'Milkshakes', 14000, NULL, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 'Classic', 4.8, '5 min', true, false, 240),
  (gen_random_uuid(), 'Strawberry Milkshake (400ml)', 'Fresh strawberry milkshake blended with ice cream and topped with a cherry', 'Juice Bar', 'Milkshakes', 14500, NULL, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888', 'Fruity', 4.7, '5 min', true, false, 210)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- WINE & LIQUOR — Categories: Wines, Whiskey,
--                 Champagne, Party Bundles
-- ============================================================

INSERT INTO public.products (id, name, description, department, category, price, original_price, image_url, tag, rating, prep_time, available, featured, orders_count)
VALUES
  -- Wines
  (gen_random_uuid(), 'Nederburg Cabernet Sauvignon', 'Bold red wine with dark fruit flavors and a long, smooth finish', 'Wine & Liquor', 'Wines', 65000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_109adbe7e-1772951391122.png', 'Popular', 4.7, 'Ready', true, true, 185),
  (gen_random_uuid(), 'Fairtrade Sauvignon Blanc', 'Crisp and refreshing white wine with citrus and tropical fruit notes', 'Wine & Liquor', 'Wines', 58000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_143a4fa91-1779095229298.png', 'White Wine', 4.5, 'Ready', true, false, 145),
  (gen_random_uuid(), 'Rose Zinfandel', 'Light and fruity rose with strawberry and watermelon notes, chilled best', 'Wine & Liquor', 'Wines', 55000, NULL, 'https://images.unsplash.com/photo-1655485676228-fbabfcf8502b', 'Rose', 4.4, 'Ready', true, false, 120),
  (gen_random_uuid(), 'Merlot Reserve (750ml)', 'Velvety smooth Merlot with plum, cherry and subtle oak notes from South Africa', 'Wine & Liquor', 'Wines', 72000, NULL, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', 'Reserve', 4.6, 'Ready', true, false, 100),
  -- Whiskey
  (gen_random_uuid(), 'Johnnie Walker Black Label', 'Aged 12 years, rich and smooth blended Scotch whisky with smoky undertones', 'Wine & Liquor', 'Whiskey', 145000, NULL, 'https://images.unsplash.com/photo-1636560652843-28c12bafa1e9', 'Premium', 4.9, 'Ready', true, true, 230),
  (gen_random_uuid(), 'Jack Daniels Tennessee Whiskey', 'Smooth Tennessee sour mash whiskey, charcoal mellowed for a distinctive taste', 'Wine & Liquor', 'Whiskey', 125000, NULL, 'https://images.unsplash.com/photo-1695948862027-17b08abc2be2', 'Best Seller', 4.8, 'Ready', true, true, 210),
  (gen_random_uuid(), 'Jameson Irish Whiskey', 'Triple-distilled Irish whiskey, famously smooth with nutty and vanilla notes', 'Wine & Liquor', 'Whiskey', 118000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_148b6bf5d-1779095229808.png', 'Irish', 4.7, 'Ready', true, false, 175),
  (gen_random_uuid(), 'Konyagi Uganda Gin (750ml)', 'Uganda''s most popular spirit — smooth gin with a clean, refreshing taste', 'Wine & Liquor', 'Whiskey', 35000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_15b39e941-1779095228542.png', 'Local', 4.3, 'Ready', true, false, 290),
  (gen_random_uuid(), 'Glenfiddich 12 Year Single Malt', 'Iconic Speyside single malt Scotch with fresh pear and subtle oak character', 'Wine & Liquor', 'Whiskey', 195000, NULL, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b', 'Single Malt', 4.9, 'Ready', true, false, 90),
  -- Champagne
  (gen_random_uuid(), 'Moet & Chandon Brut', 'Iconic French champagne with fine bubbles, green apple and citrus notes', 'Wine & Liquor', 'Champagne', 280000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_15bf41fc8-1779095228993.png', 'Luxury', 4.9, 'Ready', true, true, 130),
  (gen_random_uuid(), 'Cinzano Prosecco DOC', 'Italian sparkling wine, light and refreshing with pear and peach aromas', 'Wine & Liquor', 'Champagne', 85000, NULL, 'https://img.rocket.new/generatedImages/rocket_gen_img_1018793ea-1779095228427.png', 'Prosecco', 4.5, 'Ready', true, false, 110),
  (gen_random_uuid(), 'Veuve Clicquot Yellow Label', 'Prestigious French champagne with toasty brioche notes and vibrant acidity', 'Wine & Liquor', 'Champagne', 380000, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 'Prestige', 5.0, 'Ready', true, false, 65),
  -- Party Bundles
  (gen_random_uuid(), 'Party Bundle — 20 Guests', '3 wines + 2 whiskeys + 1 champagne + mixers — perfect for 20 guests', 'Wine & Liquor', 'Party Bundles', 450000, 540000, 'https://images.unsplash.com/photo-1586123041722-2212f07c86f7', 'Save 17%', 4.8, 'Ready', true, true, 85),
  (gen_random_uuid(), 'Corporate Event Bundle', '6 wines + 4 whiskeys + 2 champagnes + premium glassware for 50+ guests', 'Wine & Liquor', 'Party Bundles', 850000, 980000, 'https://img.rocket.new/generatedImages/rocket_gen_img_1c387bbb3-1778342652064.png', 'Corporate', 4.9, 'Ready', true, false, 45),
  (gen_random_uuid(), 'Wine Lovers Trio Pack', 'Red, white and rose — a curated trio for wine enthusiasts, gift-wrapped', 'Wine & Liquor', 'Party Bundles', 175000, 210000, 'https://img.rocket.new/generatedImages/rocket_gen_img_1cd4fed38-1769669520005.png', 'Gift Pack', 4.7, 'Ready', true, false, 70)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MARKET SPECIALS — Categories: Fresh Produce, Pantry Staples,
--                   Dairy & Eggs, Meat & Fish, Weekly Deals
-- ============================================================

INSERT INTO public.products (id, name, description, department, category, price, original_price, image_url, tag, rating, prep_time, available, featured, orders_count)
VALUES
  -- Fresh Produce
  (gen_random_uuid(), 'Organic Tomatoes (1kg)', 'Vine-ripened organic tomatoes, freshly sourced from local farms in Mukono', 'Market Specials', 'Fresh Produce', 4500, NULL, 'https://images.unsplash.com/photo-1546470427-e26264be0b0d', 'Organic', 4.7, 'Ready', true, true, 420),
  (gen_random_uuid(), 'Fresh Matooke Bunch (5kg)', 'Green cooking bananas harvested fresh from Western Uganda farms', 'Market Specials', 'Fresh Produce', 12000, NULL, 'https://images.unsplash.com/photo-1528825871115-3581a5387919', 'Farm Fresh', 4.8, 'Ready', true, false, 380),
  (gen_random_uuid(), 'Avocados (6 pcs)', 'Creamy Hass avocados, perfectly ripe and ready to eat', 'Market Specials', 'Fresh Produce', 9000, NULL, 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad', 'Ripe & Ready', 4.9, 'Ready', true, true, 340),
  (gen_random_uuid(), 'Mixed Vegetables Basket', 'Assorted seasonal vegetables: carrots, cabbage, onions, peppers and spinach', 'Market Specials', 'Fresh Produce', 18000, NULL, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', 'Seasonal Mix', 4.6, 'Ready', true, false, 260),
  (gen_random_uuid(), 'Sweet Potatoes (2kg)', 'Orange-flesh sweet potatoes, naturally sweet and nutritious', 'Market Specials', 'Fresh Produce', 7000, NULL, 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19', 'Nutritious', 4.5, 'Ready', true, false, 200),
  -- Pantry Staples
  (gen_random_uuid(), 'Basmati Rice (5kg)', 'Premium long-grain basmati rice, aromatic and fluffy when cooked', 'Market Specials', 'Pantry Staples', 35000, NULL, 'https://images.unsplash.com/photo-1586201375761-83865001e31c', 'Premium', 4.7, 'Ready', true, true, 310),
  (gen_random_uuid(), 'Sunflower Cooking Oil (5L)', 'Pure refined sunflower oil, light and healthy for everyday cooking', 'Market Specials', 'Pantry Staples', 42000, NULL, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5', 'Healthy', 4.6, 'Ready', true, false, 280),
  (gen_random_uuid(), 'Maize Flour (2kg)', 'Finely milled white maize flour for posho, ugali and porridge', 'Market Specials', 'Pantry Staples', 8000, NULL, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'Staple', 4.5, 'Ready', true, false, 350),
  (gen_random_uuid(), 'Groundnut Paste (500g)', 'Pure roasted groundnut paste with no additives — great for sauces and spreads', 'Market Specials', 'Pantry Staples', 12000, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', 'Pure', 4.8, 'Ready', true, false, 190),
  -- Dairy & Eggs
  (gen_random_uuid(), 'Fresh Whole Milk (1L)', 'Pasteurized whole milk from local dairy farms, delivered fresh daily', 'Market Specials', 'Dairy & Eggs', 4000, NULL, 'https://images.unsplash.com/photo-1550583724-b2692b85b150', 'Fresh Daily', 4.8, 'Ready', true, true, 450),
  (gen_random_uuid(), 'Free-Range Eggs (Tray of 30)', 'Farm-fresh free-range eggs from hens raised on natural feed', 'Market Specials', 'Dairy & Eggs', 18000, NULL, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f', 'Free Range', 4.9, 'Ready', true, true, 390),
  (gen_random_uuid(), 'Natural Yoghurt (500g)', 'Thick, creamy natural yoghurt with live cultures — no added sugar', 'Market Specials', 'Dairy & Eggs', 9000, NULL, 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 'Probiotic', 4.7, 'Ready', true, false, 220),
  (gen_random_uuid(), 'Butter (250g)', 'Creamy unsalted butter made from fresh pasteurized cream', 'Market Specials', 'Dairy & Eggs', 11000, NULL, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d', 'Creamy', 4.6, 'Ready', true, false, 175),
  -- Meat & Fish
  (gen_random_uuid(), 'Fresh Tilapia (1kg)', 'Whole fresh tilapia from Lake Victoria, cleaned and ready to cook', 'Market Specials', 'Meat & Fish', 22000, NULL, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', 'Lake Fresh', 4.8, 'Ready', true, true, 285),
  (gen_random_uuid(), 'Beef Stewing Cuts (1kg)', 'Tender beef cuts ideal for stews and slow cooking, locally sourced', 'Market Specials', 'Meat & Fish', 28000, NULL, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f', 'Tender', 4.7, 'Ready', true, false, 240),
  (gen_random_uuid(), 'Chicken Drumsticks (1kg)', 'Fresh chicken drumsticks, perfect for grilling, frying or stewing', 'Market Specials', 'Meat & Fish', 18000, NULL, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c8', 'Versatile', 4.6, 'Ready', true, false, 300),
  (gen_random_uuid(), 'Smoked Mukene (200g)', 'Sun-dried and smoked silver cyprinid fish, a Ugandan pantry essential', 'Market Specials', 'Meat & Fish', 8000, NULL, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', 'Traditional', 4.5, 'Ready', true, false, 180),
  -- Weekly Deals
  (gen_random_uuid(), 'Family Grocery Bundle (Weekly)', 'Rice 5kg + cooking oil 2L + tomatoes 2kg + onions 1kg + eggs 15pcs', 'Market Specials', 'Weekly Deals', 85000, 105000, 'https://images.unsplash.com/photo-1542838132-92c53300491e', 'Save 19%', 4.8, 'Ready', true, true, 155),
  (gen_random_uuid(), 'Breakfast Essentials Pack', 'Eggs 15pcs + milk 2L + bread + butter + tea leaves + sugar', 'Market Specials', 'Weekly Deals', 45000, 58000, 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666', 'Morning Pack', 4.7, 'Ready', true, false, 195),
  (gen_random_uuid(), 'Protein Power Pack', 'Beef 1kg + chicken 1kg + tilapia 1kg + eggs 15pcs + groundnut paste', 'Market Specials', 'Weekly Deals', 95000, 118000, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f', 'Save 19%', 4.9, 'Ready', true, true, 120)
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE 'Sample menu items inserted successfully for all 5 departments.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Sample data insertion failed: %', SQLERRM;
END $$;
