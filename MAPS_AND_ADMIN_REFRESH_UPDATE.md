# Admin Refresh + Maps Update

## Admin panel refresh persistence
The admin panel now stores the active module in browser localStorage. Refreshing the browser restores the same module instead of always returning to Overview. If an Order Dispatch screen is open, its order id is also restored.

## Maps
Google Maps has been removed from the checkout and order-tracking implementation. The app now loads Leaflet 1.9.4 and displays OpenStreetMap tiles, so `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is no longer required.

Updated map locations:
- Checkout: customer can click the map, drag the delivery marker, or use browser GPS.
- Customer Order Tracking: store, customer, route line, and rider-progress marker.
- Admin Orders: expanded orders include an embedded delivery map.
- Admin Order Dispatch: includes a delivery map and OpenStreetMap link.

## Important: live rider GPS
The existing Chakula Foods order-tracking code does not contain real rider GPS coordinates. Its rider marker is simulated between the store and the customer's location. Replacing Google Maps fixes map rendering, but true live tracking requires a rider-facing location-sharing flow and a database table or realtime channel for rider latitude/longitude updates.

## OpenStreetMap production note
OpenStreetMap's public standard tile servers are suitable for normal interactive viewing but are community-funded and provide no SLA. For higher commercial traffic, keep Leaflet and switch the tile URL to a hosted OSM provider with production support.
