# TRAUMA project status

Audit date: November 4, 2026 (America/Chicago).

**Readiness:** improved marketplace/manual-quote storefront; not yet a fully automated ecommerce platform. Live carrier rates, transactional orders/stock reservations, hosted contact delivery and customer-list integrations still need account configuration or further implementation.

## Scope and evidence

Source: `natebearsley-cmd/trauma-custom-clothing-`, starting commit `8852218c7690eb1885b960d4e1dce93ee1a8868f`.

The workspace contains an existing Git checkout and its development history. **The user-referenced uploaded ZIP is not attached or accessible in this session.** No ZIP-to-source comparison has been completed. The source's default deployment URL is `https://tra-coral.vercel.app`; the owner has now confirmed this production website. GitHub commit status identifies the existing Vercel project as `nathanialbearsley-2937/tra` and reports the starting source commit successfully deployed. Direct access returned a network-policy 403, and the connected web reader could not access it. Consequently, this is a source/history and local production-build audit, not a verified comparison with the running Vercel deployment.

Inventory contains 42 records: 26 published, 16 drafts. No product was newly published, no garment photo was generated or altered, and no draft facts, prices, weights, or stock counts were invented.

## Completed features

- Preserved the black/red/white design, typography, founder story and recovery, resilience, trauma, and rebuilding messaging. Founder story source and global CSS were not changed.
- UPS Ground is the default shipping service, from **Albany, Illinois**, with buyer-paid, weight-based shipping, tracking on physical orders and estimated delivery of 3–5 business days after shipment.
- Shipping policy states that most orders ship within one business day when inventory is available. Custom production timing is quoted separately. USPS Ground Advantage is the lightweight backup.
- Removed category-derived shipping prices and the conflicting over-$100 free-shipping promise. Missing weights produce no invented shipping charge.
- Added validated carrier-request architecture with quantities, packed ounces, destination ZIP, required origin ZIP/dimensions, and carrier weight limits. This does not yet call a carrier API.
- PayPal buttons on product cards, product details, and TikTok pages route through shipping review. The review offers a shipping-total inquiry and the existing marketplace checkout rather than permitting an unquoted generic payment.
- Inventory schema and full editor support apparel, reworked denim, one-of-one customs, digital products, fulfillment type, packed weight and stock quantity. Validation rejects conflicting digital fulfillment, invalid weights/counts and contradictory sold/one-of-one stock.
- Added a contact page using the existing business email in the source, including product-specific shipping inquiry subjects.
- Custom-order form has an enabled email-preparation action, a complete email draft and copied brief fallback. Attachments must be added in the email client. Sending still happens in the customer's email app; no automatic receipt is claimed.
- Retained configurable hosted custom-form submission for a future connected provider. No customer inquiry was sent during this audit.
- Server-side admin layout gates business pages with the signed session; protected APIs remain authenticated. Removed the public Manage Inventory link.
- QuietWork testing page is 404 unless explicitly enabled with `ENABLE_QUIETWORK_PUBLIC=true`; removed it from public navigation and sitemap. Its source was preserved.
- Added TikTok shipping context, corrected collection/custom/TikTok canonical URLs, added product-specific Open Graph data and Product/Offer structured data based on source records.
- Added consent-based product-update signup, rendered only when a real HTTPS `WAITLIST_FORM_ACTION` is configured. No local customer-list database or fake signup confirmation exists.
- Renamed the unsupported Best Sellers shelf to Featured Picks; no sales evidence was available to substantiate the previous label.
- Upgraded Next.js to 16.4.5, React/React DOM to 19.3.1 and affected build dependencies; updated lockfile and patched vulnerable transitive packages. The final dependency audit reports zero known advisories as of this audit date.
- Vercel Analytics now renders only on Vercel production builds, avoiding a local production-server script/MIME error.
- Expanded secret-file ignores and added `.env.example` without credentials.

## Issues, impact, recommendation and implementation

Ordered by the owner's revenue priorities.

