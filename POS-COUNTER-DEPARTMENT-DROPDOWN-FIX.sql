-- ============================================================
-- POS Counter department/category dropdown access fix
--
-- POS Counter does not require a departments table.
-- Departments are read from categories.department and products.department.
-- This policy ensures admin and cashier users can read category rows when
-- Row Level Security is enabled on public.categories.
-- ============================================================

GRANT SELECT ON TABLE public.categories TO authenticated;
GRANT SELECT ON TABLE public.products TO authenticated;

DROP POLICY IF EXISTS "pos_operators_read_categories" ON public.categories;
CREATE POLICY "pos_operators_read_categories"
ON public.categories
FOR SELECT
TO authenticated
USING (public.is_pos_operator());
