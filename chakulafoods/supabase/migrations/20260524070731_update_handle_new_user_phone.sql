-- Update handle_new_user trigger to include phone from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
    )
    ON CONFLICT (id) DO UPDATE SET
        phone = EXCLUDED.phone,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
