'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { CustomOrderGallery } from '@/components/trauma-collections'
import { GALLERY_CATEGORIES, HEADWEAR_COLLECTIONS, WOMENS_COLLECTION_TYPES, galleryProducts, type Inventory } from '@/lib/inventory'

export function CollectionBrowser({ inventory, category = 'all', collection = '', availability = 'all' }: { inventory: Inventory; category?: string; collection?: string; availability?: string }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(availability)
  const [headwear, setHeadwear] = useState(collection)
  const products = galleryProducts(inventory, category, ['headwear', 'women'].includes(category) ? headwear : collection, status)
    .filter((product) => `${product.name} ${product.description} ${product.productType ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()))
  const label = category === 'all' ? 'All collections' : category === 'apparel' ? 'Apparel' : GALLERY_CATEGORIES.find((item) => item.id === category)?.label ?? 'All collections'
  return <>
    <nav aria-label="Browse collections" className="mt-10 flex flex-wrap gap-3">{[{ id: 'all', label: 'All collections' }, ...GALLERY_CATEGORIES].map((item) => <Link key={item.id} href={`/collections?category=${item.id}`} aria-current={category === item.id ? 'page' : undefined} className={`inline-flex min-h-12 items-center border px-4 py-3 text-sm ${category === item.id ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-accent'}`}>{item.label}</Link>)}</nav>
    {category === 'custom-shoes' ? <div className="mt-12"><h2 className="mb-6 font-display text-4xl uppercase">Custom Orders</h2><CustomOrderGallery /></div> : <>
      <div className="mt-10 grid items-end gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold">Search the collection<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 min-h-12 w-full border border-input bg-background px-4" /></label>
        <label className="text-sm font-semibold">Availability<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 min-h-12 w-full border border-input bg-background px-4"><option value="all">All pieces</option><option value="available">Available</option><option value="sold">Sold / archive</option></select></label>
        {category === 'women' && <label className="text-sm font-semibold">Women's collection type<select value={headwear} onChange={(event) => setHeadwear(event.target.value)} className="mt-2 min-h-12 w-full border border-input bg-background px-4"><option value="">All women's pieces</option>{WOMENS_COLLECTION_TYPES.map((name) => <option key={name}>{name}</option>)}</select></label>}
        {category === 'headwear' && <label className="text-sm font-semibold">Headwear collection<select value={headwear} onChange={(event) => setHeadwear(event.target.value)} className="mt-2 min-h-12 w-full border border-input bg-background px-4"><option value="">All hats & beanies</option>{HEADWEAR_COLLECTIONS.map((name) => <option key={name}>{name}</option>)}</select></label>}
      </div>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5"><h2 className="font-display text-4xl uppercase">{label}</h2><p role="status" className="text-sm text-muted-foreground">{products.length} {products.length === 1 ? 'piece' : 'pieces'}</p></div>
      {products.length ? <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} featured />)}</ul> : <p className="mt-8 max-w-xl text-muted-foreground">No published products match this view. Browse another collection or request a custom piece.</p>}
      <Link href="/custom-orders" className="mt-8 inline-flex min-h-12 items-center border border-input px-5 py-3 text-sm font-semibold hover:border-accent">Request Custom Order</Link>
    </>}
  </>
}
