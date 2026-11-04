import type { Product } from './inventory'

export const SHIPPING_ORIGIN = 'Albany, Illinois, USA'
export const PROCESSING_TIME = '1–3 business days'
export const FREE_SHIPPING_OVER_CENTS = 10_000
export const DELIVERY_TIMES = {
  domestic: { label: 'United States', transit: '3–7 business days', fromOrder: '4–10 business days' },
  international: { label: 'International', transit: '7–21 business days', fromOrder: '8–24 business days' },
} as const

export const SHIPPING_RATES = [
  { id: 'accessories', label: 'Accessories / Hats / Beanies', cents: 599 },
  { id: 'shirts', label: 'T-Shirts / Tanks', cents: 699 },
  { id: 'hoodies', label: 'Hoodies / Sweatshirts', cents: 999 },
  { id: 'denim', label: 'Denim / Jackets', cents: 1299 },
] as const

export function shippingEstimate(product: Pick<Product, 'name' | 'productType' | 'category' | 'price' | 'currency'>) {
  if (product.price === null || product.currency !== 'USD') return null
  const subtotalCents = Math.round(product.price * 100)
  if (subtotalCents > FREE_SHIPPING_OVER_CENTS) return 0
  const type = [product.productType, product.name, product.category].filter(Boolean).join(' ')
  if (/matching set|jumpsuit|\b[23][ -]piece\b/i.test(type)) return null
  if (/accessor|\bhats?\b|beanie|trucker|headwear/i.test(type)) return SHIPPING_RATES[0].cents
  if (/hoodie|sweatshirt|crewneck/i.test(type)) return SHIPPING_RATES[2].cents
  if (/denim|jacket|jeans|capris|carpenter/i.test(type)) return SHIPPING_RATES[3].cents
  if (/t[ -]?shirts?|\btees?\b|\btank\b/i.test(type)) return SHIPPING_RATES[1].cents
  return null
}

export const usd = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
