-- Add delivery location coordinates to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery';

-- Enable RLS (idempotent)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Orders RLS: customers can insert and view their own orders
DROP POLICY IF EXISTS "customers_insert_own_orders" ON public.orders;
CREATE POLICY "customers_insert_own_orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "customers_select_own_orders" ON public.orders;
CREATE POLICY "customers_select_own_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "customers_update_own_orders" ON public.orders;
CREATE POLICY "customers_update_own_orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

-- Admin full access to orders
DROP POLICY IF EXISTS "admin_full_access_orders" ON public.orders;
CREATE POLICY "admin_full_access_orders"
ON public.orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Order items RLS: customers can insert and view items for their own orders
DROP POLICY IF EXISTS "customers_insert_own_order_items" ON public.order_items;
CREATE POLICY "customers_insert_own_order_items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "customers_select_own_order_items" ON public.order_items;
CREATE POLICY "customers_select_own_order_items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.customer_id = auth.uid()
  )
);

-- Admin full access to order items
DROP POLICY IF EXISTS "admin_full_access_order_items" ON public.order_items;
CREATE POLICY "admin_full_access_order_items"
ON public.order_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);
