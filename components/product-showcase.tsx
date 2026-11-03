'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product-card'
import { storefrontProducts, type Inventory } from '@/lib/inventory'

export function ProductShowcase({ inventory }: { inventory: Inventory }) {
  const [filter, setFilter] = useState('All')
  const [status, setStatus] = useState('available')
  const current = storefrontProducts(inventory)
  const archive = storefrontProducts(inventory, true)
  const categories = [
    'All',
    ...new Set([...current, ...archive].map((p) => p.category)),
  ]
  const visible = current.filter(
    (p) =>
      (filter === 'All' || p.category === filter) &&
      (status === 'all' || (status === 'sold' ? p.sold : !p.sold)),
  )
  const archived = archive.filter(
    (p) => filter === 'All' || p.category === filter,
  )
  return (
    <section
      id="drops"
      className="scroll-mt-24 border-b border-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="eyebrow">TRAUMA inventory</p>
        <h2 className="section-title">Made. Worn. Collected.</h2>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Original garments, books, and digital products from Nathanial’s own
          inventory. Explore apparel on Depop, and books and digital products on Payhip.
        </p>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter products by category"
          >
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filter === c}
                onClick={() => setFilter(c)}
                className={`min-h-11 border px-4 py-2 text-sm ${filter === c ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-foreground'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-2 text-sm">
            Availability
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="min-h-11 border border-border bg-background px-4"
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="all">All current items</option>
            </select>
          </label>
        </div>
        <p role="status" className="mt-6 text-sm text-muted-foreground">
          {visible.length} {visible.length === 1 ? 'item' : 'items'} shown
        </p>
        {visible.length ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        ) : (
          <div className="mt-6 border border-border p-8">
            <h3 className="text-xl font-semibold">
              {status === 'sold'
                ? 'No sold items to display'
                : 'No available items in this view'}
            </h3>
            <p className="mt-3 text-muted-foreground">
              Inventory is updated by Nathanial. Check back for confirmed
              pieces.
            </p>
          </div>
        )}
        <div
          id="archive"
          className="mt-16 scroll-mt-24 border-t border-border pt-10"
        >
          <p className="eyebrow">Past pieces</p>
          <h3 className="mt-3 font-display text-4xl uppercase">The archive</h3>
          <p className="mt-4 text-muted-foreground">
            Sold garments kept here as a record of the work. Archive pieces are
            unavailable to purchase.
          </p>
          {archived.length ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {archived.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              No archived pieces yet.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
