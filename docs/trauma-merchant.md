# TRAUMA Merchant deployment plan

## Release 1: phone product workflow

Route: `/admin/merchant` in the existing Next.js/Vercel project. Reuse the existing signed admin session, protected upload API, signed photo receipts and atomic GitHub inventory commit. No second catalog, spreadsheet input or new hosting project.

Implemented foundation:
- Phone camera and multi-photo selection, cover/view selection, original file uploads.
- Name, editable SKU suggestion, price, quantity, physical tag, description, condition and category fields.
- Same `inventory.json` records used by the website, PayPal checkout links and TikTok preparation.
- Existing-record links for the launch SKU queue, shown only when a matching record exists. Editing a record avoids creating a duplicate. Catalog seeding is separate and requires private storage because the current source repository is public.
- Product page/collection generation after owner publication approval and the connected deployment. Store only the actual product-specific PayPal link; complete published records render BUY NOW automatically.
- TikTok title, description, bullets, keywords and hashtags from the saved real product. Merchant adds the record to preparation, not a verified-ready state. Nothing posts to TikTok automatically.
- Existing inventory editor handles sold status, quantity zero, shipping metadata, external IDs and publication checks.

Current limits: uploads accept JPEG, PNG or WebP up to 3 MB each. Automatic background removal, HEIC conversion and the four asset variants are not implemented. Phone performance and authenticated production writes still need device testing. Under 60 seconds is a product-entry target when facts and photos are prepared; uploads, asset jobs and Vercel deployment depend on network/service time.

Fast deployment: validate tests/build, update PR #4, verify its Vercel preview, then merge the tested release into the production branch. Reuse `INVENTORY_ADMIN_KEY`, `INVENTORY_GITHUB_TOKEN`, `INVENTORY_BRANCH` and `SITE_URL`; no new credentials are needed for this code foundation. Test from the owner's iPhone against a separate private test catalog before production writes: sign in, select a genuine existing record, confirm its facts, save, and verify the deployed page. Avoid a fake live product or test charge.

Vercel configuration to verify in the existing project:
- `INVENTORY_ADMIN_KEY`: at least 32 characters, server-only, matching the owner's saved key.
- `INVENTORY_GITHUB_TOKEN`: access to this repository with Contents read/write permission. Never send the value in chat or commit it.
- Production `INVENTORY_BRANCH=main`; the connected production deployment must follow `main`.
- Preview `INVENTORY_BRANCH`: use the test branch being deployed, so a preview save cannot write to production `main`. A preview lacking its own values must not be used for write testing.
- Production `SITE_URL=https://tra-coral.vercel.app`; redeploy after changing environment variables.

The full inventory editor currently attaches existing-product photos by HTTPS URL or existing `/images/` path. A direct camera/upload edit flow for existing records is still needed before claiming a complete phone-only workflow for the three seeded records. New product creation already supports direct uploads.

## Release 2: original-preserving image jobs

Keep originals immutable and create derivatives asynchronously. Use a segmentation/background-removal service from the server, with its key in Vercel environment settings, never in client code. Prefer a mask/alpha response applied to original foreground pixels. Do not use generative apparel replacement. Require owner review of the cutout before publication.

Generate from the approved cutout:
- White-background marketplace image: 2000 × 2000, no added promotional text.
- TRAUMA promotional image: 1080 × 1350 with branding outside the garment.
- TikTok vertical image: 1080 × 1920, garment fully visible.
- Instagram square: 1080 × 1080, garment fully visible.

Use queued jobs with clear pending/failed/retry states and an original-photo fallback. Store derivatives under the original product record, including source photo and version. Private original/working assets need private storage and signed access. The current GitHub source repository is public: admin login protects the editing interface but does not make repository drafts confidential. Use a private catalog/storage source before claiming confidential draft storage.

## Release 3: external platform automation

PayPal hosted links can be saved and rendered now. Editing catalog price/stock does not edit a hosted PayPal product. One server-side PayPal Orders integration can use current catalog data without creating a PayPal Catalog Product per garment. Enable it after business-app credentials, shipping totals, durable payment/order records and atomic stock reservations are configured and tested.

TikTok publication records can be generated from the same source. Complete measured shipping, exact leaf category, photo review and an existing-SKU check. For bulk upload, map to the current official category workbook. Direct updates require an authorized TikTok Shop app and stored external IDs. Keep drafts under owner control and do not auto-publish.

References:
- https://developer.paypal.com/api/rest/integration/orders-api
- https://seller-us.tiktok.com/university/essay?knowledge_id=428445525411626&role=1
