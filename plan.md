# Menu Enhancement Plan

## Changes

### 1. Remove "Our Services" section and rename "Browse by Category"
**File:** `chakula-foods/src/app/page.tsx`

- **Delete lines 79-97** — the entire "Our Services" `<section>` containing the 4 feature cards (Fast Food, Fresh Bakery, Fresh Market, Subscriptions).
- **Edit line 102-103** — change heading text from `"Browse by Category"` to `"Browse our Services by Category"`.
- **Update imports** on line 2 — remove unused imports (`ArrowRight`, `Coffee`, `Utensils`, `ShoppingBag`, `Calendar`) and the `features` array (lines 4-29) since they're only used by the deleted section. Keep `Link`.

### 2. Update footer with new branding info
**File:** `chakula-foods/src/app/layout.tsx`

- **Replace the "Contact Us" section (lines 65-73)** with:
  - Phone: `+256 753 300 613` (replace old `+256 700 000 000`)
  - Email: keep `info@chakulafoods.ug`
  - Add "Chakula Foods powered by Fund Trust Uganda" text
- **Update bottom copyright line (lines 75-78)** — include "powered by Fund Trust Uganda" or keep as-is depending on user preference (will keep copyright line with just Chakula Foods year).

## Files Modified
1. `chakula-foods/src/app/page.tsx` — delete features section, clean up imports, rename heading
2. `chakula-foods/src/app/layout.tsx` — update footer Contact Us section
