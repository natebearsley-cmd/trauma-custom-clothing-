import Link from 'next/link'
import { TikTokShopDashboard } from '@/components/tiktok-shop-dashboard'

export const metadata = { title: 'TikTok Shop Prep | TRAUMA Admin', robots: { index: false, follow: false } }

export default function TikTokShopPage() {
  return <main id="main-content" className="mx-auto min-h-svh max-w-7xl px-4 py-10 md:px-8">
    <Link href="/admin" className="inline-flex min-h-11 items-center underline underline-offset-4">Back to TRAUMA Admin</Link>
    <p className="eyebrow mt-5">TRAUMA Custom Clothing</p>
    <h1 className="section-title">TikTok Shop Prep</h1>
    <p className="mt-4 max-w-2xl text-muted-foreground">Prepare listings and video captions from your real inventory. Copy approved details into Seller Center when you’re ready.</p>
    <TikTokShopDashboard />
  </main>
}
