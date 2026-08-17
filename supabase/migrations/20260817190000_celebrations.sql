-- Celebrations module
CREATE TABLE IF NOT EXISTS public.celebration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  celebration_type TEXT NOT NULL CHECK (celebration_type IN ('Birthday Party','Graduation Party','Baby Shower','Bridal Shower','Other')),
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  date DATE NOT NULL,
  time TIME NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_celebration_requests_created_at ON public.celebration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_celebration_requests_status ON public.celebration_requests(status);

ALTER TABLE public.celebration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_submit_celebration_requests" ON public.celebration_requests;
CREATE POLICY "public_submit_celebration_requests"
  ON public.celebration_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_celebration_requests" ON public.celebration_requests;
CREATE POLICY "admin_manage_celebration_requests"
  ON public.celebration_requests FOR ALL TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Add the Celebrations CTA to Today's Offers.
INSERT INTO public.offers (title, description, image_url, link_url, is_active, sort_order)
SELECT
  'Planning a Celebration',
  'Tell us about your party and request a tailored quote.',
  '/celebrations/celebration-banner.svg',
  '/celebrations',
  true,
  COALESCE((SELECT MAX(sort_order) + 1 FROM public.offers), 0)
WHERE NOT EXISTS (
  SELECT 1 FROM public.offers WHERE lower(title) = lower('Planning a Celebration')
);

UPDATE public.offers
SET link_url = '/celebrations',
    image_url = COALESCE(image_url, '/celebrations/celebration-banner.svg'),
    updated_at = now()
WHERE lower(title) = lower('Planning a Celebration');
