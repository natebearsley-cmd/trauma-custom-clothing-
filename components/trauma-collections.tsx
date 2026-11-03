import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { GalleryCard } from '@/components/gallery-card'
import { HomepageSpotlight } from '@/components/homepage-spotlight'
import { CUSTOM_GALLERY_TYPES, HOMEPAGE_COLLECTIONS, galleryProducts, homepageProducts, homepageCollectionKey, homepageSpotlightProduct, type Inventory } from '@/lib/inventory'

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
  const frontLineup = galleryProducts(inventory, "featured-apparel", "", "available").filter((p) => p.featuredApparel === true && p.homepageCollection !== false)
  const remaining = [...new Map([...selected, ...frontLineup].map((p) => [p.id, p])).values()].filter((product) => product.id !== spotlight?.id)
  const sections = HOMEPAGE_COLLECTIONS.filter(({ key }) => (key === 'hero' && spotlight) || remaining.some((product) => homepageCollectionKey(product) === key))
  return <>
    <section id="drops" className="scroll-mt-24 border-b border-border py-16 md:py-24"><div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Independent design · Original stories</p><h2 className="section-title">Featured Collection</h2><p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">A curated selection of TRAUMA originals. Discover the rest in the full gallery.</p></div><Link href="/collections" className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-accent">Shop the gallery <ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
      <nav aria-label="Homepage collections" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{sections.map((collection) => <Link key={collection.key} href={`#${collection.id}`} className="flex min-h-16 items-center border border-border bg-card px-5 py-4 text-sm font-semibold hover:border-accent motion-safe:transition-colors">{collection.title}</Link>)}</nav>
    </div></section>
    {sections.map(({ key, id, title, href }) => {
      if (key === 'hero' && spotlight) return <HomepageSpotlight key={key} inventory={inventory} />
      const products = remaining.filter((product) => homepageCollectionKey(product) === key)
      return <section key={key} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-b border-border py-16 md:py-24"><div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-5 border-l-2 border-accent pl-5 sm:flex-row sm:items-end sm:justify-between"><h2 id={`${id}-heading`} className="section-title">{title}</h2><Link href={href} className="inline-flex min-h-12 items-center gap-2 text-sm underline underline-offset-4">View collection<ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
        {key === 'matching-sets' && <p className="mt-5 text-muted-foreground">Complete outfits, sold together.</p>}
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{products.map((product) => <GalleryCard key={product.id} product={product} />)}</ul>
        {key === 'digital' && <p className="mt-5 text-sm text-muted-foreground">Books, guides, wallpapers, and digital products are purchased on Payhip.</p>}
      </div></section>
    })}
  </>
}
