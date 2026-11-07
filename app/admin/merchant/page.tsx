import Link from 'next/link'
import { QuickAddApparel } from '@/components/quick-add-apparel'

export const metadata = {
  title: 'TRAUMA Merchant', robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'TRAUMA Merchant', statusBarStyle: 'black-translucent' as const },
}

export default function MerchantPage() {
  return <main id="main-content" className="mx-auto min-h-svh max-w-4xl px-4 py-8 md:px-8">
    <Link href="/admin" className="inline-flex min-h-12 items-center underline underline-offset-4">← Business dashboard</Link>
    <p className="eyebrow mt-6">Owner workspace</p>
    <h1 className="section-title">TRAUMA Merchant</h1>
    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Take a photo, add the product details and inventory tag, and save. Your website and TikTok preparation use the same record.</p>
    <QuickAddApparel merchant />
  </main>
}
