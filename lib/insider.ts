import { isApparel, isCustomApparel, paypalDestination, type Product } from './inventory.ts'

export const INSIDER_PATH = '/insider-club'
export const INSIDER_PLACEMENTS = ['home', 'product', 'cart', 'order', 'footer', 'menu', 'club'] as const
export type InsiderPlacement = typeof INSIDER_PLACEMENTS[number]

const validSources = new Set<string>(
  INSIDER_PLACEMENTS.flatMap((placement) => [placement + '-qr', placement + '-tap']),
)

export function insiderSource(value: unknown): string {
  return typeof value === 'string' && validSources.has(value) ? value : 'direct'
}

export function insiderHref(placement: InsiderPlacement, format: 'qr' | 'tap' = 'tap') {
  return INSIDER_PATH + '?from=' + placement + '-' + format + '#join'
}

export function signupEndpoint(value: string | undefined) {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) return null
    return url.href
  } catch {
    return null
  }
}

export function insiderSignupAction() {
  return signupEndpoint(process.env.INSIDER_FORM_ACTION) ?? signupEndpoint(process.env.WAITLIST_FORM_ACTION)
}

export function insiderOfferEligible(product: Product, allowedIds: ReadonlySet<string>) {
  return allowedIds.has(product.id) && product.ownerConfirmed && product.published && !product.sold &&
    product.inventoryType === 'apparel' && product.stockQuantity !== undefined && product.stockQuantity >= 2 &&
    isApparel(product) && !isCustomApparel(product) && Boolean(paypalDestination(product)) &&
    product.currency === 'USD' && product.price !== null && product.price > 0 &&
    (product.originalPrice == null || product.originalPrice === product.price)
}

export function insiderEligibleIds(products: Product[]) {
  if (!insiderSignupAction()) return new Set<string>()
  const allowlist = new Set((process.env.INSIDER_DISCOUNT_PRODUCT_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean))
  return new Set(products.filter((product) => insiderOfferEligible(product, allowlist)).map(({ id }) => id))
}
