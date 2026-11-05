'use client'

import { useState, type FormEvent } from 'react'
import { offerDecision, offerThresholds } from '@/lib/offers'

const decisionLabels = {
  'missing-input': 'Enter an offer amount to see how it would be handled.',
  'decline': 'Decline: below 75% of list price or below your margin floor.',
  'review': 'Review manually.',
  'auto-accept-candidate': 'Eligible for auto-accept if the marketplace supports your chosen rules.',
}

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const usd = (cents: number) => dollars.format(cents / 100)
const money = (value: FormDataEntryValue | null) => typeof value === 'string' && /^\d+(?:\.\d{1,2})?$/.test(value.trim())
  ? Math.round(Number(value) * 100) : NaN

export function OfferCalculator() {
  const [result, setResult] = useState<{
    thresholds: NonNullable<ReturnType<typeof offerThresholds>>
    decision: keyof typeof decisionLabels
  } | null>(null)
  const [error, setError] = useState('')
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const inputs = {
      listCents: money(form.get('list')),
      costCents: money(form.get('cost')),
      targetCents: money(form.get('target')),
      feeBasisPoints: money(form.get('fee')),
      oneOfOne: form.get('one-of-one') === 'on',
    }
    const thresholds = offerThresholds(inputs)
    setError(thresholds ? '' : 'Enter the list price, all costs, percent fees and target profit before setting an offer floor.')
    setResult(thresholds ? { thresholds, decision: offerDecision(inputs, money(form.get('offer'))) } : null)
  }
  return <div className="mt-8 max-w-2xl border border-border bg-card p-5 sm:p-7">
    <form onSubmit={calculate} onChange={() => { setResult(null); setError('') }} className="grid gap-4 sm:grid-cols-2">
      {([
        ['list', 'Current list price ($)', '0.01', '1000000', true],
        ['cost', 'All fixed costs per sale ($)', '0', '1000000', true],
        ['target', 'Minimum profit after costs ($)', '0', '1000000', true],
        ['fee', 'Variable platform + affiliate fees (%)', '0', '99.99', true],
        ['offer', 'Buyer offer ($), optional', '0', '1000000', false],
      ] as const).map(([name, label, min, max, required]) =>
        <label key={name} className="grid gap-2 text-sm font-semibold">{label}
          <input name={name} type="number" inputMode="decimal" step="0.01" min={min} max={max}
            required={required} className="min-h-12 w-full min-w-0 border border-input bg-background px-3 text-base font-normal" />
        </label>)}
      <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
        <input name="one-of-one" type="checkbox" defaultChecked className="size-5" />One-of-one or custom
      </label>
      <p className="text-sm text-muted-foreground sm:col-span-2">Count the garment, labor, packaging, flat fees, seller-paid shipping and any return allowance in fixed costs. Enter actual fees for the platform you’re using.</p>
      <button className="min-h-12 bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground sm:col-span-2">Calculate offer floors</button>
    </form>
    <div aria-live="polite">
      {error && <p className="mt-4 text-accent">{error}</p>}
      {result && <div className="mt-5 space-y-2 border-t border-border pt-5">
        <p>Margin floor: <strong>{usd(result.thresholds.marginFloor)}</strong></p>
        <p>Review from: <strong>{usd(result.thresholds.reviewFloor)}</strong></p>
        <p>Auto-accept threshold: <strong>{result.thresholds.autoFloor === null ? 'Keep off' : usd(result.thresholds.autoFloor)}</strong></p>
        <p className="text-accent">{decisionLabels[result.decision]}</p>
      </div>}
    </div>
  </div>
}
