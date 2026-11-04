# TRAUMA inventory

For the current phone-first workflow, use [Admin quick start](admin-quick-start.md). Earlier sections retain implementation history; code deployment and product publication are separate. Products stay private until you explicitly approve publishing them.

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

## Unpublished draft: apparel destinations and custom quotes

These changes are local drafts pending owner review; do not deploy them or publish the proposed garments without approval. This section supersedes the earlier all-Payhip apparel instructions once approved.

Ready-made apparel uses optional `depopUrl` for a direct HTTPS Depop `/products/` listing. A direct Depop listing in `sourceUrl` also works. Apparel never falls back to Payhip. Without a Depop listing, View Item opens the local product details. Books, guides, wallpapers, digital releases, and the Founder Story retain Payhip links. `purchaseUrl` remains legacy data and is not used for routing.

Featured Apparel is limited to six published, owner-confirmed, unsold, ready-made garments with brand TRAUMA, TRAUMA CC, or TRAUMA Custom Clothing and an apparel category. Inventory order determines display order. Choose 3–6 actual top pieces; never pad the section with placeholder cards. The section remains above full inventory and uses an image, title, short description, and View Item action.

The four owner-named draft candidates are Pain Made Me T-Shirt, Loose Lips Sink Ships T-Shirt, Camo Zip Hoodie, and Camo Joggers. They are featured candidates only, with `published: false` and `ownerConfirmed: false`. Their actual cover photos, descriptions, Depop links, and remaining product facts must be provided and reviewed. The old Pain Made Me image was excluded because it depicts a different STREETWEAR shirt. No other photograph was reassigned as its replacement. Missing details are blank, never invented.

For a real custom apparel inventory entry, set `orderType: "custom"` in the manager or JSON. Omitted `orderType` and `"ready-made"` retain ready-made behavior. Custom apparel displays Request a Custom Quote instead of a fixed price, and Request Quote links to the custom section with the selected product. It does not link to Payhip or Depop checkout and is excluded from Featured Apparel. Do not create a sample inventory product merely to demonstrate the quote flow.

The custom form supports name, email, optional phone, all seven requested product types, size, quantity, design description, optional design files, and additional notes. It explains that printing equipment is being prepared and that timing and availability require confirmation. Submitting a quote request does not place an order or collect payment.

### Connecting quote delivery

Set server-side `CUSTOM_ORDER_FORM_ACTION` to the actual HTTPS submission endpoint supplied by the owner's selected form provider. The endpoint is a browser-facing form action, not a secret. Choose a provider and plan supporting multipart file attachments, recipient verification, error/success response pages, spam controls, and the required privacy/retention settings. An email address by itself is not a form endpoint. Never put an API key in this URL.

The form posts `subject`, `name`, `email`, `phone`, `product_type`, `size`, `quantity`, `design_description`, repeated `design_files` file fields, `additional_notes`, and optional `inventory_product_id` using `multipart/form-data`. The provider must support these fields and enforce validation and file limits on its server. The browser requests at most five JPG/PNG/WebP/PDF/SVG files, each up to 5 MB and 10 MB total; client validation does not replace provider validation. File content is not rendered by this website.

Verify the recipient with the provider, configure the endpoint in Vercel Production, and redeploy only after owner approval. Test a real request, an attachment, and provider success/error responses before advertising online delivery. No provider, recipient, actual file uploads, or production email delivery was configured or tested in this draft.

Without a configured endpoint, the form clearly says delivery is disconnected and disables Request a Custom Quote. Copy quote brief still prepares the entered details for a manual Depop message, with design files attached separately by the customer. It never claims a request or attachment was sent automatically.

### UNSPOKEN owner-supplied draft

UNSPOKEN Graphic Tee is the first inventory entry, making it a primary featured candidate after publication approval. Its exact supplied brand, Premium Graphic T-Shirt type, Like New condition, XL (46-48) size, White / Purple color, $79 USD price, and description are preserved. `category: "Apparel"` plus `featured: true` maps to the Featured Apparel section; `productType` records the shirt type separately. The exact owner-supplied Trauma Custom Clothing (TCC) brand is accepted by the TRAUMA-only showcase filter.

