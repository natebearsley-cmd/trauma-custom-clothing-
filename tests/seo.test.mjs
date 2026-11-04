import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PUBLIC_PAGE_SEO, canonicalUrl, productMetaDescription } from '../lib/seo.ts'
import { productStructuredData, organizationStructuredData, serializeStructuredData } from '../lib/search-schema.ts'
const products = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url))).products.filter(p => p.published && p.ownerConfirmed)

test('all public page and product descriptions are nonempty, unique, and within editorial length', () => {
  const descriptions = [...Object.values(PUBLIC_PAGE_SEO).map(p => p.description), ...products.map(productMetaDescription)]
  assert.equal(new Set(descriptions).size, descriptions.length)
  for (const description of descriptions) { assert.ok(description.length > 40); assert.ok(description.length <= 160, description) }
  assert.equal(canonicalUrl('/collections'), 'https://tra-coral.vercel.app/collections')
})
test('priced products use factual offers and unpriced pages avoid incomplete Google Product markup', () => {
  for (const p of products) {
    const schema = productStructuredData(p)
    assert.equal(schema.url, canonicalUrl(`/products/${p.id}`))
    if (schema['@type'] === 'Product') {
      assert.equal(schema.offers.price, p.price)
      assert.equal(schema.offers.priceCurrency, p.currency)
      assert.equal(schema.offers.url, schema.url)
      assert.ok(schema.image.length)
      assert.equal(schema.aggregateRating, undefined)
      const sold = productStructuredData({ ...p, sold: true })
      assert.equal(sold.offers.availability, 'https://schema.org/OutOfStock')
    } else {
      assert.equal(schema['@type'], 'WebPage')
      assert.equal(schema.offers, undefined)
    }
  }
})
test('organization uses confirmed identity/location and JSON-LD cannot escape its script', () => {
  const graph = organizationStructuredData()['@graph']
  const organization = graph.find(p => p['@type'] === 'Organization')
  assert.equal(organization.name, 'TRAUMA Custom Clothing')
  assert.equal(organization.address.postalCode, '61230')
  assert.equal(organization.address.addressRegion, 'IL')
  assert.equal(organization.telephone, undefined)
  assert.equal(organization.address.streetAddress, undefined)
  assert.ok(!serializeStructuredData({ name: '</script><script>alert(1)</script>' }).includes('<'))
})
