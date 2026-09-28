'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEPOP_DROP_URL, PRODUCTS, type Category } from '@/lib/site'

const FILTERS: Array<'All' | Category> = ['All', 'Tops', 'Outerwear', 'Headwear']

export function ProductShowcase() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const visible = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)

  return (
    <section id="drops" className="scroll-mt-20 border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
              Current Drop
            </p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-foreground md:text-7xl">
              The Inventory
            </h2>
          </div>

          <div role="group" aria-label="Filter products by category" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  'border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors',
                  filter === f
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, i) => (
            <li key={product.id} className="group flex flex-col bg-background">
              <div className="relative aspect-square overflow-hidden bg-card">
                <Image
                  src={product.image}
                  alt={product.name.replaceAll('"', '')}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover grayscale-[35%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
                <span className="absolute left-3 top-3 bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {String(i + 1).padStart(2, '0')} / {product.category}
                </span>
                {product.oneOfOne && (
                  <span className="absolute right-3 top-3 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
                    1-of-1
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
                <h3 className="text-pretty text-lg font-semibold leading-snug text-foreground">
                  {product.name}
                </h3>
                <ul className="flex flex-wrap gap-2" aria-label="Details">
                  {product.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-border px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <a
                  href={DEPOP_DROP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 border border-foreground/30 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Buy on Depop
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">{`- ${product.name} (opens in new tab)`}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