No attachments were available in this message or the workspace. `photos` therefore remains empty pending the actual front, tag/branding, and back images. No other garment photos were substituted. Add them in that order when received, keeping their original files unchanged. The featured cards support the gallery on mobile and desktop, and responsive image derivatives use quality 90 while the original files remain intact. The direct Depop listing is also pending, so `depopUrl` and `sourceUrl` remain blank. Incomplete Depop-sourced drafts can omit their source URL; publication still requires it along with the normal product details. The ready-made apparel external action reads View on Depop. No apparel route falls back to Payhip.

This entry is owner-confirmed as a real supplied product, but `published` remains false. It must not appear on the live homepage or be deployed without approval. No placeholder card is rendered for its missing images.

### Owner-supplied Ecko carpenter jeans draft

Custom Vintage Ecko Unltd Carpenter Jeans – Trauma CC LV Patched Baggy Y2K is an unpublished Featured Apparel candidate at $189 USD, size 32, Excellent condition, Blue / Navy. Its supplied description and exact TCC brand are preserved. It is a ready-made, one-of-one custom-designed garment (`orderType: "ready-made"`), not a made-to-order service; its external action uses Depop rather than Request Quote.

The intended first six candidates are UNSPOKEN, these jeans, Pain Made Me, Loose Lips Sink Ships, Camo Zip Hoodie, and Camo Joggers, in that inventory order. Every candidate remains `published: false`. The jeans and UNSPOKEN are owner-confirmed as real products based on their supplied details; this does not grant publication approval. No card is publicly rendered for missing photos or unpublished candidates.

No new photos or direct Depop listing URL were attached or accessible with the jeans request. Its `photos`, `depopUrl`, and `sourceUrl` remain empty rather than substituting other products or inventing listing URLs. Add the actual front, back, and detail images in that order when received, preserving original files. Gallery support and responsive image display are shared with the UNSPOKEN draft. Publication and deployment require owner review and approval after the real images and listing are supplied.

### TOXIC TRAUMA BOND — latest featured priority draft

The owner-supplied TOXIC TRAUMA BOND jacket is now the first unpublished candidate, followed by the Ecko carpenter jeans and UNSPOKEN. This ordering supersedes earlier priority notes. Other TRAUMA originals follow; the homepage still selects at most six eligible, published, confirmed, unsold, ready-made TRAUMA garments. Seven proposed candidates do not cause seven cards to be rendered, and drafts are never rendered publicly.

The jacket record preserves the supplied subtitle, Custom Denim Jacket type, XXL size, Like New condition, $449 USD price, description, five themes, and six artwork details. Black is taken directly from the supplied description. `category: "Apparel"` and `featured: true` map to Featured Apparel. `orderType: "ready-made"` keeps this actual one-of-one piece for sale through Depop; `requestCustomPiece: true` adds the separate Request Custom Piece action leading to the quote form with the garment selected as inspiration. It does not change the existing jacket to a made-to-order listing. The primary external action reads View On Depop, and it cannot fall back to Payhip.

Optional `subtitle`, `themes`, `keyArtwork`, and `requestCustomPiece` fields are editable in the inventory manager and validated without changing existing records. Subtitle and artwork details are included in the card. Gallery and mobile-responsive presentation use the same existing photo array and original-file preservation rules.

No attachments or direct Depop listing URL were accessible with this request. `photos`, `depopUrl`, and `sourceUrl` therefore remain empty. The required gallery order is full front, detail, neck tag/branding. Do not assign another product's photos or fabricate listing URLs. `ownerConfirmed: true` records that the owner supplied the real product details; `published: false` still requires publication approval. All changes remain local, without a push or deployment. The existing quote-delivery integration is also still awaiting a real form service endpoint.

### Still Breathing bleach-wash tee — supplied Depop screenshots

