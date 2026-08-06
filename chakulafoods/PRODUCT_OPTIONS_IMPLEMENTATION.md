# Product Options Implementation

## Database setup

Run `PRODUCT_OPTIONS_DATABASE_UPDATE.sql` in the Supabase SQL Editor before deploying the updated application.

The migration adds:

- `products.product_options` — JSON option groups configured in Add/Edit Product.
- `order_items.base_unit_price` — the original product price before extras.
- `order_items.selected_options` — the customer's selected options and surcharges.
- Matching cart fields for future database-backed cart synchronization.
- Updated order/POS item snapshots so option details appear in Admin Orders and POS Online.

## Admin usage

1. Open **Admin Panel → Products**.
2. Choose **Add Product** or edit an existing product.
3. In **Product options**, click **Group**.
4. Enter a group name such as `Side dish`, `Drink type`, `Weight`, `Flavour`, or `Size`.
5. Choose whether the customer selects one or multiple options.
6. Mark the group required when a selection is compulsory.
7. Add option names and their additional UGX prices.

Example:

- Group: `Side dish`
- Rule: `Choose one`
- Required: Yes
- Option: `Steamed cassava` — UGX 2,000
- Option: `Chips` — UGX 3,000
- Option: `Matooke` — UGX 2,500

## Customer flow

- Clicking a product opens its expanded customization view.
- **Add to Cart** opens the same view and lets the customer select options.
- **Order Now** uses Chakula red (`#C41230`) and proceeds to checkout after adding the configured item.
- The displayed total updates immediately as options and quantity change.
- Required option groups are validated before the item can be added.
- Different configurations of the same product remain separate cart lines.
