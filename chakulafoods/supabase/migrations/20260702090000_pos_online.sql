-- ============================================================
-- POS Online
-- Stores completed online orders and keeps the table in sync
-- whenever an order reaches the delivered status.
-- ============================================================

-- 1. TABLE
CREATE TABLE IF NOT EXISTS public.pos_online (
    order_number TEXT PRIMARY KEY
        REFERENCES public.orders(order_number) ON DELETE CASCADE,
    customer_name TEXT NOT NULL DEFAULT '',
    department public.department_type NOT NULL,
    total INTEGER NOT NULL DEFAULT 0
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_pos_online_department
    ON public.pos_online(department);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.pos_online ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_pos_online" ON public.pos_online;
CREATE POLICY "admins_read_pos_online"
ON public.pos_online
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Writes are performed by the security-definer trigger below.
-- This keeps customers from inserting or changing POS records directly.

-- 4. SYNC FUNCTION
CREATE OR REPLACE FUNCTION public.sync_completed_order_to_pos_online()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'delivered'::public.order_status THEN
        INSERT INTO public.pos_online (
            order_number,
            customer_name,
            department,
            total
        )
        VALUES (
            NEW.order_number,
            NEW.customer_name,
            NEW.department,
            NEW.total_amount
        )
        ON CONFLICT (order_number)
        DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            department = EXCLUDED.department,
            total = EXCLUDED.total;
    END IF;

    RETURN NEW;
END;
$$;

-- 5. TRIGGER
DROP TRIGGER IF EXISTS sync_completed_order_to_pos_online_trigger
ON public.orders;

CREATE TRIGGER sync_completed_order_to_pos_online_trigger
AFTER INSERT OR UPDATE OF status
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_completed_order_to_pos_online();

-- 6. BACKFILL ORDERS THAT WERE ALREADY COMPLETED
INSERT INTO public.pos_online (
    order_number,
    customer_name,
    department,
    total
)
SELECT
    order_number,
    customer_name,
    department,
    total_amount
FROM public.orders
WHERE status = 'delivered'::public.order_status
  AND department IS NOT NULL
ON CONFLICT (order_number)
DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    department = EXCLUDED.department,
    total = EXCLUDED.total;

-- 7. ENABLE REALTIME FOR THE ADMIN MODULE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'pos_online'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_online;
    END IF;
END $$;
