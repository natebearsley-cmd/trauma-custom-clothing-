import type { MetadataRoute } from 'next'
import { inventory } from '@/lib/inventory-store'
import { galleryProducts } from '@/lib/inventory'
import { siteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL('/', siteUrl).href, changeFrequency: 'weekly', priority: 1 },
    { url: new URL('/collections', siteUrl).href, changeFrequency: 'weekly', priority: 0.9 },
    { url: new URL('/custom-orders', siteUrl).href, changeFrequency: 'monthly', priority: 0.7 },
    ...['/collections/live-launch', '/collections/tiktok', '/shipping', '/returns', '/faq', '/contact', '/insider-club', '/gives-back'].map((path) => ({ url: new URL(path, siteUrl).href, changeFrequency: 'monthly' as const })),
    ...galleryProducts(inventory).map((product) => ({ url: new URL(`/products/${product.id}`, siteUrl).href, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ]
}
