import assert from 'node:assert/strict'
import test from 'node:test'
import { depopQuoteBrief, emailQuoteBrief } from '../lib/custom-quote.ts'

function details() {
  const form = new FormData()
  for (const [name, value] of Object.entries({
    name: 'Dummy Customer',
    email: 'dummy@example.com',
    phone: '202-555-0142',
    product_type: 'Hoodie',
    size: 'XL',
    quantity: '2',
    design_description: 'Red artwork on black',
    additional_notes: '',
    unexpected: 'do not serialize',
  })) form.set(name, value)
  form.set('design_files', new File(['dummy'], 'private-customer-filename.png'))
  return form
}

test('Depop quote includes garment information and excludes contact fields, files and unexpected data', () => {
  const result = depopQuoteBrief(details(), 'TRAUMA hoodie')
  assert.match(result, /Inventory piece: TRAUMA hoodie/)
  assert.match(result, /Product type: Hoodie\nSize: XL\nQuantity: 2\nDesign description: Red artwork on black/)
  assert.doesNotMatch(result, /Dummy|dummy@example|202-555|filename|Additional notes|unexpected|do not serialize/)
})

test('email quote retains contact information and separately attached filenames', () => {
  const result = emailQuoteBrief(details(), undefined, ['sample.png'])
  assert.match(result, /Name: Dummy Customer\nEmail: dummy@example.com\nPhone: 202-555-0142/)
  assert.match(result, /Design files \(attach separately\): sample.png/)
  assert.match(result, /Design description: Red artwork on black/)
  assert.doesNotMatch(result, /Inventory piece|private-customer-filename|do not serialize/)
})
