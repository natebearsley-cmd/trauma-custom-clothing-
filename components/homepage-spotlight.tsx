import Link from 'next/link'
import { GalleryCard } from '@/components/gallery-card'
import { homepageSpotlightProduct, type Inventory } from '@/lib/inventory'

export function HomepageSpotlight({ inventory }: { inventory: Inventory }) {
  const product = homepageSpotlightProduct(inventory)
  if (!product) return null
  return <section id="hero-collection" aria-labelledby="hero-collection-heading" className="scroll-mt-24 border-b border-border bg-card py-16 md:py-24"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:px-8 lg:gap-20"><div><p className="eyebrow">Homepage Spotlight</p><h2 id="hero-collection-heading" className="section-title">Hero Pieces</h2><h3 className="mt-5 break-words font-display text-4xl uppercase md:text-5xl">{product.name}</h3><p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p><Link href={`/products/${product.id}`} className="mt-8 inline-flex min-h-12 items-center border border-input px-6 py-3 font-semibold hover:border-accent">Explore the piece</Link></div><ul><GalleryCard product={product} /></ul></div></section>
}
