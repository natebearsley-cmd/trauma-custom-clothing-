import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StoreInfo } from '@/components/store-info'
import { galleryProducts, paypalDestination, productDestination } from '@/lib/inventory'
import { inventory } from '@/lib/inventory-store'
import { DELIVERY_TIMES, PROCESSING_TIME, SHIPPING_ORIGIN, shippingEstimate, usd } from '@/lib/shipping'

export const metadata = { title: 'PayPal Checkout | TRAUMA', robots: { index: false, follow: false } }

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = galleryProducts(inventory, 'apparel', '', 'available').find((item) => item.id === id)
  if (!product) notFound()
  const paypal = paypalDestination(product)
  if (!paypal) notFound()
  const marketplace = productDestination(product)
  const rate = shippingEstimate(product)
  return <StoreInfo title="Review before PayPal" label="TRAUMA · Checkout">
    <section className="space-y-4 border border-border bg-card p-5 sm:p-7">
      <h2 className="text-xl font-bold">{product.name}</h2>
      <p>Ships from {SHIPPING_ORIGIN}. Tracking included. {PROCESSING_TIME}.</p>
      <dl className="space-y-2">
        {product.price !== null && <div className="flex justify-between gap-4"><dt>Item price</dt><dd>{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}</dd></div>}
        <div className="flex justify-between gap-4"><dt>Store shipping estimate</dt><dd>{rate === 0 ? 'No physical shipping' : rate !== null ? usd(rate) : 'Buyer-paid UPS Ground quote required'}</dd></div>
        {Object.values(DELIVERY_TIMES).map(({label, fromOrder}) => <div key={label} className="flex justify-between gap-4"><dt>{label} delivery</dt><dd>{fromOrder} from order</dd></div>)}
      </dl>
      <p className="text-sm text-muted-foreground">The item price excludes shipping. Request a shipping-inclusive total before paying through PayPal. This page does not collect payment or reserve stock. You can also complete your purchase on Depop, where the listing and checkout confirm availability and final charges.</p>
      <div className="flex flex-wrap gap-4">
        <a href={`/contact?product=${encodeURIComponent(product.id)}`} className="inline-flex min-h-12 items-center bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent">Confirm shipping before payment</a>
        {marketplace && <a href={marketplace.url} className="inline-flex min-h-12 items-center border border-input px-5 py-3 font-semibold hover:border-accent">View listing on {marketplace.platform}</a>}
        <Link href="/shipping" className="inline-flex min-h-12 items-center underline underline-offset-4">Shipping policy</Link>
      </div>
    </section>
    <Link href={`/products/${product.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">← Back to this piece</Link>
  </StoreInfo>
}
