-- Add a named unique constraint on cart_items so upsert onConflict works reliably
-- The previous migration only created a unique INDEX, not a named CONSTRAINT
-- Supabase upsert requires a named constraint for onConflict resolution
DO $$
BEGIN
  -- Drop the index-only approach if it exists and add a proper constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_product_unique'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    -- Drop the index first if it exists (constraint will create its own index)
    DROP INDEX IF EXISTS public.idx_cart_items_user_product;
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END;
$$;
