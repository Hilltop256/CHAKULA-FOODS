-- ============================================================
-- Order item snapshots for Orders and POS Online
--
-- public.order_items remains the source of truth. The JSONB
-- snapshots below make the Admin Orders and POS Online modules
-- able to display item details directly and stay synchronized.
-- ============================================================

-- 1. ADD ITEM SNAPSHOT FIELDS
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS items_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.pos_online
    ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::JSONB,
    ADD COLUMN IF NOT EXISTS items_count INTEGER NOT NULL DEFAULT 0;

-- 2. BUILD AND SAVE AN ORDER'S ITEM SNAPSHOT
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
                    'unit_price', oi.unit_price,
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

REVOKE ALL ON FUNCTION public.refresh_order_items_snapshot(UUID) FROM PUBLIC;

-- 3. REFRESH THE SNAPSHOT WHEN ORDER ITEMS CHANGE
CREATE OR REPLACE FUNCTION public.handle_order_items_snapshot_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.refresh_order_items_snapshot(OLD.order_id);
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.order_id IS DISTINCT FROM NEW.order_id THEN
        PERFORM public.refresh_order_items_snapshot(OLD.order_id);
    END IF;

    PERFORM public.refresh_order_items_snapshot(NEW.order_id);
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_order_items_snapshot_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS refresh_order_items_snapshot_trigger
ON public.order_items;

CREATE TRIGGER refresh_order_items_snapshot_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_items_snapshot_change();

-- 4. BACKFILL ITEM SNAPSHOTS FOR EXISTING ORDERS
UPDATE public.orders o
SET
    items = COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'unit_price', oi.unit_price,
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

-- 5. COPY THE ITEM SNAPSHOT INTO POS ONLINE
CREATE OR REPLACE FUNCTION public.sync_completed_order_to_pos_online()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'delivered'::public.order_status
       AND NEW.department IS NOT NULL THEN
        INSERT INTO public.pos_online (
            order_number,
            customer_name,
            department,
            items,
            items_count,
            total
        )
        VALUES (
            NEW.order_number,
            NEW.customer_name,
            NEW.department,
            COALESCE(NEW.items, '[]'::JSONB),
            COALESCE(NEW.items_count, 0),
            NEW.total_amount
        )
        ON CONFLICT (order_number)
        DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            department = EXCLUDED.department,
            items = EXCLUDED.items,
            items_count = EXCLUDED.items_count,
            total = EXCLUDED.total;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_completed_order_to_pos_online_trigger
ON public.orders;

CREATE TRIGGER sync_completed_order_to_pos_online_trigger
AFTER INSERT OR UPDATE OF status, customer_name, department, items, items_count, total_amount
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_completed_order_to_pos_online();

-- 6. BACKFILL POS ONLINE ITEM DETAILS FOR COMPLETED ORDERS
INSERT INTO public.pos_online (
    order_number,
    customer_name,
    department,
    items,
    items_count,
    total
)
SELECT
    o.order_number,
    o.customer_name,
    o.department,
    COALESCE(o.items, '[]'::JSONB),
    COALESCE(o.items_count, 0),
    o.total_amount
FROM public.orders o
WHERE o.status = 'delivered'::public.order_status
  AND o.department IS NOT NULL
ON CONFLICT (order_number)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    department = EXCLUDED.department,
    items = EXCLUDED.items,
    items_count = EXCLUDED.items_count,
    total = EXCLUDED.total;
