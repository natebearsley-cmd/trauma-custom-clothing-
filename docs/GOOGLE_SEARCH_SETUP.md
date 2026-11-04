# Google Search setup — TRAUMA Custom Clothing

Confirmed website: **https://tra-coral.vercel.app/**

Business/owner locality: **Albany, Illinois 61230, US**. This is not confirmation of a customer-facing storefront or a full business address.

## Implemented configuration

- Eight main public pages and 26 published product pages have distinct descriptions. `docs/SEO_META_DESCRIPTIONS.md` contains every generated title/description and URL.
- Public canonical URLs use HTTPS and the confirmed origin. The home canonical is `/`; other public routes self-canonicalize. Collection filter/search query variations canonicalize to `/collections`; contact product-query variations canonicalize to `/contact`.
- `SITE_URL` accepts an HTTPS origin only. The default and `.env.example` use the confirmed site. If the Vercel project already sets SITE_URL, verify that it equals `https://tra-coral.vercel.app` and redeploy after changing it.
- The sitemap contains 34 public URLs, excluding drafts, admin, API, checkout and the disabled QuietWork page. It does not invent modification dates.
- Robots permits public crawling and points to the absolute sitemap. Admin/API exclusions do not secure routes; authentication remains necessary. Checkout is noindex and crawlable so Google can read the directive.
- The root layout accepts `GOOGLE_SITE_VERIFICATION` and emits Google's HTML verification meta tag only when a real token is configured. No placeholder token is emitted.
- Thirteen priced product pages have Product/Offer JSON-LD using the exact stored price/currency, canonical page URL, photos, SKU, brand, seller identity and source sold/stock status. Thirteen pages without a price use WebPage/Thing markup instead of incomplete Google Product rich-result markup. No ratings, GTINs, shipping charges or price-expiration dates were invented.
- Organization/Person/WebSite schema uses TRAUMA Custom Clothing, Nathanial Bearsley, the confirmed origin/location, existing business email and source social links. No unconfirmed street address, telephone, opening hours or logo was added. No LocalBusiness schema or local storefront is claimed.

## Verification limits

Local production HTML checks verify routes, sitemap membership, canonical URLs, unique descriptions, JSON-LD parsing/fields, noindex exclusions and verification-tag readiness. These are not Google's Rich Results Test or an indexing confirmation.

The execution network blocks direct requests to the live site's `/robots.txt` and `/sitemap.xml` with proxy HTTP 403. That is an environment access limitation, not proof that Googlebot is blocked. Verify the actual public responses in a browser and Search Console after deployment.

No Google account is connected. Search Console ownership, sitemap submission, Google-selected canonicals, actual indexed URLs and ranking data cannot be confirmed here. Verification remains pending until Google supplies the token and accepts it.

## Search Console: exact verification steps

1. Sign in to https://search.google.com/search-console using the business owner's Google account. Enable appropriate account security and retain ownership access.
2. Add a **URL-prefix** property: `https://tra-coral.vercel.app/`. Do not add `vercel.app` as a Domain property; TRAUMA does not control that parent domain. A future owned custom domain can use a DNS-verified Domain property.
3. Choose **HTML tag** under the available verification methods. Google will provide `<meta name="google-site-verification" content="YOUR_REAL_TOKEN" />`.
4. Copy only the real `content` value. In the existing Vercel project `tra`, add `GOOGLE_SITE_VERIFICATION` with that value for Production. Keep any verification methods/tokens belonging to existing authorized owners.
5. Redeploy the same project. View the deployed homepage source and confirm exactly the supplied `google-site-verification` tag is present and that the homepage is public, not behind deployment protection.
6. Return to Search Console and click **Verify**. Keep the tag in production afterward; verification is checked periodically.
7. Add team members through Search Console permissions rather than sharing the owner's password.

The verification token is a public ownership marker, not a payment/API secret. Do not paste a whole meta tag into the environment variable. No invented value will verify ownership.

## Indexing: launch sequence

