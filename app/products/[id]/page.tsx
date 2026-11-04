import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { inventory } from '@/lib/inventory-store'
import { galleryProducts, productDestination } from '@/lib/inventory'
import { siteUrl } from '@/lib/seo'
import { ProductDetail } from '@/components/product-detail'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const products = galleryProducts(inventory)
export function generateStaticParams() { return products.map((product) => ({ id: product.id })) }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) return { title: 'Piece unavailable | TRAUMA', robots: { index: false, follow: false } }
  return { title: `${product.name} | TRAUMA Collections`, description: product.description.slice(0, 160), openGraph: { title: product.name, description: product.description.slice(0, 160), images: product.photos.slice(0, 1), url: `/products/${product.id}` }, alternates: { canonical: `/products/${product.id}` } }
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()
  const destination = productDestination(product)
  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.photos.map(photo => new URL(photo, siteUrl).href), sku: product.id, brand: { '@type': 'Brand', name: product.brand }, ...(destination && product.price !== null ? { offers: { '@type': 'Offer', url: destination.url, price: product.price, priceCurrency: product.currency, availability: product.sold ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' } } : {}) }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><SiteHeader /><main id="main-content"><ProductDetail product={product} /></main><SiteFooter /></>
}
