import Image from 'next/image'
import { ArrowDown } from 'lucide-react'
import { BRAND_DESCRIPTION, BRAND_TAGLINE } from '@/lib/brand'

export function Hero() {
  return (
    <section
      id="top"
      className="grain relative isolate overflow-hidden border-b border-border"
    >
      <Image
        src="/images/hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/20"
      />

      <div className="mx-auto flex min-h-[78svh] max-w-7xl flex-col justify-end px-4 pb-12 pt-14 md:pt-28 md:px-8 md:pb-24">
        <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
          <span className="h-px w-10 bg-accent" aria-hidden="true" />
          TRAUMA CUSTOM CLOTHING
        </p>

        <h1 className="max-w-5xl text-balance font-display text-5xl uppercase leading-[0.9] tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-[7rem]">
          <span className="block">Built From Trauma.</span>
          <span className="block">Never Broke.</span>
          <span className="block text-accent">Just Bent.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {BRAND_DESCRIPTION}
        </p>
        <p className="mt-3 text-lg font-semibold text-accent">{BRAND_TAGLINE}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="/collections" className="inline-flex min-h-12 items-center justify-center bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent">
            Shop Collection
          </a>
          <a href="#story" className="inline-flex min-h-12 items-center justify-center gap-2 border border-foreground/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background">
            Our Story <ArrowDown className="size-4" aria-hidden="true" />
          </a>
      </div>
      </div>

      <div
        className="overflow-hidden border-t border-border bg-primary py-3"
        aria-hidden="true"
      >
        <p className="whitespace-nowrap font-display text-lg uppercase tracking-[0.2em] text-primary-foreground">
          {Array.from({ length: 6 })
            .map(
              () =>
                'Pain Builds Purpose  ✕  Respect The Scars  ✕  Still Breathing  ✕  ',
            )
            .join('')}
        </p>
      </div>
    </section>
  )
}
