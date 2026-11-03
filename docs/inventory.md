# TRAUMA inventory

## Store rules

Never generate products, sample inventory, placeholder listings, prices, sizes, or availability. Only Nathanial’s real garments and products may be published. Allowed sources are existing repository content, existing TRAUMA data, Nathanial’s Depop listings, or entries manually supplied by Nathanial. Confirmation is an owner attestation, not an automated authenticity check.

`data/inventory.json` is the single source of truth. The six previously described repository garments were preserved as unpublished, unconfirmed drafts. The existing Reversal Guide and four additional real titles supplied by Nathanial are owner-confirmed but remain unpublished while their missing details and covers are collected. Missing details remain blank rather than invented. No item is public until it is confirmed and explicitly published. Original garment photos live in `public/images/products/`; the old root-level duplicate copies were consolidated there.

## One-time manager setup

The `/admin` page edits the same JSON file through the GitHub Contents API. It never writes to Vercel’s temporary filesystem and never exposes the GitHub token to the browser.

In Vercel project environment settings, securely configure:

- `INVENTORY_ADMIN_KEY`: a unique random secret of at least 32 characters (generate with a password manager).
- `INVENTORY_GITHUB_TOKEN`: a fine-grained GitHub token restricted to `natebearsley-cmd/trauma-custom-clothing-`, with Contents read/write permission. Keep it server-side. Do not use a `NEXT_PUBLIC_` prefix.
- `INVENTORY_BRANCH`: optional; defaults to `main`. Use the branch connected to production deployment. Branch protection must permit the intended workflow.
- `SITE_URL`: preferred public origin; defaults to `https://tra-coral.vercel.app`.

Redeploy after configuring variables. Restrict the admin route further with Vercel deployment protection/access controls where available. Use a long random admin key, keep it private, and rotate it if exposed. The API fails closed when credentials are absent. The admin key is held only in tab memory. GitHub writes use revision checks to prevent overwriting concurrent changes. There is no distributed login rate limiter in this implementation; use platform access controls for additional protection.

GitHub API network access to `api.github.com` is required where outbound access is restricted. Saving makes a Git commit; the public inventory updates only after the configured Vercel integration deploys that commit successfully. Production credentials and remote writes have not been tested by this implementation task.

## Add a product from your Depop inventory

1. Open `/admin` and enter your admin key.
2. Select **Add my product**, or select an existing draft to complete it.
3. Copy the real name, brand, category, size, color, condition, description, price, and currency from your listing. Choose **My Depop inventory** as the source and paste its source listing URL. Books, Digital Downloads, Wallpapers, Guides, Apparel, and JourneyVault are suggested categories; you can also enter your own.
4. Paste the direct product URL copied from Payhip into `payhipUrl`. Leave it blank for View Details only. Keep the Depop listing in `sourceUrl`; it does not drive checkout.
5. Add your own photo URLs, one per line, with the cover first (maximum 12). Alternatively upload your files using GitHub’s upload-files interface into `public/images/products/` and enter `/images/products/your-file.jpg`. Use descriptive, unique filenames. Prefer compressed JPEG/WebP photos. The manager supports URLs and repository paths; it does not upload files itself or scrape Depop.
6. Confirm you personally created, listed, or sold the item. Check **Publish this product** when the details are accurate and complete.
7. Choose **Save inventory to GitHub**. Wait for a successful deployment before expecting it in the public store.

Blank entries are never automatically published. Publishing requires owner confirmation, a real name, a category, a description, and at least one photo. Add all known apparel details; leave fields that do not apply to digital products blank. A nonempty `payhipUrl` must be a direct HTTPS Payhip product page and requires a price. Without `payhipUrl`, only View Details is shown. Sold products never show Buy Now. HTTPS external photos outside `images.depop.com` are delivered directly, without Next’s server optimizer; use repository photos for reliable optimized delivery.

## Mark an item sold

Check **This product is sold**. Choose either **Show in sold inventory with a SOLD label** or **Automatically place in the archive**, then save. Sold items have no purchase button. Moving to the archive happens automatically from this flag, not from polling Depop. Return it to available by clearing sold status and supplying current accurate details.

## Edit without the manager

Edit only `data/inventory.json`; no component changes are needed. Keep `version: 1` and the existing record fields. Add a unique lowercase hyphenated `id`. Use `source: "manual"`, `"depop"`, or `"repository"`. Price is a number (not a formatted string), or `null` while unknown. Supported currencies: USD, GBP, EUR, CAD, AUD. `soldDisplay` is `"show"` or `"archive"`. Set `published` and `ownerConfirmed` only when authorized by Nathanial. Never manufacture missing facts. Run `pnpm test`, `pnpm typecheck`, and `pnpm build` before committing.

## JourneyVault waitlist

