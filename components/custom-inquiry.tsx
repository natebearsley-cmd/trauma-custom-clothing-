'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Upload } from 'lucide-react'
import { CUSTOM_ORDER_TYPES } from '@/lib/inventory'
import { CONTACT_EMAIL_URL } from '@/lib/contact'
import { depopQuoteBrief, emailQuoteBrief } from '@/lib/custom-quote'
import { DEPOP_SHOP_URL } from '@/lib/site'

const PRODUCT_TYPES = CUSTOM_ORDER_TYPES
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Mixed sizes', 'Other']
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_TOTAL_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|pdf|svg)$/i
const fieldClass = 'w-full min-h-12 border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40'
const labelClass = 'text-xs font-semibold uppercase tracking-widest text-muted-foreground'
type CustomProduct = { id: string; name: string }

export function CustomInquiry({ action = null, customProducts = [], initialType = '' }: {
  action?: string | null
  customProducts?: CustomProduct[]
  initialType?: string
}) {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productType, setProductType] = useState(PRODUCT_TYPES.includes(initialType) ? initialType : '')
  const [delivery, setDelivery] = useState<'direct' | 'depop'>('direct')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [message, setMessage] = useState('')
  const [manualCopy, setManualCopy] = useState('')
  const isDepop = delivery === 'depop'
  const formRef = useRef<HTMLFormElement>(null)
  const filesRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('customProduct')
    if (id && customProducts.some((product) => product.id === id)) setSelectedProduct(id)
  }, [customProducts])

  function checkFiles(selected: File[]): string {
    if (selected.length > 5) return 'Please select up to 5 files.'
    if (selected.some((file) => !ALLOWED_EXTENSIONS.test(file.name))) return 'Use JPG, PNG, WebP, PDF, or SVG files.'
    if (selected.some((file) => file.size === 0 || file.size > MAX_FILE_SIZE)) return 'Each file must be nonempty and no larger than 5 MB.'
    if (selected.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_SIZE) return 'Keep the total attachment size at or below 10 MB.'
    return ''
  }
  function changeDelivery(next: 'direct' | 'depop') {
    if (next === delivery) return
    setDelivery(next)
    if (filesRef.current) filesRef.current.value = ''
    setFiles([])
    setFileError('')
    setEmailDraft('')
    setManualCopy('')
    setMessage('')
  }
  function selectedInventoryName() {
    return customProducts.find((product) => product.id === selectedProduct)?.name
  }
  function prepareEmail() {
    const node = formRef.current
    if (isDepop || !node?.reportValidity()) return
    const selectedFiles = Array.from(filesRef.current?.files ?? [])
    const error = checkFiles(selectedFiles)
    setFileError(error)
    if (error) {
      filesRef.current?.focus()
      return
    }
    const brief = emailQuoteBrief(new FormData(node), selectedInventoryName(), selectedFiles.map((file) => file.name))
    setEmailDraft(`${CONTACT_EMAIL_URL}?subject=${encodeURIComponent('TRAUMA custom quote request')}&body=${encodeURIComponent(brief)}`)
    setMessage('Email draft ready. Open it below and attach any design files separately. Nothing has been sent or copied.')
  }
  async function copyDepopQuote() {
    const node = formRef.current
    if (!isDepop || !node?.reportValidity()) return
    const brief = depopQuoteBrief(new FormData(node), selectedInventoryName())
    setManualCopy('')
    try {
      await navigator.clipboard.writeText(brief)
      setMessage('Order details copied. Open TRAUMA on Depop and paste them in a message there. Nothing has been sent.')
    } catch {
      setManualCopy(brief)
      setMessage('Select and copy the order details below, then paste them in a Depop message. Nothing has been sent.')
    }
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isDepop || !action) {
      event.preventDefault()
      return
    }
    const error = checkFiles(Array.from(filesRef.current?.files ?? []))
    setFileError(error)
    if (error) {
      event.preventDefault()
      filesRef.current?.focus()
    }
    // Only a configured provider receives the full multipart quote and attachments.
    // Its response page confirms receipt; we never display a fabricated success.
  }
  return (
    <section id="custom" aria-labelledby="custom-heading" className="scroll-mt-20 border-b border-border py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow">TRAUMA · Custom orders</p>
          <h2 id="custom-heading" className="mt-3 font-display text-5xl uppercase leading-none md:text-7xl">Custom Orders</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">Custom apparel for your story, your business, or your team. Share your idea and request a personal quote.</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">Printing equipment is being prepared. Production timing and availability will be confirmed with your quote.</p>
          <p className="mt-8 font-display text-3xl uppercase">Request a Custom Quote</p>
          <p className="mt-3 text-sm text-muted-foreground">No fixed price or payment is collected here. A request does not place an order.</p>
          <a href={DEPOP_SHOP_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 underline underline-offset-4">Contact TRAUMA on Depop <ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>
        </div>
        <form ref={formRef} action={isDepop ? undefined : action ?? undefined} method="post" encType="multipart/form-data" onSubmit={handleSubmit}
          onInput={() => { if (emailDraft) setEmailDraft(''); if (manualCopy) setManualCopy(''); if (message) setMessage('') }}
          aria-describedby="custom-delivery custom-privacy" className="flex min-w-0 flex-col gap-6 border border-border bg-card p-6 md:p-8 lg:col-span-7">
          <div role="group" aria-label="Quote delivery method" className="grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={!isDepop} onClick={() => changeDelivery('direct')} className="min-h-12 border border-input px-3 py-2 text-sm font-semibold aria-pressed:border-accent aria-pressed:bg-background/60">{action ? 'Direct quote' : 'Email quote'}</button>
            <button type="button" aria-pressed={isDepop} onClick={() => changeDelivery('depop')} className="min-h-12 border border-input px-3 py-2 text-sm font-semibold aria-pressed:border-accent aria-pressed:bg-background/60">Depop quote</button>
          </div>
          {!isDepop && <input type="hidden" name="subject" value="TRAUMA custom quote request" />}
          <div className="grid gap-6 sm:grid-cols-2">
            {!isDepop && <>
            <div className="flex flex-col gap-2"><label htmlFor="quote-name" className={labelClass}>Name</label><input id="quote-name" name="name" required maxLength={120} autoComplete="name" className={fieldClass} /></div>
            <div className="flex flex-col gap-2"><label htmlFor="quote-email" className={labelClass}>Email</label><input id="quote-email" name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} /></div>
            <div className="flex flex-col gap-2"><label htmlFor="quote-phone" className={labelClass}>Phone (optional)</label><input id="quote-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={fieldClass} /></div>
            </>}
            <div className="flex flex-col gap-2"><label htmlFor="quote-type" className={labelClass}>Product type</label><select id="quote-type" name="product_type" required value={productType} onChange={(e) => setProductType(e.target.value)} className={fieldClass}><option value="" disabled>Select a product type</option>{PRODUCT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
            <div className="flex flex-col gap-2"><label htmlFor="quote-size" className={labelClass}>Size</label><input id="quote-size" name="size" required maxLength={200} list="quote-sizes" aria-describedby="quote-size-help" className={fieldClass} /><datalist id="quote-sizes">{SIZES.map((size) => <option key={size} value={size} />)}</datalist><p id="quote-size-help" className="text-xs text-muted-foreground">For multiple sizes, include quantities for each size in your notes.</p></div>
            <div className="flex flex-col gap-2"><label htmlFor="quote-quantity" className={labelClass}>Quantity</label><input id="quote-quantity" name="quantity" type="number" min="1" max="10000" step="1" required defaultValue="1" className={fieldClass} /></div>
          </div>
          {customProducts.length > 0 && <div className="flex flex-col gap-2"><label htmlFor="quote-inventory" className={labelClass}>Inventory piece (optional)</label><select id="quote-inventory" name="inventory_product_id" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className={fieldClass}><option value="">My own custom idea</option>{customProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>}
          <div className="flex flex-col gap-2"><label htmlFor="quote-design" className={labelClass}>Design description</label><textarea id="quote-design" name="design_description" required rows={5} maxLength={5000} aria-describedby="quote-design-help" className={fieldClass} /><p id="quote-design-help" className="text-sm text-muted-foreground">Tell us about your artwork, colors, or one-of-one idea. {isDepop && 'Do not include personal contact or payment information in your size, description, or notes.'}</p></div>
          {!isDepop && <div className="flex flex-col gap-3 border border-dashed border-input p-4">
            <label htmlFor="quote-files" className={`${labelClass} flex items-center gap-2`}><Upload className="size-4" aria-hidden="true" />Design files (optional)</label>
            <input ref={filesRef} id="quote-files" name="design_files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.svg" aria-describedby="quote-file-help quote-file-error" aria-invalid={!!fileError}
              className="min-h-12 w-full min-w-0 text-sm file:mr-3 file:cursor-pointer file:border file:border-input file:bg-background file:px-3 file:py-3 file:text-foreground"
              onChange={(event) => { const next = Array.from(event.target.files ?? []); setFileError(checkFiles(next)); setFiles(next); }} />
            <p id="quote-file-help" className="text-xs text-muted-foreground">JPG, PNG, WebP, PDF, or SVG. Up to 5 files, 5 MB each, 10 MB total. Files are sent only when you submit through a connected quote service.</p>
            {files.length > 0 && <><ul className="space-y-1 text-xs text-muted-foreground">{files.map((file, index) => <li key={`${index}-${file.name}`} className="break-all">{file.name} · {(file.size / 1024).toFixed(0)} KB</li>)}</ul><button type="button" onClick={() => { if (filesRef.current) filesRef.current.value = ''; setFiles([]); setFileError(''); }} className="min-h-11 self-start text-sm underline">Clear files</button></>}
            <p id="quote-file-error" role="alert" className="text-sm text-accent">{fileError}</p>
          </div>}
          <div className="flex flex-col gap-2"><label htmlFor="quote-notes" className={labelClass}>Additional notes (optional)</label><textarea id="quote-notes" name="additional_notes" rows={3} maxLength={3000} className={fieldClass} /></div>
          <p id="custom-privacy" className="text-xs leading-relaxed text-muted-foreground">{isDepop ? 'Keep Depop conversations and payments on Depop. Do not paste email addresses, phone numbers, addresses, or payment details.' : 'Your contact information and design files are used to respond to your quote request. Only share information and artwork you want TRAUMA to receive.'}</p>
          <p id="custom-delivery" className="text-sm leading-relaxed text-muted-foreground">{isDepop ? 'Copy the order details, then message TRAUMA on Depop. This does not collect contact details or send anything.' : action ? 'Submitting sends your details and files to TRAUMA’s quote service. The service’s response page confirms receipt.' : 'Online quote delivery is not connected yet. Prepare an email draft below; attach any files separately in your mail app.'}</p>
          <button type={!isDepop && action ? "submit" : "button"} onClick={isDepop ? copyDepopQuote : action ? undefined : prepareEmail} disabled={!isDepop && !!fileError} className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">{isDepop ? 'Copy quote for Depop' : action ? 'Request a Custom Quote' : 'Prepare email quote'}<ArrowUpRight className="size-4" aria-hidden="true" /></button>
          {!isDepop && action && <button type="button" onClick={prepareEmail} disabled={!!fileError} className="min-h-12 border border-input px-5 py-3 text-sm font-semibold hover:border-accent">Prepare email quote</button>}
          {!isDepop && emailDraft && <a href={emailDraft} className="inline-flex min-h-12 items-center justify-center bg-primary px-5 py-3 font-semibold text-primary-foreground">Email this quote request</a>}
          <p role="status" aria-live="polite" className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{message}</p>
          {isDepop && manualCopy && <label className="flex flex-col gap-2 text-sm">Order details to copy<textarea readOnly value={manualCopy} onFocus={(event) => event.currentTarget.select()} rows={6} className={fieldClass} /></label>}
          {isDepop && <a href={DEPOP_SHOP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 self-start underline underline-offset-4">Open TRAUMA on Depop <ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>}
        </form>
      </div>
    </section>
  )
}
