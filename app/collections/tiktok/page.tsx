import { publicPageMetadata } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { galleryProducts, isMatchingSet, paypalDestination, productDestination } from '@/lib/inventory'
import { inventory } from '@/lib/inventory-store'

export const metadata = publicPageMetadata('/collections/tiktok')

const picks = [
  'ptsd-edition-me-vs-myself-hoodie',
  'betrayal-eyes-dont-lie-hoodie',
  'trauma-made-me-denim-jacket',
  'trauma-cc-ecko-carpenter-jeans',
  'survived-graphic-tee',
  'unspoken-tie-dye-graphic-tee-small',
  'toxic-trauma-bond',
]

export default function TikTokCollectionPage() {
  const available = galleryProducts(inventory, 'apparel', '', 'available').filter(
    (product) => product.photos.length && product.price !== null && productDestination(product),
  )
  const byId = new Map(available.map((product) => [product.id, product]))
  const selected = picks.flatMap((id) => {
    const product = byId.get(id)
    return product ? [product] : []
  })
  const matchingSet = available.find(isMatchingSet)
  const products = matchingSet ? [...selected.slice(0, 2), matchingSet, ...selected.slice(2, 6)] : selected

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-8 md:pb-24 md:pt-12">
        <p className="eyebrow">TRAUMA Custom Clothing</p>
        <h1 className="section-title mt-2">TikTok Sales Collection</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">One-of-one clothing built from trauma, recovery, and resilience. Ships from Albany, Illinois. Buyer-paid UPS Ground shipping is confirmed before payment.</p>
        {products.length > 0 && (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-7">
            {products.map((product, index) => {
              const href = `/products/${product.id}`
              const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price!)
              const story = product.description.trim().split(/\n\s*\n/).slice(0, 2).join(' ')
              const paypal = paypalDestination(product)
              const depop = productDestination(product)
              const secondaryButton = 'inline-flex min-h-11 flex-1 items-center justify-center border border-border px-3 py-2 text-sm font-semibold hover:border-accent'
              return (
                <li key={product.id}>
                  <article className="flex h-full flex-col border border-border border-t-2 border-t-accent bg-card">
                    <Link href={href} aria-label={`View ${product.name}`} className="relative block aspect-[4/5] bg-[#171619] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:aspect-square">
                      <Image src={product.photos[0]} alt={product.name} fill preload={index === 0} sizes="(min-width: 1152px) 540px, (min-width: 640px) 46vw, 94vw" className="object-contain p-2 sm:p-3" />
                    </Link>
                    <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                      <h2 className="break-words text-lg font-bold sm:text-xl">{product.name}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">{story}</p>
                      <Link href={href} aria-label={`Shop ${product.name} for ${price}`} className="mt-auto flex min-h-12 items-center justify-between gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                        View Product · {price}<ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        {paypal && <Link href={`/checkout/${product.id}`} className={secondaryButton}>Shipping &amp; PayPal</Link>}
                        {depop?.platform === 'Depop' && <a href={depop.url} className={secondaryButton}>Shop on Depop</a>}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
        <Link href="/collections" className="mt-8 inline-flex min-h-11 items-center gap-2 underline underline-offset-4">View full gallery <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
      </main>
      <SiteFooter />
    </>
  )
}
