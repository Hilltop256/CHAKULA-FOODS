-- Market Specials table
CREATE TABLE IF NOT EXISTS public.market_specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_label TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_specials_is_active ON public.market_specials(is_active);
CREATE INDEX IF NOT EXISTS idx_market_specials_sort_order ON public.market_specials(sort_order);

ALTER TABLE public.market_specials ENABLE ROW LEVEL SECURITY;

-- Public can read active specials
DROP POLICY IF EXISTS "public_read_market_specials" ON public.market_specials;
CREATE POLICY "public_read_market_specials"
  ON public.market_specials
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admin full access using auth metadata
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

DROP POLICY IF EXISTS "admin_manage_market_specials" ON public.market_specials;
CREATE POLICY "admin_manage_market_specials"
  ON public.market_specials
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Sample market specials
DO $$
DECLARE
  prod_id UUID;
BEGIN
  SELECT id INTO prod_id FROM public.products WHERE department = 'Market Specials' LIMIT 1;

  INSERT INTO public.market_specials (id, title, description, image_url, discount_label, product_id, link_url, is_active, sort_order)
  VALUES
    (gen_random_uuid(), 'Rice Bundle Deal', '5kg Premium Rice at a special price', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80', '20% OFF', prod_id, '#market', true, 1),
    (gen_random_uuid(), 'Cooking Oil Special', 'Buy 2 get 1 free on all cooking oils', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', 'Buy 2 Get 1', prod_id, '#market', true, 2),
    (gen_random_uuid(), 'Sugar Saver Pack', 'Bulk sugar at wholesale prices', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', '15% OFF', prod_id, '#market', true, 3),
    (gen_random_uuid(), 'Weekly Bundle', 'Complete household essentials bundle', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', 'Best Value', prod_id, '#market', true, 4),
    (gen_random_uuid(), 'Fresh Produce Deal', 'Farm-fresh vegetables at market price', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80', 'Fresh Daily', prod_id, '#market', true, 5)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Sample data insertion skipped: %', SQLERRM;
END $$;
