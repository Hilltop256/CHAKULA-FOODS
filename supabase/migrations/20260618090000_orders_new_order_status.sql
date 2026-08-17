-- Add 'new_order' and 'rider_assigned' to the order_status enum
-- These must be committed before they can be used, so we run them outside a transaction.
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'new_order' BEFORE 'confirmed';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'rider_assigned' AFTER 'preparing';

-- Commit the enum additions before using the new values
COMMIT;

-- Set 'new_order' as the default status for orders
ALTER TABLE public.orders
ALTER COLUMN status SET DEFAULT 'new_order'::public.order_status;

-- Update any orders that have no status or a blank status to 'new_order'
UPDATE public.orders
SET status = 'new_order'::public.order_status
WHERE status IS NULL OR status::TEXT = '' OR status::TEXT = 'pending';
