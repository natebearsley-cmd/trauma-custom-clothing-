'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
  validateInventory,
  type Inventory,
  type Product,
} from '@/lib/inventory'

const fieldClass =
  'mt-2 min-h-12 w-full border border-input bg-background px-3 py-2 text-base'
const buttonClass =
  'min-h-12 border border-input px-5 py-3 text-sm font-semibold hover:border-foreground disabled:opacity-50'

export function InventoryManager() {
  const [key, setKey] = useState('')
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [sha, setSha] = useState('')
  const [selected, setSelected] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const product = inventory?.products.find((p) => p.id === selected)
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  async function load(event?: FormEvent) {
    event?.preventDefault()
    if (
      dirty &&
      !window.confirm(
        'Discard unsaved changes and reload? Export them first if you want to keep them.',
      )
    )
      return
    setBusy(true)
    try {
      const response = await fetch('/api/admin/inventory', {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      validateInventory(result.inventory)
      setInventory(result.inventory)
      setSha(result.sha)
      setSelected(result.inventory.products[0]?.id ?? '')
      setDirty(false)
      setMessage('Loaded current GitHub inventory.')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not load inventory',
      )
    } finally {
      setBusy(false)
    }
  }
  function update(patch: Partial<Product>) {
    if (!inventory || !product) return
    setInventory({
      ...inventory,
      products: inventory.products.map((p) =>
        p.id === selected ? { ...p, ...patch } : p,
      ),
    })
    setDirty(true)
  }
  function add() {
    if (!inventory) return
    const id = `item-${crypto.randomUUID()}`
    const next: Product = {
      id,
      name: '',
      brand: '',
      category: '',
      size: '',
      color: '',
      condition: '',
      photos: [],
      description: '',
      price: null,
      currency: 'USD',
      purchaseUrl: '',
      payhipUrl: '',
      sold: false,
      soldDisplay: 'show',
      published: false,
      featured: false,
      ownerConfirmed: false,
      source: 'manual',
      sourceUrl: '',
    }
    setInventory({ ...inventory, products: [...inventory.products, next] })
    setSelected(id)
    setDirty(true)
    setMessage(
      'New unsaved entry. Enter details from your own existing product, Depop listing, or Payhip product.',
    )
  }
  function exportInventory() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(inventory, null, 2) + '\n'], {
        type: 'application/json',
      }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'inventory.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  async function save() {
    setBusy(true)
    try {
      validateInventory(inventory)
      const response = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory, sha }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setSha(result.sha)
      setDirty(false)
      setMessage(result.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="mt-10">
      {!inventory ? (
        <form onSubmit={load} className="max-w-xl border border-border p-6">
          <label htmlFor="admin-key" className="text-sm font-semibold">
            Admin key
          </label>
          <input
            id="admin-key"
            type="password"
            required
            autoComplete="current-password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            The key is kept in this tab’s memory only. See docs/inventory.md for
            secure setup.
          </p>
          <button disabled={busy} className={`${buttonClass} mt-5`}>
            {busy ? 'Loading…' : 'Open inventory'}
          </button>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={add}
              className={buttonClass}
            >
              Add my product
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className={`${buttonClass} bg-primary text-primary-foreground`}
            >
              {busy ? 'Working…' : 'Save inventory to GitHub'}
            </button>
            <button
              type="button"
              onClick={exportInventory}
              className={buttonClass}
            >
              Export JSON backup
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => load()}
              className={buttonClass}
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm('Discard unsaved changes and lock?')
                ) {
                  setKey('')
                  setInventory(null)
                  setDirty(false)
                }
              }}
              className={buttonClass}
            >
              Lock
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {dirty ? 'Unsaved changes' : 'No unsaved changes'} · Saving creates
            a repository commit. Store changes appear after deployment.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
            <div>
              <label
                htmlFor="selected-product"
                className="text-sm font-semibold"
              >
                Select a product
              </label>
              <select
                id="selected-product"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className={fieldClass}
              >
                {inventory.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || 'Unsaved entry'} —{' '}
                    {!p.published ? 'Draft' : p.sold ? 'Sold' : 'Available'}
                  </option>
                ))}
              </select>
            </div>
            {product && (
              <div className="min-w-0 border border-border p-5 md:p-8">
                <p className="mb-6 break-all text-xs text-muted-foreground">
                  ID: {product.id}
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {(
                    [
                      'name',
                      'brand',
                      'category',
                      'size',
                      'color',
                      'condition',
                    ] as const
                  ).map((field) => (
                    <label
                      key={field}
                      className="text-sm font-semibold capitalize"
                    >
                      {field}
                      <input
                        value={product[field]}
                        maxLength={200}
                        onChange={(e) => update({ [field]: e.target.value })}
                        list={
                          field === 'category'
                            ? 'product-categories'
                            : undefined
                        }
                        className={fieldClass}
                      />
                    </label>
                  ))}
                  <datalist id="product-categories">
                    {[
                      'Books',
                      'Digital Downloads',
                      'Wallpapers',
                      'Guides',
                      'Apparel',
                      'JourneyVault',
                      'Tops',
                      'Outerwear',
                      'Headwear',
                    ].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <label className="text-sm font-semibold">
                    Price
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={product.price ?? ''}
                      onChange={(e) =>
                        update({
                          price:
                            e.target.value === ''
                              ? null
                              : Number(e.target.value),
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Currency
                    <select
                      value={product.currency}
                      onChange={(e) => update({ currency: e.target.value })}
                      className={fieldClass}
                    >
                      {['USD', 'GBP', 'EUR', 'CAD', 'AUD'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Description
                    <textarea
                      rows={5}
                      maxLength={5000}
                      value={product.description}
                      onChange={(e) => update({ description: e.target.value })}
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Photos — one HTTPS URL or /images/ path per line
                    <textarea
                      rows={4}
                      value={product.photos.join('\n')}
                      onChange={(e) =>
                        update({ photos: e.target.value.split('\n') })
                      }
                      onBlur={() =>
                        update({
                          photos: product.photos
                            .map((p) => p.trim())
                            .filter(Boolean),
                        })
                      }
                      className={fieldClass}
                    />
                    <span className="mt-2 block text-sm font-normal text-muted-foreground">
                      First photo is the cover. Up to 12 photos. Use your own
                      images; upload files to public/images/products/ in the
                      repository, or use photo URLs you control.
                    </span>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Payhip product URL (leave blank for View Details only)
                    <input
                      type="url"
                      value={product.payhipUrl}
                      onChange={(e) =>
                        update({ payhipUrl: e.target.value.trim() })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Source
                    <select
                      value={product.source}
                      onChange={(e) =>
                        update({ source: e.target.value as Product['source'] })
                      }
                      className={fieldClass}
                    >
                      <option value="repository">Existing repository</option>
                      <option value="depop">My Depop inventory</option>
                      <option value="payhip">My Payhip product</option>
                      <option value="manual">Manually added by me</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Source listing URL
                    <input
                      type="url"
                      value={product.sourceUrl}
                      onChange={(e) =>
                        update({ sourceUrl: e.target.value.trim() })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    When sold
                    <select
                      value={product.soldDisplay}
                      onChange={(e) =>
                        update({
                          soldDisplay: e.target.value as Product['soldDisplay'],
                        })
                      }
                      className={fieldClass}
                    >
                      <option value="show">
                        Show in sold inventory with a SOLD label
                      </option>
                      <option value="archive">
                        Automatically place in the archive
                      </option>
                    </select>
                  </label>
                  <label className="flex min-h-12 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={product.sold}
                      onChange={(e) => update({ sold: e.target.checked })}
                      className="size-5"
                    />
                    This product is sold
                  </label>
                  <label className="flex min-h-12 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={product.published}
                      onChange={(e) => update({ published: e.target.checked })}
                      className="size-5"
                    />
                    Publish this product
                  </label>
                  <label className="flex min-h-12 items-center gap-3 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={product.featured}
                      onChange={(e) => update({ featured: e.target.checked })}
                      className="size-5"
                    />
                    Feature on homepage (Apparel, Tops, Outerwear, and Headwear appear in Featured Apparel; other categories appear in Featured Products)
                  </label>
                  <label className="flex min-h-12 items-start gap-3 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={product.ownerConfirmed}
                      onChange={(e) =>
                        update({ ownerConfirmed: e.target.checked })
                      }
                      className="mt-1 size-5 shrink-0"
                    />
                    I confirm this is a real product I personally created,
                    listed, or sold, and the details and photos are accurate.
                  </label>
                </div>
                <button
                  type="button"
                  className={`${buttonClass} mt-8`}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Remove this product from the inventory? This is saved only when you save to GitHub.',
                      )
                    ) {
                      setInventory({
                        ...inventory,
                        products: inventory.products.filter(
                          (p) => p.id !== product.id,
                        ),
                      })
                      setSelected('')
                      setDirty(true)
                    }
                  }}
                >
                  Remove this product
                </button>
              </div>
            )}
          </div>
        </>
      )}
      <p
        role="status"
        aria-live="polite"
        className="mt-6 whitespace-pre-wrap text-sm"
      >
        {message}
      </p>
    </div>
  )
}
