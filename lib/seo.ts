import type { Product } from './inventory.ts'

export const STORE_NAME = 'TRAUMA Custom Clothing'
const configuredUrl = new URL(process.env.SITE_URL || 'https://tra-coral.vercel.app/')
if (configuredUrl.protocol !== 'https:' || configuredUrl.username || configuredUrl.password || configuredUrl.pathname !== '/' || configuredUrl.search || configuredUrl.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without credentials, path, query or fragment')
}
export const siteUrl = new URL(`${configuredUrl.origin}/`)
export const canonicalUrl = (path: string) => new URL(path, siteUrl).href

export const PUBLIC_PAGE_SEO = {
  '/': { title: 'TRAUMA Custom Clothing | Custom Apparel & Reworked Denim', description: 'Explore TRAUMA custom apparel, reworked denim, one-of-one pieces and recovery-inspired digital products. Independent clothing from Albany, Illinois.' },
  '/collections': { title: 'Apparel & One-of-One Collections | TRAUMA Custom Clothing', description: 'Browse TRAUMA hoodies, graphic tees, reworked denim, hats and one-of-one clothing. View garment photos, sizing, stories and purchase options.' },
  '/collections/tiktok': { title: 'TikTok Collection | TRAUMA Custom Clothing', description: 'Discover the TRAUMA TikTok collection: statement hoodies, custom denim and graphic tees. Explore available pieces and confirm shipping before payment.' },
  '/custom-orders': { title: 'Request Custom Clothing | TRAUMA Custom Clothing', description: 'Request a TRAUMA custom clothing quote. Share your design, sizes and quantities for personal apparel, memorial pieces, business clothing or team orders.' },
  '/contact': { title: 'Contact TRAUMA | Orders, Custom Clothing & Shipping', description: 'Contact TRAUMA Custom Clothing about a piece, custom quote or order. Ask about buyer-paid shipping from Albany, Illinois 61230 before payment.' },
  '/shipping': { title: 'Shipping Policy | TRAUMA Custom Clothing', description: 'TRAUMA ships from Albany, Illinois 61230 with buyer-paid UPS Ground shipping and tracking. Review processing times and the USPS Ground Advantage backup.' },
  '/returns': { title: 'Returns & Order Issues | TRAUMA Custom Clothing', description: 'Read TRAUMA’s returns policy for custom and one-of-one clothing, including how to report damaged deliveries or incorrect items within seven days.' },
  '/faq': { title: 'Clothing, Custom Orders & Shipping FAQ | TRAUMA', description: 'Find answers about TRAUMA custom orders, shipping from Albany, Illinois, UPS Ground delivery estimates and how to get help with an order.' },
} as const

export function publicPageMetadata(path: keyof typeof PUBLIC_PAGE_SEO) {
  const { title, description } = PUBLIC_PAGE_SEO[path]
  return { title, description, alternates: { canonical: path }, openGraph: { type: 'website' as const, title, description, url: path, siteName: STORE_NAME, images: ['/images/hero.png'] }, twitter: { card: 'summary_large_image' as const, title, description, images: ['/images/hero.png'] } }
}

export function productMetaDescription(product: Product): string {
  const intro = `${product.name}${product.size.trim() ? ` (${product.size.trim()})` : ''} by TRAUMA Custom Clothing.`
  const details = product.description.replace(/\s+/g, ' ').trim()
  const text = `${intro} ${details}`.replace(/\s+/g, ' ').trim()
  if (text.length <= 160) return text
  const shortened = text.slice(0, 157).replace(/\s+\S*$/, '').replace(/[.,;:!?–—-]+$/, '')
  return `${shortened}...`
}
