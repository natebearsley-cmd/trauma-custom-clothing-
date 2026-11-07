import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isPayPalProductUrl, paypalBuyNowDestination, validateInventory } from '../lib/inventory.ts'
import { commerceCatalog, commerceRequirements, paypalShopProducts } from '../lib/commerce.ts'

const inventory = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url), 'utf8'))
const hat = inventory.products.find((p) => p.sku === 'PMH-001')

test('direct checkout supports future catalog SKUs without hard-coded product IDs', () => {
  assert.equal(paypalBuyNowDestination(hat), hat.paypalUrl)
  const future = { ...hat, id: 'test-only-future-product', sku: 'TEST-002', physicalInventoryTag: 'TEST-002',
    paypalUrl: 'https://www.paypal.com/ncp/payment/TESTONLY' }
  assert.equal(paypalBuyNowDestination(future), future.paypalUrl)
  for (const patch of [{ sku: '' }, { physicalInventoryTag: '' }, { photos: [] }, { description: '' },
    { stockQuantity: 0 }, { stockQuantity: undefined }, { stockQuantity: 1.5 }, { price: null }, { price: 0 },
    { published: false }, { ownerConfirmed: false }, { sold: true }, { orderType: 'custom' },
    { paypalUrl: 'https://paypal.me/NathanialBearsley' }, { paypalUrl: 'https://paypal.com.attacker.example/ncp/payment/TESTONLY' }]) {
    const product = { ...future, ...patch }
    assert.equal(paypalBuyNowDestination(product), null, JSON.stringify(patch))
    assert.equal(paypalShopProducts({ version: 1, products: [product] }).length, 0)
    assert.ok(commerceRequirements(product).length)
  }
})

test('checkout URLs are product specific and cannot be reused for another physical item', () => {
  assert.equal(isPayPalProductUrl(hat.paypalUrl), true)
  for (const value of ['https://paypal.me/NathanialBearsley', 'http://www.paypal.com/ncp/payment/TESTONLY',
    'https://user:password@www.paypal.com/ncp/payment/TESTONLY', 'https://www.paypal.com:8443/ncp/payment/TESTONLY'])
    assert.equal(isPayPalProductUrl(value), false)
  const other = { ...hat, id: 'test-only-second-item', sku: 'TEST-002', physicalInventoryTag: 'TEST-002' }
  assert.throws(() => validateInventory({ version: 1, products: [hat, other] }), /checkout link/)
  assert.throws(() => validateInventory({ version: 1, products: [hat, { ...other, paypalUrl: '', sku: 'pmh-001' }] }), /SKU/)
  assert.throws(() => validateInventory({ version: 1, products: [hat, { ...other, paypalUrl: '', physicalInventoryTag: '0461' }] }), /Physical inventory tag/)
  assert.throws(() => validateInventory({ version: 1, products: [{ ...hat, physicalInventoryTag: 461 }] }), /Physical inventory tag/)
})

test('launch catalog references existing records without inventing missing products or assets', () => {
  const rows = commerceCatalog(inventory)
  const pmh = rows.find((p) => p.sku === 'PMH-001')
  assert.equal(pmh.physicalInventoryTag, '0461')
  assert.equal(pmh.paypalUrl, hat.paypalUrl)
  assert.deepEqual(pmh.missing, [])
  const pink = rows.find((p) => p.sku === 'RTS-001')
  assert.equal(pink.product, undefined)
  assert.equal(pink.physicalInventoryTag, null)
  assert.equal(pink.paypalUrl, null)
  assert.ok(pink.missing.includes('Connect existing product'))
  const anx = rows.find((p) => p.sku === 'ANX-001')
  assert.equal(anx.product, undefined)
  assert.equal(anx.physicalInventoryTag, null)
  assert.deepEqual(paypalShopProducts(inventory).map((p) => p.sku), ['PMH-001'])
})