1. Confirm the public production domain serves the intended release over HTTPS. Home, collections, custom orders and product pages must return 200; missing/draft products must return 404. Remove unintended production password protection or `noindex` directives on public pages.
2. Open https://tra-coral.vercel.app/robots.txt and https://tra-coral.vercel.app/sitemap.xml. Confirm public crawl permission, the sitemap URL, XML content, and no drafts/private routes. Do not use the retired sitemap ping endpoint or the Google Indexing API for ordinary product pages.
3. Verify Search Console ownership using the preceding steps.
4. In **Sitemaps**, submit `https://tra-coral.vercel.app/sitemap.xml`. Confirm Google can fetch/read it and monitor processing errors. A sitemap is a discovery hint, not an indexing guarantee.
5. Use **URL Inspection → Test Live URL** on the homepage, `/collections`, `/custom-orders`, and representative priced and unpriced product pages. Check crawl access, rendered content, canonical, images and indexing directives.
6. Request indexing for the homepage and a small number of key new/changed pages. Let the sitemap and normal internal links expose the remainder. Requests do not guarantee inclusion or immediate crawling.
7. Inspect **Page indexing**, **Sitemaps** and **Security & Manual Actions** reports. Fix redirect errors, soft 404s, blocked resources or unintended exclusions. A filter URL excluded as an alternate canonical can be expected; inspect the canonical destination before treating it as a defect.
8. Check Google's selected canonical against the declared canonical after crawling. Resolve conflicting internal links, redirects, alternate hosts or SITE_URL values if they disagree.
9. Run https://search.google.com/test/rich-results on representative priced product URLs and the homepage; use https://validator.schema.org/ for broader schema syntax/vocabulary checks. Address required-field errors; do not invent optional fields to silence warnings.
10. Recheck products after stock/price changes and mark sold one-of-one items promptly. External Depop/Payhip facts must match visible storefront claims.

## Ranking: ongoing work

- Complete real product prices, sizes, measurements, condition, original photos and useful descriptions. Thirteen published pages still have unknown prices and intentionally lack Product offers. Do not publish the sixteen incomplete drafts solely to increase page count.
- Replace generic shop destinations with verified, product-specific marketplace URLs when available. Clearly distinguish marketplace purchases, manual PayPal invoices and custom quote requests. The site is not yet a verified automated on-site checkout.
- Use natural, specific titles for apparel, reworked denim, hoodies and one-of-one jackets. Preserve the founder's story and the recovery/resilience context. Avoid repetitive keyword lists or unsupported bestseller claims.
- Keep useful collection links and descriptive internal links to products; add related pieces where genuinely relevant. Do not create near-identical location pages or thin pages for empty categories.
- Publish original, helpful content about garment measurements, custom-order preparation, reworked denim care and the founder's process only when it reflects real business practice.
- Measure mobile performance with PageSpeed Insights and Search Console Core Web Vitals. Improve image sizes, loading and interaction problems based on measurements; no Lighthouse or ranking score is claimed by this audit.
- If eligible, complete a truthful Google Business Profile using `docs/GOOGLE_BUSINESS_PROFILE_CHECKLIST.md`. An online-only brand should prioritize organic search and legitimate online/social listings rather than claim a local storefront.
- Earn genuine mentions and customer reviews where permitted. Do not buy links or fabricate testimonials. Keep brand, contact and location details consistent across owned channels.
- After Search Console data accumulates, review queries, impressions, clicks, CTR and landing pages weekly at launch, then monthly. Improve pages based on actual customer searches and conversion behavior.
- Add a real consent-based email provider and useful post-purchase support when operationally ready. These improve customer retention; they are not substitutes for crawlability or guaranteed ranking factors.
- Consider a stable owned domain for long-term branding. If migrating, plan permanent redirects, canonicals, sitemap updates and the applicable Search Console migration workflow instead of maintaining competing indexable copies.

Google determines indexing, snippets and rankings. Technical setup makes the site discoverable and understandable; it does not guarantee placement, rich results or a ranking timetable.

## Official references

- Search Console verification: https://support.google.com/webmasters/answer/9008080
- Sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Product snippets: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Organization schema: https://developers.google.com/search/docs/appearance/structured-data/organization
- SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
