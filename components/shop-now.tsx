import Link from 'next/link'
import { PayPalProductGrid } from '@/components/paypal-product-grid'
import { paypalShopProducts } from '@/lib/commerce'
import type { Inventory } from '@/lib/inventory'

export function ShopNow({ inventory }: { inventory: Inventory }) {
  const products = paypalShopProducts(inventory)
  if (!products.length) return null
  return <section id="shop-now" aria-labelledby="shop-now-heading" className="border-b border-border py-12 md:py-20">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-accent pl-5">
        <h2 id="shop-now-heading" className="section-title">Shop Now</h2>
        <Link href="/shop" className="inline-flex min-h-12 items-center underline underline-offset-4">Shop all available pieces</Link>
      </div>
      <PayPalProductGrid products={products.slice(0, 6)} />
    </div>
  </section>
}
