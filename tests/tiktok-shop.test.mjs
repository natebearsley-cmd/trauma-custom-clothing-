import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { generateTikTokListing, tiktokPriority, tiktokReadinessIssues } from '../lib/tiktok-shop.ts'
import { validateInventory } from '../lib/inventory.ts'
import { buildQuickAddProduct } from '../lib/quick-add.ts'

const inventory = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url), 'utf8'))
const hoodie = inventory.products.find(({ id }) => id === 'ptsd-edition-me-vs-myself-hoodie')
const jacket = inventory.products.find(({ id }) => id === 'toxic-trauma-bond')

test('approved apparel generates copy from real product facts without off-platform checkout links', () => {
  const listing = generateTikTokListing({
    ...hoodie, description: hoodie.description + '\nBuy on Depop: https://www.depop.com/traumacc/',
  })
  assert.ok(listing.title.includes('PTSD'))
  assert.equal(listing.price, '$82.44')
  assert.ok(listing.bullets.includes('Size: XL'))
  assert.ok(listing.hashtags.includes('#TRAUMACC'))
  assert.doesNotMatch(JSON.stringify(listing), /https?:|Buy on Depop/i)
  assert.ok(listing.caption.includes(listing.title))
})

test('unconfirmed items cannot produce copy, and an unknown price stays blank and blocks readiness', () => {
  assert.equal(generateTikTokListing({ ...hoodie, ownerConfirmed: false }), null)
  assert.equal(generateTikTokListing({ ...hoodie, photos: [] }), null)
  const missingPrice = { ...hoodie, price: null }
  assert.equal(generateTikTokListing(missingPrice).price, '')
  assert.deepEqual(tiktokReadinessIssues(missingPrice), ['Confirm the price.'])
  assert.ok(tiktokReadinessIssues({ ...hoodie, sold: true }).includes('This item is marked sold.'))
})

test('priority classifies the real hoodie and one-of-one jacket separately and groups matching sets', () => {
  assert.equal(tiktokPriority(hoodie).label, 'Hoodies')
  assert.equal(tiktokPriority(jacket).label, 'One-of-one jackets')
  assert.equal(tiktokPriority({ ...hoodie, category: 'Matching Sets' }).label, 'Matching sets')
})

test('Quick Add persists TikTok readiness without publishing the storefront draft', () => {
  const session = '12345678-1234-1234-1234-123456789abc'
  const product = buildQuickAddProduct({
    name: hoodie.name, description: hoodie.description, price: hoodie.price, category: 'Outerwear',
    depopUrl: '', paypalUrl: '', payhipUrl: '', featured: false, published: false,
    ownerConfirmed: true, reviewApproved: false, tiktokReady: true,
  }, ['/images/products/admin/hoodie.jpg'], session)
  assert.equal(product.tiktokShopStatus, 'ready')
  assert.equal(product.published, false)
  validateInventory({ version: 1, products: [product] })
  assert.throws(() => validateInventory({ version: 1, products: [{ ...product, tiktokShopStatus: 'auto-published' }] }), /Invalid TikTok Shop status/)
})
