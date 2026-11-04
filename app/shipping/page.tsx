import Link from 'next/link'
import { StoreInfo } from '@/components/store-info'
import { DELIVERY_TIMES, PROCESSING_TIME, SHIPPING_ORIGIN, SHIPPING_RATES, usd } from '@/lib/shipping'

export const metadata = { title: 'Shipping Policy | TRAUMA Custom Clothing', alternates: { canonical: '/shipping' } }

export default function ShippingPage() {
  return <StoreInfo title="TRAUMA Shipping Policy">
    <section className="space-y-2"><h2 className="text-xl font-bold">Processing time</h2><p>Ships from {SHIPPING_ORIGIN}.</p><p>{PROCESSING_TIME} before shipment.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Estimated time in transit</h2>
      <dl className="space-y-1">{Object.values(DELIVERY_TIMES).map(({label, transit}) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd>{transit}</dd></div>)}</dl>
    </section>
    <section><h2 className="mb-3 text-xl font-bold">Shipping rates</h2>
      <dl className="divide-y divide-border border border-border bg-card">{SHIPPING_RATES.map(({id, label, cents}) => <div key={id} className="flex justify-between gap-4 px-4 py-3"><dt>{label}</dt><dd className="font-semibold">{usd(cents)}</dd></div>)}
        <div className="flex justify-between gap-4 px-4 py-3"><dt>Orders over $100</dt><dd className="font-semibold text-accent">Free shipping</dd></div>
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">For orders placed on a marketplace, confirm shipping at that marketplace’s checkout.</p>
    </section>
    <Link href="/faq" className="inline-flex min-h-11 items-center underline underline-offset-4">See the FAQ</Link>
  </StoreInfo>
}
