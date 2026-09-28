import Image from 'next/image'
import { ArrowDown } from 'lucide-react'

export function Hero() {
  return (
    <section id="top" className="grain relative isolate overflow-hidden border-b border-border">
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

      <div className="mx-auto flex min-h-[88svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-8 md:pb-24">
        <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
          <span className="h-px w-10 bg-accent" aria-hidden="true" />
          Est. From The Wreckage
        </p>

        <h1 className="max-w-5xl text-balance font-display text-6xl uppercase leading-[0.9] tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-9xl">
          Built From Trauma.{' '}
          <span className="text-accent">Never Broke</span> Just Bent.
        </h1>

        <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Streetwear forged through survival, orthopedic titanium, and resilience. 1-of-1 cuts &amp;
          limited garments.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#drops"
            className="inline-flex items-center justify-center gap-2 bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent"
          >
            Explore Drop
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
          <a
            href="#story"
            className="inline-flex items-center justify-center border border-foreground/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            Our Story
          </a>
        </div>
      </div>

      <div className="overflow-hidden border-t border-border bg-primary py-3" aria-hidden="true">
        <p className="whitespace-nowrap font-display text-lg uppercase tracking-[0.2em] text-primary-foreground">
          {Array.from({ length: 6 })
            .map(() => 'Pain Builds Purpose  ✕  Respect The Scars  ✕  Still Breathing  ✕  ')
            .join('')}
        </p>
      </div>
    </section>
  )
}