| Priority | Issue and impact | Recommended fix | Implementation/status |
| --- | --- | --- | --- |
| 1 | Category-based prices and free shipping could undercharge physical orders. | Buyer-paid destination/weight-based quotes. | Removed invented estimates and threshold; implemented carrier payload builder and clear policy. Live quotes still need a provider. |
| 1 | Carrier/origin requirements changed during the audit; inconsistent promises would confuse buyers. | One Illinois origin and UPS-first policy. | Latest requirements applied: UPS Ground default, USPS Ground Advantage backup, 3–5 day UPS estimate, tracking, usually one-business-day dispatch when stocked. |
| 1 | Packed weights, package measurements and full return address are still needed. | Collect measured inputs before rating. | Origin ZIP confirmed as 61230 and applied to shipping payloads; schema/editor ready. Remaining measurements and return address require owner input. |
| 1 | No rate/label-provider connection. | Configure a UPS/USPS-capable provider or marketplace settings. | Not connected: no carrier account/credentials available. Current payment flow requires a quote or marketplace final charge. |
| 2 | Some PayPal buttons bypassed shipping review. | Make final total confirmation mandatory before generic PayPal payment. | Routed all identified public PayPal CTAs through review; preserved marketplace purchase paths. |
| 2 | Generic PayPal links do not create secure shipping-inclusive orders or reserve one-of-one stock. | Use marketplace checkout now; add server-priced checkout, signed webhooks and transactional stock for direct ecommerce. | Manual quote/marketplace path implemented. Automated payment/order/reservation backend remains unfinished. |
| 2 | Marketplace links could not be remotely verified here. | Check each Depop/Payhip product and complete sandbox/test purchases. | Internal routes validated; six Payhip requests returned HTTP 403; Depop/live-site reachability unverified. Existing URLs preserved. |
| 3 | Inventory lacked explicit fulfillment/weight/quantity fields. | Add validated fields to the existing manager. | Implemented without inventing measurements or republishing drafts. |
| 3 | Repository inventory is not synchronized with marketplace stock. | Mark sold immediately; add stock reservations and marketplace/payment reconciliation before multichannel automation. | Validation improved; automatic reconciliation not implemented. |
| 3 | Sixteen unpublished records may appear to be missing products. | Compare with owner-approved records and ZIP before publication. | Drafts preserved. Public pages receive only confirmed published inventory. |
| 4 | Custom submission was disconnected and its primary action disabled. | Provide an actionable email fallback and connect a hosted form when available. | Enabled Prepare Email Quote, copied brief, full email draft, and contact page. Hosted form remains unconfigured. |
| 4 | Contact footer lacked a direct business support workflow. | Add dedicated order/shipping contact entry. | Implemented using the business email already in source. Owner must confirm mailbox receipt/access. |
| 4 | Printing equipment/production availability is still pending in existing copy. | Confirm capacity and lead times before promising fulfillment. | Honest status retained; custom timing remains subject to accepted quote. |
| 5 | TikTok purchase links skipped shipping review and lacked shipping context. | Use fast product links, clear dispatch terms, and a shipping review path. | Implemented. Existing TikTok Shop Prep is preserved; there is no Seller Center API sync. |
| 6 | Collection/custom/TikTok canonical metadata could inherit the home URL; product sharing used generic data. | Explicit canonical URLs, per-product sharing and structured data. | Implemented; sitemap includes TikTok and contact and excludes the testing page. |
| 6 | Google ownership/indexing are unconfirmed; the production website is now owner-confirmed. | Confirm SITE_URL, verify Search Console and submit sitemap. | Public metadata/schema and local sitemap checks completed; Search Console token/account verification and live Google checks remain outstanding. No indexing guarantee. |
| 7 | Disconnected waitlist cannot build a customer list. | Connect an email provider with consent, double opt-in, unsubscribe and privacy terms. | Provider-ready product-update form added; hidden until configured. No addresses collected. |
| Security | Critical/high dependency advisories were present. | Upgrade framework and affected transitive packages. | Updated; audit now reports zero known vulnerabilities. This is not a penetration-test guarantee. |
| Security | Admin page shells and an admin navigation link were public. | Server-side session gate and remove public business-tool navigation. | Implemented. The sign-in entry remains intentionally reachable; business tools require authentication. APIs fail closed without setup. |
| Security | QuietWork exposed a service still described as testing. | Hide testing content until explicitly enabled. | Route defaults to 404 and noindex; source preserved. |
| Security | Secret hygiene needed broader ignores. | Ignore all real env files, retain a blank example, inspect tracked app sources. | Implemented. No matching private-key/GitHub-token/Stripe-secret patterns found in scanned app/components/lib files. Production secrets and full historical secret scanning were not accessible. |
| Quality | Local Vercel analytics requested a missing script and produced console errors. | Render analytics only in Vercel production. | Implemented; final browser pass checks the fix. |
| Content | Best Sellers lacked supporting sales data. | Use a neutral editorial shelf name. | Renamed Featured Picks; identity/story preserved. |
| Recovery | ZIP and live runtime comparison are unavailable; deployed baseline source commit is identified. | Obtain ZIP and compare it with the confirmed deployed baseline commit, assets, routes and current release; smoke-test the production domain. | Still blocked; no claims of ZIP/live parity. |

## Recovery from earlier development

Git history and existing files establish the following, without claiming access to earlier chat sessions:

- `ff9cd8d` explicitly removed homepage soundtrack placement to prioritize product collections. Audio player, Suno source, state logic and tests remain present. Do not silently reverse this intentional decision. Actual audio, title and art are still pending.
- JourneyVault component remains in source, but its old disconnected signup is not restored to the storefront. A provider-backed product-update signup is available when configured.
- Inventory editor, Quick Add, signed photo receipts, original product photos, featured controls, TikTok listing preparation, galleries, matching sets and digital purchase links remain available in the source.
- Old hero/showcase/collection components remain available for reference. Their presence does not establish that they should replace the current homepage.
- Sixteen draft records remain recoverable for owner review. They were not automatically published.
- Contact/email quote workflow and shipping-safe purchase entry points were improved from the current source, rather than inventing missing prior-session features.

