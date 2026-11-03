import { ProductCard } from '@/components/product-card'
import { featuredProducts, featuredApparel, isApparel, type Inventory } from '@/lib/inventory'
import { PAYHIP_SHOP_URL } from '@/lib/site'

export function FeaturedProducts({ inventory, apparel = false }: { inventory: Inventory; apparel?: boolean }) {
  const products = apparel
    ? featuredApparel(inventory)
    : featuredProducts(inventory).filter((product) => !isApparel(product))
  return (
    <section
      id={apparel ? "featured-apparel" : "featured"}
      aria-labelledby={apparel ? "featured-apparel-heading" : "featured-heading"}
      className="scroll-mt-24 border-b border-border bg-card py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">From Nathanial Bearsley</p>
            <h2 id={apparel ? "featured-apparel-heading" : "featured-heading"} className="section-title">
              {apparel ? "Featured Apparel" : "Featured Products"}
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              {apparel
                ? "Original clothing from TRAUMA. Explore each piece; checkout stays on Payhip."
                : "Books, wallpapers, guides, and digital products from the person behind TRAUMA. Every purchase stays on Payhip."}
            </p>
          </div>
          <a
            href={PAYHIP_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center border border-input px-5 py-3 text-sm font-semibold hover:border-accent"
          >
            Explore the Payhip store
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
        {products.length > 0 && (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} featured />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