Three visible chat screenshots identify a separate Still Breathing Bleach Wash Graphic Tee: women's L, relaxed fit, Brand New / Pristine, listed colors Red / Multi, and $89.99 USD. A new unpublished candidate is placed after TOXIC TRAUMA BOND, Ecko jeans, and UNSPOKEN. Its description is a concise transcription of the identifiable front and back design details in the supplied listing, not a generated product. It is not merged with the differently named, unconfirmed See No Evil repository record without owner confirmation.

The screenshot seller is `traumacc`; no direct product URL is visible, so neither a listing URL nor a seller link is fabricated. The three screenshots are visible as chat images but were not exposed as downloadable files or local paths in this execution environment. `photos` remains empty until original front/back files or usable image URLs are supplied. The listing-description screenshot is evidence, not a garment gallery image. Do not regenerate, crop, or substitute images. Current shared Depop shop configuration is unchanged pending confirmation of the correct shop link.

The record remains `published: false`, with `featured: true`, and cannot render on the public homepage before approval. No source was pushed or deployed for this addition.

### Loose Lips Sink Ships Wide-Leg Graphic Jeans — latest priority

The owner-supplied wide-leg jeans are a separate unpublished product from the Loose Lips T-shirt candidate. Their exact Trauma Custom Clothing (Trauma C.C.) brand, Women's 25 size, 30 inseam, Like New condition, $121 USD price, description, and seven supplied features are preserved. `inseam` stores the supplied text without inventing a unit. Color is blank because it was not separately specified; Light wash denim remains in the supplied features. Optional `inseam` and `features` fields are validated, editable in the manager, and displayed in product details. The exact supplied brand is accepted by the TRAUMA-only showcase filter.

The latest first five candidates are TOXIC TRAUMA BOND, Ecko carpenter jeans, Loose Lips wide-leg jeans, STILL BREATHING, and UNSPOKEN. This replaces earlier priority notes. Other real candidates follow; the public selector remains limited to six eligible confirmed garments and excludes every unpublished draft.

The jeans are ready-made, with a Depop purchase action and a separate Request Custom Piece action. Depop is the selected purchase method for this entry. No PayPal URL was supplied or created, and apparel never falls back to Payhip. Digital products retain Payhip. Actual front/rear photo files and the direct Depop listing URL were not available with this request; `photos`, `depopUrl`, and `sourceUrl` remain empty. No photo or link was substituted. Keep `published: false` until owner approval. No source changes were pushed or deployed.

### SURVIVED Graphic Tee — current six-item priority

SURVIVED is a separate owner-supplied, unpublished Featured Apparel candidate: Premium Graphic Tee, exact Trauma Custom Clothing (Trauma C.C.) brand, XL, Brand New, $121 USD. The supplied introduction and description are preserved, with the four front details in `features`, the back slogan in `keyArtwork`, and all five themes in `themes`. It has the ready-made Depop action and a separate Request Custom Piece action.

The current first six candidates are TOXIC TRAUMA BOND, Ecko carpenter jeans, SURVIVED, Loose Lips wide-leg jeans, STILL BREATHING, and UNSPOKEN. This supersedes earlier priority notes. All remain `published: false`; no source changes have been pushed or deployed. Existing gallery and responsive mobile support apply once the actual photographs arrive.

No photo files or direct Depop URL were available with this request. `photos`, `depopUrl`, and `sourceUrl` remain empty; no other product's images or invented links are used. Color is unspecified and remains blank. Depop is this garment's requested purchase method. No PayPal link was supplied, and apparel cannot fall back to Payhip. Books and digital products retain Payhip. Supply original front/back images and the actual listing URL before reviewing publication.

### ANXIETY Shawna Splatter Crewneck — latest seven-piece collection

The ANXIETY crewneck is an owner-supplied unpublished Featured Apparel candidate, fourth in the current collection. Its exact brand, Large size, Brand New condition, description, seven features, and five themes are preserved. `price: 58.65` is the supplied current sale price; optional `originalPrice: 69` preserves the actual original price. The manager exposes Original price separately. Ready-made cards show current price and strike through an original price only when it is greater. Custom quote products still do not show a fixed price. No discount or original price is inferred for any other product.