The Coming Soon section does not save or send emails by default and says so explicitly. To enable it, connect a real email provider, configure its subscription fields, consent, confirmation/unsubscribe behavior and privacy notice, and set server-side `JOURNEYVAULT_WAITLIST_ACTION` to its HTTPS form endpoint accepting an `email` field. Provider success/error pages handle the submission response. This is a form integration point, not a built-in mailing-list database. Do not claim signups were collected until that integration has been tested.

The existing Payhip profile URL is preserved for shop navigation. The existing Reversal Guide entry retains its original $13 price and description, but remains a draft until confirmed and a real cover photo is supplied. Add its actual product URL to enable Buy Now. No Payhip products have been scraped or invented. Payhip checkout remains external; there is no cart or payment implementation.

## Add a Payhip product in under 60 seconds

With your actual listing details and photo path ready:

1. Open `data/inventory.json` (the only inventory file).
2. Select the existing entry for your product. For a new real product, copy the record structure and replace its ID, details, and photos with your actual product information. Do not leave copied facts from a different item.
3. Paste the direct product URL copied from Payhip into **`payhipUrl`**. Do not invent a URL. The official shop home is `https://payhip.com/Thereversal1`; that is shop navigation, not an individual product page.
4. Set the real `price` and `currency`, confirm `ownerConfirmed: true`, and set `published: true` when ready. Save and deploy.

No other file needs editing. If no direct Payhip product URL exists yet, leave `payhipUrl` as an empty string: the product shows **View Details** without a Buy Now button. `purchaseUrl` is retained for legacy external-link data and never drives checkout. The suggested 60-second edit time assumes details and photos are already prepared; deployment time is additional.

All Buy Now links open Payhip in a new tab with `noopener noreferrer`. The site does not process payments, replace Payhip, sync Payhip availability, or scrape product data. Update sold status in this file or the manager after a sale.

## Featured Payhip products

Set `featured: true` on a real inventory entry to show it prominently below the hero. Only published, owner-confirmed, unsold entries appear. Cards use large cover images, the real description, price when supplied, View Details, and Buy Now only when a direct `payhipUrl` exists. Sold products leave the featured section automatically while following their sold/archive policy elsewhere.

The Rebuild Bundle, Bent, Not Broken, 30 Days of Rebuilding, Built From Trauma Wallpaper Pack, and The Reversal Guide are the five real titles supplied by Nathanial. Their records are marked featured but remain unpublished while direct links, verified cover images, and missing details are collected. No cover was reassigned from an unrelated garment, and no descriptions, prices, or product URLs were generated. The section links to the verified-as-owner-supplied official shop while individual entries await completion. The book's pre-existing repository description and $13 price were retained; its current Payhip price still needs verification.

To feature a future real product, edit its entry in this same file: supply the accurate details and your real photo, paste the Payhip product URL, then enable `ownerConfirmed`, `published`, and `featured`. No component edits are required. The admin manager exposes the same featured toggle.

## Featured Apparel and Payhip source support

Open `/admin` using the footer’s **Manage inventory** link. Select your existing product, set its category and its **Feature on homepage** toggle, and save. Categories Apparel, Tops, Outerwear, and Headwear route to **Featured Apparel**; all other categories (including Books and Wallpapers) route to **Featured Products**. Both sections exclude unpublished, unconfirmed, and sold entries. Empty sections do not contain sample cards.

Choose **My Payhip product** as the source for a real Payhip listing. Paste its actual direct `https://payhip.com/b/...` URL into both Source listing URL and Payhip product URL. Copy the real listing details and cover; no automatic import or live sync is implemented. The existing direct-URL and publication checks remain in force. Payhip handles checkout and fulfillment; the local inventory controls storefront presentation.

Store inspection during this task failed because the configured network proxy could not be reached, even though Payhip is allowed by the active network policy. No new product data was imported, and no existing draft was published. Admin production saving still requires the server configuration above.

## Admin search, filters, previews, and featuring

Search products by name, ID, brand, description, category, size, or color. Combine search with status (All, Draft, Published, Sold), category, source, and featured-placement filters. Published includes sold published records; Sold includes sold records regardless of publishing status. Counts cover the full inventory. Filtering never edits or publishes a record. The current editor stays open when its product stops matching, so unsaved edits remain available. Clear filters to restore the full list.

The image preview displays up to 12 entered image URLs or local image paths, with the first labeled Cover photo. Invalid URLs and failed image loads show a text message. Previews do not upload files; use the existing repository upload workflow above.

Featured Products and Featured Apparel now have separate labeled toggles in the editor. Only the toggle appropriate to the actual category is enabled. Both use the existing `featured` field; changing the category moves its existing featured selection according to the unchanged storefront rules. Featuring does not publish a draft. Keep Publish unchecked until the owner has reviewed the listing. No existing product statuses or public layouts were changed by this admin update.
