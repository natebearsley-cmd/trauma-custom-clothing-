import { publicPageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { StoreInfo } from '@/components/store-info'
import { PROCESSING_TIME, SHIPPING_ORIGIN, SHIPPING_SERVICES } from '@/lib/shipping'
export const metadata = publicPageMetadata('/shipping')
export default function ShippingPage() {
  return <StoreInfo title="TRAUMA Shipping Policy">
    <section className="space-y-2"><h2 className="text-xl font-bold">Buyer-paid shipping</h2><p>Physical products ship from {SHIPPING_ORIGIN}. The buyer pays shipping, separately from the item price. There is no free-shipping threshold.</p><p>Shipping depends on the packed weight, package dimensions, destination, and selected service. Confirm the final shipping charge at the marketplace checkout or in your written custom-order quote before paying.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Carriers and delivery</h2><ul className="list-inside list-disc">{SHIPPING_SERVICES.map(service => <li key={service}>{service}</li>)}</ul><p>UPS Ground is our default service, with estimated delivery in 3–5 business days after shipment. USPS Ground Advantage is a backup option for lightweight shipments, typically estimated at 2–5 business days after shipment. Carrier estimates are not guaranteed.</p><p>US domestic service only under this policy. Contact TRAUMA before ordering for other destinations.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Processing and tracking</h2><p>{PROCESSING_TIME}. Custom production timing is confirmed with your quote and is separate from transit time. Tracking is included on all physical orders and provided after shipment.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-bold">Digital products</h2><p>Digital products are delivered through Payhip and do not incur physical shipping charges.</p></section>
    <Link href="/contact" className="inline-flex min-h-11 items-center underline underline-offset-4">Contact TRAUMA about shipping</Link>
  </StoreInfo>
}
