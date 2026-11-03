'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
  validateInventory,
  safeUrl,
  isApparel,
  filterInventoryProducts,
  type InventoryFilters,
  type Inventory,
  type Product,
} from '@/lib/inventory'

const fieldClass =
  'mt-2 min-h-12 w-full border border-input bg-background px-3 py-2 text-base'
const buttonClass =
  'min-h-12 border border-input px-5 py-3 text-sm font-semibold hover:border-foreground disabled:opacity-50'

const emptyFilters: InventoryFilters = {
  search: '', status: 'all', category: '', source: '', featured: 'all',
}

function PhotoPreview({ url, index, name }: { url: string; index: number; name: string }) {
  const [failed, setFailed] = useState(false)
  const valid = safeUrl(url, true)
  return (
    <figure className="min-w-0 border border-border p-3">
      {valid && !failed ? (
        // Preview the owner's URL directly; no upload, proxy, or inventory mutation.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`${name || 'Product'} — photo ${index + 1}`}
          className="h-40 w-full object-contain" loading="lazy" referrerPolicy="no-referrer"
          onError={() => setFailed(true)} />
      ) : (
        <p className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">
          {valid ? 'Image could not be loaded. Check the URL or file path.' : 'Use an HTTPS image URL or /images/ path.'}
        </p>
      )}
      <figcaption className="mt-3 break-all text-xs text-muted-foreground">
        <span className="font-semibold">{index === 0 ? 'Cover photo' : `Photo ${index + 1}`}</span>
        <span className="mt-1 block">{url}</span>
      </figcaption>
    </figure>
  )
}

export function InventoryManager() {
  const [key, setKey] = useState('')
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [sha, setSha] = useState('')
  const [selected, setSelected] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [filters, setFilters] = useState<InventoryFilters>(emptyFilters)
  const products = inventory?.products ?? []
  const filtered = filterInventoryProducts(products, filters)
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort()
  function changeFilter(patch: Partial<InventoryFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
  }
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
      setFilters(emptyFilters)
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
    setFilters(emptyFilters)
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
          <section aria-label="Find products" className="mt-8 border border-border p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold sm:col-span-2 lg:col-span-4">
                Search products
                <input type="search" value={filters.search}
                  onChange={(e) => changeFilter({ search: e.target.value })}
                  className={fieldClass} aria-describedby="search-help" />
                <span id="search-help" className="mt-2 block text-sm font-normal text-muted-foreground">
                  Search names, IDs, brands, descriptions, categories, sizes, and colors.
                </span>
              </label>
              <label className="text-sm font-semibold">Status
                <select value={filters.status} onChange={(e) => changeFilter({ status: e.target.value as InventoryFilters['status'] })} className={fieldClass}>
                  <option value="all">All products ({products.length})</option>
                  <option value="draft">Draft products ({products.filter((p) => !p.published).length})</option>
                  <option value="published">Published products ({products.filter((p) => p.published).length})</option>
                  <option value="sold">Sold products ({products.filter((p) => p.sold).length})</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Category
                <select value={filters.category} onChange={(e) => changeFilter({ category: e.target.value })} className={fieldClass}>
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">Source
                <select value={filters.source} onChange={(e) => changeFilter({ source: e.target.value })} className={fieldClass}>
                  <option value="">All sources</option>
                  <option value="payhip">Payhip</option>
                  <option value="depop">Depop</option>
                  <option value="repository">Repository</option>
                  <option value="manual">Manual</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Featured placement
                <select value={filters.featured} onChange={(e) => changeFilter({ featured: e.target.value as InventoryFilters['featured'] })} className={fieldClass}>
                  <option value="all">All placements</option>
                  <option value="products">Featured Products</option>
                  <option value="apparel">Featured Apparel</option>
                  <option value="none">Not featured</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p role="status" className="text-sm text-muted-foreground">{filtered.length} of {products.length} products match</p>
              <button type="button" onClick={() => setFilters(emptyFilters)} className={buttonClass}>Clear filters</button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Sold products can also be drafts or published. Filters never change product status.</p>
          </section>
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <nav aria-label="Matching products" className="min-w-0">
              <h2 className="mb-3 text-sm font-semibold">Select a product</h2>
              {filtered.length ? (
                <ul className="max-h-[36rem] space-y-2 overflow-y-auto">
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <button type="button" disabled={busy} onClick={() => setSelected(p.id)}
                        aria-current={selected === p.id ? 'true' : undefined}
                        className={`w-full break-words border p-4 text-left hover:border-foreground disabled:opacity-50 ${selected === p.id ? 'border-accent bg-card' : 'border-border'}`}>
                        <span className="block font-semibold">{p.name || 'Unsaved entry'}</span>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          {p.published ? 'Published' : 'Draft'}{p.sold ? ' · Sold' : ''}
                          {p.category ? ` · ${p.category}` : ''}
                        </span>
                        {p.featured && <span className="mt-2 block text-xs">{isApparel(p) ? 'Featured Apparel' : 'Featured Products'}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="border border-border p-4 text-sm text-muted-foreground">No matching products. Clear filters to see all inventory.</p>}
            </nav>
            {product && (
              <fieldset disabled={busy} className="min-w-0 border border-border p-5 md:p-8 disabled:opacity-60">
                <legend className="px-2 font-semibold">Edit product</legend>
                <h2 className="break-words text-xl font-semibold">{product.name || 'Unsaved entry'}</h2>
                <p className="mt-2 mb-4 text-sm text-muted-foreground">
                  {product.published ? 'Published' : 'Draft'}{product.sold ? ' · Sold' : ''}
                  {!filtered.some((p) => p.id === product.id) && ' · This selected product is outside the current filters. Your edits are preserved.'}
                </p>
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
                  <div className="sm:col-span-2" aria-label="Product image previews">
                    <h3 className="text-sm font-semibold">Image preview</h3>
                    {product.photos.some((photo) => photo.trim()) ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {product.photos.map((photo) => photo.trim()).filter(Boolean).slice(0, 12).map((url, index) => (
                          <PhotoPreview key={`${product.id}-${index}-${url}`} url={url} index={index} name={product.name} />
                        ))}
                      </div>
                    ) : <p className="mt-3 text-sm text-muted-foreground">Add your real photo URLs or file paths above to preview them here.</p>}
                  </div>
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
                    Publish this product (leave unchecked to keep a draft)
                  </label>
                  <div className="sm:col-span-2 border-t border-border pt-5">
                    <h3 className="text-sm font-semibold">Featured placement</h3>
                    <label className="flex min-h-12 items-center gap-3 text-sm">
                      <input type="checkbox" checked={product.featured && !isApparel(product)}
                        disabled={isApparel(product)} aria-describedby="featured-help"
                        onChange={(e) => update({ featured: e.target.checked })} className="size-5" />
                      Featured Products
                    </label>
                    <label className="flex min-h-12 items-center gap-3 text-sm">
                      <input type="checkbox" checked={product.featured && isApparel(product)}
                        disabled={!isApparel(product)} aria-describedby="featured-help"
                        onChange={(e) => update({ featured: e.target.checked })} className="size-5" />
                      Featured Apparel
                    </label>
                    <p id="featured-help" className="text-sm text-muted-foreground">
                      Apparel, Tops, Outerwear, and Headwear use Featured Apparel; other categories use Featured Products.
                      Choose the accurate category to enable its toggle. Changing category moves any existing featured selection.
                      Featuring never publishes a draft. Only reviewed, published, confirmed, unsold products appear publicly.
                    </p>
                  </div>
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
              </fieldset>
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
