import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shippingEstimate, shippingRequest, SHIPPING_ORIGIN } from '../lib/shipping.ts'

test('physical shipping is buyer paid, weight based, and originates in Illinois', () => {
  assert.equal(SHIPPING_ORIGIN, 'Albany, Illinois 61230, USA')
  const product = { id: 'denim', fulfillmentType: 'physical', packedWeightOz: 24 }
  const request = shippingRequest([{ product, quantity: 2 }], '90210', 'USPS Ground Advantage')
  assert.equal(request.originState, 'IL')
  assert.equal(request.originPostalCode, '61230')
  assert.equal(request.packedWeightOz, 48)
  assert.equal(request.buyerPaysShipping, true)
  assert.equal(request.requiresCarrierQuote, true)
  assert.equal(shippingEstimate(product), null)
  assert.equal(shippingEstimate({ price: 200 }), null)
})
test('digital fulfillment has no physical shipping', () => {
  const product = { id: 'journal', fulfillmentType: 'digital' }
  assert.equal(shippingEstimate(product), 0)
  assert.equal(shippingRequest([{ product, quantity: 1 }], '90210', 'UPS Ground').requiresCarrierQuote, false)
})
test('missing weights, invalid destinations, quantities and oversized parcels fail closed', () => {
  const product = { id: 'custom', packedWeightOz: 20 }
  assert.throws(() => shippingRequest([{ product: { id: 'unknown' }, quantity: 1 }], '90210', 'USPS Ground Advantage'))
  assert.throws(() => shippingRequest([{ product, quantity: 1 }], 'bad', 'USPS Ground Advantage'))
  assert.throws(() => shippingRequest([{ product, quantity: 0 }], '90210', 'USPS Ground Advantage'))
  assert.throws(() => shippingRequest([{ product, quantity: 60 }], '90210', 'USPS Ground Advantage'))
  assert.throws(() => shippingRequest([{ product, quantity: 1 }], '90210', 'Free shipping'))
})

test('carrier payload requires a confirmed origin ZIP and measured dimensions', async () => {
  const { carrierQuoteRequest } = await import('../lib/shipping.ts')
  const request = shippingRequest([{ product: { id: 'hoodie', packedWeightOz: 28 }, quantity: 1 }], '90210', 'USPS Ground Advantage')
  assert.throws(() => carrierQuoteRequest(request, '', { length: 12, width: 10, height: 3 }))
  assert.throws(() => carrierQuoteRequest(request, '61230', { length: 0, width: 10, height: 3 }))
  assert.throws(() => carrierQuoteRequest(request, '12345', { length: 12, width: 10, height: 3 }))
  assert.equal(carrierQuoteRequest(request, '61230', { length: 12, width: 10, height: 3 }).originState, 'IL')
})

test('UPS Ground defaults to tracked buyer-paid shipping and uses its own weight limit', () => {
  const product = { id: 'bulk-apparel', packedWeightOz: 1200 }
  const request = shippingRequest([{ product, quantity: 1 }], '90210')
  assert.equal(request.service, 'UPS Ground')
  assert.equal(request.trackingIncluded, true)
  assert.throws(() => shippingRequest([{ product, quantity: 1 }], '90210', 'USPS Ground Advantage'))
  assert.throws(() => shippingRequest([{ product, quantity: 3 }], '90210'))
})
