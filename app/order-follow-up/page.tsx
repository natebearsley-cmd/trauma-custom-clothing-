import Link from 'next/link'
import { InsiderPlacement } from '@/components/insider-placement'
import { StoreInfo } from '@/components/store-info'

export const metadata = {
  title: 'After Your Purchase | TRAUMA Custom Clothing',
  robots: { index: false, follow: true },
}

export default function OrderFollowUp() {
  return <StoreInfo title="After your purchase" label="TRAUMA · Order help">
    <section className="space-y-4 border border-border bg-card p-5 sm:p-7">
      <h2 className="text-xl font-bold">Find your order receipt</h2>
      <p>Check the email or order history from the platform you paid through. If you purchased a digital product through Payhip, use the download link in your Payhip email.</p>
      <p className="text-sm text-muted-foreground">This page does not confirm payment or show order status.</p>
      <Link href="/contact" className="inline-flex min-h-11 items-center underline underline-offset-4">Get order help</Link>
    </section>
    <InsiderPlacement placement="order" />
  </StoreInfo>
}
