-- ============================================================
-- Product customization options
-- - Stores reusable option groups on products
-- - Stores the customer's selected options on order items
-- - Preserves option details in Orders and POS Online snapshots
-- ============================================================

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS product_options JSONB NOT NULL DEFAULT '[]'::JSONB;

ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS base_unit_price INTEGER,
    ADD COLUMN IF NOT EXISTS selected_options JSONB NOT NULL DEFAULT '[]'::JSONB;

ALTER TABLE public.cart_items
    ADD COLUMN IF NOT EXISTS base_price INTEGER,
    ADD COLUMN IF NOT EXISTS selected_options JSONB NOT NULL DEFAULT '[]'::JSONB;

UPDATE public.order_items
SET base_unit_price = unit_price
WHERE base_unit_price IS NULL;

UPDATE public.cart_items
SET base_price = price
WHERE base_price IS NULL;

ALTER TABLE public.order_items
    ALTER COLUMN base_unit_price SET DEFAULT 0,
    ALTER COLUMN base_unit_price SET NOT NULL;

ALTER TABLE public.cart_items
    ALTER COLUMN base_price SET DEFAULT 0,
    ALTER COLUMN base_price SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_product_options_array_check'
    ) THEN
        ALTER TABLE public.products
            ADD CONSTRAINT products_product_options_array_check
            CHECK (jsonb_typeof(product_options) = 'array');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'order_items_selected_options_array_check'
    ) THEN
        ALTER TABLE public.order_items
            ADD CONSTRAINT order_items_selected_options_array_check
            CHECK (jsonb_typeof(selected_options) = 'array');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'cart_items_selected_options_array_check'
    ) THEN
        ALTER TABLE public.cart_items
            ADD CONSTRAINT cart_items_selected_options_array_check
            CHECK (jsonb_typeof(selected_options) = 'array');
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.refresh_order_items_snapshot(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_items JSONB;
    v_items_count INTEGER;
BEGIN
    SELECT
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'base_unit_price', COALESCE(oi.base_unit_price, oi.unit_price),
                    'unit_price', oi.unit_price,
                    'selected_options', COALESCE(oi.selected_options, '[]'::JSONB),
                    'line_total', oi.quantity * oi.unit_price
                )
                ORDER BY oi.created_at, oi.id
            ),
            '[]'::JSONB
        ),
        COALESCE(SUM(oi.quantity), 0)::INTEGER
    INTO v_items, v_items_count
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id;

    UPDATE public.orders
    SET
        items = v_items,
        items_count = v_items_count
    WHERE id = p_order_id
      AND (
          items IS DISTINCT FROM v_items
          OR items_count IS DISTINCT FROM v_items_count
      );
END;
$$;

UPDATE public.orders o
SET
    items = COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'base_unit_price', COALESCE(oi.base_unit_price, oi.unit_price),
                    'unit_price', oi.unit_price,
                    'selected_options', COALESCE(oi.selected_options, '[]'::JSONB),
                    'line_total', oi.quantity * oi.unit_price
                )
                ORDER BY oi.created_at, oi.id
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ),
        '[]'::JSONB
    ),
    items_count = COALESCE(
        (
            SELECT SUM(oi.quantity)::INTEGER
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ),
        0
    );

UPDATE public.pos_online po
SET
    items = o.items,
    items_count = o.items_count,
    updated_at = CURRENT_TIMESTAMP
FROM public.orders o
WHERE o.order_number = po.order_number;
