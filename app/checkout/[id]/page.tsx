import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StoreInfo } from '@/components/store-info'
import { galleryProducts, paypalDestination } from '@/lib/inventory'
import { inventory } from '@/lib/inventory-store'
import { DELIVERY_TIMES, PROCESSING_TIME, SHIPPING_ORIGIN, shippingEstimate, usd } from '@/lib/shipping'

export const metadata = { title: 'PayPal Checkout | TRAUMA', robots: { index: false, follow: false } }

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = galleryProducts(inventory, 'apparel', '', 'available').find((item) => item.id === id)
  if (!product) notFound()
  const paypal = paypalDestination(product)
  if (!paypal) notFound()
  const rate = shippingEstimate(product)
  return <StoreInfo title="Review before PayPal" label="TRAUMA · Checkout">
    <section className="space-y-4 border border-border bg-card p-5 sm:p-7">
      <h2 className="text-xl font-bold">{product.name}</h2>
      <p>Ships from {SHIPPING_ORIGIN}. Processing: {PROCESSING_TIME}.</p>
      <dl className="space-y-2">
        {product.price !== null && <div className="flex justify-between gap-4"><dt>Item price</dt><dd>{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}</dd></div>}
        <div className="flex justify-between gap-4"><dt>Store shipping estimate</dt><dd>{rate === 0 ? 'Free shipping' : rate !== null ? usd(rate) : 'Confirm with TRAUMA'}</dd></div>
        {Object.values(DELIVERY_TIMES).map(({label, fromOrder}) => <div key={label} className="flex justify-between gap-4"><dt>{label} delivery</dt><dd>{fromOrder} from order</dd></div>)}
      </dl>
      <p className="text-sm text-muted-foreground">Confirm your shipping destination and the final total before paying in PayPal.</p>
      <div className="flex flex-wrap gap-4">
        <a href={paypal} className="inline-flex min-h-12 items-center bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent">Continue to PayPal</a>
        <Link href="/shipping" className="inline-flex min-h-12 items-center underline underline-offset-4">Shipping policy</Link>
      </div>
    </section>
    <Link href={`/products/${product.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">← Back to this piece</Link>
  </StoreInfo>
}
