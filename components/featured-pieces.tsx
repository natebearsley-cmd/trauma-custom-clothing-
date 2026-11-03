import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { GalleryCard } from '@/components/gallery-card'
import { FeaturedPiecesRail } from '@/components/featured-pieces-rail'
import { galleryProducts, type Inventory, type Product } from '@/lib/inventory'

// This is the lead selection from the first 25 products published in the gallery.
const arrivalIds = [
  'trauma-made-me-denim-jacket',
  'toxic-trauma-bond',
  'ptsd-edition-me-vs-myself-hoodie',
  'trauma-cc-ecko-carpenter-jeans',
  'survived-graphic-tee',
  'unspoken-tie-dye-graphic-tee-small',
]

const imageSizes = '(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 44vw, 82vw'

function Shelf({ id, title, products, href }: { id: string; title: string; products: Product[]; href: string }) {
  if (!products.length) return null
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-12 scroll-mt-24 border-t border-border pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${id}-heading`} className="text-xl font-bold sm:text-2xl">{title}</h3>
        <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4">View collection <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <GalleryCard key={product.id} product={product} imageSizes={imageSizes} />)}
      </ul>
    </section>
  )
}

export function FeaturedPieces({ inventory }: { inventory: Inventory }) {
  const available = galleryProducts(inventory, 'apparel', '', 'available').filter((product) => product.photos.length && product.homepageCollection !== false)
  const byId = new Map(available.map((product) => [product.id, product]))
  const arrivals = arrivalIds.flatMap((id) => {
    const product = byId.get(id)
    return product ? [product] : []
  })
  const apparel = galleryProducts(inventory, 'featured-apparel', '', 'available')
    .filter((product) => byId.has(product.id) && !arrivalIds.includes(product.id) && product.price !== null).slice(0, 3)
  const artwear = galleryProducts(inventory, 'artwear', '', 'available')
    .filter((product) => byId.has(product.id) && product.price !== null).slice(0, 3)
  if (!arrivals.length && !apparel.length && !artwear.length) return null

  return (
    <section id="drops" aria-labelledby="featured-products-heading" className="scroll-mt-24 border-b border-border py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="border-l-2 border-accent pl-5">
          <h2 id="featured-products-heading" className="section-title">Featured Products</h2>
        </div>
        {arrivals.length > 0 && (
          <section id="featured-pieces" aria-labelledby="new-arrivals-heading" className="mt-7 scroll-mt-24">
            <h3 id="new-arrivals-heading" className="text-xl font-bold sm:text-2xl">New Arrivals</h3>
            <p className="mt-2 text-sm text-muted-foreground">Featured pieces from the online gallery launch.</p>
            <FeaturedPiecesRail count={arrivals.length}>
              {arrivals.map((product) => <GalleryCard key={product.id} product={product} imageSizes={imageSizes} />)}
            </FeaturedPiecesRail>
          </section>
        )}
        <Shelf id="featured-apparel" title="Featured Apparel" products={apparel} href="/collections?category=featured-apparel&amp;availability=available" />
        <Shelf id="one-of-one" title="One-of-One Collection" products={artwear} href="/collections?category=artwear&amp;availability=available" />
        <nav aria-label="Shop more TRAUMA pieces" className="mt-8 flex flex-wrap gap-3">
          <Link href="/collections/tiktok" className="inline-flex min-h-11 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent">Shop the TikTok Collection <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
          <Link href="/collections" className="inline-flex min-h-11 items-center border border-border px-4 py-2 text-sm font-semibold hover:border-accent">View full gallery</Link>
        </nav>
      </div>
    </section>
  )
}
