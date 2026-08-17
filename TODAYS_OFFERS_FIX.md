# Today's Offers fix

This update fixes existing demo offer rows as well as the carousel:
- Meals You’ll Love -> /restaurant-page
- Grocery Savings -> /market-specials
- Weekend Drinks -> /wine-liquor-page
- No offer-card "TODAY'S OFFER" badge is rendered.
- Today's Offers heading has a safer line-height and overflow treatment so the Y is not clipped.

Run supabase/migrations/20260817110000_fix_demo_offers.sql if the demo rows already exist.
