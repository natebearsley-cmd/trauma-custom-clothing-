import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { inventory } from '@/lib/inventory-store'
import { galleryProducts } from '@/lib/inventory'
import { ProductDetail } from '@/components/product-detail'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const products = galleryProducts(inventory)
export function generateStaticParams() { return products.map((product) => ({ id: product.id })) }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) return { title: 'Piece unavailable | TRAUMA', robots: { index: false, follow: false } }
  return { title: `${product.name} | TRAUMA Collections`, description: product.description.slice(0, 160), alternates: { canonical: `/products/${product.id}` } }
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()
  return <><SiteHeader /><main id="main-content"><ProductDetail product={product} /></main><SiteFooter /></>
}
