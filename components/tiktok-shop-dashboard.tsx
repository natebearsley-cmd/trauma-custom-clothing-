'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { TikTokListingPackage } from '@/components/tiktok-listing-package'
import { isDepopUrl, productPhotoLabel, type Inventory } from '@/lib/inventory'
import { generateTikTokListing, tiktokPriority, tiktokReadinessIssues, TIKTOK_STATUSES, TIKTOK_STATUS_LABELS, type TikTokShopStatus } from '@/lib/tiktok-shop'
import { TIKTOK_URL } from '@/lib/site'

const button = 'inline-flex min-h-11 items-center border border-input px-4 py-2 text-sm font-semibold hover:border-accent'

export function TikTokShopDashboard() {
  const [record, setRecord] = useState<{ inventory: Inventory; sha: string } | null>(null)
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TikTokShopStatus | 'all'>('all')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [signIn, setSignIn] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/admin/inventory', { cache: 'no-store', signal: controller.signal })
        if (response.status === 401) { setSignIn(true); return }
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setRecord(result)
        setSelected(new URLSearchParams(location.search).get('product') ?? '')
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not open the inventory.') }
    }
    void load()
    return () => controller.abort()
  }, [])
  const products = (record?.inventory.products ?? []).filter((product) =>
    (status === 'all' || (product.tiktokShopStatus ?? 'not-started') === status) &&
    [product.name, product.category, product.productType, tiktokPriority(product).label].some((value) => value?.toLowerCase().includes(search.trim().toLowerCase())))
    .sort((a, b) => tiktokPriority(a).rank - tiktokPriority(b).rank || a.name.localeCompare(b.name))
  const product = products.find((item) => item.id === selected) ?? products[0]
  const issues = product ? tiktokReadinessIssues(product) : []
  const listing = product ? generateTikTokListing(product) : null
  const current = product?.tiktokShopStatus ?? 'not-started'
  async function save(next: TikTokShopStatus) {
    if (!record || !product || saving || ((next === 'ready' || next === 'listed') && (issues.length || !listing))) return
    const inventory = { ...record.inventory, products: record.inventory.products.map((item) => item.id === product.id ? { ...item, tiktokShopStatus: next } : item) }
    setSaving(true); setMessage(''); setError('')
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventory, sha: record.sha }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setRecord({ inventory, sha: result.sha }); setMessage(`Saved: ${TIKTOK_STATUS_LABELS[next]}.`)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save this status.') }
    finally { setSaving(false) }
  }
  if (signIn) return <p className="mt-6"><Link href="/admin" className={button}>Sign in to open TikTok Shop Prep</Link></p>
  if (!record) return <p role={error ? 'alert' : 'status'} className="mt-6">{error || 'Loading inventory…'}</p>
  return <div className="mt-8">
    <a href={TIKTOK_URL} className={button} target="_blank" rel="noreferrer">TRAUMA on TikTok · @nateb19841</a>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)]">
      <section aria-label="Inventory queue" className="min-w-0 border border-border bg-card p-4">
        <label className="block text-sm font-semibold">Search inventory<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="mt-2 min-h-11 w-full border border-input bg-background px-3 text-base" /></label>
        <label className="mt-4 block text-sm font-semibold">TikTok Shop status<select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="mt-2 min-h-11 w-full border border-input bg-background px-3 text-base">
          <option value="all">All statuses</option>{TIKTOK_STATUSES.map((value) => <option key={value} value={value}>{TIKTOK_STATUS_LABELS[value]}</option>)}
        </select></label>
        <p className="mt-4 text-sm text-muted-foreground">{products.length} inventory items</p>
        <ul className="mt-3 max-h-72 space-y-2 overflow-auto lg:max-h-[70vh]">
          {products.map((item) => <li key={item.id}><button type="button" aria-pressed={item.id === product?.id} onClick={() => { setSelected(item.id); setMessage(''); setError('') }} className="min-h-12 w-full break-words border border-border px-3 py-3 text-left text-sm aria-pressed:border-accent">
            <span className="block font-semibold">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{tiktokPriority(item).label} · {TIKTOK_STATUS_LABELS[item.tiktokShopStatus ?? 'not-started']}</span>
          </button></li>)}
        </ul>
      </section>
      {product ? <section aria-label="Selected inventory item" className="min-w-0 border border-border bg-card p-4 sm:p-6">
        <h2 className="break-words text-2xl font-semibold">{product.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{product.category || 'Category needed'} · {product.price === null ? 'Price needed' : new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}</p>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm">{product.description || 'Add the product description in inventory.'}</p>
        {product.photos.length > 0 && <ul aria-label="Original product photos" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {product.photos.map((url, index) => <li key={`${url}-${index}`}><a href={url} target="_blank" rel="noreferrer"><img src={url} alt={`${product.name} — ${productPhotoLabel(product, index)}`} loading="lazy" className="aspect-square w-full border border-border bg-background object-contain" /></a></li>)}
        </ul>}
        <p className="mt-5 text-sm text-muted-foreground">Inventory links</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
          {([['Depop', product.depopUrl || (isDepopUrl(product.sourceUrl) ? product.sourceUrl : '')], ['PayPal', product.paypalUrl], ['Payhip', product.payhipUrl]] as const).map(([label, url]) => <div key={label}><dt className="font-semibold">{label}</dt><dd>{url ? <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline">Open link</a> : 'Not set'}</dd></div>)}
        </dl>
        <Link href={`/admin/inventory?product=${encodeURIComponent(product.id)}`} className={`${button} mt-3`}>Edit inventory details</Link>
        <div className="mt-6 space-y-3 border-t border-border pt-4">
          <label className="flex min-h-11 items-center gap-3 font-semibold"><input type="checkbox" className="size-5" checked={current === 'ready' || current === 'listed'} disabled={saving || ((issues.length > 0 || !listing) && current !== 'ready' && current !== 'listed')} onChange={(e) => void save(e.target.checked ? 'ready' : 'in-preparation')} />Ready for TikTok Shop</label>
          {issues.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
          {current === 'not-started' && <button type="button" className={button} disabled={saving} onClick={() => void save('in-preparation')}>Start preparation</button>}
          {current === 'ready' && !issues.length && listing && <button type="button" className={button} disabled={saving} onClick={() => void save('listed')}>Mark as listed manually</button>}
          {current === 'listed' && <p className="text-sm text-muted-foreground">Marked as listed manually.</p>}
          <p className="text-sm text-muted-foreground">Readiness tracks your workflow. Confirm category, shipping details, condition and brand eligibility in Seller Center before posting.</p>
          {error && <p role="alert" className="text-sm">{error}</p>}<p role="status" className="text-sm">{saving ? 'Saving status…' : message}</p>
        </div>
        {listing && <TikTokListingPackage key={product.id} listing={listing} />}
      </section> : <p className="p-4 text-sm text-muted-foreground">No inventory matches these filters.</p>}
    </div>
  </div>
}
