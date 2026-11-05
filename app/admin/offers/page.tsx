import Link from 'next/link'
import { OfferCalculator } from '@/components/offer-calculator'

export const metadata = { title: 'Offer Guardrails | TRAUMA Admin', robots: { index: false, follow: false } }

export default function OfferPage() {
  return <main id="main-content" className="mx-auto min-h-svh max-w-4xl px-4 py-10 md:px-8">
    <Link href="/admin" className="inline-flex min-h-11 items-center underline underline-offset-4">Back to TRAUMA Admin</Link>
    <p className="eyebrow mt-5">TRAUMA Custom Clothing</p>
    <h1 className="section-title">Offer Guardrails</h1>
    <p className="mt-4 text-muted-foreground">Calculate a floor before accepting an offer. The calculator does not save costs, send offers or change any listings.</p>
    <OfferCalculator />
    <p className="mt-6 max-w-2xl text-sm text-muted-foreground">Depop’s auto-response counters lower offers at your set floor. Leave it off if you want to review midrange offers or protect a one-of-one piece.</p>
  </main>
}
