'use client'

import { useRef, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function FeaturedPiecesRail({ children, count }: { children: ReactNode; count: number }) {
  const rail = useRef<HTMLUListElement>(null)

  function move(direction: -1 | 1) {
    const list = rail.current
    const first = list?.children[0]
    const second = list?.children[1]
    if (!list || !first || !second) return
    const distance = second.getBoundingClientRect().left - first.getBoundingClientRect().left
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    list.scrollBy({ left: direction * distance, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const buttonClass = 'inline-flex size-11 items-center justify-center border border-border bg-card text-foreground hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'

  return (
    <div className="mt-6">
      {count > 1 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Swipe or use the arrows to browse.</p>
          <div className="flex shrink-0 gap-2">
            <button type="button" aria-label="Previous featured piece" aria-controls="featured-pieces-rail" onClick={() => move(-1)} className={buttonClass}><ArrowLeft aria-hidden="true" className="size-5" /></button>
            <button type="button" aria-label="Next featured piece" aria-controls="featured-pieces-rail" onClick={() => move(1)} className={buttonClass}><ArrowRight aria-hidden="true" className="size-5" /></button>
          </div>
        </div>
      )}
      <ul id="featured-pieces-rail" ref={rail} className="grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-4 overflow-x-auto px-1 pb-4 pt-1 sm:auto-cols-[44%] lg:auto-cols-[calc((100%-2rem)/3)] [&>li]:snap-start [&>li]:scroll-ms-1">
        {children}
      </ul>
    </div>
  )
}
