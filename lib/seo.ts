import type { Product } from './inventory.ts'
export { STORE_NAME } from './brand.ts'
import { STORE_NAME } from './brand.ts'

const configuredUrl = new URL(process.env.SITE_URL || 'https://tra-coral.vercel.app/')
if (configuredUrl.protocol !== 'https:' || configuredUrl.username || configuredUrl.password || configuredUrl.pathname !== '/' || configuredUrl.search || configuredUrl.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without credentials, path, query or fragment')
}
export const siteUrl = new URL(`${configuredUrl.origin}/`)
export const canonicalUrl = (path: string) => new URL(path, siteUrl).href

export const PUBLIC_PAGE_SEO = {
  '/': { title: 'TRAUMA Custom Clothing | Streetwear With a Story', description: 'Shop TRAUMA Custom Clothing: trucker hats, graphic hoodies and custom streetwear for mental health awareness, overdose awareness and the recovery community.' },
  '/collections': { title: 'Streetwear, Trucker Hats & Hoodies | TRAUMA Custom Clothing', description: 'Browse TRAUMA Custom Clothing trucker hats, graphic hoodies, tees and reworked denim. Explore streetwear with a story, real product photos and purchase options.' },
  '/collections/tiktok': { title: 'TikTok Streetwear Collection | TRAUMA Custom Clothing', description: 'Explore TRAUMA Custom Clothing statement trucker hats, graphic hoodies and custom denim. Find your next streetwear piece and view its purchase options.' },
  '/custom-orders': { title: 'Request Custom Clothing | TRAUMA Custom Clothing', description: 'Request a TRAUMA custom clothing quote. Share your design, sizes and quantities for personal apparel, memorial pieces, business clothing or team orders.' },
  '/contact': { title: 'Contact TRAUMA | Orders, Custom Clothing & Shipping', description: 'Contact TRAUMA Custom Clothing about a piece, custom quote or order. Ask about buyer-paid shipping from Albany, Illinois 61230 before payment.' },
  '/shipping': { title: 'Shipping Policy | TRAUMA Custom Clothing', description: 'TRAUMA ships from Albany, Illinois 61230 with buyer-paid UPS Ground shipping and tracking. Review processing times and the USPS Ground Advantage backup.' },
  '/returns': { title: 'Returns & Order Issues | TRAUMA Custom Clothing', description: 'Read TRAUMA’s returns policy for custom and one-of-one clothing, including how to report damaged deliveries or incorrect items within seven days.' },
  '/insider-club': { title: 'TRAUMA Insider Club | TRAUMA Custom Clothing', description: 'Get first look at independent TRAUMA streetwear, reworked denim and one-of-one drops. Find out how to join the TRAUMA Insider Club.' },
  '/gives-back': { title: 'TRAUMA Gives Back | TRAUMA Custom Clothing', description: 'Learn how TRAUMA plans to support recovery, rehabilitation, mental health and community assistance, and how future campaigns will be reported.' },
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
