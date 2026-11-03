import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildQuickAddProduct, MAX_PRODUCT_PHOTO_BYTES } from '../lib/quick-add.ts'
import { detectPhotoExtension, signPhotoReceipt, validPhotoReceipt } from '../lib/product-photo-upload.ts'
import { commitQuickAdd } from '../lib/github-inventory-write.ts'
import { validateInventory } from '../lib/inventory.ts'
const inventory = JSON.parse(readFileSync(new URL('../data/inventory.json', import.meta.url)))
const original = inventory.products.find((p) => p.id === 'toxic-trauma-bond')
const session = '11111111-2222-4333-8444-555555555555'
const path = '/images/products/admin/11111111-2222-4333-8444-555555555555.jpg'
const fields = () => ({ name: original.name, description: original.description, price: original.price, category: 'Apparel', depopUrl: '', paypalUrl: original.paypalUrl, payhipUrl: '', featured: true, published: false, ownerConfirmed: true, reviewApproved: false })

test('quick add preserves pasted owner details and requires explicit publication review', () => {
  const input = fields()
  const product = buildQuickAddProduct(input, [path], session)
  validateInventory({ version: 1, products: [product] })
  assert.equal(product.name, original.name)
  assert.equal(product.description, original.description)
  assert.equal(product.published, false)
  assert.equal(product.featured, true)
  assert.deepEqual(product.photos, [path])
  assert.equal(product.id, `product-${session}`)
  assert.throws(() => buildQuickAddProduct({ ...input, ownerConfirmed: false }, [path], session), /real TRAUMA/)
  assert.throws(() => buildQuickAddProduct({ ...input, published: true }, [path], session), /approve/)
  assert.equal(buildQuickAddProduct({ ...input, published: true, reviewApproved: true }, [path], session).published, true)
  assert.throws(() => buildQuickAddProduct(input, [], session), /photos/)
  assert.throws(() => buildQuickAddProduct({ ...input, price: 1.001 }, [path], session), /price/)
  assert.throws(() => buildQuickAddProduct({ ...input, payhipUrl: 'https://payhip.com/b/test' }, [path], session), /Apparel uses/)
  assert.throws(() => buildQuickAddProduct({ ...input, category: 'Books' }, [path], session), /Books and digital/)
  const women = buildQuickAddProduct({ ...input, category: "Women's Collection" }, [path], session)
  assert.equal(women.collection, "Women's Collection")
})

test('photo upload format checks and signed receipts preserve bytes and prevent substituted paths or sessions', () => {
  assert.equal(MAX_PRODUCT_PHOTO_BYTES, 3145728)
  assert.equal(detectPhotoExtension(Uint8Array.from([255, 216, 255, 1])), 'jpg')
  assert.equal(detectPhotoExtension(Uint8Array.from([137,80,78,71,13,10,26,10])), 'png')
  assert.equal(detectPhotoExtension(Buffer.from('RIFF0000WEBP')), 'webp')
  assert.equal(detectPhotoExtension(Buffer.from('<svg>')), null)
  const secret = 'unit-test-only-not-a-production-credential'
  const receipt = signPhotoReceipt({ session, path: `public${path}`, sha: 'a'.repeat(40) }, secret)
  assert.equal(validPhotoReceipt(receipt, session, secret), true)
  assert.equal(validPhotoReceipt({ ...receipt, path: 'public/images/../secret.jpg' }, session, secret), false)
  assert.equal(validPhotoReceipt({ ...receipt, sha: 'b'.repeat(40) }, session, secret), false)
  assert.equal(validPhotoReceipt(receipt, 'another-session', secret), false)
})

function mockGitHub(current, { fileSha = 'a'.repeat(40), rejectRef = false } = {}) {
  const writes = []
  const calls = []
  const head = '1'.repeat(40)
  const fetcher = async (url, options) => {
    const pathname = new URL(url).pathname
    calls.push(pathname)
    const method = options.method || 'GET'
    if (method !== 'GET') writes.push({ pathname, method, body: JSON.parse(options.body) })
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
    if (pathname.endsWith('/git/ref/heads/main')) return json({ object: { sha: head } })
    if (pathname.endsWith('/contents/data/inventory.json')) return json({ sha: fileSha, content: Buffer.from(JSON.stringify(current)).toString('base64') })
    if (pathname.endsWith(`/git/commits/${head}`)) return json({ tree: { sha: '2'.repeat(40) } })
    if (pathname.endsWith('/git/blobs')) return json({ sha: '3'.repeat(40) })
    if (pathname.endsWith('/git/trees')) return json({ sha: '4'.repeat(40) })
    if (pathname.endsWith('/git/commits')) return json({ sha: '5'.repeat(40) })
    if (pathname.endsWith('/git/refs/heads/main')) return json({}, rejectRef ? 422 : 200)
    throw new Error(`Unexpected mocked request: ${pathname}`)
  }
  return { fetcher, writes, calls }
}

