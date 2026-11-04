import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateInventory, isApparel } from '../lib/inventory.ts'
const inventory = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url)))
test('one-of-one and sold stock constraints prevent contradictory inventory', () => {
  const copy = structuredClone(inventory)
  const product = copy.products.find(p => p.published)
  product.inventoryType = 'one-of-one'
  product.stockQuantity = 2
  assert.throws(() => validateInventory(copy))
  product.stockQuantity = 1
  validateInventory(copy)
  product.sold = true
  assert.throws(() => validateInventory(copy))
  product.stockQuantity = 0
  validateInventory(copy)
})
test('fulfillment rejects invalid weights and conflicting digital shipping', () => {
  const copy = structuredClone(inventory)
  const product = copy.products[0]
  product.packedWeightOz = -1
  assert.throws(() => validateInventory(copy))
  product.packedWeightOz = 20
  product.inventoryType = 'digital'
  product.fulfillmentType = 'physical'
  assert.throws(() => validateInventory(copy))
  product.fulfillmentType = 'digital'
  validateInventory(copy)
  assert.equal(isApparel(product), false)
})
