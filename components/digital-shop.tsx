import { ArrowUpRight } from 'lucide-react'
import { PAYHIP_SHOP_URL } from '@/lib/site'

const digitalProducts = [
  { title: 'The Rebuild Bundle — Journal + Wallpaper Pack', url: 'https://payhip.com/b/gaKDk' },
  { title: 'Bent, Not Broken — Coloring & Activity Book', url: 'https://payhip.com/b/DXYTk' },
  { title: '30 Days of Rebuilding — A Raw Guided Journal', url: 'https://payhip.com/b/FL5sw' },
  { title: 'Built From Trauma — Wallpaper Pack Vol. 1', url: 'https://payhip.com/b/SnC9J' },
  { title: 'The Reversal Guide', url: 'https://payhip.com/b/NwoV2' },
]

export function DigitalShop() {
  return (
    <section id="books-digital" aria-labelledby="books-digital-heading" className="scroll-mt-24 border-b border-border py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="border-l-2 border-accent pl-5">
          <h2 id="books-digital-heading" className="section-title">Books &amp; Digital Products</h2>
          <p className="mt-4 text-muted-foreground">Browse journals, books, and downloads. Checkout is on Payhip.</p>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {digitalProducts.map(({ title, url }) => (
            <li key={url}>
              <a href={url} className="flex h-full min-h-24 items-center justify-between gap-4 border border-border bg-card p-5 font-semibold hover:border-accent">
                {title}<ArrowUpRight className="size-4 shrink-0 text-accent" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <a href={PAYHIP_SHOP_URL} className="mt-5 inline-flex min-h-12 items-center underline underline-offset-4">Visit the Payhip shop</a>
      </div>
    </section>
  )
}
