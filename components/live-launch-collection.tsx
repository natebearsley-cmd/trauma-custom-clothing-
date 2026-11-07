import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { galleryProducts, type Inventory } from '@/lib/inventory'

const launchSkus = ['PMH-001', 'RTS-001', 'ANX-001', 'UNS-XXL-001', 'RTSH-006']

export function LiveLaunchCollection({ inventory }: { inventory: Inventory }) {
  const products = galleryProducts(inventory, 'all', '', 'available')
    .filter((product) => launchSkus.includes(product.sku ?? ''))
    .sort((a, b) => launchSkus.indexOf(a.sku!) - launchSkus.indexOf(b.sku!))
  if (!products.length) return null
  return <section id="live-launch" className="mx-auto max-w-7xl px-4 py-12 md:px-8" aria-labelledby="live-launch-heading">
    <h2 id="live-launch-heading" className="font-display text-4xl uppercase">Featured Live Collection</h2>
    <p className="mt-3 text-muted-foreground">Original TRAUMA pieces. One of each available.</p>
    <Link href="/collections/live-launch" className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4">Shop the featured collection</Link>
    <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</ul>
  </section>
}
