import Link from 'next/link'
import { StoreInfo } from '@/components/store-info'
import { CONTACT_EMAIL, CONTACT_EMAIL_URL } from '@/lib/contact'
export const metadata = { title: 'Contact TRAUMA | Orders & Custom Clothing', description: 'Contact TRAUMA Custom Clothing about your order, custom apparel, or shipping from Albany, Illinois.', alternates: { canonical: '/contact' } }
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams
  const productId = typeof product === 'string' && /^[a-z0-9-]{1,100}$/.test(product) ? product : null
  const subject = productId ? `Shipping quote: ${productId}` : 'TRAUMA order inquiry'
  const body = 'Name:\nProduct or order reference:\nDestination ZIP code (for shipping):\nPreferred service (UPS Ground by default; USPS Ground Advantage backup):\nMessage:\n'
  return <StoreInfo title="Contact TRAUMA">
    <section className="space-y-4"><h2 className="text-2xl font-bold">Orders, shipping &amp; support</h2><p>Email your question, order reference, or the piece you are interested in. For a shipping quote, include your destination ZIP code and preferred carrier service. Please do not send card details or passwords.</p>
      <a href={`${CONTACT_EMAIL_URL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`} className="inline-flex min-h-12 items-center bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent">Email TRAUMA</a><p className="break-all">{CONTACT_EMAIL}</p><p className="text-sm text-muted-foreground">This opens your email app. Send the message there to contact TRAUMA. An order is confirmed only after availability, shipping, total price, and payment are agreed.</p></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">Custom clothing</h2><p>Build a custom quote request with your sizes, quantities, story, and artwork details.</p><Link href="/custom-orders" className="inline-flex min-h-11 items-center underline underline-offset-4">Request a custom piece</Link></section>
    <Link href="/shipping" className="inline-flex min-h-11 items-center underline underline-offset-4">Shipping policy</Link>
  </StoreInfo>
}
