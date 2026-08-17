-- Fix cart_items RLS policies to ensure all operations work correctly
-- Drop and recreate policies with explicit per-operation rules

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_cart_items" ON public.cart_items;

-- SELECT: users can read their own cart items
CREATE POLICY "cart_select_own"
  ON public.cart_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: users can insert rows where user_id matches their auth uid
CREATE POLICY "cart_insert_own"
  ON public.cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: users can update their own cart items
CREATE POLICY "cart_update_own"
  ON public.cart_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can delete their own cart items
CREATE POLICY "cart_delete_own"
  ON public.cart_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure the unique constraint exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cart_items_user_product_unique'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    DROP INDEX IF EXISTS public.idx_cart_items_user_product;
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END;
$$;
