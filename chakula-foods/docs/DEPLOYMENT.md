# Deployment & Testing Guide

This guide explains exactly what you need to do to get the new image upload and menu completion features working on your live deployment.

## What was broken (why you saw "Failed to upload" + 401 errors)

1. **Admin UI runs in TEST MODE (no login required)** — but the backend API routes still enforced `getCurrentUser()`. So every write call returned 401 Unauthorized.
2. **Image upload fell through to base64** when Supabase Storage env vars were missing, and the generic "Upload failed" alert hid the actual reason.
3. **Unsplash `_next/image` 404s** are usually browser/ad-blocker issues — not fatal.

## What was fixed

- `src/lib/test-mode.ts` — returns a synthetic admin in dev mode so admin API calls work without logging in
- All admin routes (products, orders, offers, packages, categories, upload, CSV) now use `getAdminOrTestUser` instead of `getCurrentUser`
- Customer routes (order checkout, subscription signup) still require real login
- Upload route now has explicit Node.js runtime, detailed logging, and a clearer fallback path
- Admin UI now shows the real error message instead of just "Image upload failed"

## Deploy steps

### 1. Push to your remote

```bash
git push origin main
```

Vercel will auto-deploy if connected. Otherwise run `vercel --prod` manually.

### 2. Set environment variables on your deployment platform

Required for persistent image storage (Vercel → Project Settings → Environment Variables):

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase **pooler** URL (port 6543) | **CRITICAL:** Must be the pooler, not direct |
| `DIRECT_URL` | Supabase **direct** URL (port 5432) | Used only for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | **Secret** — Settings → API → service_role |
| `SUPABASE_STORAGE_BUCKET` | `media` | Name of your bucket |
| `ADMIN_TEST_MODE` | `true` | Keep admin UI open without login. Set to `false` in production when ready |

**⚠️ Database connection — critical:**
Vercel serverless functions **cannot** connect directly to Supabase port 5432. You must use the connection pooler.

Get the pooler URL from **Supabase Dashboard → Settings → Database → Connection string → Transaction mode**. It looks like:
```
postgres://postgres.xxxxxxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

If you see `Can't reach database server at db.xxx.supabase.co:5432` in logs, your `DATABASE_URL` is pointing at the direct connection instead of the pooler. Fix: update `DATABASE_URL` to use the pooler (port 6543) and put the direct URL in `DIRECT_URL`.

Without Supabase storage vars, uploads still work but use base64 (stored in memory, lost on server restart).

### 3. Create the Supabase Storage bucket (one-time)

1. Open your Supabase dashboard → **Storage**
2. Click **New bucket**, name it `media`
3. Toggle **Public bucket** ON
4. Click **Create**

See `docs/STORAGE_SETUP.md` for detailed steps including RLS policies.

### 4. Apply the database migration

```bash
npx prisma migrate deploy
```

This applies `20250421185543_add_scheduling_variants` — adds `availableFrom`, `availableTo`, `availableDays` to Product and creates the `ProductVariant` table.

If you use `prisma db push` instead (no migration table), run:
```bash
npx prisma db push
```

### 5. (Optional) Re-seed with scheduling + variants

```bash
npm run db:seed
```

This wipes and reseeds 60+ products with realistic availability schedules (breakfast items in the morning, drinks/wines in the evening, etc.) and sample variants (Coffee 16oz/22oz, Juice 500ml/750ml).

## Testing checklist

After deploy, test these flows:

### Image upload
1. Go to `/admin` → Menu tab
2. Click **Add Product** or edit an existing one
3. Click **Upload Image** and pick a JPEG/PNG ≤ 5MB
4. You should see the preview immediately
5. Open DevTools → Network → find the `POST /api/upload` request
   - Response should have `storage: "supabase"` if env vars are set
   - Or `storage: "base64"` if falling back (still works, non-persistent)
6. If it fails, the alert now shows the real error (e.g. "Storage upload failed: 403" → bucket not public)

### Menu CRUD
1. Create a new product with scheduling (e.g. "Morning Rolex", 06:00–10:00, Mon–Sat only)
2. Create a product with 2–3 variants (e.g. Small, Medium, Large with different prices)
3. Save — should succeed (no more 401)
4. Visit `/menu` and confirm the scheduled product only appears during its window

### CSV import/export
1. Click **Export CSV** in the Menu tab → downloads `products.csv`
2. Edit the CSV in Excel/Sheets (change prices, add rows)
3. Click **Import CSV** → pick the edited file
4. Alert confirms "X created, Y updated"

## Troubleshooting

**"Storage upload failed: Invalid JWT" or 401 from Supabase:**
- `SUPABASE_SERVICE_ROLE_KEY` is wrong. Make sure you copied the `service_role` key (not `anon`).

**"Storage upload failed: 404 Bucket not found":**
- Bucket name mismatch. Check `SUPABASE_STORAGE_BUCKET` matches your Supabase bucket name exactly.

**Images upload but don't display:**
- Bucket isn't public. Go to Supabase → Storage → bucket → toggle public.

**Still getting 401 on admin API calls:**
- Make sure `ADMIN_TEST_MODE=true` is set on Vercel AND redeployed after setting it.
- Or set `NODE_ENV` to non-production (it defaults to `production` on Vercel, so you need the explicit `ADMIN_TEST_MODE` flag).

**Unsplash 404s in console:**
- Those are seed-data placeholder images. Replace them with your own uploads. Not a bug.

## Turning off test mode later (when you have real admin accounts)

1. Set `ADMIN_TEST_MODE=false` on Vercel and redeploy
2. In `src/app/admin/page.tsx`, change `const isTestMode = true;` → `const isTestMode = false;`
3. Log in with `admin@chakulafoods.ug` / `admin123` (from seed) or your created admin user

## Files changed in this session

### New
- `src/lib/storage.ts` — Supabase Storage client
- `src/lib/env.ts` — env helpers
- `src/lib/test-mode.ts` — test-mode auth bypass
- `src/app/api/products/export/route.ts`
- `src/app/api/products/import/route.ts`
- `prisma/migrations/20250421185543_add_scheduling_variants/`
- `docs/STORAGE_SETUP.md`
- `docs/DEPLOYMENT.md` (this file)

### Modified
- `prisma/schema.prisma` — scheduling + variants
- `prisma/seed.ts` — realistic schedules + variants
- `src/app/api/upload/route.ts` — Supabase + base64 fallback + diagnostics
- `src/app/api/products/route.ts` — variants + scheduling handling
- `src/app/api/{orders,offers,packages,subscriptions,categories}/route.ts` — test-mode auth
- `src/app/admin/page.tsx` — scheduling UI, variants UI, CSV buttons, clearer errors
- `src/app/account/page.tsx` — avatar upload with cleanup
- `src/app/menu/page.tsx` — `isProductAvailableNow()` filter
- `.env.example` — Supabase vars
