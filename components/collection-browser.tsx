'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GalleryCard } from '@/components/gallery-card'
import { galleryProducts, visibleGalleryCategories, type Inventory } from '@/lib/inventory'

export function CollectionBrowser({ inventory, category = 'all', collection = '', availability = 'all', initialSearch = '' }: { inventory: Inventory; category?: string; collection?: string; availability?: string; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(availability)
  const tabs = visibleGalleryCategories(inventory)
  const matching = galleryProducts(inventory, category, collection, status)
  const products = matching.filter((product) => `${product.name} ${product.description} ${product.productType ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()))
  const label = tabs.find((item) => item.id === category)?.label ?? (category === 'featured-apparel' ? 'Featured Apparel' : 'All pieces')
  if (!galleryProducts(inventory).length) return null
  return <>
    <nav aria-label="Browse collections" className="mt-8 flex flex-wrap gap-2">
      {[{ id: 'all', label: 'All pieces' }, ...tabs].map((item) => (
        <Link key={item.id} href={`/collections?category=${item.id}`} aria-current={category === item.id ? 'page' : undefined} className={`inline-flex min-h-11 items-center border px-3 py-2 text-sm ${category === item.id ? 'border-[#e98793] bg-[#752634] text-white' : 'border-white/15 bg-[#211f23] hover:border-[#e98793]'}`}>{item.label}</Link>
      ))}
    </nav>
    <div className="mt-7 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold">Search the gallery<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 min-h-11 w-full border border-input bg-background px-3" /></label>
      <label className="text-sm font-semibold">Availability<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 min-h-11 w-full border border-input bg-background px-3"><option value="all">All pieces</option><option value="available">Available</option><option value="sold">Sold / archive</option></select></label>
    </div>
    <div className="mt-9 flex flex-wrap items-end justify-between gap-3 border-b border-[#a52d41] pb-4"><h2 className="font-display text-3xl uppercase sm:text-4xl">{label}</h2><p role="status" className="text-sm text-muted-foreground">{products.length} {products.length === 1 ? 'piece' : 'pieces'}</p></div>
    {products.length > 0 ? <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{products.map((product) => <GalleryCard key={product.id} product={product} />)}</ul> :
      (search || status !== 'all') && <button type="button" onClick={() => { setSearch(''); setStatus('all') }} className="mt-5 min-h-11 underline underline-offset-4">Clear filters</button>}
  </>
}
