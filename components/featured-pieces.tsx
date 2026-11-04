import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { GalleryCard } from '@/components/gallery-card'
import { FeaturedPiecesRail } from '@/components/featured-pieces-rail'
import { galleryCategory, galleryProducts, type Inventory, type Product } from '@/lib/inventory'

const heroIds = [
  'trauma-made-me-denim-jacket',
  'toxic-trauma-bond',
  'ptsd-edition-me-vs-myself-hoodie',
  'trauma-cc-ecko-carpenter-jeans',
  'still-breathing-bleach-wash-graphic-tee',
]

const bestSellerIds = [
  'survived-graphic-tee',
  'born-from-pain-black-tee',
  'unspoken-tie-dye-graphic-tee-small',
  'ptsd-edition-me-vs-myself-hoodie',
]

const accessoryIds = [
  'unspoken-red-letter-trucker',
  'trauma-red-lips-trucker',
  'unspoken-purple-trucker',
  'made-in-chaos-dark-beanie',
  'trauma-cc-stacked-dark-beanie',
]

const oneOfOneIds = [
  'toxic-trauma-bond',
  'trauma-made-me-denim-jacket',
  'trauma-black-quilted-graphic-jacket',
  'adidas-nizza-rf-purple-chain-custom',
]

function Shelf({ id, title, description, products, href }: { id: string; title: string; description?: string; products: Product[]; href?: string }) {
  if (!products.length) return null
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-12 scroll-mt-24 border-t border-border pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${id}-heading`} className="text-xl font-bold sm:text-2xl">{title}</h3>
        {href && <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4">View collection <ArrowUpRight aria-hidden="true" className="size-4" /></Link>}
      </div>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {products.map((product) => <GalleryCard key={product.id} product={product} />)}
      </ul>
    </section>
  )
}

export function FeaturedPieces({ inventory }: { inventory: Inventory }) {
  const available = galleryProducts(inventory, 'apparel', '', 'available').filter((product) => product.photos.length && product.homepageCollection !== false)
  const byId = new Map(available.map((product) => [product.id, product]))
  const select = (ids: string[]) => ids.flatMap((id) => {
    const product = byId.get(id)
    return product ? [product] : []
  })
  const hero = select(heroIds)
  const drops = [
    { title: 'Varsity Jacket', product: available.find((p) => /\bvarsity\b.*\bjacket\b/i.test(`${p.name} ${p.productType ?? ''}`)) },
    { title: 'Pressure Makes Diamonds Hat', product: available.find((p) => galleryCategory(p) === 'headwear' && /pressure makes diamonds/i.test(`${p.name} ${p.productType ?? ''}`)) },
    { title: 'Unspoken Collection', product: select(['unspoken-tie-dye-graphic-tee-small', 'unspoken-red-letter-trucker', 'unspoken-purple-trucker', 'unspoken-pink-custom-high-tops'])[0], href: '/collections?availability=available&q=Unspoken' },
    { title: 'Reworked Denim', product: select(['trauma-cc-ecko-carpenter-jeans', 'trauma-made-me-denim-jacket', 'pressure-makes-diamonds-army-patch-capris'])[0], href: '/collections?category=denim&availability=available' },
  ]
  const bestSellers = select(bestSellerIds)
  const accessories = select(accessoryIds)
  const oneOfOne = select(oneOfOneIds)
  const otherShelfIds = new Set([...heroIds, ...bestSellerIds, ...accessoryIds, ...oneOfOneIds])
  const apparel = galleryProducts(inventory, 'featured-apparel', '', 'available')
    .filter((product) => byId.has(product.id) && !otherShelfIds.has(product.id) && product.price !== null)
    .slice(0, 4)
  if (![hero, bestSellers, apparel, accessories, oneOfOne].some((products) => products.length)) return null

  return (
    <section id="drops" aria-labelledby="featured-products-heading" className="scroll-mt-24 border-b border-border py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="border-l-2 border-accent pl-5">
          <h2 id="featured-products-heading" className="section-title">Featured Drops</h2>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {drops.map(({ title, product, href }) => product && (
            <li key={title} className="min-w-0">
              <Link href={href ?? `/products/${product.id}`} className="group block h-full border border-border border-t-2 border-t-accent bg-card hover:border-accent">
                <div className="relative aspect-[4/5] bg-[#171619]">
                  <Image src={product.photos[0]} alt={product.name} fill sizes="(min-width: 768px) 25vw, 49vw" className="object-contain p-2 sm:p-3" />
                </div>
                <span className="flex items-center justify-between gap-2 px-3 py-4 text-sm font-bold sm:text-base">{title}<ArrowUpRight className="size-4 shrink-0 text-accent" aria-hidden="true" /></span>
              </Link>
            </li>
          ))}
        </ul>
        {hero.length > 0 && (
          <section id="featured-pieces" aria-labelledby="hero-collection-heading" className="mt-7 scroll-mt-24">
            <h3 id="hero-collection-heading" className="text-xl font-bold sm:text-2xl">Hero Collection</h3>
            <FeaturedPiecesRail count={hero.length}>
              {hero.map((product) => <GalleryCard key={product.id} product={product} imageSizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 44vw, 82vw" />)}
            </FeaturedPiecesRail>
          </section>
        )}
        <Shelf id="best-sellers" title="Featured Picks" products={bestSellers} />
        <Shelf id="featured-apparel" title="Featured Apparel" products={apparel} href="/collections?category=featured-apparel&availability=available" />
        <Shelf id="accessories" title="Accessories" products={accessories} href="/collections?category=headwear&availability=available" />
        <Shelf id="one-of-one" title="One of One Collection" description="No two pieces are identical." products={oneOfOne} href="/collections?category=artwear&availability=available" />
        <nav aria-label="Shop more TRAUMA pieces" className="mt-8 flex flex-wrap gap-3">
          <Link href="/collections/tiktok" className="inline-flex min-h-11 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent">Shop the TikTok Collection <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
          <Link href="/collections" className="inline-flex min-h-11 items-center border border-border px-4 py-2 text-sm font-semibold hover:border-accent">View full gallery</Link>
        </nav>
      </div>
    </section>
  )
}
