'use client'

import { useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { DEPOP_DROP_URL, DEPOP_SHOP_URL } from '@/lib/site'

const NAV = [
  { label: 'Drops', href: '#drops' },
  { label: 'Story', href: '#story' },
  { label: 'Custom 1-of-1', href: '#custom' },
  { label: 'Depop Shop', href: DEPOP_SHOP_URL, external: true },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8">
        <a href="#top" className="flex flex-col leading-none" aria-label="TRAUMA CC home">
          <span className="font-display text-2xl tracking-wide text-foreground md:text-3xl">
            TRAUMA <span className="text-accent">CC</span>
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Trauma Custom Clothing
          </span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={DEPOP_DROP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent sm:inline-flex"
          >
            Shop Depop Drop
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center border border-border text-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="block border-b border-border/60 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="py-4">
              <a
                href={DEPOP_DROP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground"
              >
                Shop Depop Drop
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
