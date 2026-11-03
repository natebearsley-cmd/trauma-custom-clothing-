import Link from 'next/link'
import { QuickAddApparel } from '@/components/quick-add-apparel'
export const metadata = { title: 'Quick Add Product | TRAUMA', robots: { index: false, follow: false } }
export default function QuickAddPage() {
  return <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 md:px-8"><Link href="/admin" className="inline-flex min-h-11 items-center underline underline-offset-4">← Business dashboard</Link><p className="eyebrow mt-6">TRAUMA · No coding required</p><h1 className="section-title">Quick Add Product</h1><p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">Paste your listing, choose your photos, select a category, and save. Your product page and collection placement are handled automatically when you approve publishing.</p><QuickAddApparel /></main>
}
