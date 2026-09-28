'use client'

import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { DEPOP_SHOP_URL, TIKTOK_URL } from '@/lib/site'

const GARMENT_TYPES = ['Acid-Wash Denim', 'Heavyweight Hoodie', 'Custom Patchwork'] as const
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const

const fieldClass =
  'w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40'
const labelClass = 'text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground'

type Status = 'idle' | 'copied' | 'manual'

export function CustomInquiry() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const brief = [
      'TRAUMA CC — CUSTOM 1-OF-1 INQUIRY',
      `Name: ${String(data.get('name')).trim()}`,
      `Email: ${String(data.get('email')).trim()}`,
      `Garment: ${data.get('garment')}`,
      `Size: ${data.get('size')}`,
      `Vision: ${String(data.get('vision')).trim()}`,
    ].join('\n')

    setMessage(brief)
    try {
      await navigator.clipboard.writeText(brief)
      setStatus('copied')
    } catch {
      setStatus('manual')
    }
  }

  return (
    <section id="custom" className="scroll-mt-20 border-b border-border py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Custom 1-of-1</p>
          <h2 className="mt-3 text-balance font-display text-5xl uppercase leading-none text-foreground md:text-7xl">
            Wear Your Story
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            {
              'One garment. One owner. Tell Nathanial what you survived and what you want to carry. Every commission is hand-built and never repeated.'
            }
          </p>
          <ol className="mt-10 flex flex-col gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <li className="flex gap-4">
              <span className="text-accent">01</span> Fill out the brief
            </li>
            <li className="flex gap-4">
              <span className="text-accent">02</span> {"We'll copy it for you"}
            </li>
            <li className="flex gap-4">
              <span className="text-accent">03</span> Send it via TikTok or Depop DM
            </li>
          </ol>
        </div>

        <div className="lg:col-span-7">
          {status === 'idle' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 border border-border bg-card p-6 md:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="inq-name" className={labelClass}>
                    Name
                  </label>
                  <input id="inq-name" name="name" required maxLength={80} autoComplete="name" className={fieldClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="inq-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="inq-email"
                    name="email"
                    type="email"
                    required
                    maxLength={120}
                    autoComplete="email"
                    className={fieldClass}
                  />
                </div>
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className={`${labelClass} mb-3`}>Garment Type</legend>
                <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
                  {GARMENT_TYPES.map((type, index) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-3 bg-background px-4 py-4 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
                    >
                      <input
                        type="radio"
                        name="garment"
                        value={type}
                        required
                        defaultChecked={index === 0}
                        className="sr-only"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <label htmlFor="inq-size" className={labelClass}>
                  Sizing
                </label>
                <select id="inq-size" name="size" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Select a size
                  </option>
                  {SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="inq-vision" className={labelClass}>
                  Project Vision
                </label>
                <textarea
                  id="inq-vision"
                  name="vision"
                  required
                  rows={5}
                  maxLength={1500}
                  placeholder="Graphics, phrases, colors, the story behind it..."
                  className={`${fieldClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-primary-foreground transition-colors hover:bg-accent"
              >
                Submit Inquiry
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <div role="status" className="flex flex-col gap-6 border border-primary/60 bg-card p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                  {status === 'copied' ? (
                    <Check className="size-6" aria-hidden="true" />
                  ) : (
                    <Copy className="size-6" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-3xl uppercase text-foreground">
                    {status === 'copied' ? 'Brief Copied' : 'Copy Your Brief'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {status === 'copied'
                      ? 'Paste it into a DM to Nathanial to lock in your 1-of-1.'
                      : 'Select and copy the brief below, then send it in a DM.'}
                  </p>
                </div>
              </div>

              <pre className="max-h-64 overflow-auto whitespace-pre-wrap border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
                {message}
              </pre>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent"
                >
                  DM On TikTok
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href={DEPOP_SHOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  Message On Depop
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="self-start text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Edit Inquiry
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
