# Supabase Storage Setup Guide

Chakula Foods uses Supabase Storage for persistent image storage. Images uploaded via the admin panel (products, offers, packages) and user avatars are stored in a Supabase bucket.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your **Project URL** (e.g. `https://abcdefgh.supabase.co`)
3. Go to **Settings → API** and copy:
   - `service_role` key (SECRET, server-side only)

## 2. Create Storage Bucket

1. In your Supabase dashboard, navigate to **Storage**
2. Click **New bucket**
3. Name: `media` (or customize via `SUPABASE_STORAGE_BUCKET` env var)
4. Toggle **Public bucket** ON (so images can be viewed in the browser)
5. Click **Create bucket**

## 3. Configure Bucket Policies

For public read access, add this policy under the `media` bucket → Policies:

```sql
-- Allow anyone to read files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');
```

Server-side uploads/deletes use the service role key, which bypasses RLS.

## 4. Set Environment Variables

Add these to your `.env` file (local) or Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (long service_role key)
SUPABASE_STORAGE_BUCKET=media
```

## 5. Verify Setup

Start the app and upload an image through the admin panel (Menu → Add Product → Upload Image).

- If configured correctly, the URL will be `https://your-project.supabase.co/storage/v1/object/public/media/products/...`
- If not configured, the app falls back to in-memory base64 (non-persistent, fine for development)

## Folder Structure

Uploaded images are organized by category:
- `products/` — product images
- `offers/` — promotional offer images
- `packages/` — combo/bundle images
- `avatars/` — user profile pictures
- `media/` — default catch-all

## Troubleshooting

**Upload fails silently, falls back to base64:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Restart the dev server after adding env vars

**Images don't load in the browser:**
- Ensure the bucket is **public**
- Verify the public read RLS policy is active

**Old images not deleted when replaced:**
- Check server logs; failures are non-fatal (logged as warnings)
- Verify `SUPABASE_SERVICE_ROLE_KEY` has delete permission
