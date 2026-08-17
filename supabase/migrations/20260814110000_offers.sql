-- Today's Offers
-- The table may already exist in the database; this migration is safe to run either way.
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_sort_order ON public.offers(sort_order);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_offers" ON public.offers;
CREATE POLICY "public_read_active_offers"
  ON public.offers
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_offers" ON public.offers;
CREATE POLICY "admin_manage_offers"
  ON public.offers
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
