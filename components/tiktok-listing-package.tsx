'use client'
import { useState } from 'react'
import type { generateTikTokListing } from '@/lib/tiktok-shop'

export type TikTokListing = NonNullable<ReturnType<typeof generateTikTokListing>>
const button = 'inline-flex min-h-11 items-center justify-center border border-input px-4 py-2 text-sm font-semibold hover:border-accent'

export function TikTokListingPackage({ listing }: { listing: TikTokListing }) {
  const [message, setMessage] = useState('')
  const [manualCopy, setManualCopy] = useState<{ label: string; value: string } | null>(null)
  const fields = [
    ['TikTok Shop title', listing.title], ['TikTok Shop description', listing.description],
    ['Inventory category', listing.category], ['Price', listing.price], ['Product bullets', listing.bullets.map((x) => `• ${x}`).join('\n')],
    ['SEO keywords', listing.keywords.join(', ')], ['Hashtags', listing.hashtags.join(' ')],
    ['Social media caption', listing.caption],
  ].filter(([, value]) => value)
  async function copy(label: string, value: string) {
    try { await navigator.clipboard.writeText(value); setManualCopy(null); setMessage(`Copied ${label}.`) }
    catch { setManualCopy({ label, value }); setMessage('Select and copy the text below.') }
  }
  return <section aria-label="TikTok listing package" className="mt-6 min-w-0 border-l-2 border-accent pl-4 sm:pl-6">
    <h3 className="text-xl font-semibold">TikTok listing package</h3>
    <p className="mt-2 text-sm text-muted-foreground">Review before posting. Use the hashtags and caption for social posts.</p>
    <button type="button" className={`${button} mt-4`} onClick={() => copy('the package', fields.map(([key, value]) => `${key}\n${value}`).join('\n\n'))}>Copy full package</button>
    <p role="status" className="mt-2 text-sm text-muted-foreground">{message}</p>
    {manualCopy && <textarea readOnly aria-label={manualCopy.label} value={manualCopy.value} onFocus={(e) => e.currentTarget.select()} rows={7} className="mt-3 w-full border border-input bg-background p-3 text-base" />}
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      {fields.map(([label, value]) => <div key={label} className={`min-w-0 border border-border bg-background p-4 ${label === 'TikTok Shop description' ? 'sm:col-span-2' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><dt className="font-semibold">{label}</dt><button type="button" aria-label={`Copy ${label}`} className={button} onClick={() => copy(label, value)}>Copy</button></div>
        <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{value}</dd>
      </div>)}
    </dl>
  </section>
}