## Validation and limits

- Production Next.js build passes, including TypeScript checks; frozen-lockfile install succeeds.
- All 55 unit tests pass, covering inventory, fulfillment/stock, shipping defaults/limits, signed admin sessions, uploads/Quick Add, soundtrack state and TikTok preparation.
- Browser audit checks 34 public pages (all 26 published product pages plus main/policy/contact pages), discovered internal links and anchors, image loading and layouts at 320, 360, 375, 390, 412, 430, 768, 1024 and 1440 pixels. These are Chromium viewport checks, not physical iPhone/Safari or Android hardware certification.
- Separate flow checks cover all 13 eligible PayPal-review routes, custom email draft preparation, inventory photo URLs, unknown/draft product 404s and hidden QuietWork route.
- Final local browser audit: 34/34 public pages returned 200; no broken discovered internal links/anchors, failed displayed images, horizontal overflow or captured console errors. All 13 PayPal-review routes returned 200 and required quote confirmation. All checked inventory photo URLs returned 200.
- Admin business pages render sign-in only without a session; unauthenticated session/inventory API requests return 401. Production authenticated saves were not exercised because credentials are absent; no inventory writes or customer messages were sent.
- Provider-backed form delivery, email enrollment/double opt-in, live payment totals, carrier labels/tracking, Google indexing and production deployment require external account verification.

See `docs/audit-results.json` for final machine-readable local browser results and `docs/shipping-architecture.md` for rate/fulfillment architecture. The release uses the existing GitHub-to-Vercel connection; deployment outcome is recorded with the release evidence.

## Immediate next actions

1. Origin ZIP is confirmed as 61230 for Albany, Illinois. Confirm the full return address and weigh all packaged inventory. Configure UPS Ground first and USPS Ground Advantage backup in the actual selling account.
2. Confirm the existing business mailbox; send and receive a real custom quote and shipping inquiry. Attach files manually for email quotes.
3. Configure a rate provider/marketplace and verify a shipping-inclusive purchase, label and tracking. Use transactional orders/reservations before automating one-of-one direct checkout.
4. Attach the original ZIP and use the confirmed production website; perform the outstanding three-way comparison and deployed smoke test.
5. Verify admin setup, available stock/prices, returns policy and production capacity. Keep drafts unpublished until approved.
6. Configure `SITE_URL`, Search Console and the optional signup/form providers. Verify consent, unsubscribe and delivery before advertising email signup.

## Deployment result

Code release `ba7aea02113f181af3cdc05779004973852925ac` was pushed to `main`. The existing Vercel project `nathanialbearsley-2937/tra` reported **success — Deployment has completed** through its GitHub commit status.

Deployment: https://vercel.com/nathanialbearsley-2937/tra/HbCAnYmsWoYZWS29faDDMZdPpuHK

The deployed code includes the UPS-first policy and sales-workflow changes described above. This confirms Vercel's deployment result, not a completed live purchase or runtime smoke test: direct storefront access is still blocked in this environment. No Vercel credentials, marketplace settings, carrier accounts or email-provider credentials were configured. The original ZIP is still required for backup comparison.

## Confirmed shipping ZIP

The owner confirmed **Albany, Illinois 61230**. Shared origin configuration, carrier-request payloads and policy text use 61230. Carrier payloads reject a different origin ZIP. Full return address, package measurements and carrier-account setup remain outstanding.

## Google Search configuration

The owner confirmed https://tra-coral.vercel.app/ and Albany, Illinois 61230. All 34 public routes now have unique meta descriptions and explicit canonicals. Local production HTTP checks pass for sitemap membership, robots directives, canonical metadata (including filter/query variants), JSON-LD parsing and private-page noindex directives. Thirteen priced pages use Product/Offer markup; thirteen unpriced pages use WebPage/Thing rather than incomplete Google Product markup. Organization/Person/WebSite identity and location are consistent.

Search Console HTML verification support is prepared via `GOOGLE_SITE_VERIFICATION`; no token has been supplied or fabricated. Google ownership verification, Rich Results Test results, sitemap submission, actual indexing/rankings and live-site responses remain unverified. The execution proxy blocks the live robots/sitemap requests with HTTP 403. Business Profile eligibility is unconfirmed: shipping-only online businesses do not qualify solely by having a fulfillment location.

See `docs/GOOGLE_SEARCH_SETUP.md`, `docs/GOOGLE_BUSINESS_PROFILE_CHECKLIST.md`, `docs/SEO_META_DESCRIPTIONS.md` and `docs/seo-audit-results.json`. Founder content, brand colors and publication status were preserved.
