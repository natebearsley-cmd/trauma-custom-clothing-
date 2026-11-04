import type { Product } from './inventory'

export const SHIPPING_ORIGIN_POSTAL_CODE = '61230'
export const SHIPPING_ORIGIN = `Albany, Illinois ${SHIPPING_ORIGIN_POSTAL_CODE}, USA`
export const PROCESSING_TIME = 'Most orders ship within 1 business day when inventory is available'
export const DEFAULT_SHIPPING_SERVICE = 'UPS Ground' as const
export const SHIPPING_SERVICES = [DEFAULT_SHIPPING_SERVICE, 'USPS Ground Advantage'] as const
export type ShippingService = typeof SHIPPING_SERVICES[number]
export const DELIVERY_TIMES = {
  domestic: { label: 'United States', transit: '3–5 business days with UPS Ground', fromOrder: 'Processing time plus carrier transit time' },
} as const

// Carrier rates require destination, packed weight and dimensions. Never infer
// weight from a garment name or advertise an unconfigured rate as a quote.
export function shippingRequest(items: { product: Pick<Product, 'id' | 'fulfillmentType' | 'packedWeightOz'>; quantity: number }[], destinationPostalCode: string, service: ShippingService = DEFAULT_SHIPPING_SERVICE) {
  if (!/^\d{5}(?:-\d{4})?$/.test(destinationPostalCode) || !SHIPPING_SERVICES.includes(service) || !items.length) throw new Error('Choose a US destination, service, and items')
  let packedWeightOz = 0
  for (const { product, quantity } of items) {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) throw new Error('Invalid quantity')
    if (product.fulfillmentType === 'digital') continue
    if (!Number.isFinite(product.packedWeightOz) || product.packedWeightOz! <= 0) throw new Error(`Packed weight required for ${product.id}`)
    packedWeightOz += product.packedWeightOz! * quantity
  }
  const maxWeightOz = service === 'UPS Ground' ? 2400 : 1120
  if (packedWeightOz > maxWeightOz) throw new Error('Package exceeds the selected carrier weight limit; request a separate quote')
  return { originCity: 'Albany', originState: 'IL', originPostalCode: SHIPPING_ORIGIN_POSTAL_CODE, destinationPostalCode, service, packedWeightOz, buyerPaysShipping: true as const, trackingIncluded: true as const, requiresCarrierQuote: packedWeightOz > 0 }
}

export function shippingEstimate(product: Pick<Product, 'fulfillmentType'>): number | null {
  return product.fulfillmentType === 'digital' ? 0 : null
}
export const usd = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

// Feed this payload to a server-side UPS/USPS-capable rate provider. API keys and
// label purchasing belong on the server; the browser must not submit prices.
export function carrierQuoteRequest(request: ReturnType<typeof shippingRequest>, originPostalCode: string, dimensionsIn: { length: number; width: number; height: number }) {
  if (originPostalCode !== SHIPPING_ORIGIN_POSTAL_CODE) throw new Error('Shipping origin must be the confirmed Albany, Illinois ZIP 61230')
  if (!request.requiresCarrierQuote) throw new Error('Digital orders do not need a carrier quote')
  if (Object.values(dimensionsIn).some(value => !Number.isFinite(value) || value <= 0)) throw new Error('Measured package dimensions are required')
  return { ...request, originPostalCode, originCountry: 'US', destinationCountry: 'US', dimensionsIn }
}
