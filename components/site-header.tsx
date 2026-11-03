'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { PAYHIP_SHOP_URL } from '@/lib/site'

const NAV = [
  { label: 'Products', href: '#featured' },
  { label: 'Apparel', href: '#featured-apparel' },
  { label: 'Collections', href: '/collections' },
  { label: 'Story', href: '#story' },
  { label: 'Custom', href: '#custom' },
  { label: 'JourneyVault', href: '#journeyvault' },
  { label: 'Payhip Shop', href: PAYHIP_SHOP_URL, external: true },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <a
          href="/#top"
          className="flex flex-col leading-none"
          aria-label="TRAUMA CC home"
        >
          <span className="font-display text-2xl tracking-wide text-foreground md:text-3xl">
            TRAUMA <span className="text-accent">CC</span>
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Trauma Custom Clothing
          </span>
        </a>

        <nav aria-label="Primary" className="hidden 2xl:block">
          <ul className="flex items-center gap-5">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href.startsWith('#') ? `/${item.href}` : item.href}
                  {...(item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
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
            href={PAYHIP_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent lg:inline-flex"
          >
            Shop on Payhip
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            ref={toggle}
            className="inline-flex size-11 items-center justify-center border border-border text-foreground 2xl:hidden"
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
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="max-h-[75svh] overflow-y-auto border-t border-border 2xl:hidden"
        >
          <ul className="flex flex-col px-4 py-2">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href.startsWith('#') ? `/${item.href}` : item.href}
                  onClick={() => setOpen(false)}
                  {...(item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="block border-b border-border/60 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="py-4">
              <a
                href={PAYHIP_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground"
              >
                Shop on Payhip
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
