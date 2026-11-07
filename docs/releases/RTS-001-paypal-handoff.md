# RTS-001 PayPal release handoff — not published

Owner-confirmed item:
- Name: TRAUMA Respect The Scars Pink Trucker Hat
- SKU: RTS-001
- Physical inventory tag: 0465
- Price: USD 49.99
- Quantity: 1
- Condition: New With Tags
- Size: One Size Adjustable
- PayPal merchant account: owner's confirmed business account

Preserve the exact approved photos and listing description. Those sources are not present in the current website inventory. No other pink hat or rose hat is a substitute.

Before publication:
1. In the confirmed PayPal business account, create the product-specific fixed-price USD 49.99 payment link, SKU RTS-001, available quantity one, and confirmed shipping/tax settings. Verify shipping against the store policy. No generic paypal.me link and no reuse of PMH-001's link.
2. Recover the approved original photos and listing copy; confirm they depict tag 0465.
3. Add one approved, published product record with the confirmed fields and its actual PayPal-hosted /ncp/payment link.
4. ProductDetail and ProductCard already share the BUY NOW helper. This branch extends that exact implementation to RTS-001 + tag 0465 + quantity one only.
5. Test product detail → BUY NOW → PayPal title, amount, shipping and merchant. Do not submit a live test payment automatically.
6. Deploy only when the actual link and preserved product data are present. Recheck the production product page and PayPal handoff. Coordinate sold status across marketplaces immediately when this single physical unit sells.

Current blockers: The actual PayPal payment link and approved RTS photos/copy are not available. No PayPal product was created and no public inventory was changed.
