import { publicPageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { StoreInfo } from '@/components/store-info'
import { DELIVERY_TIMES, PROCESSING_TIME, SHIPPING_ORIGIN } from '@/lib/shipping'

export const metadata = publicPageMetadata('/faq')

export default function FaqPage() {
  const link = 'underline underline-offset-4'
  return <StoreInfo title="Frequently Asked Questions">
    <section><h2 className="text-xl font-bold">Where do orders ship from?</h2><p className="mt-2">TRAUMA ships from {SHIPPING_ORIGIN}. {PROCESSING_TIME}.</p></section>
    <section><h2 className="text-xl font-bold">When should my order arrive?</h2><p className="mt-2">After shipment, delivery takes an estimated {DELIVERY_TIMES.domestic.transit} within the United States. See our <Link href="/shipping" className={link}>shipping policy</Link> for buyer-paid, weight-based UPS Ground shipping, with USPS Ground Advantage as backup.</p></section>
    <section><h2 className="text-xl font-bold">What if my order arrives damaged or is the wrong item?</h2><p className="mt-2">Contact us within 7 days of delivery. See the <Link href="/returns" className={link}>returns policy</Link> for details.</p></section>
    <section><h2 className="text-xl font-bold">Can I request a custom piece?</h2><p className="mt-2">Yes. Tell us what you have in mind through <Link href="/custom-orders" className={link}>Custom Orders</Link> and we’ll review your request.</p></section>
  </StoreInfo>
}
