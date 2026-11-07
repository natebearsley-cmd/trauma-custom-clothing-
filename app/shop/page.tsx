import { redirect } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PayPalProductGrid } from '@/components/paypal-product-grid'
import { paypalShopProducts } from '@/lib/commerce'
import { inventory } from '@/lib/inventory-store'
import { publicPageMetadata } from '@/lib/seo'

export const metadata = publicPageMetadata('/shop')

export default function ShopPage() {
  const products = paypalShopProducts(inventory)
  if (!products.length) redirect('/collections')
  return <><SiteHeader /><main id="main-content" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
    <p className="eyebrow">Respect the scars. Wear your story.</p>
    <h1 className="section-title">Shop Now</h1>
    <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Original TRAUMA pieces. Choose your piece and buy securely with PayPal.</p>
    <p className="mt-3 text-sm text-muted-foreground">Ships from Albany, Illinois.</p>
    <PayPalProductGrid products={products} priority />
  </main><SiteFooter /></>
}
