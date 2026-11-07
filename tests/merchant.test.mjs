import test from 'node:test'
import assert from 'node:assert/strict'
import { suggestMerchantSku } from '../lib/merchant.ts'
import { buildQuickAddProduct } from '../lib/quick-add.ts'
import { validateInventory } from '../lib/inventory.ts'

test('phone SKU suggestions avoid existing identifiers and remain editable metadata', () => {
  assert.equal(suggestMerchantSku('TRAUMA Respect The Scars Pink Trucker Hat', ['RTS-001']), 'RTS-002')
  assert.equal(suggestMerchantSku('Pain Made Me', ['pmh-001', 'PMH-002']), 'PMM-001')
  assert.equal(suggestMerchantSku('TRAUMA Custom Clothing', []), '')
})

test('phone creation retains physical tags and quantity and never treats preparation as publication', () => {
  const fields = { name: 'Test only hat', description: 'Test only original garment description.', price: 49.99,
    category: 'Headwear', depopUrl: '', paypalUrl: '', payhipUrl: '', sku: 'TEST-001',
    physicalInventoryTag: '0470', stockQuantity: 1, condition: 'New With Tags', size: 'One Size Adjustable',
    featured: false, published: false, ownerConfirmed: true, reviewApproved: false, prepareTikTok: true }
  const p = buildQuickAddProduct(fields, ['/images/products/admin/test-only.jpg'], '123e4567-e89b-42d3-a456-426614174000')
  validateInventory({ version: 1, products: [p] })
  assert.equal(p.sku, 'TEST-001'); assert.equal(p.physicalInventoryTag, '0470'); assert.equal(p.stockQuantity, 1)
  assert.equal(p.tiktokShopStatus, 'in-preparation'); assert.equal(p.published, false)
  assert.throws(() => buildQuickAddProduct({ ...fields, stockQuantity: 1.5 }, p.photos, '123e4567-e89b-42d3-a456-426614174000'), /Inventory/)
  assert.throws(() => buildQuickAddProduct({ ...fields, physicalInventoryTag: 470 }, p.photos, '123e4567-e89b-42d3-a456-426614174000'), /physicalInventoryTag/)
})
