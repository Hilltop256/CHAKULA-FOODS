-- ============================================================
-- Riders and Order Dispatch Migration
-- Adds riders table and order_dispatch table
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.rider_status CASCADE;
CREATE TYPE public.rider_status AS ENUM ('available', 'on_delivery', 'offline');

DROP TYPE IF EXISTS public.dispatch_status CASCADE;
CREATE TYPE public.dispatch_status AS ENUM ('pending', 'rider_assigned', 'out_for_delivery', 'delivered');

-- 2. Add 'order_ready' to order_status enum (if not exists)
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'order_ready' AFTER 'preparing';

-- 3. TABLES

-- riders
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_type TEXT DEFAULT 'Motorcycle',
    vehicle_plate TEXT,
    status public.rider_status NOT NULL DEFAULT 'available'::public.rider_status,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- order_dispatch
CREATE TABLE IF NOT EXISTS public.order_dispatch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
    status public.dispatch_status NOT NULL DEFAULT 'pending'::public.dispatch_status,
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_riders_status ON public.riders(status);
CREATE INDEX IF NOT EXISTS idx_riders_is_active ON public.riders(is_active);
CREATE INDEX IF NOT EXISTS idx_order_dispatch_order_id ON public.order_dispatch(order_id);
CREATE INDEX IF NOT EXISTS idx_order_dispatch_rider_id ON public.order_dispatch(rider_id);
CREATE INDEX IF NOT EXISTS idx_order_dispatch_status ON public.order_dispatch(status);

-- 5. FUNCTIONS

-- Auto-update updated_at for riders
DROP TRIGGER IF EXISTS update_riders_updated_at ON public.riders;
CREATE OR REPLACE FUNCTION public.update_riders_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Auto-update updated_at for order_dispatch
CREATE OR REPLACE FUNCTION public.update_order_dispatch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Sync order status when dispatch status changes
CREATE OR REPLACE FUNCTION public.sync_order_status_from_dispatch()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.status = 'rider_assigned'::public.dispatch_status THEN
        UPDATE public.orders SET status = 'rider_assigned'::public.order_status, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.order_id;
    ELSIF NEW.status = 'out_for_delivery'::public.dispatch_status THEN
        UPDATE public.orders SET status = 'out_for_delivery'::public.order_status, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.order_id;
    ELSIF NEW.status = 'delivered'::public.dispatch_status THEN
        UPDATE public.orders SET status = 'delivered'::public.order_status, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.order_id;
    END IF;
    RETURN NEW;
END;
$$;

-- 6. ENABLE RLS
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_dispatch ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Riders: admin full access, public read for available riders
DROP POLICY IF EXISTS "admin_manage_riders" ON public.riders;
CREATE POLICY "admin_manage_riders"
ON public.riders FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Order dispatch: admin full access
DROP POLICY IF EXISTS "admin_manage_order_dispatch" ON public.order_dispatch;
CREATE POLICY "admin_manage_order_dispatch"
ON public.order_dispatch FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 8. TRIGGERS
DROP TRIGGER IF EXISTS update_riders_updated_at ON public.riders;
CREATE TRIGGER update_riders_updated_at
    BEFORE UPDATE ON public.riders
    FOR EACH ROW EXECUTE FUNCTION public.update_riders_updated_at();

DROP TRIGGER IF EXISTS update_order_dispatch_updated_at ON public.order_dispatch;
CREATE TRIGGER update_order_dispatch_updated_at
    BEFORE UPDATE ON public.order_dispatch
    FOR EACH ROW EXECUTE FUNCTION public.update_order_dispatch_updated_at();

DROP TRIGGER IF EXISTS sync_order_status_on_dispatch_update ON public.order_dispatch;
CREATE TRIGGER sync_order_status_on_dispatch_update
    AFTER INSERT OR UPDATE OF status ON public.order_dispatch
    FOR EACH ROW EXECUTE FUNCTION public.sync_order_status_from_dispatch();

-- 9. MOCK DATA - Sample riders
DO $$
BEGIN
    INSERT INTO public.riders (id, name, phone, vehicle_type, vehicle_plate, status)
    VALUES
        (gen_random_uuid(), 'David Mugisha', '+256 701 234 567', 'Motorcycle', 'UAX 123B', 'available'::public.rider_status),
        (gen_random_uuid(), 'Peter Ssemakula', '+256 772 345 678', 'Motorcycle', 'UBE 456C', 'available'::public.rider_status),
        (gen_random_uuid(), 'Grace Nakato', '+256 753 456 789', 'Bicycle', 'N/A', 'available'::public.rider_status),
        (gen_random_uuid(), 'James Okello', '+256 782 567 890', 'Motorcycle', 'UCF 789D', 'offline'::public.rider_status)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock rider data insertion skipped: %', SQLERRM;
END $$;