The latest requested collection contains seven pieces: TOXIC TRAUMA BOND, Ecko carpenter jeans, SURVIVED, ANXIETY, Loose Lips wide-leg jeans, STILL BREATHING, and UNSPOKEN. The showcase limit is now seven to accommodate this explicit collection, superseding earlier six-item limits and priority notes. It still requires actual TRAUMA brand, confirmation, publication, and unsold ready-made status. All records remain unpublished.

No new photo attachments or direct Depop listing were available with this request. The crewneck's `photos`, `depopUrl`, and `sourceUrl` remain empty. Add original front, back, and brand-tag images in that order when supplied. No images, links, or inventory were generated. Depop is the requested purchase method; no PayPal URL was supplied. The secondary Request Custom Piece action uses the quote form. Apparel never routes to Payhip; books, guides, and digital products retain Payhip. Nothing was pushed, deployed, or published.

## Unpublished PayPal support draft — Direct From TRAUMA

The local homepage now includes Direct From TRAUMA, with the owner's requested description, a Pay With PayPal heading, a Buy With PayPal button, and the public payment link `https://paypal.me/NathanialBearsley` transcribed from the supplied PayPal.me screenshot. It remains unpublished with the rest of the pending storefront changes. No payment was initiated or verified by this implementation.

`data/inventory.json` now optionally holds public `payments` settings:

- `paypalUrl`: the actual public PayPal payment link for the direct-payment section.
- `paypalQrImage`: a real HTTPS image URL or `/images/` path to the original PayPal QR image. Currently empty because the QR is visible in chat but not available to this environment as a downloadable file or asset path. No QR was generated or substituted.

Manage these settings in `/admin` under Direct From TRAUMA — PayPal settings, then save the inventory. They contain public destinations only; never store passwords, API keys, or private account details. Upload the original QR file through GitHub into `public/images/` and enter its actual path, or supply its HTTPS image URL. Verify on a phone that the QR resolves to the intended account before approving deployment. The page displays the supplied image directly on white with padding, without filtering or image recompression, and provides a same-device button as well. Missing QR images are omitted; failed image loads leave a working payment link instead of a replacement code.

Each product also accepts optional `paypalUrl`. It is filled with the supplied public link on the seven owner-confirmed apparel drafts only; all others remain empty. Valid HTTPS PayPal.me and supported PayPal payment URLs are required. Ready-made apparel with this field shows Pay With PayPal automatically alongside a valid Depop listing and its optional Request Custom Piece action. Sold items show no purchase actions. Custom quote products retain Request Quote and do not offer direct payment before a quote. Non-apparel products ignore this field and retain Payhip. Existing records without these optional fields remain valid.

These are external payment links, not an embedded cart or automatic order/stock system. The general PayPal.me link does not prefill a garment, amount, shipping, or reserve one-of-one inventory. Customers are asked to confirm the piece, availability, shipping, and total with TRAUMA before paying. Update sold status manually after confirming a sale. Depop remains the marketplace; Payhip remains books/digital/wallpapers/guides; custom requests remain the quote form. All inventory is still unpublished and no source was pushed or deployed.

### Vibrant Red PTSD Edition / Me Vs Myself Hoodie — unpublished addition

The owner-supplied red hoodie is a distinct ready-made Featured Apparel draft: XL, Brand New / Excellent, Vibrant Red, sale price $82.44 and original price $96.99. The exact title, description, seven features, and five themes are preserved. It supports View On Depop when a real listing URL is supplied, Pay With PayPal using the existing owner-provided public PayPal.me link, and Request Custom Piece through the quote form.

The submitted priority list ends after TOXIC TRAUMA BOND. TOXIC remains first; the prior seven-piece order is preserved, with this hoodie appended eighth. The local showcase limit is eight so the added garment can appear alongside the current collection after approval. No carousel or automatic rotation is implied. All products remain unpublished; no source was pushed or deployed.

Actual full-front, hood-detail, and sleeve-branding files and the direct Depop URL were unavailable with this request. `photos`, `depopUrl`, and `sourceUrl` remain blank. Existing black PTSD hoodie imagery was not substituted for the specified Vibrant Red garment. Add the actual three images in the requested order and the real listing URL before publication review. Digital products retain Payhip; this apparel item never routes to Payhip.

