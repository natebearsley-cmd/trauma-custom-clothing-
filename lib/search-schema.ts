import type { Product } from './inventory.ts'
import { isCustomApparel } from './inventory.ts'
import { STORE_NAME, canonicalUrl, productMetaDescription } from './seo.ts'
import { BRAND_DESCRIPTION, BRAND_TAGLINE } from './brand.ts'

export function organizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': canonicalUrl('/#organization'), name: STORE_NAME, alternateName: ['TRAUMA CC', 'TCC'], url: canonicalUrl('/'), description: BRAND_DESCRIPTION, slogan: BRAND_TAGLINE, email: 'traumacustomclothingofficial@gmail.com', address: { '@type': 'PostalAddress', addressLocality: 'Albany', addressRegion: 'IL', postalCode: '61230', addressCountry: 'US' }, founder: { '@id': canonicalUrl('/#founder') }, sameAs: ['https://payhip.com/Thereversal1', 'https://www.depop.com/traumacc/', 'https://www.tiktok.com/@nateb19841'] },
      { '@type': 'Person', '@id': canonicalUrl('/#founder'), name: 'Nathanial Bearsley', jobTitle: ['Founder', 'Author', 'Recovery Coach', 'Entrepreneur'] },
      { '@type': 'WebSite', '@id': canonicalUrl('/#website'), name: STORE_NAME, alternateName: ['TRAUMA CC', 'TCC'], description: BRAND_DESCRIPTION, url: canonicalUrl('/'), publisher: { '@id': canonicalUrl('/#organization') } },
    ],
  }
}

export function productStructuredData(product: Product) {
  const url = canonicalUrl(`/products/${product.id}`)
  const image = product.photos.map(photo => new URL(photo, url).href)
  // Missing prices/quote-only pages are ordinary WebPages, not incomplete
  // Google Product results. Never invent prices, ratings or product identifiers.
  if (product.price === null || isCustomApparel(product)) {
    return { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${url}#webpage`, url, name: product.name, description: productMetaDescription(product), about: { '@type': 'Thing', name: product.name, image }, publisher: { '@id': canonicalUrl('/#organization') } }
  }
  return { '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, url, name: product.name, description: product.description, image, sku: product.id, brand: { '@type': 'Brand', name: product.brand }, ...(product.size ? { size: product.size } : {}), ...(product.color ? { color: product.color } : {}), offers: { '@type': 'Offer', '@id': `${url}#offer`, url, price: product.price, priceCurrency: product.currency, availability: product.sold || product.stockQuantity === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', seller: { '@id': canonicalUrl('/#organization') } } }
}

export function serializeStructuredData(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c') }
