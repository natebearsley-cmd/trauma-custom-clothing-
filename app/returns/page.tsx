import Link from 'next/link'
import { StoreInfo } from '@/components/store-info'

export const metadata = { title: 'Returns Policy | TRAUMA Custom Clothing', alternates: { canonical: '/returns' } }

export default function ReturnsPage() {
  return <StoreInfo title="TRAUMA Returns Policy">
    <div className="space-y-4 border-l-2 border-accent pl-5">
      <p>Because many TRAUMA items are custom, handmade, or one-of-one pieces, all sales are final unless the item arrives damaged or the wrong item was received.</p>
      <p>Please contact us within <strong>7 days of delivery</strong> for any order issues.</p>
    </div>
    <p>Include your order number and a short description of the issue. If you purchased on a marketplace, use that marketplace’s order support.</p>
    <Link href="/contact" className="inline-flex min-h-11 items-center underline underline-offset-4">Contact TRAUMA</Link>
  </StoreInfo>
}