### Pressure Makes Diamonds Custom Army Patch Capris — unpublished addition

The owner-supplied capris are a distinct ready-made Featured Apparel candidate: Women's 28, Brand New, sale price $161.49, original price $189.99. The exact name, brand, Custom Denim Capris type, description, six features, and five themes are preserved. They are not merged with the differently named repository Pressure Makes Diamonds tee. The record supports Depop when a real listing link is supplied, Pay With PayPal through the existing owner-provided public link, and Request Custom Piece.

The capris are appended after the red PTSD hoodie without changing earlier priorities or TOXIC's first position. The local collection limit is nine to accommodate all nine owner-detailed apparel candidates. All remain unpublished. No source was pushed or deployed. The submitted requirements list ended after Draft only; the existing approval requirement remains in force.

No photo files or direct Depop listing URL were accessible with this request. `photos`, `depopUrl`, and `sourceUrl` remain blank. Add actual front and rear views in that order. No photos, listings, prices, or products were invented. Color remains blank because none was specified. Apparel never routes to Payhip; digital products retain Payhip.

## Unpublished TRAUMA Collections gallery

The local homepage now provides Featured Collection, Apparel Gallery, Hat & Beanie Gallery, Custom Orders Gallery, and Books & Digital Products. View Full Collection opens `/collections`, with search, availability filters, and category navigation. Product images and names open `/products/<id>`. Product pages include the real photo gallery with thumbnails and keyboard navigation, description, price/original price, collection, size and availability, and the correct external purchase/quote actions. Original image files remain linked. Motion effects respect reduced-motion preferences.

Public gallery selection requires publication and owner confirmation. Apparel also requires a recognized TRAUMA brand. Product detail routes and sitemap entries use only this public selection; draft IDs return 404 and draft data is never passed to the gallery. With the current unpublished inventory, sections show an honest empty state rather than invented products or image cards. No product publication, push, or deployment was performed for this work.

Optional `collection` is editable in `/admin`. Dedicated headwear filters are Trauma CC Beanies, Made In Chaos Beanies, UNSPOKEN Hats, Trauma CC Trucker Hats, and Custom Headwear. Assign the actual collection to real existing headwear when completing its record. These are category filters, not newly created products. Existing records without a collection are grouped using their actual category/type/name. No headwear items, shoe products, or photographs were invented.

The eight custom-order category cards are service navigation, not inventory listings: Custom Hats, Shoes, Hoodies, T-Shirts, Jeans, Jackets, Sports Bras, and Bras. They open `/custom-orders?type=<selected type>` with the quote form preselected. The earlier custom types remain supported. The form still explicitly disables automatic submission until the real `CUSTOM_ORDER_FORM_ACTION` endpoint is configured; copying a brief for manual contact remains available. Product detail Request Custom Piece opens `/custom-orders?customProduct=<id>` and includes that published apparel item as inspiration.

Books/digital product detail pages and cards retain Buy on Payhip. Ready-made apparel retains View On Depop when a listing exists and Pay With PayPal when supplied; custom items route to Request Custom Order. Sold products have no purchase actions. No missing Depop links, prices, photos, or sample records were filled in.

### Latest story-first homepage order

The homepage order is Hero (Turn Pain Into Purpose), the owner's dedicated Founder Story (Built From Strength. Built By Struggle.), TRAUMA Soundtrack, then the five TRAUMA Collections galleries and the existing direct-payment/quote sections. The soundtrack is a standalone section after the story rather than being read ahead of it in the story's left column. The first five apparel candidates are TOXIC, PTSD Hoodie, SURVIVED, Ecko Jeans, and ANXIETY. Other supplied pieces retain their relative order. These are local drafts only; all publication flags remain false.

## Required photo workflow and latest unpublished Hero Collection draft

Follow `docs/product-photo-workflow.md` for every current and future upload. Original garment appearance, artwork, logos, graphics and colors must not be redesigned. Only the owner's listed background, lighting, shadow, sharpening, centering, and crop adjustments are allowed. Preserve originals and use actual views only. No mockups or invented images are permitted. Draft status and publication approval remain separate from photo cleanup.

