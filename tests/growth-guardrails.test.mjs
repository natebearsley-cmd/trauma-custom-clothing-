import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { offerDecision, offerThresholds } from '../lib/offers.ts'
import { insiderOfferEligible, insiderSource, signupEndpoint } from '../lib/insider.ts'
import { generateTikTokListing, tiktokReviewFlags } from '../lib/tiktok-shop.ts'

const { products } = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url), 'utf8'))
const denim = products.find(({ id }) => id === 'trauma-made-me-denim-jacket')

test('offer rules use the higher of the contribution floor and the percentage threshold', () => {
  const standard = { listCents: 10000, costCents: 5400, targetCents: 1100, feeBasisPoints: 500, oneOfOne: false }
  assert.deepEqual(offerThresholds(standard), { marginFloor: 6843, reviewFloor: 7500, acceptFloor: 9000, autoFloor: 9000 })
  assert.equal(offerDecision(standard, 7499), 'decline')
  assert.equal(offerDecision(standard, 7500), 'review')
  assert.equal(offerDecision(standard, 8999), 'review')
  assert.equal(offerDecision(standard, 9000), 'auto-accept-candidate')
  assert.equal(offerDecision({ ...standard, oneOfOne: true }, 9500), 'review')
  assert.equal(offerDecision({ ...standard, costCents: 8000 }, 9000), 'decline')
  assert.equal(offerThresholds({ ...standard, feeBasisPoints: 10000 }), null)
  assert.equal(offerThresholds({ ...standard, costCents: 10000 }).autoFloor, null)
})

test('discount cannot apply to a one-off, discounted stock, or unapproved items', () => {
  const apparel = { ...denim, inventoryType: 'apparel', orderType: 'ready-made', stockQuantity: 3, price: 75, originalPrice: null, paypalUrl: 'https://paypal.me/example' }
  assert.equal(insiderOfferEligible(apparel, new Set([denim.id])), true)
  for (const patch of [{ stockQuantity: 1 }, { inventoryType: 'one-of-one' }, { originalPrice: 90 }, { sold: true }, { published: false }, { orderType: 'custom' }, { paypalUrl: '' }]) {
    assert.equal(insiderOfferEligible({ ...apparel, ...patch }, new Set([denim.id])), false)
  }
  assert.equal(insiderOfferEligible(apparel, new Set()), false)
})

test('signup rejects unsafe endpoints and unknown source labels', () => {
  assert.equal(signupEndpoint('https://signup.example/form'), 'https://signup.example/form')
  for (const unsafe of ['http://signup.example/', 'https://x:y@signup.example/', 'https://signup.example/#join', 'javascript:alert(1)', '/form']) assert.equal(signupEndpoint(unsafe), null)
  assert.equal(insiderSource('order-qr'), 'order-qr')
  assert.equal(insiderSource('person@example.com'), 'direct')
  assert.equal(insiderSource(['cart-qr']), 'direct')
})

test('TikTok prep flags a reworked branded item and removes generic filler without repeating size', () => {
  const adidas = products.find(({ id }) => id === 'adidas-nizza-rf-purple-chain-custom')
  assert.ok(tiktokReviewFlags(adidas).some((flag) => flag.includes('Third-party')))
  const camo = products.find(({ name }) => name.startsWith('Camp xl'))
  assert.ok(tiktokReviewFlags(camo).some((flag) => flag.includes('bundle')))
  assert.equal(generateTikTokListing({ ...denim, name: 'Rare Find TRAUMA Denim Jacket XL high quality', productType: 'Jacket' }).title, 'TRAUMA Denim Jacket XL')
  assert.equal(generateTikTokListing({ ...denim, name: 'TRAUMA Denim Jacket', productType: 'Jacket' }).title, 'TRAUMA Denim Jacket XL')
})