test('quick save commits original-photo blobs and inventory together without publishing a draft or replacing existing records', async () => {
  const current = structuredClone(inventory)
  const before = JSON.stringify(current)
  const product = buildQuickAddProduct(fields(), [path], session)
  const mock = mockGitHub(current)
  const result = await commitQuickAdd({ product, images: [{ path: `public${path}`, sha: '9'.repeat(40) }], expectedSha: 'a'.repeat(40), assertInventory: validateInventory, fetcher: mock.fetcher })
  assert.equal(result.product.published, false)
  const blob = mock.writes.find((write) => write.pathname.endsWith('/git/blobs'))
  const saved = JSON.parse(Buffer.from(blob.body.content, 'base64').toString())
  assert.equal(saved.products.length, current.products.length + 1)
  assert.deepEqual(saved.products.slice(0, -1), current.products)
  assert.equal(saved.products.at(-1).published, false)
  assert.deepEqual(saved.payments, current.payments)
  const tree = mock.writes.find((write) => write.pathname.endsWith('/git/trees'))
  assert.deepEqual(tree.body.tree.map((entry) => entry.path), [`public${path}`, 'data/inventory.json'])
  assert.equal(mock.writes.at(-1).body.force, false)
  assert.equal(JSON.stringify(current), before)
})

test('quick save detects stale inventory, rejects concurrent branch updates, and retries idempotently', async () => {
  const product = buildQuickAddProduct(fields(), [path], session)
  let mock = mockGitHub(inventory)
  await assert.rejects(commitQuickAdd({ product, images: [], expectedSha: 'b'.repeat(40), assertInventory: validateInventory, fetcher: mock.fetcher }), /Inventory changed/)
  assert.equal(mock.writes.length, 0)
  mock = mockGitHub(inventory, { rejectRef: true })
  await assert.rejects(commitQuickAdd({ product, images: [], expectedSha: 'a'.repeat(40), assertInventory: validateInventory, fetcher: mock.fetcher }), /Another change/)
  const saved = { ...structuredClone(inventory), products: [...structuredClone(inventory.products), product] }
  mock = mockGitHub(saved)
  const result = await commitQuickAdd({ product, images: [], expectedSha: 'b'.repeat(40), assertInventory: validateInventory, fetcher: mock.fetcher })
  assert.equal(result.replayed, true)
  assert.equal(mock.writes.length, 0)
  await assert.rejects(commitQuickAdd({ product: { ...product, price: 1 }, images: [], expectedSha: 'a'.repeat(40), assertInventory: validateInventory, fetcher: mock.fetcher }), /already saved with different details/)
})


test('quick add automates categories, photo views, and independent featured placement for apparel and digital products', async () => {
  const { galleryProducts, productDestination, productPhotoLabel } = await import('../lib/inventory.ts')
  const input = { ...fields(), published: true, reviewApproved: true, featuredCollection: false, featuredApparel: true, photoViews: ['front'] }
  const product = buildQuickAddProduct(input, [path], session)
  validateInventory({ version: 1, products: [product] })
  assert.equal(productPhotoLabel(product, 0), 'Front view — photo 1')
  assert.equal(galleryProducts({ version: 1, products: [product] }, 'featured').length, 0)
  assert.equal(galleryProducts({ version: 1, products: [product] }, 'featured-apparel').length, 1)
  const book = inventory.products.find((item) => item.id === 'the-reversal-guide')
  const digital = buildQuickAddProduct({ ...fields(), name: book.name, description: book.description, price: book.price, category: 'Books', depopUrl: '', paypalUrl: '', payhipUrl: 'https://payhip.com/b/routing-fixture', published: true, reviewApproved: true }, [path], session)
  validateInventory({ version: 1, products: [digital] })
  assert.equal(digital.featuredApparel, false)
  assert.equal(productDestination(digital).platform, 'Payhip')
  assert.equal(galleryProducts({ version: 1, products: [digital] }, 'digital').length, 1)
  assert.equal(galleryProducts({ version: 1, products: [digital] }, 'featured').length, 1)
  const invalid = { ...product, photoViews: ['front', 'back'] }
  assert.throws(() => validateInventory({ version: 1, products: [invalid] }), /photo/)
})
