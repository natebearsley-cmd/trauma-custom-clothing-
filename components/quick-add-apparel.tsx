'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { TikTokListingPackage, type TikTokListing } from '@/components/tiktok-listing-package'
import { validateInventory, PHOTO_VIEW_LABELS, type PhotoView, type Product } from '@/lib/inventory'
import { suggestMerchantSku } from '@/lib/merchant'
import { PAYPAL_LAUNCH_SKUS } from '@/lib/commerce'
import { MAX_PRODUCT_PHOTO_BYTES, MAX_PRODUCT_PHOTOS, QUICK_APPAREL_CATEGORIES, QUICK_PRODUCT_CATEGORIES, type QuickAddFields } from '@/lib/quick-add'
import type { PhotoReceipt } from '@/lib/product-photo-upload'

const field = 'mt-2 min-h-12 w-full rounded-sm border border-input bg-background px-3 py-3 text-base'
const button = 'inline-flex min-h-12 items-center justify-center border border-input px-5 py-3 text-sm font-semibold hover:border-accent disabled:opacity-50'
function PhotoTile({ file, cover, view, onView, onCover, onRemove }: { file: File; cover: boolean; view: PhotoView; onView: (view: PhotoView) => void; onCover: () => void; onRemove: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const objectUrl = URL.createObjectURL(file); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl) }, [file])
  return <li className="min-w-0 border border-border p-3">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {url && <img src={url} alt={`Your photo: ${file.name}`} className="h-44 w-full object-contain" />}
    <p className="mt-3 break-all text-xs text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
    <label className="mt-3 block text-xs font-semibold">Photo view for {file.name}<select value={view} onChange={(event) => onView(event.target.value as PhotoView)} className="mt-2 min-h-11 w-full border border-input bg-background px-2">{Object.entries(PHOTO_VIEW_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <p className="mt-2 text-sm font-semibold">{cover ? 'Cover photo' : 'Gallery photo'}</p>
    <div className="mt-2 flex flex-wrap gap-2">{!cover && <button type="button" onClick={onCover} className="min-h-11 border border-input px-3 text-xs">Use as cover</button>}<button type="button" onClick={onRemove} className="min-h-11 border border-input px-3 text-xs">Remove</button></div>
  </li>
}
export function QuickAddApparel({ merchant = false }: { merchant?: boolean } = {}) {
  const [key, setKey] = useState('')
  const [opened, setOpened] = useState(false)
  const [sha, setSha] = useState('')
  const [session, setSession] = useState('')
  const [paypalDefault, setPaypalDefault] = useState('')
  const [existingProducts, setExistingProducts] = useState<Product[]>([])
  const [sku, setSku] = useState('')
  const [skuEdited, setSkuEdited] = useState(false)
  const [sessionSkus, setSessionSkus] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [views, setViews] = useState(new Map<File, PhotoView>())
  const [mode, setMode] = useState<'draft' | 'published'>('draft')
  const [category, setCategory] = useState('Apparel')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<{ productId: string; published: boolean; tiktokListing: TikTokListing | null } | null>(null)
  const receipts = useRef(new Map<File, PhotoReceipt>())
  const formRef = useRef<HTMLFormElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  useEffect(() => { fetch('/api/admin/session', { cache: 'no-store' }).then((response) => { if (response.ok) void open() }).catch(() => {}) }, [])
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  async function open(event?: FormEvent) {
    event?.preventDefault(); setBusy(true); setError('')
    try {
      if (key) { const signed = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }); const result = await signed.json(); if (!signed.ok) throw new Error(result.error || 'Could not sign in.'); setKey('') }
      const response = await fetch('/api/admin/inventory', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not open inventory.')
      validateInventory(result.inventory)
      setSha(result.sha)
      setExistingProducts(result.inventory.products)
      if (!opened) {
        setPaypalDefault(merchant ? '' : result.inventory.payments?.paypalUrl ?? '')
        setSession(crypto.randomUUID())
        setOpened(true)
      }
      setMessage(opened ? 'Inventory refreshed. Your product details and selected photos are kept. You can save again.' : 'Ready. Paste your listing, choose photos, and save.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not open inventory.') }
    finally { setBusy(false) }
  }
  function choosePhotos(selected: FileList | null) {
    if (!selected) return
    const next = [...files, ...Array.from(selected)]
    if (next.length > MAX_PRODUCT_PHOTOS) { setError('Choose up to 12 photos. Remove a photo before adding another.'); return }
    const invalid = next.find((file) => !file.size || file.size > MAX_PRODUCT_PHOTO_BYTES || !/\.(jpe?g|png|webp)$/i.test(file.name))
    if (invalid) { setError(`${invalid.name}: use a nonempty JPG, PNG, or WebP file, 3 MB or smaller. Originals are never silently resized or replaced.`); return }
    setFiles(next); setDirty(true); setError('')
  }
  function suggestFromName(name: string) {
    if (skuEdited) return
    const existing = existingProducts.flatMap((item) => item.sku ? [item.sku] : [])
    setSku(suggestMerchantSku(name, [...existing, ...sessionSkus]))
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || saved) return
    if (!files.length) { setError('Add at least one real product photo.'); uploadRef.current?.focus(); return }
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '')
    const fields: QuickAddFields = {
      name: text('name'), description: text('description'), price: Number(text('price')), category,
      depopUrl: text('depopUrl'), paypalUrl: text('paypalUrl'), payhipUrl: text('payhipUrl'),
      size: text('size'), color: text('color'), condition: text('condition'), collection: text('collection'), productType: text('productType'),
      sku, physicalInventoryTag: text('physicalInventoryTag'), stockQuantity: text('stockQuantity') === '' ? undefined : Number(text('stockQuantity')),
      featured: form.get('featuredCollection') === 'on' || form.get('featuredApparel') === 'on',
      featuredCollection: form.get('featuredCollection') === 'on', featuredApparel: form.get('featuredApparel') === 'on',
      photoViews: files.map((file) => views.get(file) ?? 'other'), published: mode === 'published',
      tiktokReady: !merchant && form.get('tiktokReady') === 'on',
      prepareTikTok: merchant && form.get('tiktokReady') === 'on',
      ownerConfirmed: form.get('ownerConfirmed') === 'on', reviewApproved: form.get('reviewApproved') === 'on',
    }
    setBusy(true); setError('')
    try {
      const photos: PhotoReceipt[] = []
      for (const [index, file] of files.entries()) {
        setMessage(`Uploading photo ${index + 1} of ${files.length}…`)
        let receipt = receipts.current.get(file)
        if (!receipt) {
          const data = new FormData(); data.set('session', session); data.set('photo', file)
          const response = await fetch('/api/admin/photos', { method: 'POST', body: data })
          const result = await response.json().catch(() => ({ error: 'Photo upload could not complete. Check the file size and try again.' }))
          if (!response.ok) throw new Error(result.error || 'Photo upload failed. Your details are kept.')
          receipt = result.receipt as PhotoReceipt
          receipts.current.set(file, receipt)
        }
        photos.push(receipt)
      }
      setMessage('Saving your product and photos together…')
      const response = await fetch('/api/admin/quick-add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, sha, product: fields, photos }),
      })
      const result = await response.json().catch(() => ({ error: 'The save response was interrupted. Refresh inventory and retry; your details are kept.' }))
      if (!response.ok) throw new Error(result.error || 'Could not save this product.')
      if (fields.sku) setSessionSkus((current) => [...new Set([...current, fields.sku!])])
      setSha(result.sha); setSaved({ productId: result.productId, published: result.published, tiktokListing: result.tiktokListing ?? null }); setDirty(false); setMessage(result.message)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save this product.'); setMessage('Your form and selected photos are kept. Refresh inventory if needed, then try Save again.') }
    finally { setBusy(false) }
  }
  function another() {
    formRef.current?.reset(); setFiles([]); setViews(new Map()); receipts.current.clear(); setSession(crypto.randomUUID())
    setMode('draft'); setCategory('Apparel'); setSaved(null); setMessage('Ready for your next real TRAUMA product.'); setError(''); setDirty(false)
    setSku(''); setSkuEdited(false)
  }
  return <div className="mt-8">
    {!opened ? <form onSubmit={open} className="max-w-xl border border-border bg-card p-6"><label htmlFor="quick-key" className="font-semibold">Admin key<input id="quick-key" type="password" required autoComplete="current-password" value={key} onChange={(event) => setKey(event.target.value)} className={field} /></label><p className="mt-3 text-sm text-muted-foreground">Use your existing TRAUMA admin key. This device can stay signed in for up to seven days.</p><button disabled={busy} className={`${button} mt-5 w-full bg-primary text-primary-foreground`}>{busy ? 'Opening…' : merchant ? 'Open TRAUMA Merchant' : 'Open Quick Add'}</button></form> : <>
      {merchant && <section aria-labelledby="merchant-existing" className="mb-8 border border-border bg-card p-5"><h2 id="merchant-existing" className="text-xl font-semibold">Continue an existing product</h2><p className="mt-2 text-sm text-muted-foreground">Edit the original record to add photos, shipping details or its PayPal link.</p><ul className="mt-4 grid gap-3">{PAYPAL_LAUNCH_SKUS.map((code) => {
        const product = existingProducts.find((item) => item.sku === code)
        return product ? <li key={code}><Link href={`/admin/inventory?product=${encodeURIComponent(product.id)}`} className="flex min-h-20 flex-col justify-center gap-1 border border-border px-4 py-3 hover:border-accent"><span className="font-semibold">{code} · Tag {product.physicalInventoryTag || 'not recorded'}</span><span className="text-sm text-muted-foreground">{product.name || 'Product details needed'}</span></Link></li> : null
      })}</ul></section>}
      <div className="mb-6 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => open()} className={button}>Refresh inventory</button><Link href="/admin/inventory" className={button}>Full inventory manager</Link><button type="button" disabled={busy} onClick={async () => { if (!dirty || window.confirm('Discard this unsaved product and sign out?')) { const response = await fetch('/api/admin/session', { method: 'DELETE' }); if (!response.ok) { setError('Could not sign out. Try again.'); return } setKey(''); setOpened(false); setFiles([]); receipts.current.clear(); setSaved(null); setDirty(false) } }} className={button}>Sign out</button></div>
      {saved ? <div className="border border-accent bg-card p-6"><h2 className="text-2xl font-semibold">{saved.published ? 'Saved with publishing approved' : 'Draft saved'}</h2><p className="mt-4 leading-relaxed">{message}</p>{saved.published && <Link href={`/products/${saved.productId}`} className={`${button} mt-5`}>Open product after deployment</Link>}<button type="button" onClick={another} className={`${button} mt-5 ml-0 sm:ml-3`}>Add another product</button><Link href={`/admin/tiktok-shop?product=${encodeURIComponent(saved.productId)}`} className={`${button} mt-5 ml-0 sm:ml-3`}>Open in TikTok Shop Prep</Link>{saved.tiktokListing && <TikTokListingPackage listing={saved.tiktokListing} />}</div> : <form ref={formRef} onSubmit={save} onChange={() => setDirty(true)}>
        <fieldset disabled={busy} className="space-y-6 border border-border bg-card p-5 md:p-8">
          <legend className="px-2 font-semibold">Add your real TRAUMA product</legend>
          <label className="block font-semibold">Product Name<input name="name" required maxLength={200} autoComplete="off" onChange={(event) => suggestFromName(event.target.value)} className={field} /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="font-semibold">SKU<input name="sku" required={merchant} maxLength={64} value={sku} onChange={(event) => { setSku(event.target.value.trim().toUpperCase()); setSkuEdited(true) }} className={field} /><span className="mt-2 block text-xs font-normal text-muted-foreground">Suggested from the name. You can change it before saving.</span></label><label className="font-semibold">Physical Inventory Tag<input name="physicalInventoryTag" required={merchant} maxLength={64} inputMode="text" className={field} placeholder="Example: 0470" /></label><label className="font-semibold">Inventory Quantity<input name="stockQuantity" required={merchant} type="number" min="1" step="1" inputMode="numeric" className={field} /></label><label className="font-semibold">Condition<select name="condition" required={merchant} className={field} defaultValue=""><option value="">Choose actual condition</option><option>New With Tags</option><option>New Without Tags</option><option>Pre-owned</option></select></label></div>
          <label className="block font-semibold">Description<textarea name="description" required rows={6} maxLength={5000} className={field} /><span className="mt-2 block text-sm font-normal text-muted-foreground">Copy and paste your actual Depop title and description above.</span></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="font-semibold">Price (USD)<input name="price" type="number" required min="0" max="1000000" step="0.01" inputMode="decimal" className={field} /></label><label className="font-semibold">Category<select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className={field}>{QUICK_PRODUCT_CATEGORIES.map((name) => <option key={name}>{name}</option>)}</select></label></div>
          <div><label htmlFor="quick-photos" className="font-semibold">Photos</label>{merchant && <label className={`${button} mt-3 w-full cursor-pointer bg-primary text-primary-foreground`}>Take Photo<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => { choosePhotos(event.target.files); event.target.value = '' }} /></label>}<input ref={uploadRef} id="quick-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-3 block min-h-12 w-full min-w-0 text-sm file:mr-3 file:border file:border-input file:bg-background file:px-4 file:py-3 file:text-foreground" onChange={(event) => { choosePhotos(event.target.files); event.target.value = '' }} aria-describedby="quick-photo-help" /><p id="quick-photo-help" className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose up to 12 real JPG, PNG, or WebP photos, each 3 MB or smaller. The first is your cover. Originals are preserved exactly; the storefront creates web-sized versions. Background and lighting cleanup are not automatically applied by this uploader.</p>{files.length > 0 && <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{files.map((file, index) => <PhotoTile key={`${file.name}-${file.size}-${file.lastModified}-${index}`} file={file} cover={index === 0} view={views.get(file) ?? 'other'} onView={(view) => { setViews((current) => new Map(current).set(file, view)); setDirty(true) }} onCover={() => { setFiles((current) => [file, ...current.filter((_, at) => at !== index)]); setDirty(true) }} onRemove={() => { setFiles((current) => current.filter((_, at) => at !== index)); setDirty(true) }} />)}</ul>}</div>
          <label className="block font-semibold">Depop URL (optional)<input name="depopUrl" type="url" disabled={!QUICK_APPAREL_CATEGORIES.includes(category)} className={field} /><span className="mt-2 block text-sm font-normal text-muted-foreground">Paste your real listing link. Direct Depop listings and Depop app links work.</span></label>
          <label className="block font-semibold">PayPal checkout URL (optional)<input name="paypalUrl" type="url" disabled={!QUICK_APPAREL_CATEGORIES.includes(category)} defaultValue={paypalDefault} placeholder="https://www.paypal.com/ncp/payment/..." className={field} /><span className="mt-2 block text-sm font-normal text-muted-foreground">Use this product's actual business checkout link. A complete published product with its own checkout link gets BUY NOW automatically.</span></label>
          <label className="block font-semibold text-muted-foreground">Payhip URL — books and digital products only<input name="payhipUrl" type="url" disabled={QUICK_APPAREL_CATEGORIES.includes(category)} className={field} /><span className="mt-2 block text-sm font-normal">Category selection enables the correct links. Apparel never uses Payhip; books and digital products use Payhip.</span></label>
          <details className="border-y border-border py-3"><summary className="flex min-h-12 cursor-pointer items-center font-semibold">Optional apparel details</summary><div className="mt-4 grid gap-5 sm:grid-cols-2">{[['size', 'Size'], ['color', 'Color'], ['productType', 'Product type'], ['collection', 'Collection (leave blank for automatic grouping)']].map(([name, label]) => <label key={name} className="text-sm font-semibold">{label}<input name={name} maxLength={200} className={field} /></label>)}</div></details>
          <fieldset className="space-y-3 border border-border p-4"><legend className="px-2 font-semibold">Featured placement</legend><label className="flex min-h-12 items-center gap-3"><input name="featuredCollection" type="checkbox" className="size-5 shrink-0" /><span>Add to Featured Collection</span></label><label className="flex min-h-12 items-center gap-3"><input name="featuredApparel" type="checkbox" disabled={!QUICK_APPAREL_CATEGORIES.includes(category)} className="size-5 shrink-0" /><span>Add to Featured Apparel</span></label><p className="text-sm text-muted-foreground">Choose either or both. All published pieces enter their category gallery; homepage curation is limited to eight distinct pieces.</p></fieldset>
          <fieldset className="space-y-3 border border-border p-4"><legend className="px-2 font-semibold">Save status</legend><label className="flex min-h-11 items-center gap-3"><input type="radio" name="status" value="draft" checked={mode === 'draft'} onChange={() => setMode('draft')} />Save as draft</label><label className="flex min-h-11 items-center gap-3"><input type="radio" name="status" value="published" checked={mode === 'published'} onChange={() => setMode('published')} />Publish after my review</label><p className="text-sm text-muted-foreground">Drafts stay out of public product pages and galleries. Approved publishing creates the page and gallery entries after the connected website deployment succeeds. Homepage curation is limited to eight pieces.</p></fieldset>
          <label className="flex min-h-12 items-start gap-3"><input name="tiktokReady" type="checkbox" className="mt-1 size-5 shrink-0" /><span>{merchant ? 'Prepare TikTok listing package' : 'Ready for TikTok Shop'}<span className="mt-1 block text-sm text-muted-foreground">{merchant ? 'Save to the preparation queue and generate copy from your product details. Complete the shipping and Seller Center checks before publication.' : 'Save this status and get a copy-ready listing package. Saving here does not post to TikTok.'}</span></span></label>
          <label className="flex min-h-12 items-start gap-3"><input name="ownerConfirmed" type="checkbox" required className="mt-1 size-5 shrink-0" /><span>I confirm this is my real TRAUMA product and the details and photos accurately represent it.</span></label>
          {mode === 'published' && <label className="flex min-h-12 items-start gap-3"><input name="reviewApproved" type="checkbox" required className="mt-1 size-5 shrink-0" /><span>I have reviewed this product and approve publishing it.</span></label>}
          <button type="submit" disabled={busy} className={`${button} w-full bg-primary text-primary-foreground sm:w-auto`}>{busy ? 'Saving…' : 'Save Product'}</button>
        </fieldset>
      </form>}
    </>}
    <p role="status" aria-live="polite" className="mt-5 whitespace-pre-wrap text-sm text-muted-foreground">{saved ? '' : message}</p>
    {error && <p role="alert" className="mt-4 border border-accent p-4 text-sm">{error}</p>}
  </div>
}
