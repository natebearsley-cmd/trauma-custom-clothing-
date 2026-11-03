# TRAUMA Custom Clothing

Next.js App Router storefront for Nathanial Bearsley’s own garments and products. No generated or sample inventory. See [inventory management](docs/inventory.md) for store rules, product fields, Depop workflow, secure admin setup, and sold/archive behavior.

## Development

Use Node.js 24 and pnpm (the package manager version is declared in package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Use the existing checkout in `/workspace`; cloud tasks are already isolated and do not need a new worktree.

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

Anton and Inter are self-hosted with their Open Font Licenses; builds do not fetch Google Fonts. No secrets are required to build or browse the store. `/admin` saving requires the server-side credentials documented in docs/inventory.md. Do not commit secrets. Updates are not public until deployed.

## Main locations

- `data/inventory.json`: the only product inventory source.
- `lib/inventory.ts`: shared schema, validation, and visibility rules.
- `app/`: public page, admin page, protected inventory endpoint, SEO routes.
- `components/`: reusable storefront and manager components.
- `public/images/products/`: original garment photos.
- `tests/`: inventory rules and source-asset checks.
