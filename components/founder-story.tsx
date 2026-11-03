import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PAYHIP_SHOP_URL } from '@/lib/site'

const STORY = [
  "I never expected my life to look the way it does today.",
  "I have experienced incarceration, addiction, recovery, trauma, loss, financial struggles, and the challenge of rebuilding my life from the ground up.",
  "I survived a severe head-on collision, became a recovery coach, returned to college, built a brand, and continue caring for my mother as she battles dementia.",
  "There were many times I could have given up. I chose to keep moving forward.",
  "TRAUMA was never created to celebrate pain. It was created to show that pain does not get the final word.",
  "Every garment, every design, every book, and every project represents resilience, growth, recovery, and the belief that our past does not define our future.",
  "If my story helps even one person find hope, every struggle was worth it.",
]

export function FounderStory() {
  return (
    <section
      id="story"
      className="scroll-mt-20 border-b border-border py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="grain relative aspect-[4/5] overflow-hidden border border-border">
            <Image
              src="/images/titanium-xray.png"
              alt="X-ray showing orthopedic titanium plates and screws fixing a reconstructed bone"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {'Fig. 01 — Orthopedic titanium. Held together, never broken.'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
            Founder · Author · Recovery Coach · Entrepreneur
          </p>
          <h2 className="mt-3 text-balance font-display text-5xl uppercase leading-none text-foreground md:text-7xl">The Story Behind TRAUMA</h2>
          <h3 className="mt-6 font-display text-3xl uppercase text-accent">Built From Strength. Built By Struggle.</h3>
          <div className="mt-6 max-w-2xl space-y-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {STORY.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className="mt-6 font-semibold">— Nathanial Bearsley</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/collections" className="inline-flex min-h-12 items-center justify-center bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent">Explore TRAUMA Collections</Link>
            <Link href="/custom-orders" className="inline-flex min-h-12 items-center justify-center border border-input px-5 py-3 text-sm font-semibold hover:border-accent">Request Custom Piece</Link>
          </div>

          <aside className="mt-10 border border-border bg-card p-6 md:p-8">
            <p className="eyebrow">Books · Guides · Digital products</p>
            <h3 className="mt-3 font-display text-3xl uppercase">
              Continue the story
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Explore Nathanial’s existing releases on Payhip. Purchases and
              payments are handled on Payhip.
            </p>
            <a
              href={PAYHIP_SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
            >
              Explore on Payhip
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </aside>
        </div>
      </div>
    </section>
  )
}
