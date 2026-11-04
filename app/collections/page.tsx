import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CollectionBrowser } from '@/components/collection-browser'
import { inventory } from '@/lib/inventory-store'
import { GALLERY_CATEGORIES, galleryProducts } from '@/lib/inventory'

export const metadata = { title: 'TRAUMA Collections', description: 'Explore original TRAUMA apparel, headwear, one-of-one artwear, books, and custom orders.', alternates: { canonical: '/collections' } }
export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ category?: string; collection?: string; availability?: string; q?: string }> }) {
  const query = await searchParams
  const requested = ['all', 'apparel', ...GALLERY_CATEGORIES.map((item) => item.id)].includes(query.category ?? '') ? query.category! : 'all'
  const category = galleryProducts(inventory, requested).length ? requested : 'all'
  const availability = ['all', 'available', 'sold'].includes(query.availability ?? '') ? query.availability! : 'all'
  const search = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  return <><SiteHeader /><main id="main-content" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24"><p className="eyebrow">Original pieces · Independent stories</p><h1 className="section-title">Featured Lineup</h1><p className="mt-6 max-w-2xl text-lg text-muted-foreground">Explore the gallery. Open a piece for its photographs, story, sizing, and purchase options.</p><CollectionBrowser key={`${category}-${query.collection ?? ''}-${availability}-${search}`} initialSearch={search} inventory={{ version: inventory.version, products: galleryProducts(inventory) }} category={category} collection={typeof query.collection === 'string' ? query.collection : ''} availability={availability} /></main><SiteFooter /></>
}
