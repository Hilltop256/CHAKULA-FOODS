-- Fix existing demo Today's Offers rows created by earlier migrations.
-- This deliberately updates existing rows so deployments that already ran the
-- first demo migration receive the corrected destinations.
UPDATE public.offers
SET link_url = '/restaurant-page', updated_at = now()
WHERE title = 'Meals You''ll Love';

UPDATE public.offers
SET link_url = '/market-specials', updated_at = now()
WHERE title = 'Grocery Savings';

UPDATE public.offers
SET link_url = '/wine-liquor-page', updated_at = now()
WHERE title = 'Weekend Drinks';
