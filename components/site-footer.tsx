import { ArrowUpRight } from 'lucide-react'
import { DEPOP_SHOP_URL, TIKTOK_URL } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:px-8">
        <p className="font-display text-6xl uppercase leading-none text-foreground/10 sm:text-8xl md:text-9xl">
          Still Breathing
        </p>
        <div className="flex flex-col gap-6 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {`© ${new Date().getFullYear()} Trauma Custom Clothing. All rights reserved.`}
          </p>
          <ul className="flex flex-wrap gap-6">
            <li>
              <a
                href={DEPOP_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:text-accent"
              >
                Depop · atec911
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:text-accent"
              >
                TikTok · @nateb19841
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
