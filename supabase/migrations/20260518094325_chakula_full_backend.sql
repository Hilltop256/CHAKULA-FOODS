-- ============================================================
-- Chakula Foods Full Backend Migration
-- 3-tier auth (customer, admin, delivery), products, orders
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'delivery');

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

DROP TYPE IF EXISTS public.department_type CASCADE;
CREATE TYPE public.department_type AS ENUM ('Restaurant', 'Confectionary', 'Juice Bar', 'Wine & Liquor', 'Market Specials');

-- 2. CORE TABLES

-- user_profiles (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    role public.user_role NOT NULL DEFAULT 'customer'::public.user_role,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    department public.department_type NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    original_price INTEGER,
    image_url TEXT,
    tag TEXT,
    rating NUMERIC(3,1) DEFAULT 4.5,
    prep_time TEXT DEFAULT '20 min',
    available BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    orders_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL DEFAULT '',
    customer_phone TEXT,
    department public.department_type,
    status public.order_status NOT NULL DEFAULT 'confirmed'::public.order_status,
    total_amount INTEGER NOT NULL DEFAULT 0,
    delivery_address TEXT,
    scheduled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_department ON public.products(department);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 4. FUNCTIONS (must be before RLS policies)

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Handle new user signup: create profile from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Role check helper (reads from auth metadata — safe for user_profiles RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    (SELECT role::TEXT FROM public.user_profiles WHERE id = auth.uid()),
    'customer'
);
$$;

-- Is admin check (safe: reads user_profiles but used on OTHER tables)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
);
$$;

-- Is delivery check
CREATE OR REPLACE FUNCTION public.is_delivery()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'delivery'::public.user_role
);
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 2800) + 1
    INTO seq_num
    FROM public.orders
    WHERE order_number ~ '^ord[0-9]+$';
    RETURN 'ord' || LPAD(seq_num::TEXT, 4, '0');
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- user_profiles: users manage own, admins see all
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_manage_all_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- products: public read, admin write
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
ON public.products
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admins_manage_products" ON public.products;
CREATE POLICY "admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- orders: customers see own, admins/delivery see all
DROP POLICY IF EXISTS "customers_manage_own_orders" ON public.orders;
CREATE POLICY "customers_manage_own_orders"
ON public.orders
FOR ALL
TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_all_orders" ON public.orders;
CREATE POLICY "admins_manage_all_orders"
ON public.orders
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delivery_view_orders" ON public.orders;
CREATE POLICY "delivery_view_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_delivery());

DROP POLICY IF EXISTS "delivery_update_orders" ON public.orders;
CREATE POLICY "delivery_update_orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_delivery())
WITH CHECK (public.is_delivery());

