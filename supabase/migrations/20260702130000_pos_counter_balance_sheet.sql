-- ============================================================
-- POS Counter + Balance Sheet support
-- - Adds a cashier role for in-house POS operators
-- - Creates public.pos_counter with item snapshots and CRUD access
-- - Adds transaction timestamps to public.pos_online
-- - Keeps completed online orders dated for financial reporting
-- ============================================================

-- 1. CASHIER ROLE
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'cashier';

CREATE OR REPLACE FUNCTION public.is_pos_operator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
          AND role::TEXT IN ('admin', 'cashier')
          AND is_active = true
    );
$$;

-- 2. ADD REPORTING TIMESTAMPS TO POS ONLINE
ALTER TABLE public.pos_online
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Existing completed online orders inherit the order completion/update time.
UPDATE public.pos_online po
SET
    created_at = COALESCE(o.updated_at, o.created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(o.updated_at, o.created_at, CURRENT_TIMESTAMP)
FROM public.orders o
WHERE o.order_number = po.order_number;

UPDATE public.pos_online
SET
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);

ALTER TABLE public.pos_online
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pos_online_created_at
    ON public.pos_online(created_at DESC);

-- Cashiers may read online sales for the Balance Sheet, but online records
-- continue to be written only by the order-completion trigger.
DROP POLICY IF EXISTS "admins_read_pos_online" ON public.pos_online;
DROP POLICY IF EXISTS "pos_operators_read_pos_online" ON public.pos_online;
CREATE POLICY "pos_operators_read_pos_online"
ON public.pos_online
FOR SELECT
TO authenticated
USING (public.is_pos_operator());

-- 3. POS COUNTER ORDER NUMBER GENERATOR
CREATE SEQUENCE IF NOT EXISTS public.pos_counter_order_number_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_pos_counter_order_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        'CTR-' ||
        to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala', 'YYYYMMDD') ||
        '-' ||
        lpad(nextval('public.pos_counter_order_number_seq')::TEXT, 5, '0');
$$;

-- 4. POS COUNTER TABLE
CREATE TABLE IF NOT EXISTS public.pos_counter (
    order_number TEXT PRIMARY KEY DEFAULT public.generate_pos_counter_order_number(),
    customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
    department public.department_type NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
    items_count INTEGER NOT NULL DEFAULT 0 CHECK (items_count >= 0),
    total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pos_counter_department
    ON public.pos_counter(department);
CREATE INDEX IF NOT EXISTS idx_pos_counter_created_at
    ON public.pos_counter(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_counter_created_by
    ON public.pos_counter(created_by);

-- 5. NORMALIZE COUNTER ITEMS AND CALCULATE TOTALS SERVER-SIDE
CREATE OR REPLACE FUNCTION public.normalize_pos_counter_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_items JSONB;
    v_items_count INTEGER;
    v_total INTEGER;
BEGIN
    IF jsonb_typeof(COALESCE(NEW.items, '[]'::JSONB)) <> 'array' THEN
        RAISE EXCEPTION 'POS Counter items must be a JSON array';
    END IF;

    SELECT
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'product_id', item->>'product_id',
                    'product_name', item->>'product_name',
                    'category', COALESCE(item->>'category', ''),
                    'quantity', GREATEST(COALESCE((item->>'quantity')::INTEGER, 1), 1),
                    'unit_price', GREATEST(COALESCE((item->>'unit_price')::INTEGER, 0), 0),
                    'line_total',
                        GREATEST(COALESCE((item->>'quantity')::INTEGER, 1), 1) *
                        GREATEST(COALESCE((item->>'unit_price')::INTEGER, 0), 0)
                )
            ),
            '[]'::JSONB
        ),
        COALESCE(
            SUM(GREATEST(COALESCE((item->>'quantity')::INTEGER, 1), 1)),
            0
        )::INTEGER,
        COALESCE(
            SUM(
                GREATEST(COALESCE((item->>'quantity')::INTEGER, 1), 1) *
                GREATEST(COALESCE((item->>'unit_price')::INTEGER, 0), 0)
            ),
            0
        )::INTEGER
    INTO v_items, v_items_count, v_total
    FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::JSONB)) AS item
    WHERE NULLIF(BTRIM(item->>'product_name'), '') IS NOT NULL;

    IF jsonb_array_length(v_items) = 0 THEN
        RAISE EXCEPTION 'A POS Counter order must contain at least one item';
    END IF;

    NEW.customer_name := COALESCE(NULLIF(BTRIM(NEW.customer_name), ''), 'Walk-in Customer');
    NEW.items := v_items;
    NEW.items_count := v_items_count;
    NEW.total := v_total;
    NEW.updated_at := CURRENT_TIMESTAMP;

    IF TG_OP = 'INSERT' AND NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_pos_counter_record_trigger
ON public.pos_counter;

CREATE TRIGGER normalize_pos_counter_record_trigger
BEFORE INSERT OR UPDATE OF customer_name, department, items
ON public.pos_counter
FOR EACH ROW
EXECUTE FUNCTION public.normalize_pos_counter_record();

-- 6. POS COUNTER SECURITY
ALTER TABLE public.pos_counter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pos_operators_manage_pos_counter" ON public.pos_counter;
CREATE POLICY "pos_operators_manage_pos_counter"
ON public.pos_counter
FOR ALL
TO authenticated
USING (public.is_pos_operator())
WITH CHECK (public.is_pos_operator());

-- Allow cashiers to read the products needed by the item dropdowns.
-- The existing public product SELECT policy already covers this.

-- 7. UPDATE ONLINE ORDER SYNC WITH ITEM SNAPSHOTS AND TRANSACTION DATE
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
            total,
            created_at,
            updated_at
        )
        VALUES (
            NEW.order_number,
            NEW.customer_name,
            NEW.department,
            COALESCE(NEW.items, '[]'::JSONB),
            COALESCE(NEW.items_count, 0),
            NEW.total_amount,
            COALESCE(NEW.updated_at, NEW.created_at, CURRENT_TIMESTAMP),
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (order_number)
        DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            department = EXCLUDED.department,
            items = EXCLUDED.items,
            items_count = EXCLUDED.items_count,
            total = EXCLUDED.total,
            updated_at = CURRENT_TIMESTAMP;
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

-- 8. BACKFILL / REFRESH COMPLETED ONLINE ORDERS
INSERT INTO public.pos_online (
    order_number,
    customer_name,
    department,
    items,
    items_count,
    total,
    created_at,
    updated_at
)
SELECT
    o.order_number,
    o.customer_name,
    o.department,
    COALESCE(o.items, '[]'::JSONB),
    COALESCE(o.items_count, 0),
    o.total_amount,
    COALESCE(o.updated_at, o.created_at, CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
FROM public.orders o
WHERE o.status = 'delivered'::public.order_status
  AND o.department IS NOT NULL
ON CONFLICT (order_number)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    department = EXCLUDED.department,
    items = EXCLUDED.items,
    items_count = EXCLUDED.items_count,
    total = EXCLUDED.total,
    updated_at = CURRENT_TIMESTAMP;

-- 9. REALTIME
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'pos_counter'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_counter;
    END IF;
END $$;
