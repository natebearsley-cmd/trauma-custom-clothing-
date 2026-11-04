# Shipping architecture — Albany, Illinois

The owner corrected the origin to **Albany, Illinois, USA**. Obtain the owner's exact origin ZIP and return address before enabling carrier quotes or labels. Never place the street address in public client data.

## Recommended carrier mix

- **UPS Ground**: owner-selected default for apparel, denim, hoodies, and custom pieces. Buyer pays weight-based shipping. Estimated delivery is 3–5 business days after shipment. Tracking is included on every physical order.
- **USPS Ground Advantage**: backup for lightweight shipments, with tracking included. Carrier estimates are not guarantees.
- Most orders ship within **1 business day when inventory is available**. Custom production timing is confirmed separately.
- Start with US domestic fulfillment. Quote other destinations separately; do not advertise unsupported international USPS services.

The buyer pays shipping on physical products. No $100 free-shipping rule. Digital products have no physical shipping.

## Implemented foundation

`lib/shipping.ts` defines Illinois origin, UPS Ground default and USPS Ground Advantage backup, quantity/weight validation, carrier-specific ceilings (UPS 150 lb / USPS 70 lb), and a server-provider payload requiring a confirmed origin ZIP plus measured package dimensions. Product inventory supports `fulfillmentType`, `packedWeightOz`, `inventoryType`, and `stockQuantity`; the full inventory manager exposes these fields. Existing product weights and counts remain unfilled rather than invented.

`shippingRequest` validates item quantities and sums their packed weights. For consolidated bundles, reweigh the final parcel before obtaining the binding quote; per-item packaging sums are planning data. `carrierQuoteRequest` requires origin ZIP and dimensions. This is a provider-neutral payload builder, not a live carrier integration and not a billing calculation.

## Launch-safe checkout today

- Depop purchases: listing/marketplace checkout establishes shipping, stock, taxes, and final total. Configure actual Illinois ship-from and buyer-paid shipping in the marketplace account.
- PayPal: storefront buttons first open a review page. Request a shipping-inclusive total by email before paying; the existing generic PayPal link cannot securely calculate shipping. The review page also offers the marketplace listing. No automatic total or stock reservation is claimed.
- Custom pieces: confirm size, quantity, artwork rights, production time, packed weight, service, shipping, and total in writing before sending the invoice. Take payment only after the quote is accepted.
- Digital: Payhip checkout/delivery remains separate.

## Next production integration

1. Enter actual packed weights; confirm origin ZIP/return address and package dimensions.
2. Configure UPS Ground and USPS Ground Advantage through a UPS/USPS-capable rate/label provider or the existing marketplace. Keep credentials server-side.
3. A future on-site checkout must load product prices from trusted server inventory, obtain destination-specific rates, bind a rate ID to an expiring quote, recalculate before charging, and verify signed payment webhooks.
4. Record orders and stock in a transactional database with reservation/expiration and webhook idempotency before selling one-of-one stock across multiple channels. Repository JSON is not an atomic order database.
5. Test label purchase, tracking, address corrections, failed rates, refunds, and a real delivered parcel before declaring automated fulfillment complete.

Processing and delivery wording follows the owner’s latest UPS-first requirements. Returns terms remain inherited business policy and still require owner confirmation. Exact carrier pricing depends on current carrier tariffs, dimensions, and destination.