The latest owner-supplied TRAUMA MADE ME Denim Jacket is the first local Hero Collection candidate, at $199 USD, XL, Brand New. Its actual title, T.C.C. brand, description, five front features, five back details, and five themes are preserved. `collection: "Hero Collection"`, `featured: true`, and `homepageSpotlight: true` mark it for the slot immediately after Founder Story, but `published: false` keeps it hidden. Its photos and direct Depop URL remain unavailable and blank; the existing owner-supplied PayPal link and Custom Piece action are prepared. No photograph, color, or purchase listing was invented.

Latest featured priority: TRAUMA MADE ME, TOXIC, PTSD Hoodie, Ecko Jeans, SURVIVED, ANXIETY, UNSPOKEN. These seven lead the homepage once eligible and approved; other real pieces remain in the full collection. This supersedes earlier order/limit notes. The spotlight independently requires a published, confirmed, unsold, ready-made featured TRAUMA garment and never exposes a draft.

A single CUSTOM CREATIONS section presents Coming Soon navigation for Custom Hats, Beanies, Shoes, Hoodies, Jackets, Denim, Sports Bras, and Bras, with the owner's text: Have an idea? Let TRAUMA bring it to life. Its Request Custom Piece button opens the quote form. These are service categories, not generated product inventory. The quote form still requires a real service endpoint for automatic submissions.

## Latest homepage curation: eight sections, eight distinct products maximum

The homepage collection sections are now Hero Collection, Apparel, Denim, Hats & Beanies, Custom Footwear, Women's Collection, Books & Guides, and Custom Orders, using the owner's requested icons. The homepage selects at most eight unique published, confirmed, unsold, featured ready-made products in inventory priority order. Never pad to six when fewer approved products are available. An eligible spotlight is counted in the same eight-item budget and is not duplicated in another homepage section. The spotlight remains immediately below Founder Story.

Other selected products are assigned to exactly one homepage section. A specific Women's Collection assignment takes precedence over general apparel grouping. Hero collection, denim, headwear, footwear, and books use their proper sections. Custom-order category links are service navigation and do not count as inventory products. The Coming Soon CUSTOM CREATIONS content now lives within the Custom Orders section instead of rendering twice.

View Full Collection opens `/collections`, which retains all approved items independently of the homepage limit. The admin's featured checkbox and inventory order control homepage curation; `homepageCollection: false` excludes a product from the homepage without removing it from the full gallery. No draft, confirmation status, or publication flag was changed for this restructuring.

The leggings request adds Women's Collection with Leggings, Sports Bras, Bras, Women's Hoodies, and Women's Custom Pieces navigation. It contains only real approved records, not sample garments. Custom quote categories now include Sports Bras, Bras, Leggings, Women's Sets, Hats, Beanies, Shoes, Denim, and Hoodies alongside earlier options. The design-description field explicitly invites artwork, colors, names, memorial designs and one-of-one ideas. Actual quote delivery remains disconnected until a real endpoint is supplied.

Suffered In Silence Leggings remain a local unpublished record: Women's 10 (XL Listing), Brand New, sale $58.65 / original $69, featured, Women's Collection, homepageCollection true. The supplied description, five features, and five themes are preserved. Actual images and a direct Depop listing are still missing; no photos, links, or color were invented. Existing PayPal and Custom Piece actions are prepared. No source was pushed or deployed, and no products were published.

## Quick Add Apparel — local implementation, pending deployment

The dedicated screen is `/admin/quick-add`, linked from `/admin`. It uses the existing admin key and server-side GitHub token. No additional service credentials are needed for repository photo storage. Credentials must be configured once in Vercel before real saves can work; this implementation has not accessed those production secrets or tested a production write.

### From a phone, without code

