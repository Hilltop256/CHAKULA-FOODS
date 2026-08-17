-- Demo Today's Offers for previewing the carousel.
-- These are intentionally marked as demo content and can be deleted from Admin > Today's Offers.
INSERT INTO public.offers (title, description, image_url, link_url, is_active, sort_order)
SELECT 'Meals You''ll Love', 'Delicious meals, made fresh and delivered to you.', '/demo-offers/meals.svg', '/restaurant-page', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE title = 'Meals You''ll Love' AND image_url = '/demo-offers/meals.svg');

INSERT INTO public.offers (title, description, image_url, link_url, is_active, sort_order)
SELECT 'Grocery Savings', 'Stock up on everyday essentials at great prices.', '/demo-offers/groceries.svg', '/market-specials', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE title = 'Grocery Savings' AND image_url = '/demo-offers/groceries.svg');

INSERT INTO public.offers (title, description, image_url, link_url, is_active, sort_order)
SELECT 'Weekend Drinks', 'Explore selected drinks for your next celebration.', '/demo-offers/alcohol.svg', '/wine-liquor-page', true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE title = 'Weekend Drinks' AND image_url = '/demo-offers/alcohol.svg');
