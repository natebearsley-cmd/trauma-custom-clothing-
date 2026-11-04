import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export function StoreInfo({ title, label = 'TRAUMA · Order information', children }: { title: string; label?: string; children: React.ReactNode }) {
  return <><SiteHeader /><main id="main-content" className="mx-auto min-h-[55vh] max-w-4xl px-4 py-12 md:px-8 md:py-20">
    <Link href="/#top" className="mb-7 inline-flex min-h-11 items-center text-sm underline underline-offset-4">← Back to TRAUMA</Link>
    <p className="eyebrow">{label}</p>
    <h1 className="section-title mt-3">{title}</h1>
    <div className="mt-8 space-y-7 leading-relaxed">{children}</div>
  </main><SiteFooter /></>
}
