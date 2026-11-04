# TRAUMA public launch checklist

November 4, 2026. Check boxes indicate verified work, not assumed account configuration.

## Shipping — first revenue priority

- [x] Origin text/configuration uses Albany, Illinois.
- [x] UPS Ground default; USPS Ground Advantage lightweight backup.
- [x] Buyer pays weight-based physical shipping; conflicting free-shipping promise removed.
- [x] Policy states estimated UPS delivery of 3–5 business days after shipment.
- [x] Policy states most stocked orders ship within one business day.
- [x] Tracking included on all physical orders; custom production timing quoted separately.
- [x] Schema/editor accept actual packed weights; quote payload requires measured dimensions and confirmed origin ZIP.
- [ ] Confirm exact ship-from ZIP and return address.
- [ ] Weigh packed apparel, denim, hoodies and custom items; enter real values.
- [ ] Configure UPS account/rate provider or marketplace shipping; enable USPS backup.
- [ ] Test destination-specific rates, multi-item packaging, errors, labels and tracking.
- [ ] Verify the same Illinois origin and buyer-paid settings in Depop/PayPal invoices.

## Checkout and inventory

- [x] Public PayPal actions enter shipping review; marketplace listing remains available.
- [x] No fabricated shipping quote or automatic order/stock-reservation success is shown.
- [x] Inventory supports apparel, reworked denim, one-of-one and digital fulfillment.
- [x] Validation rejects invalid counts/weights, conflicting digital fulfillment and one-of-one stock over one.
- [x] Existing photos and 42 source records preserved; drafts remain unpublished.
- [ ] Confirm every sale price, size, condition, ownership and quantity against actual stock.
- [ ] Verify live Depop/Payhip links and digital deliveries; complete an end-to-end purchase/refund test.
- [ ] Test final shipping-inclusive PayPal invoice manually before accepting payment.
- [ ] Confirm taxes and marketplace return/refund policies for the actual sales channels.
- [ ] Before automatic direct checkout: implement server-priced totals, transactional stock reservations, orders, signed/idempotent payment webhooks and reconciliation.
- [ ] Test authenticated inventory updates and photo uploads with production-scoped credentials.

## Custom orders and customer support

- [x] Dedicated contact page and product-specific shipping inquiry email drafts.
- [x] Custom form prepares a complete email request, with copied brief fallback.
- [x] Attachments require explicit customer action; no fake sent/received message.
- [ ] Confirm the source business email is actively monitored and receive a test quote with attachments.
- [ ] Confirm equipment readiness, production limits and lead times.
- [ ] Establish written quote approval, artwork permission, invoice, delivery and issue-response workflow.
- [ ] If enabling `CUSTOM_ORDER_FORM_ACTION`, verify multipart attachment support, validation, spam protection, delivery errors, privacy and actual receipt.
- [ ] Verify inherited seven-day issue-reporting and final-sale policy with the owner.

## TikTok, SEO and customer list

- [x] TikTok collection has product links and shipping context, plus shipping review for PayPal.
- [x] Canonical metadata for collections/custom/TikTok/contact; product Open Graph and Product structured data.
- [x] Sitemap includes published product routes, contact and TikTok; excludes testing/admin pages.
- [x] Product-update email form requires explicit consent and stays hidden without a provider.
- [ ] Confirm current production domain and `SITE_URL`; inspect production sitemap/canonicals/robots.
- [ ] Verify Search Console ownership, submit sitemap and inspect representative URLs.
- [ ] Validate product rich results; verify externally managed prices and availability remain current.
- [ ] Set TikTok bio to the verified landing page; measure visits and product/checkout clicks with agreed campaign tags.
- [ ] Verify TikTok Seller Center listings/stock separately; local preparation is not automatic TikTok Shop integration.
- [ ] Configure a real customer-list provider, double opt-in, unsubscribe and privacy information; test enrollment/removal.

## Security and release verification

- [x] Known dependency advisories addressed; final package audit reports zero.
- [x] Admin business pages gated server-side; protected APIs reject unauthenticated requests.
- [x] Public admin link removed; QuietWork defaults to 404 until explicitly enabled.
- [x] Real env files ignored; example contains no secrets; scanned app sources show no matching key/token patterns.
- [x] Production build and TypeScript checks pass; source assets resolve locally.
- [x] Founder story, black/red/white identity and recovery/resilience messaging preserved.
- [ ] Confirm production credentials are server-only and least-privilege; review Vercel project settings and repository history for secrets.
- [ ] Confirm production admin cookie/login/logout and protected API behavior over HTTPS.
- [x] Local audit: 34 public pages, 13 PayPal reviews, all inventory photo URLs; no broken internal links, console errors or overflow at tested widths.
- [ ] Repeat navigation/product/contact tests on the deployed revision.
- [ ] Check real iPhone Safari and Android Chrome: menus, product images, email handoff and checkout.
- [ ] Upload/provide the original ZIP for the outstanding backup/live/source comparison.
- [x] Vercel reports successful deployment of code release `ba7aea0` to the existing TRAUMA project.
- [ ] Confirm the public production domain points at the release and complete live smoke tests.
- [ ] Verify live carrier charges, payment receipt, tracking and support delivery before describing the platform as fully automated or launch-ready.

A Git push can trigger Vercel only when the existing project is connected to this repository/branch. A successful source push alone does not prove production deployment.