1. Open `/admin`, choose Quick Add Apparel, enter your existing Admin key, and tap Open Quick Add.
2. Copy the actual Depop listing title into Product Name and paste the real listing description into Description.
3. Enter the real current USD price and select Apparel, Tops, Outerwear, Denim, Headwear, Women's Collection, or Footwear.
4. Choose photos from your phone. JPG, PNG, and WebP are supported, up to 12 files and 3 MB per file. Existing originals are not silently resized or altered. Preview every file, use Use as cover if needed, or remove a file before saving. Background/lighting cleanup is not automatic in this uploader; follow the required photo workflow separately.
5. Paste the actual Depop URL. The owner's public PayPal link is prefilled when configured; change or remove it as appropriate. Payhip is disabled for apparel because it belongs to books/digital products in the full manager.
6. Optionally enter size, condition, color, product type, and collection. Otherwise gallery grouping follows the chosen category and actual product title. Women's Collection automatically receives that collection label.
7. Select Feature this apparel on the homepage when desired. The homepage still shows only eight distinct eligible pieces; all approved pieces remain available in the full gallery.
8. Save as draft is the default. Confirm the item and photos are your real TRAUMA product. To publish, explicitly choose Publish after my review and check the separate approval box.
9. Tap Save Product. Photo upload progress appears, then the photos and inventory entry are committed together. After the connected Vercel deployment succeeds, an approved published product automatically gets `/products/<id>`, a gallery entry, appropriate collection grouping, and eligible featured placement. A draft stays private. Saving does not require editing files or code.

### How upload/save works and its limits

Each original photo is sent separately to authenticated `/api/admin/photos`, checked for size and JPG/PNG/WebP signatures, then stored as a GitHub blob with a signed receipt. Individual photo uploads are limited to 3 MB to stay below the hosting platform request limit. The original file bytes are preserved. The final `/api/admin/quick-add` request validates all receipts, ownership and publication approval, URLs, categories, price, and current inventory revision, then writes one Git commit containing every photo and the new inventory record. No images are stored on Vercel's temporary filesystem.

Concurrent inventory edits and branch updates are rejected rather than overwritten. Repeated saves with the same request ID do not add duplicate products. If a response is interrupted, inventory can be refreshed and retried while the form and successfully uploaded photos remain in the open tab. There is no claim that the deployment finished merely because a Git save succeeded. Rejected/abandoned uploads may leave unreferenced Git blobs, but do not publish images or inventory.

The screen is mobile responsive, keeps the admin key in tab memory, previews only selected real files, and requires real product name, description, price, category, at least one photo, and owner confirmation. Links are optional while details are being prepared. All existing draft records remain unchanged by implementation. Photo-background cleanup and lighting correction are not automatically connected; only preservation and responsive web delivery are implemented. Nothing was pushed, deployed, published, or paid for as part of these checks.

## Current mobile dashboard and Quick Add workflow

Use `docs/admin-quick-start.md` as the current nontechnical guide. `/admin` is now the six-button business dashboard; the full editor moved to `/admin/inventory`, and `/admin/quick-add` is Quick Add Product. A signed seven-day HttpOnly session cookie is shared across admin screens. Password autofill may use the phone's Face ID; the website does not claim native biometric/passkey support. Photos upload through the admin interface, preserving originals, with front/back/detail/branding labels and independent Featured Collection/Apparel selections. Books and digital categories are supported by the same Quick Add screen with Payhip, while apparel retains Depop/PayPal. Publication still requires explicit owner approval in the form. Existing product drafts were not published or modified for this dashboard change.


## Shipping and stock fields (November 2026)

The full inventory editor includes `inventoryType` (`apparel`, `reworked-denim`, `one-of-one`, `digital`), `fulfillmentType` (`physical`, `digital`), `packedWeightOz`, and `stockQuantity`. Existing records may omit these until the owner supplies measured values. Reworked denim and one-of-one types route as physical apparel. One-of-one stock cannot exceed one; sold records with explicit counts must have zero; published zero-stock pieces must be marked sold.

UPS Ground is the default, from Albany, Illinois, with buyer-paid weight-based shipping, tracking and estimated transit of 3–5 business days. USPS Ground Advantage is the lightweight backup. Most orders ship within one business day when stock is available; custom production timing requires a quote. See `docs/shipping-architecture.md` for the unconnected carrier-provider boundary. An inventory count is not a stock reservation or marketplace synchronization.
