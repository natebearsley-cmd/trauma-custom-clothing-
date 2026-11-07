import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateInventory, storefrontProducts } from '../lib/inventory.ts'
import { commerceMasterRows, commerceMasterCsv, tiktokPublicationRecords, tiktokPublicationIssues, websiteProductUrl } from '../lib/commerce-master.ts'

const inventory = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url), 'utf8'))
const origin = 'https://tra-coral.vercel.app'
const hat = inventory.products.find((p) => p.sku === 'PMH-001')

test('one saved catalog record feeds website, master export and TikTok publication data', () => {
  const changed = structuredClone(inventory)
  const product = changed.products.find((p) => p.sku === 'PMH-001')
  product.price = 51.25; product.stockQuantity = 2
  const master = commerceMasterRows(changed, origin).find((p) => p.sku === 'PMH-001')
  const tiktok = tiktokPublicationRecords(changed, origin).find((p) => p.sku === 'PMH-001')
  assert.equal(master.price, product.price); assert.equal(tiktok.price, product.price)
  assert.equal(master.inventory, product.stockQuantity); assert.equal(tiktok.inventory, product.stockQuantity)
  assert.equal(master.paypalUrl, product.paypalUrl)
  assert.equal(master.productUrl, `${origin}/products/${product.id}`)
  assert.equal(master.physicalInventoryTag, '0461')
  const future = { ...product, id: 'test-only-future', sku: 'FUTURE-TEST', physicalInventoryTag: 'FUTURE-TAG', paypalUrl: '' }
  changed.products.push(future)
  assert.ok(commerceMasterRows(changed, origin).some((p) => p.sku === 'FUTURE-TEST'))
  assert.ok(tiktokPublicationRecords(changed, origin).some((p) => p.sku === 'FUTURE-TEST'))
})

test('unpublished SKU-only records stay out of the storefront and unknown facts stay missing', () => {
  const incomplete = { ...hat, id: 'test-only-incomplete', sku: 'TEST-INCOMPLETE', physicalInventoryTag: 'TEST-TAG',
    name: '', price: null, stockQuantity: undefined, photos: [], photoViews: [], paypalUrl: '', published: false }
  const fixture = { version: 1, products: [incomplete] }
  validateInventory(fixture)
  assert.equal(websiteProductUrl(incomplete, origin), null)
  assert.equal(storefrontProducts(fixture).length, 0)
  const row = commerceMasterRows(fixture, origin).find((p) => p.sku === incomplete.sku)
  assert.equal(row.price, null); assert.equal(row.inventory, null); assert.equal(row.productUrl, null)
  assert.equal(row.paypalUrl, null); assert.equal(row.tiktokProductId, null)
  const changed = structuredClone(fixture); changed.products[0].published = true
  assert.throws(() => validateInventory(changed), /Product name is required/)
})

test('publication checks retain missing measurements and duplicate checks until completed', () => {
  assert.equal(tiktokPublicationRecords(inventory, origin).filter((p) => p.importReady).length, 0)
  const candidate = { ...hat, size: 'Test size', packedWeightOz: 8,
    packageDimensionsIn: { length: 8, width: 8, height: 5 }, tiktokCategoryId: 'TEST-CATEGORY',
    tiktokCategoryPath: 'Test category', tiktokPhotosApproved: true, tiktokListingChecked: true,
  }
  assert.deepEqual(tiktokPublicationIssues(candidate), [])
  assert.ok(tiktokPublicationIssues({ ...candidate, packageDimensionsIn: undefined }).some((p) => p.includes('dimensions') || p.includes('length')))
  assert.ok(tiktokPublicationIssues({ ...candidate, tiktokListingChecked: false }).some((p) => p.includes('prevent duplicates')))
  assert.ok(tiktokPublicationIssues({ ...candidate, tiktokDescription: 'Buy with PayPal https://example.com' }).some((p) => p.includes('off-platform')))
  const updated = { ...candidate, tiktokProductId: 'EXISTING-TEST-ID' }
  const publication = tiktokPublicationRecords({ version: 1, products: [updated] }, origin)[0]
  assert.equal(publication.action, 'Review existing TikTok listing')
  assert.equal(publication.tiktokProductId, 'EXISTING-TEST-ID')
  assert.ok(publication.photos[0].startsWith(`${origin}/images/`))
})

test('exports preserve zero stock, escape CSV formulas, and validate channel metadata', () => {
  const altered = structuredClone(inventory)
  const product = altered.products.find((p) => p.sku === 'PMH-001')
  product.name = '=1+1'; product.stockQuantity = 0; product.sold = true
  const csv = commerceMasterCsv(altered, origin)
  assert.ok(csv.includes("'=1+1")); assert.ok(csv.includes("'0461"))
  assert.equal(commerceMasterRows(altered, origin)[0].inventory, 0)
  for (const patch of [{ packageDimensionsIn: { length: 0, width: 2, height: 3 } },
    { tiktokPhotosApproved: 'yes' }, { tiktokProductId: 'https://not-an-id' },
    { productUrl: 'javascript:alert(1)' }]) {
    const changed = structuredClone(inventory); Object.assign(changed.products.find((p) => p.sku === 'PMH-001'), patch)
    assert.throws(() => validateInventory(changed))
  }
})
