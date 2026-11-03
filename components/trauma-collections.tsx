import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { CustomCreations } from '@/components/custom-creations'
import { HEADWEAR_COLLECTIONS, WOMENS_COLLECTION_TYPES, CUSTOM_GALLERY_TYPES, HOMEPAGE_COLLECTIONS, homepageProducts, homepageCollectionKey, homepageSpotlightProduct, type Inventory } from '@/lib/inventory'

export function CustomOrderGallery() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{CUSTOM_GALLERY_TYPES.map((type, index) => (
    <Link key={type} href={`/custom-orders?type=${encodeURIComponent(type)}`} className="group flex min-h-48 flex-col justify-between border border-border bg-card p-6 hover:border-accent motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
      <span className="font-mono text-xs text-muted-foreground">TRAUMA / {String(index + 1).padStart(2, '0')}</span>
      <span className="mt-6 font-display text-3xl uppercase">{type}</span>
      <span className="mt-4 inline-flex items-center gap-2 text-sm">Request Custom Order <ArrowUpRight className="size-4" aria-hidden="true" /></span>
    </Link>
  ))}</div>
}

export function TraumaCollections({ inventory }: { inventory: Inventory }) {
  const selected = homepageProducts(inventory)
  const spotlight = homepageSpotlightProduct(inventory)
  const remaining = selected.filter((product) => product.id !== spotlight?.id)
  return <>
    <section id="drops" className="scroll-mt-24 border-b border-border py-16 md:py-24"><div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Independent design · Original stories</p><h2 className="section-title">TRAUMA Collections</h2><p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">A curated selection of TRAUMA originals. Discover the rest in the full gallery.</p></div><Link href="/collections" className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-accent">View Full Collection <ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
      <nav aria-label="Homepage collections" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{HOMEPAGE_COLLECTIONS.map((collection) => <Link key={collection.key} href={collection.key === 'hero' && spotlight ? '#hero-collection' : `#${collection.id}`} className="flex min-h-16 items-center border border-border bg-card px-5 py-4 text-sm font-semibold hover:border-accent motion-safe:transition-colors">{collection.title}</Link>)}</nav>
    </div></section>
    {HOMEPAGE_COLLECTIONS.map(({ key, id, title, href }) => {
      if (key === 'hero' && spotlight) return null
      if (key === 'custom') return <CustomCreations key={key} title={title} />
      const products = remaining.filter((product) => homepageCollectionKey(product) === key)
      return <section key={key} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-b border-border py-16 md:py-24"><div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-5 border-l-2 border-accent pl-5 sm:flex-row sm:items-end sm:justify-between"><h2 id={`${id}-heading`} className="section-title">{title}</h2><Link href={href} className="inline-flex min-h-12 items-center gap-2 text-sm underline underline-offset-4">{key === 'footwear' ? 'Request Custom Shoes' : 'View collection'}<ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
        {key === 'headwear' && <nav aria-label="Headwear collections" className="mt-8 flex flex-wrap gap-3">{HEADWEAR_COLLECTIONS.map((collection) => <Link key={collection} href={`/collections?category=headwear&collection=${encodeURIComponent(collection)}`} className="inline-flex min-h-11 items-center border border-border px-4 py-2 text-sm hover:border-accent">{collection}</Link>)}</nav>}
        {key === 'women' && <nav aria-label="Women's collection categories" className="mt-8 flex flex-wrap gap-3">{WOMENS_COLLECTION_TYPES.map((type) => <Link key={type} href={`/collections?category=women&collection=${encodeURIComponent(type)}`} className="inline-flex min-h-11 items-center border border-border px-4 py-2 text-sm hover:border-accent">{type}</Link>)}</nav>}
        {products.length ? <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} featured apparelShowcase={key !== 'digital'} />)}</ul> : <p className="mt-8 text-sm text-muted-foreground">{key === 'footwear' ? 'Custom footwear is coming soon. Share your idea to request a quote.' : 'No approved pieces are featured here yet. Explore the full collection.'}</p>}
        {key === 'digital' && <p className="mt-5 text-sm text-muted-foreground">Books, guides, wallpapers, and digital products are purchased on Payhip.</p>}
      </div></section>
    })}
  </>
}
