import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shippingEstimate } from '../lib/shipping.ts'

const item = (name, price, overrides = {}) => ({ name, price, currency: 'USD', category: 'Apparel', ...overrides })

test('each advertised shipping tier applies to its garment type', () => {
  for (const [name, rate] of [['Trucker Hat', 599], ['Graphic Tank', 699], ['Graphic T-Shirt', 699], ['Crewneck Sweatshirt', 999], ['Reworked Denim', 1299], ['Varsity Jacket', 1299]]) {
    assert.equal(shippingEstimate(item(name, 40)), rate, name)
  }
})

test('free shipping starts above $100 and unknown rates are not guessed', () => {
  assert.equal(shippingEstimate(item('Hoodie', 100)), 999)
  assert.equal(shippingEstimate(item('Hoodie', 100.01)), 0)
  assert.equal(shippingEstimate(item('3 piece jumpsuit', 80)), null)
  assert.equal(shippingEstimate(item('Sneakers', 80)), null)
  assert.equal(shippingEstimate(item('Hoodie', null)), null)
  assert.equal(shippingEstimate(item('Hoodie', 115, { currency: 'CAD' })), null)
})
