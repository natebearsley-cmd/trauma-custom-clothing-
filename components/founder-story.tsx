import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { PAYHIP_SHOP_URL } from '@/lib/site'

const TIMELINE = [
  {
    year: '2020',
    title: 'The Collision',
    body: 'A high-speed head-on collision nearly ended everything. Nathanial survived what most would not.',
  },
  {
    year: 'Rebuild',
    title: 'Titanium Fixation',
    body: 'Reconstructive surgery. Plates, screws, and orthopedic titanium holding the frame together.',
  },
  {
    year: 'Recovery',
    title: 'Out Of The Dark',
    body: 'Walked out of incarceration and addiction. Chose the long road back, one day at a time.',
  },
  {
    year: 'Now',
    title: 'Recovery Coach',
    body: 'Turning survival into service. Every garment carries the story forward for someone still fighting.',
  },
]

const MOTTOS = ['Pain Builds Purpose', 'Respect The Scars', 'Still Breathing']

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
          <h2 className="mt-3 text-balance font-display text-5xl uppercase leading-none text-foreground md:text-7xl">
            Nathanial Bearsley
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {
              "Trauma CC wasn't built in a studio. It was built in hospital beds, cell blocks, and recovery rooms. Every cut, every print, every stitch is proof that the damage doesn't get the final word."
            }
          </p>

          <ol className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
            {TIMELINE.map((item) => (
              <li key={item.title} className="bg-background p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {item.year}
                </p>
                <h3 className="mt-2 font-display text-2xl uppercase text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>

          <ul className="mt-10 flex flex-col gap-2" aria-label="Core mottos">
            {MOTTOS.map((motto) => (
              <li
                key={motto}
                className="flex items-center gap-4 font-display text-3xl uppercase text-foreground md:text-4xl"
              >
                <span className="h-px w-8 bg-accent" aria-hidden="true" />
                {motto}
              </li>
            ))}
          </ul>

          <aside className="mt-10 border border-border bg-card p-6 md:p-8">
            <p className="eyebrow">Books · Digital products · Merchandise</p>
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
