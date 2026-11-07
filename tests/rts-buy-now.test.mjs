import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { paypalBuyNowDestination } from '../lib/inventory.ts'
const inventory = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url), 'utf8'))
const rose = inventory.products.find(({ sku }) => sku === 'PMH-001')

test('existing PMH checkout is unchanged and RTS accepts only its confirmed identity', () => {
  assert.equal(paypalBuyNowDestination(rose), rose.paypalUrl)
  // A test-only provider URL is never written into inventory or deployed as a product.
  const pink = { ...rose, id: 'respect-the-scars-pink-trucker-hat', name: 'TRAUMA Respect The Scars Pink Trucker Hat',
    sku: 'RTS-001', physicalInventoryTag: '0465', stockQuantity: 1,
    paypalUrl: 'https://www.paypal.com/ncp/payment/TESTONLY' }
  assert.equal(paypalBuyNowDestination(pink), pink.paypalUrl)
  for (const patch of [
    { sku: 'OTHER' }, { physicalInventoryTag: 'OTHER' }, { stockQuantity: 0 },
    { stockQuantity: undefined }, { stockQuantity: 2 }, { sold: true },
    { paypalUrl: '' }, { paypalUrl: 'https://paypal.me/NathanialBearsley' },
    { paypalUrl: 'https://paypal.com.attacker.example/ncp/payment/TESTONLY' },
  ]) assert.equal(paypalBuyNowDestination({ ...pink, ...patch }), null)
})