-- order_items: follow order access
DROP POLICY IF EXISTS "customers_manage_own_order_items" ON public.order_items;
CREATE POLICY "customers_manage_own_order_items"
ON public.order_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "admins_manage_all_order_items" ON public.order_items;
CREATE POLICY "admins_manage_all_order_items"
ON public.order_items
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delivery_view_order_items" ON public.order_items;
CREATE POLICY "delivery_view_order_items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_delivery());

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. MOCK DATA
DO $$
DECLARE
    customer_uuid UUID := gen_random_uuid();
    admin_uuid UUID := gen_random_uuid();
    delivery_uuid UUID := gen_random_uuid();
    customer2_uuid UUID := gen_random_uuid();
    customer3_uuid UUID := gen_random_uuid();
    prod1_uuid UUID := gen_random_uuid();
    prod2_uuid UUID := gen_random_uuid();
    prod3_uuid UUID := gen_random_uuid();
    prod4_uuid UUID := gen_random_uuid();
    prod5_uuid UUID := gen_random_uuid();
    prod6_uuid UUID := gen_random_uuid();
    prod7_uuid UUID := gen_random_uuid();
    prod8_uuid UUID := gen_random_uuid();
    prod9_uuid UUID := gen_random_uuid();
    prod10_uuid UUID := gen_random_uuid();
    prod11_uuid UUID := gen_random_uuid();
    prod12_uuid UUID := gen_random_uuid();
    order1_uuid UUID := gen_random_uuid();
    order2_uuid UUID := gen_random_uuid();
    order3_uuid UUID := gen_random_uuid();
    order4_uuid UUID := gen_random_uuid();
    order5_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users (trigger will create user_profiles automatically)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (customer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'amara.nakato@chakulafoods.ug', crypt('Chakula@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Amara Nakato', 'role', 'customer'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@chakulafoods.ug', crypt('Admin@Chakula26', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Tendo Mugisha', 'role', 'admin'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (delivery_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'rider.okello@chakulafoods.ug', crypt('Rider@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Okello Patrick', 'role', 'delivery'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (customer2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'julius.ssebunya@gmail.com', crypt('Julius@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Julius Ssebunya', 'role', 'customer'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (customer3_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'grace.achieng@outlook.com', crypt('Grace@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Grace Achieng', 'role', 'customer'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Update phone numbers for profiles (trigger creates them, we update phone)
    UPDATE public.user_profiles SET phone = '+256 772 345 678' WHERE id = customer_uuid;
    UPDATE public.user_profiles SET phone = '+256 700 000 001' WHERE id = admin_uuid;
    UPDATE public.user_profiles SET phone = '+256 752 987 654' WHERE id = delivery_uuid;

    -- Products
    INSERT INTO public.products (id, name, description, department, category, price, original_price, image_url, tag, rating, prep_time, available, featured, orders_count) VALUES
        (prod1_uuid, 'Chicken Stew & Matooke', 'Tender chicken in rich groundnut sauce served with steamed matooke', 'Restaurant', 'Meals', 18000, null, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80', 'Best Seller', 4.9, '25 min', true, true, 342),
        (prod2_uuid, 'Rolex (Chapati & Egg Roll)', 'Ugandan street food classic — egg and vegetables rolled in fresh chapati', 'Restaurant', 'Street Food', 6500, null, 'https://images.unsplash.com/photo-1719206927942-f0c8b52b884a', 'Local Fav', 4.8, '10 min', true, true, 589),
        (prod3_uuid, 'Birthday Celebration Cake', 'Custom decorated celebration cake, made to order with your choice of flavour', 'Confectionary', 'Cakes', 85000, 95000, 'https://images.unsplash.com/photo-1686651952819-de42dd47b237', 'Order Ahead', 4.9, '24h notice', true, true, 124),
        (prod4_uuid, 'Mango & Pineapple Smoothie', 'Fresh tropical blend of ripe mangoes and pineapple, no added sugar', 'Juice Bar', 'Smoothies', 9500, null, 'https://images.unsplash.com/photo-1666181767084-91e0cd358adf', 'Refreshing', 4.7, '8 min', true, true, 278),
        (prod5_uuid, 'South African Red Wine', 'Premium Cabernet Sauvignon from the Western Cape wine region', 'Wine & Liquor', 'Wines', 65000, null, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', '18+', 4.7, 'In stock', true, true, 95),
        (prod6_uuid, 'Premium Rice Bundle (10kg)', 'High-quality long-grain rice, perfect for family meals', 'Market Specials', 'Rice', 58000, 68000, 'https://img.rocket.new/generatedImages/rocket_gen_img_19101ba4f-1768321892069.png', 'Bundle', 4.6, 'Same day', true, true, 203),
        (prod7_uuid, 'Red Velvet Cupcakes (6 pack)', 'Moist red velvet cupcakes with cream cheese frosting', 'Confectionary', 'Pastries', 32000, null, 'https://images.unsplash.com/photo-1655650166075-11705e680bb1', 'Popular', 4.8, '3h notice', true, true, 167),
        (prod8_uuid, 'Passion Fruit Detox Juice', 'Cold-pressed passion fruit with ginger and lemon for a natural detox', 'Juice Bar', 'Detox Plans', 11000, null, 'https://images.unsplash.com/photo-1612975817531-e81150eaa3e1', 'Detox', 4.5, '10 min', false, false, 88),
        (prod9_uuid, 'Beef & Pork Combo Meal', 'Grilled beef and pork served with rice, salad and sauce', 'Restaurant', 'Combos', 28000, 34000, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', 'Combo Deal', 4.6, '30 min', true, true, 215),
        (prod10_uuid, 'Johnnie Walker Black Label', '12-year aged Scotch whisky, smooth and complex', 'Wine & Liquor', 'Whiskey', 145000, null, 'https://images.unsplash.com/photo-1638567827189-ec12e06c4ded', '18+', 4.9, 'In stock', true, false, 62),
        (prod11_uuid, 'Ugandan Breakfast Plate', 'Full Ugandan breakfast with eggs, beans, rolex and fresh juice', 'Restaurant', 'Breakfast', 14000, null, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80', 'Breakfast', 4.8, '20 min', true, true, 431),
        (prod12_uuid, 'Chocolate Fudge Brownie Box', 'Rich chocolate fudge brownies, 6 pieces per box', 'Confectionary', 'Dessert Boxes', 24000, null, 'https://images.unsplash.com/photo-1607775643915-28dbfb0f3a77', 'Dessert', 4.7, '2h notice', true, false, 149)
    ON CONFLICT (id) DO NOTHING;

    -- Orders
    INSERT INTO public.orders (id, order_number, customer_id, customer_name, customer_phone, department, status, total_amount, delivery_address, scheduled_at, created_at) VALUES
        (order1_uuid, 'ord2847', customer_uuid, 'Amara Nakato', '+256 772 345 678', 'Restaurant', 'preparing', 46000, 'Naalya Estate, Plot 14', null, now() - interval '18 minutes'),
        (order2_uuid, 'ord2846', customer2_uuid, 'Julius Ssebunya', '+256 700 123 456', 'Confectionary', 'confirmed', 85000, 'Kiwatule Road, Apt 3B', now() + interval '1 day 2 hours', now() - interval '32 minutes'),
        (order3_uuid, 'ord2845', customer3_uuid, 'Grace Achieng', '+256 752 987 654', 'Juice Bar', 'out_for_delivery', 19000, 'Kyaliwajjala, Green Park', null, now() - interval '45 minutes'),
        (order4_uuid, 'ord2844', customer_uuid, 'Amara Nakato', '+256 772 345 678', 'Wine & Liquor', 'delivered', 210000, 'Bukoto, Spring Road', null, now() - interval '1 hour 5 minutes'),
        (order5_uuid, 'ord2843', customer2_uuid, 'Julius Ssebunya', '+256 700 123 456', 'Market Specials', 'cancelled', 62000, 'Namugongo, Sunrise Rd', null, now() - interval '2 hours 30 minutes')
    ON CONFLICT (id) DO NOTHING;

    -- Order items
    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price) VALUES
        (order1_uuid, prod1_uuid, 'Chicken Stew & Matooke', 2, 18000),
        (order1_uuid, prod11_uuid, 'Ugandan Breakfast Plate', 1, 14000),
        (order2_uuid, prod3_uuid, 'Birthday Celebration Cake', 1, 85000),
        (order3_uuid, prod4_uuid, 'Mango & Pineapple Smoothie', 2, 9500),
        (order4_uuid, prod5_uuid, 'South African Red Wine', 2, 65000),
        (order4_uuid, prod10_uuid, 'Johnnie Walker Black Label', 1, 145000),
        (order5_uuid, prod6_uuid, 'Premium Rice Bundle (10kg)', 1, 58000),
        (order5_uuid, prod4_uuid, 'Mango & Pineapple Smoothie', 4, 9500)
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
