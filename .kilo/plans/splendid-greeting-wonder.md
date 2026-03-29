# Plan: Integrate HTML Menu into Chakula Foods Next.js App

## Context
The user has a custom-designed HTML menu with 8 parts (CSS, Hero/Nav/Wraps, Bowls/Pizza, Roasts, Specials/Bakery, Platters, Drinks, Footer/JS). This menu uses base64-embedded images and a unique design system (dark theme, Playfair Display + Poppins fonts, card layouts, section-based navigation). The goal is to integrate this into the existing Next.js app **without changing the app structure, look, or features** (Navbar, Footer, Cart, Checkout, Payments, Auth, Admin all remain untouched).

The user chose: **Full ordering from the HTML menu** — the HTML menu replaces the current `/menu` page, with add-to-cart on each item.

## What Changes vs What Stays

### Unchanged (NOT touching these):
- `src/app/layout.tsx` — root layout stays the same
- `src/store/cart.tsx`, `src/store/auth.tsx` — unchanged
- `src/lib/` — auth, prisma, sms, utils, payments — unchanged
- `src/app/page.tsx` (home), `/cart`, `/checkout`, `/account`, `/admin`, `/login`, `/register`, `/subscriptions`, `/payment/callback` — all unchanged
- All `/api/` routes — unchanged
- `tailwind.config.js`, `postcss.config.mjs` — unchanged

### Files Modified:
| File | Change |
|---|---|
| `prisma/schema.prisma` | Add new ProductCategory enum values (WRAPS, BOWLS_PIZZA, ROASTS, SPECIALS_BAKERY, PLATTERS, DRINKS) |
| `prisma/seed.ts` | Replace seed products with items from the HTML menu (names, prices, descriptions, categories) |
| `src/app/menu/page.tsx` | Complete rewrite — renders the HTML menu sections as React components with add-to-cart |
| `src/components/layout/Navbar.tsx` | Update navLinks to reflect new menu sections |
| `src/app/menu/menu.css` | NEW — the CSS from Part 1, scoped to prevent conflicts |
| `src/app/menu/components/` | NEW — individual section components extracted from Parts 2-8 |

## Implementation Steps (in order)

### Step 1: Create the CSS file
- Create `src/app/menu/menu.css` with all CSS from Part 1
- Scope rules to prevent conflicts with the app's Tailwind styles
- Import Google Fonts (Playfair Display + Poppins)

### Step 2: Create section components
Create `src/app/menu/components/` directory with:

| Component | Source Part | Content |
|---|---|---|
| `MenuHero.tsx` | Part 2 | Hero banner (CHAKULA FOODS title, subtitle, tags) |
| `MenuNav.tsx` | Part 2 | Sticky section navigation bar |
| `WrapsSection.tsx` | Part 2 | Wraps menu items with cards |
| `BowlsPizzaSection.tsx` | Part 3 | Bowl Meals + Pizza sections |
| `RoastsSection.tsx` | Part 4 | Roasts & Grills section |
| `SpecialsBakerySection.tsx` | Part 5 | Specials & Bakery sections |
| `PlattersSection.tsx` | Part 6 | Party & Group Platters (overlay card style) |
| `DrinksSection.tsx` | Part 7 | Drinks & Beverages (dark card style) |

Each component uses `useCart()` from `@/store/cart` and `formatCurrency` from `@/lib/utils`.

### Step 3: Rewrite `/menu` page
- `src/app/menu/page.tsx` becomes a wrapper that:
  - Imports `menu.css`
  - Renders `<MenuHero />`
  - Renders `<MenuNav />`
  - Renders all sections in order
  - Uses `<Suspense>` boundary (required for `useSearchParams`)

### Step 4: Update Prisma schema
- Add new enum values to `ProductCategory`: WRAPS, BOWLS_PIZZA, ROASTS, SPECIALS_BAKERY, PLATTERS, DRINKS
- Run `prisma db push` to sync schema

### Step 5: Update seed data
- Replace current seed products with items from the HTML menu
- Each item gets: name, description, price, category, image URL, preparationTime, tags

### Step 6: Handle images
- Base64 images from Parts 2-8 get converted to files in `public/images/menu/`
- Card components use `<img>` tags for static menu content

### Step 7: Update Navbar links
- Change navLinks to reflect new menu sections with anchor links
- e.g. `{ href: "/menu#wraps", label: "Wraps" }`

### Step 8: Smooth scroll navigation
- `<MenuNav />` uses anchor links (`#wraps`, `#bowls-pizza`, etc.)
- CSS `scroll-behavior: smooth`

## Cart Integration
Each "Add" button calls:
```ts
addItem({
  productId: string,  // stable ID for the menu item
  name: string,       // item name
  price: number,      // price in UGX
  image?: string,     // image URL
  quantity: 1,        // default add
})
```

## Verification
1. `npm run build` — compiles without errors
2. `npm run lint` — no lint errors
3. `/menu` — hero, sticky nav, all sections render
4. Click "Add" — item appears in cart badge in Navbar
5. `/cart` — items show correctly with names and prices
6. Checkout — works end-to-end with new products
7. Mobile — responsive, sticky nav scrolls horizontally

## What to Send Next
User needs to send **Parts 2 through 8** (the actual HTML content with menu items, images, and embedded data) to proceed with implementation.
