# TRAUMA Admin — phone quick start

## Open your business dashboard

After this version is deployed, open https://tra-coral.vercel.app/admin in Safari. On iPhone, tap Share → Add to Home Screen and name it TRAUMA Admin. This is your direct business-app shortcut; an internet connection is required.

Sign in with the existing Admin key. You can save it in your phone's password manager. iOS may use Face ID to unlock saved-password autofill; this website does not implement biometric authentication or a passkey. A signed, secure, HttpOnly session cookie keeps this device signed in for up to seven days and is shared by the dashboard, Quick Add, and inventory/gallery manager. Sign out clears it. Changing the server Admin key invalidates old sessions.

One-time hosting setup still requires INVENTORY_ADMIN_KEY and INVENTORY_GITHUB_TOKEN in Vercel Production. The key must be at least 32 characters; the fine-grained GitHub token needs Contents read/write access only to the TRAUMA repository. Never enter that GitHub token into a product form or chat. No production credentials were read or created by this work.

## Dashboard tools

- Quick Add Product: /admin/quick-add
- Manage Gallery: /admin/inventory?view=gallery
- Inventory: /admin/inventory
- Featured Products: /admin/inventory?featured=featured
- Books & Digital Products: /admin/inventory?category=digital
- View Website: /

## Add a Depop product without code

1. Tap Quick Add Product. Your saved session opens the form without another key prompt.
2. Choose the actual category. Paste your Depop title and description. Enter the real current USD price.
3. Choose up to 12 original JPG/PNG/WebP photos from your phone, each up to 3 MB. Label each Front, Back, Detail, Branding/tag, or Photo. Use as cover chooses the first gallery image. Originals are uploaded without re-encoding or altering the garment.
4. Paste the real Depop URL. Use or change the prefilled owner-supplied PayPal link as appropriate. Apparel never uses Payhip. Choosing Books, Guides, Wallpapers, or Digital Downloads enables Payhip and disables apparel payment links.
5. Optional details include size, color, condition, product type, and collection. Category/title-based grouping is automatic when collection is left blank. Women's Collection is assigned explicitly for that category.
6. Select Add to Featured Collection, Add to Featured Apparel, or both. Homepage curation has a shared eight-product limit; the full galleries retain every approved product. A featured flag never publishes a draft by itself.
7. Confirm the item/photos are your real product. Save as draft is selected by default. To go live, choose Publish after my review and explicitly approve publication.
8. Tap Save Product. Upload progress is shown, then original-photo blobs and the inventory record are committed together. Approved products enter their product page, category gallery, collection, and selected featured galleries after the connected Vercel deployment succeeds. Drafts stay off public pages.
9. Tap Add another product or return to the dashboard. No code or JSON editing is required.

## Manage existing products

Inventory provides search, category/status/source/featured filters, draft/published/sold controls, price, description, payment links, and photo URL/view-label editing. Manage Gallery opens the same manager with visual product previews and links into its editor. Books & Digital Products and Featured Products prefilter the manager. Saving existing edits still requires the connected deployment to finish before public pages update.

## Photography limits and accuracy

Original file bytes are preserved. The storefront creates responsive web-size derivatives without replacing originals. Automatic background removal, relighting, and garment cleanup are not connected; the interface states this rather than claiming those edits occurred. Never redesign or alter garment artwork, colors, logos, distressing, branding, fabric, embroidery, or print placement. Use only the permitted background/lighting/crop/clarity/web-optimization operations on separate copies, compare them with originals, and obtain publication approval.

The dashboard and Quick Add code are tested locally using intercepted browser API calls and mocked GitHub writes, including concurrent changes, safe retry, and publication approval. No production inventory write is used as a test, and no real payment is initiated. Production saving depends on correct hosting credentials and the repository deployment connection.
