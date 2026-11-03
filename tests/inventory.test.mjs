import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import {
  validateInventory,
  storefrontProducts,
  safeUrl,
  isDepopUrl,
  isPayhipProductUrl,
} from '../lib/inventory.ts'
const inventory = JSON.parse(
  readFileSync(new URL('../data/inventory.json', import.meta.url)),
)
const copy = () => structuredClone(inventory)

test('existing inventory is valid, all photo paths exist, and no unconfirmed drafts are public', () => {
  validateInventory(inventory)
  for (const p of inventory.products)
    for (const photo of p.photos)
      assert.ok(
        existsSync(new URL(`../public${photo}`, import.meta.url)),
        photo,
      )
  assert.equal(storefrontProducts(inventory).length, 0)
  assert.equal(storefrontProducts(inventory, true).length, 0)
})
test('publishing incomplete or unconfirmed repository entries is rejected', () => {
  const data = copy()
  data.products[0].published = true
  assert.throws(() => validateInventory(data), /confirm ownership/)
})
test('sold routing uses published owner-confirmed entries and never includes drafts', () => {
  const data = copy()
  const p = data.products[0]
  // Exercise visibility only using an existing repository entry; no fixture listing is persisted.
  p.published = true
  p.ownerConfirmed = true
  p.sold = true
  assert.equal(storefrontProducts(data).length, 1)
  p.soldDisplay = 'archive'
  assert.equal(storefrontProducts(data).length, 0)
  assert.equal(storefrontProducts(data, true).length, 1)
  p.published = false
  assert.equal(storefrontProducts(data, true).length, 0)
})
test('duplicate IDs, unsafe URLs, invalid statuses and prices are rejected', () => {
  for (const mutate of [
    (d) => {
      d.products[1].id = d.products[0].id
    },
    (d) => {
      d.products[0].purchaseUrl = 'javascript:alert(1)'
    },
    (d) => {
      d.products[0].payhipUrl = 'https://payhip.com/Thereversal1'
    },
    (d) => {
      d.products[0].photos = ['/images/../private.png']
    },
    (d) => {
      d.products[0].sold = 'false'
    },
    (d) => {
      d.products[0].price = -1
    },
    (d) => {
      d.products[0].price = 1.001
    },
    (d) => {
      d.products[0].source = 'generated'
    },
    (d) => {
      d.products[0].source = 'depop'
      d.products[0].sourceUrl = 'https://depop.com.attacker.example/'
    },
  ]) {
    const data = copy()
    mutate(data)
    assert.throws(() => validateInventory(data))
  }
  assert.equal(safeUrl('https://user:password@depop.com'), false)
  assert.equal(isDepopUrl('https://www.depop.com/atec911/'), true)
})

test('Buy Now destinations must be direct Payhip product pages', () => {
  assert.equal(isPayhipProductUrl('https://payhip.com/Thereversal1'), false)
  assert.equal(isPayhipProductUrl('https://www.depop.com/atec911/'), false)
  assert.equal(
    isPayhipProductUrl('https://payhip.com.attacker.example/b/test'),
    false,
  )
  assert.equal(isPayhipProductUrl('javascript:alert(1)'), false)
})

test('featured products never include drafts, unconfirmed entries or sold products', async () => {
  const { featuredProducts } = await import('../lib/inventory.ts')
  assert.deepEqual(featuredProducts(inventory), [])
  const data = copy()
  const product = data.products.find((p) => p.id === 'the-reversal-guide')
  product.published = true
  assert.equal(featuredProducts(data).length, 1)
  product.sold = true
  assert.equal(featuredProducts(data).length, 0)
  product.sold = false
  product.ownerConfirmed = false
  assert.equal(featuredProducts(data).length, 0)
})

test('featured apparel routes existing clothing categories and excludes unavailable entries', async () => {
  const { featuredApparel, isApparel } = await import('../lib/inventory.ts')
  const data = copy()
  const garment = data.products[0]
  garment.published = true
  garment.ownerConfirmed = true
  garment.featured = true
  assert.equal(isApparel(garment), true)
  assert.deepEqual(featuredApparel(data).map((p) => p.id), [garment.id])
  garment.sold = true
  assert.deepEqual(featuredApparel(data), [])
  assert.equal(isApparel(data.products.find((p) => p.category === 'Books')), false)
})

test('Payhip source requires a direct product URL rather than the shop homepage', () => {
  const data = copy()
  data.products[0].source = 'payhip'
  data.products[0].sourceUrl = 'https://payhip.com/Thereversal1'
  assert.throws(() => validateInventory(data), /direct Payhip source/)
})
