import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { inventory } from '@/lib/inventory-store'
import { galleryProducts } from '@/lib/inventory'
import { productMetaDescription } from '@/lib/seo'
import { productStructuredData, serializeStructuredData } from '@/lib/search-schema'
import { ProductDetail } from '@/components/product-detail'
import { InsiderPlacement } from '@/components/insider-placement'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const products = galleryProducts(inventory)
export function generateStaticParams() { return products.map((product) => ({ id: product.id })) }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) return { title: 'Piece unavailable | TRAUMA', robots: { index: false, follow: false } }
  const description = productMetaDescription(product)
  return { title: `${product.name} | TRAUMA Custom Clothing`, description, openGraph: { title: product.name, description, images: product.photos.slice(0, 1), url: `/products/${product.id}` }, twitter: { card: 'summary_large_image', title: product.name, description, images: product.photos.slice(0, 1) }, alternates: { canonical: `/products/${product.id}` } }
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()
  const schema = productStructuredData(product)
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(schema) }} /><SiteHeader /><main id="main-content"><ProductDetail product={product} /><InsiderPlacement placement="product" compact className="mx-auto max-w-7xl px-4 py-8 md:px-8" /></main><SiteFooter /></>
}
