-- Create product-images storage bucket for admin image uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
DROP POLICY IF EXISTS "product_images_auth_insert" ON storage.objects;
CREATE POLICY "product_images_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update product images
DROP POLICY IF EXISTS "product_images_auth_update" ON storage.objects;
CREATE POLICY "product_images_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
DROP POLICY IF EXISTS "product_images_auth_delete" ON storage.objects;
CREATE POLICY "product_images_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
