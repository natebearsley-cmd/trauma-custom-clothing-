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
const releasedInventory = JSON.parse(
  readFileSync(new URL('../data/inventory.json', import.meta.url)),
)
// A fully unpublished copy exercises review and approval flows independently of the live assortment.
const inventory = { ...releasedInventory, products: releasedInventory.products.map((p) => ({ ...p, published: false })) }
const copy = () => {
  const fixture = structuredClone(inventory)
  fixture.products.push({ ...fixture.products[0], id: 'loose-lips-sink-ships-premium-3-piece-collection', category: 'Matching Sets', collection: 'Matching Sets', price: 260, photos: ['/images/hero.png'], photoViews: ['front'], paypalUrl: '', depopUrl: '', sourceUrl: '', source: 'manual', featuredApparel: false, homepageCollection: true })
  return fixture
}

test('existing inventory is valid, all photo paths exist, and no unconfirmed drafts are public', () => {
  validateInventory(releasedInventory)
  for (const p of releasedInventory.products)
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
  const product = data.products.find((p) => p.source === 'repository' && !p.ownerConfirmed)
  product.published = true
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
  assert.equal(isDepopUrl('https://www.depop.com/traumacc/'), true)
})

test('Buy Now destinations must be direct Payhip product pages', () => {
  assert.equal(isPayhipProductUrl('https://payhip.com/Thereversal1'), false)
  assert.equal(isPayhipProductUrl('https://www.depop.com/traumacc/'), false)
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
  garment.brand = 'TRAUMA'
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

test('management filters combine search, status, category, source and featured placement without mutating inventory', async () => {
  const { filterInventoryProducts } = await import('../lib/inventory.ts')
  const data = copy()
  const filters = { search: '', status: 'all', category: '', source: '', featured: 'all' }
  const before = JSON.stringify(data)
  assert.equal(filterInventoryProducts(data.products, filters).length, data.products.length)
  assert.equal(filterInventoryProducts(data.products, { ...filters, status: 'draft' }).length, data.products.length)
  assert.equal(filterInventoryProducts(data.products, { ...filters, status: 'published' }).length, 0)
  assert.equal(filterInventoryProducts(data.products, { ...filters, search: '  REVERSAL   GUIDE ', category: 'Books', source: 'repository', featured: 'products' })[0].id, 'the-reversal-guide')
  assert.equal(filterInventoryProducts(data.products, { ...filters, search: 'REVERSAL GUIDE', category: 'Apparel' }).length, 0)
  assert.equal(filterInventoryProducts(data.products, { ...filters, search: 'does-not-match-any-product' }).length, 0)
  assert.equal(JSON.stringify(data), before)

  const garment = data.products[0]
  garment.featured = true
  garment.sold = true
  garment.published = true
  const matching = { ...filters, search: garment.id, status: 'sold', featured: 'apparel' }
  assert.deepEqual(filterInventoryProducts(data.products, matching).map((p) => p.id), [garment.id])
  assert.equal(filterInventoryProducts(data.products, { ...matching, status: 'published' }).length, 1)
  assert.equal(filterInventoryProducts(data.products, { ...matching, status: 'draft' }).length, 0)
  assert.equal(filterInventoryProducts(data.products, { ...matching, featured: 'products' }).length, 0)
  assert.equal(filterInventoryProducts(data.products, { ...matching, featured: 'none' }).length, 0)
})


test('apparel routes only to Depop, while books route only to Payhip', async () => {
  const { productDestination, isDepopProductUrl } = await import('../lib/inventory.ts')
  const data = copy()
  const apparel = data.products.find((p) => p.id === 'pain-made-me')
  // URL fixtures test routing only; they are never saved to inventory.
  apparel.payhipUrl = 'https://payhip.com/b/routing-fixture'
  assert.equal(productDestination(apparel), null)
  apparel.depopUrl = 'https://www.depop.com/products/routing-fixture/'
  assert.equal(productDestination(apparel).platform, 'Depop')
  apparel.depopUrl = ''
  apparel.sourceUrl = 'https://www.depop.com/products/routing-fixture/'
  assert.equal(productDestination(apparel).platform, 'Depop')
  apparel.sold = true
  assert.equal(productDestination(apparel), null)
  assert.equal(isDepopProductUrl('https://www.depop.com/traumacc/'), false)
  assert.equal(isDepopProductUrl('https://www.depop.com.attacker.example/products/item/'), false)
  assert.equal(isDepopProductUrl('http://www.depop.com/products/item/'), false)
  const book = data.products.find((p) => p.category === 'Books')
  book.payhipUrl = 'https://payhip.com/b/routing-fixture'
  book.depopUrl = 'https://www.depop.com/products/routing-fixture/'
  assert.equal(productDestination(book).platform, 'Payhip')
  book.payhipUrl = ''
  assert.equal(productDestination(book), null)
})

test('featured apparel is TRAUMA only, capped at seven, and excludes drafts and sold entries', async () => {
  const { featuredApparel } = await import('../lib/inventory.ts')
  const data = copy()
  for (const product of data.products.filter((p) => ['Tops', 'Outerwear', 'Apparel', 'Headwear'].includes(p.category))) {
    product.published = true
    product.ownerConfirmed = true
    product.featured = true
    product.brand = 'TRAUMA'
  }
  assert.equal(featuredApparel(data).length, 7)
  const first = featuredApparel(data)[0]
  first.brand = 'Another brand'
  assert.ok(!featuredApparel(data).some((p) => p.id === first.id))
  first.brand = 'TRAUMA CC'
  first.sold = true
  assert.ok(!featuredApparel(data).some((p) => p.id === first.id))
  first.sold = false
  first.published = false
  assert.ok(!featuredApparel(data).some((p) => p.id === first.id))
})

test('Depop listing validation accepts legacy records and rejects unsafe destinations', () => {
  const data = copy()
  validateInventory(data)
  const apparel = data.products.find((p) => p.id === 'pain-made-me')
  apparel.depopUrl = 'https://payhip.com/b/routing-fixture'
  assert.throws(() => validateInventory(data), /Depop URL/)
})

test('custom apparel requests a quote and never routes to an external purchase link', async () => {
  const { isCustomApparel, productDestination, featuredApparel } = await import('../lib/inventory.ts')
  const data = copy()
  const product = data.products.find((p) => p.id === 'pain-made-me')
  product.orderType = 'custom'
  product.depopUrl = 'https://www.depop.com/products/routing-fixture/'
  product.payhipUrl = 'https://payhip.com/b/routing-fixture'
  assert.equal(isCustomApparel(product), true)
  assert.equal(productDestination(product), null)
  product.published = true
  product.ownerConfirmed = true
  product.photos = ['/images/products/IMG_0914.png']
  product.description = 'Routing test only, never persisted.'
  product.price = null
  validateInventory(data)
  assert.ok(!featuredApparel(data).some((p) => p.id === product.id))
  product.orderType = 'unsupported'
  assert.throws(() => validateInventory(data), /Order type/)
})


test('owner-supplied UNSPOKEN draft is prioritized but cannot appear before approval and photos', async () => {
  const { isTraumaApparel, featuredApparel } = await import('../lib/inventory.ts')
  const product = inventory.products.find((p) => p.id === 'unspoken-graphic-tee')
  assert.ok(inventory.products.indexOf(product) < 8)
  assert.equal(product.id, 'unspoken-graphic-tee')
  assert.equal(product.name, 'UNSPOKEN Graphic Tee')
  assert.equal(product.price, 79)
  assert.equal(product.published, false)
  assert.equal(product.featured, true)
  assert.equal(isTraumaApparel(product), true)
  assert.deepEqual(featuredApparel(inventory), [])
  const data = copy()
  const draft = data.products.find((p) => p.id === 'unspoken-graphic-tee')
  draft.published = true
  assert.throws(() => validateInventory(data), /Depop source URL/)
  draft.sourceUrl = 'https://www.depop.com/products/routing-fixture/'
  assert.throws(() => validateInventory(data), /Add photos/)
})

test('owner-supplied jeans and the six intended garments remain unpublished candidates', async () => {
  const { isTraumaApparel, featuredApparel, productDestination } = await import('../lib/inventory.ts')
  const candidates = inventory.products.filter((p) => ['unspoken-graphic-tee', 'trauma-cc-ecko-carpenter-jeans', 'pain-made-me', 'loose-lips-sink-ships', 'camo-zip-hoodie', 'camo-joggers'].includes(p.id))
  assert.equal(candidates.length, 6)
  assert.ok(candidates.every((p) => p.featured && !p.published && isTraumaApparel(p)))
  const jeans = candidates.find((p) => p.id === 'trauma-cc-ecko-carpenter-jeans')
  assert.equal(jeans.price, 189)
  assert.equal(jeans.size, '32')
  assert.equal(jeans.orderType, 'ready-made')
  assert.equal(jeans.photos.length, 2)
  assert.equal(productDestination(jeans).url, 'https://www.depop.com/traumacc/')
  assert.deepEqual(featuredApparel(inventory), [])
})


test('TOXIC TRAUMA BOND is first, preserves supplied details, and remains unpublished', async () => {
  const { isTraumaApparel, featuredApparel } = await import('../lib/inventory.ts')
  const jacket = inventory.products.find((p) => p.id === 'toxic-trauma-bond')
  assert.equal(jacket.id, 'toxic-trauma-bond')
  assert.deepEqual(inventory.products.slice(0, 2).map((p) => p.id), ['trauma-made-me-denim-jacket', 'toxic-trauma-bond'])
  assert.equal(jacket.price, 449)
  assert.equal(jacket.size, 'XXL')
  assert.equal(jacket.requestCustomPiece, true)
  assert.equal(jacket.themes.length, 5)
  assert.equal(jacket.keyArtwork.length, 6)
  assert.equal(jacket.published, false)
  assert.equal(isTraumaApparel(jacket), true)
  assert.deepEqual(featuredApparel(inventory), [])
  for (const patch of [{ subtitle: 123 }, { themes: [''] }, { keyArtwork: 'invalid' }, { requestCustomPiece: 'true' }]) {
    const data = copy()
    Object.assign(data.products[0], patch)
    assert.throws(() => validateInventory(data))
  }
})

test('Still Breathing screenshot details are preserved in a separate unpublished draft', () => {
  const product = inventory.products.find((p) => p.id === 'still-breathing-bleach-wash-graphic-tee')
  assert.equal(product.price, 89.99)
  assert.equal(product.size, 'L (Relaxed Fit)')
  assert.equal(product.condition, 'Brand New / Pristine')
  assert.equal(product.color, 'Red / Multi')
  assert.equal(product.published, false)
  assert.equal(product.featured, true)
  assert.equal(product.photos.length, 2)
  assert.equal(product.depopUrl, 'https://www.depop.com/traumacc/')
  assert.ok(inventory.products.some((p) => p.id === 'see-no-evil'))
})


test('Loose Lips wide-leg jeans preserve owner data and the latest five-item priority without publishing', async () => {
  const { isTraumaApparel, featuredApparel, productDestination } = await import('../lib/inventory.ts')
  assert.deepEqual(inventory.products.slice(0, 7).map((p) => p.id), ['trauma-made-me-denim-jacket', 'toxic-trauma-bond', 'ptsd-edition-me-vs-myself-hoodie', 'trauma-cc-ecko-carpenter-jeans', 'survived-graphic-tee', 'anxiety-shawna-splatter-crewneck', 'unspoken-graphic-tee'])
  const jeans = inventory.products.find((p) => p.id === 'loose-lips-sink-ships-wide-leg-jeans')
  assert.equal(jeans.size, "Women's 25")
  assert.equal(jeans.inseam, '30')
  assert.equal(jeans.price, 121)
  assert.equal(jeans.features.length, 7)
  assert.equal(jeans.requestCustomPiece, true)
  assert.equal(isTraumaApparel(jeans), true)
  assert.equal(jeans.published, false)
  assert.equal(jeans.photos.length, 2)
  assert.equal(productDestination(jeans).url, 'https://www.depop.com/traumacc/')
  assert.deepEqual(featuredApparel(inventory), [])
  for (const patch of [{ inseam: 30 }, { features: [''] }, { features: 'invalid' }]) {
    const data = copy()
    Object.assign(data.products.find((p) => p.id === 'loose-lips-sink-ships-wide-leg-jeans'), patch)
    assert.throws(() => validateInventory(data))
  }
})


test('SURVIVED owner-supplied draft preserves its details and never publishes or links to Payhip', async () => {
  const { isTraumaApparel, featuredApparel, productDestination } = await import('../lib/inventory.ts')
  const tee = inventory.products.find((p) => p.id === 'survived-graphic-tee')
  assert.equal(tee.id, 'survived-graphic-tee')
  assert.equal(tee.size, 'XL')
  assert.equal(tee.condition, 'Brand New')
  assert.equal(tee.price, 121)
  assert.equal(tee.features.length, 4)
  assert.deepEqual(tee.keyArtwork, ['Back: "So Far You\'ve Survived 100% Of Your Worst Days"'])
  assert.equal(tee.themes.length, 5)
  assert.equal(tee.requestCustomPiece, true)
  assert.equal(tee.published, false)
  assert.equal(isTraumaApparel(tee), true)
  assert.equal(tee.photos.length, 2)
  assert.equal(tee.payhipUrl, '')
  assert.equal(productDestination(tee).url, 'https://www.depop.com/traumacc/')
  assert.deepEqual(featuredApparel(inventory), [])
})


test('ANXIETY preserves actual sale and original prices as an unpublished featured candidate', async () => {
  const { isTraumaApparel, productDestination } = await import('../lib/inventory.ts')
  const product = inventory.products.find((p) => p.id === 'anxiety-shawna-splatter-crewneck')
  assert.equal(product.id, 'anxiety-shawna-splatter-crewneck')
  assert.equal(product.price, 58.65)
  assert.equal(product.originalPrice, 69)
  assert.equal(product.size, 'Large')
  assert.equal(product.published, false)
  assert.equal(product.featured, true)
  assert.equal(isTraumaApparel(product), true)
  assert.equal(product.features.length, 7)
  assert.equal(product.themes.length, 5)
  assert.equal(product.photos.length, 2)
  assert.equal(productDestination(product).url, 'https://www.depop.com/traumacc/')
  for (const originalPrice of [-1, 58, 69.001, Infinity, '69']) {
    const data = copy()
    data.products.find((p) => p.id === 'anxiety-shawna-splatter-crewneck').originalPrice = originalPrice
    assert.throws(() => validateInventory(data), /Original price/)
  }
  const legacy = copy()
  delete legacy.products.find((p) => p.id === 'anxiety-shawna-splatter-crewneck').originalPrice
  validateInventory(legacy)
})

test('PayPal links are trusted HTTPS payment destinations only', async () => {
  const { isPayPalUrl } = await import('../lib/inventory.ts')
  assert.equal(isPayPalUrl('https://paypal.me/NathanialBearsley'), true)
  assert.equal(isPayPalUrl('https://www.paypal.com/ncp/payment/TESTID'), true)
  for (const url of ['http://paypal.me/NathanialBearsley', 'https://paypal.me.attacker.example/NathanialBearsley', 'https://user:password@paypal.me/NathanialBearsley', 'javascript:alert(1)', 'https://payhip.com/b/test', 'https://paypal.me/', 'https://paypal.me:8443/NathanialBearsley'])
    assert.equal(isPayPalUrl(url), false, url)
})

test('PayPal is an independent apparel action without replacing Depop or digital Payhip routing', async () => {
  const { paypalDestination, productDestination } = await import('../lib/inventory.ts')
  const data = copy()
  const apparel = data.products.find((p) => p.id === 'toxic-trauma-bond')
  assert.equal(paypalDestination(apparel), 'https://paypal.me/NathanialBearsley')
  apparel.depopUrl = 'https://www.depop.com/products/routing-fixture/'
  assert.equal(productDestination(apparel).platform, 'Depop')
  assert.equal(paypalDestination(apparel), 'https://paypal.me/NathanialBearsley')
  apparel.sold = true
  assert.equal(paypalDestination(apparel), null)
  apparel.sold = false
  apparel.orderType = 'custom'
  assert.equal(paypalDestination(apparel), null)
  apparel.orderType = 'ready-made'
  apparel.paypalUrl = ''
  assert.equal(paypalDestination(apparel), null)
  const book = data.products.find((p) => p.category === 'Books')
  book.paypalUrl = 'https://paypal.me/NathanialBearsley'
  book.payhipUrl = 'https://payhip.com/b/routing-fixture'
  assert.equal(paypalDestination(book), null)
  assert.equal(productDestination(book).platform, 'Payhip')
})

test('payment settings and optional per-product PayPal fields validate without publishing inventory', () => {
  assert.equal(inventory.payments.paypalUrl, 'https://paypal.me/NathanialBearsley')
  assert.equal(inventory.payments.paypalQrImage, '')
  assert.ok(inventory.products.filter((p) => p.paypalUrl).every((p) => p.paypalUrl === inventory.payments.paypalUrl))
  assert.equal(inventory.products.filter((p) => p.published).length, 0)
  for (const mutate of [
    (d) => { d.products[0].paypalUrl = 'https://attacker.example/payment' },
    (d) => { d.products[0].paypalUrl = 123 },
    (d) => { d.payments.paypalUrl = 'https://payhip.com/Thereversal1' },
    (d) => { d.payments.paypalQrImage = 'javascript:alert(1)' },
    (d) => { d.payments.paypalQrImage = '/images/../secret.png' },
    (d) => { d.payments.paypalUrl = ''; d.payments.paypalQrImage = '/images/qr.png' },
  ]) {
    const data = copy(); mutate(data); assert.throws(() => validateInventory(data))
  }
  const legacy = copy()
  delete legacy.payments
  for (const product of legacy.products) delete product.paypalUrl
  validateInventory(legacy)
})


test('red PTSD hoodie remains a distinct unpublished draft with actual sale and original prices', async () => {
  const { isTraumaApparel, paypalDestination, productDestination, featuredApparel } = await import('../lib/inventory.ts')
  const hoodie = inventory.products.find((p) => p.id === 'ptsd-edition-me-vs-myself-hoodie')
  assert.equal(inventory.products[0].id, 'trauma-made-me-denim-jacket')
  assert.ok(inventory.products.indexOf(hoodie) < 7)
  assert.equal(hoodie.color, 'Vibrant Red')
  assert.equal(hoodie.size, 'XL')
  assert.equal(hoodie.price, 82.44)
  assert.equal(hoodie.originalPrice, 96.99)
  assert.equal(hoodie.features.length, 7)
  assert.equal(hoodie.themes.length, 5)
  assert.equal(hoodie.requestCustomPiece, true)
  assert.equal(hoodie.published, false)
  assert.equal(isTraumaApparel(hoodie), true)
  assert.equal(hoodie.photos.length, 2)
  assert.equal(productDestination(hoodie).platform, 'Depop')
  assert.equal(productDestination(hoodie).url, 'https://www.depop.com/traumacc/')
  assert.equal(paypalDestination(hoodie), 'https://paypal.me/NathanialBearsley')
  assert.deepEqual(featuredApparel(inventory), [])
})


test('army patch capris preserve owner-supplied details as a separate unpublished draft', async () => {
  const { isTraumaApparel, paypalDestination, productDestination, featuredApparel } = await import('../lib/inventory.ts')
  const capris = inventory.products.find((p) => p.id === 'pressure-makes-diamonds-army-patch-capris')
  assert.equal(capris.price, 161.49)
  assert.equal(capris.originalPrice, 189.99)
  assert.equal(capris.size, "Women's 28")
  assert.equal(capris.condition, 'Brand New')
  assert.equal(capris.features.length, 6)
  assert.equal(capris.themes.length, 5)
  assert.equal(capris.requestCustomPiece, true)
  assert.equal(capris.published, false)
  assert.equal(capris.featured, true)
  assert.equal(isTraumaApparel(capris), true)
  assert.equal(capris.photos.length, 2)
  assert.equal(productDestination(capris).url, 'https://www.depop.com/traumacc/')
  assert.equal(paypalDestination(capris), 'https://paypal.me/NathanialBearsley')
  assert.ok(inventory.products.some((p) => p.id === 'pressure-makes-diamonds'))
  assert.deepEqual(featuredApparel(inventory), [])
})

test('TRAUMA gallery categories route existing products and never expose drafts or other brands', async () => {
  const { galleryProducts, galleryCategory, productCollection, HEADWEAR_COLLECTIONS, CUSTOM_GALLERY_TYPES } = await import('../lib/inventory.ts')
  assert.deepEqual(galleryProducts(inventory), [])
  assert.ok(CUSTOM_GALLERY_TYPES.includes('Custom Leggings'))
  assert.ok(CUSTOM_GALLERY_TYPES.includes("Custom Women's Sets"))
  assert.equal(HEADWEAR_COLLECTIONS.length, 5)
  const data = copy()
  const tee = data.products.find((p) => p.id === 'survived-graphic-tee')
  const jeans = data.products.find((p) => p.id === 'loose-lips-sink-ships-wide-leg-jeans')
  const hoodie = data.products.find((p) => p.id === 'ptsd-edition-me-vs-myself-hoodie')
  const beanie = data.products.find((p) => p.id === 'tcc-beanie')
  const book = data.products.find((p) => p.id === 'the-reversal-guide')
  assert.equal(galleryCategory(tee), 'shirts')
  assert.equal(galleryCategory(jeans), 'denim')
  assert.equal(galleryCategory(hoodie), 'hoodies')
  assert.equal(galleryCategory(beanie), 'headwear')
  assert.equal(galleryCategory(book), 'digital')
  for (const product of [tee, jeans, hoodie, beanie, book]) { product.published = true; product.ownerConfirmed = true }
  beanie.brand = 'TRAUMA CC'
  beanie.collection = 'Trauma CC Beanies'
  assert.equal(productCollection(beanie), 'Trauma CC Beanies')
  assert.deepEqual(galleryProducts(data, 'headwear', 'Trauma CC Beanies').map((p) => p.id), [beanie.id])
  assert.equal(galleryProducts(data, 'headwear', 'UNSPOKEN Hats').length, 0)
  assert.equal(galleryProducts(data, 'digital').length, 1)
  assert.equal(galleryProducts(data, 'apparel').length, 4)
  tee.sold = true
  assert.equal(galleryProducts(data, 'shirts', '', 'available').length, 0)
  assert.equal(galleryProducts(data, 'shirts', '', 'sold').length, 1)
  assert.equal(galleryProducts(data, 'featured').some((p) => p.id === tee.id), false)
  beanie.brand = 'Another brand'
  assert.equal(galleryProducts(data, 'headwear').length, 0)
  book.published = false
  assert.equal(galleryProducts(data, 'digital').length, 0)
})


test('the red PTSD hoodie opens the official shop, and another seller profile is rejected', async () => {
  const { DEPOP_SHOP_URL, isDepopProductUrl, productDestination } = await import('../lib/inventory.ts')
  assert.equal(isDepopProductUrl('https://depop.app.link/TestShortId'), true)
  assert.equal(isDepopProductUrl('https://depop.app.link/'), false)
  assert.equal(isDepopProductUrl('https://depop.app.link.attacker.example/TestShortId'), false)
  const matching = inventory.products.filter((product) => product.id === "ptsd-edition-me-vs-myself-hoodie" && product.sourceUrl === DEPOP_SHOP_URL)
  assert.deepEqual(matching.map((product) => product.id), ['ptsd-edition-me-vs-myself-hoodie'])
  assert.equal(matching[0].published, false)
  const otherShop = { ...matching[0], depopUrl: 'https://www.depop.com/other-seller/', sourceUrl: '' }
  assert.equal(productDestination(otherShop), null)
  assert.throws(() => validateInventory({ version: 1, products: [otherShop] }), /Depop URL/)
})


test('TRAUMA MADE ME is first in Hero Collection but its spotlight stays hidden before approval', async () => {
  const { homepageSpotlightProduct, isTraumaApparel, productCollection, CUSTOM_CREATION_TYPES, CUSTOM_ORDER_TYPES } = await import('../lib/inventory.ts')
  const jacket = inventory.products[0]
  assert.equal(jacket.id, 'trauma-made-me-denim-jacket')
  assert.equal(jacket.price, 199)
  assert.equal(jacket.size, 'XL')
  assert.equal(jacket.homepageSpotlight, true)
  assert.equal(productCollection(jacket), 'Hero Collection')
  assert.equal(isTraumaApparel(jacket), true)
  assert.equal(jacket.published, false)
  assert.equal(jacket.photos.length, 2)
  assert.equal(homepageSpotlightProduct(inventory), null)
  assert.equal(CUSTOM_CREATION_TYPES.length, 10)
  assert.ok(CUSTOM_ORDER_TYPES.includes('Custom Beanies'))
  assert.ok(CUSTOM_ORDER_TYPES.includes('Custom Denim'))
  const data = copy()
  data.products[0].published = true
  assert.equal(homepageSpotlightProduct(data).id, jacket.id)
  data.products[0].sold = true
  assert.equal(homepageSpotlightProduct(data), null)
  data.products[0].homepageSpotlight = 'true'
  assert.throws(() => validateInventory(data), /Spotlight/)
})


test('women collection leggings remain an unpublished apparel draft with valid routing and collection filters', async () => {
  const { isApparel, isWomensCollection, womensCollectionType, galleryProducts, paypalDestination, productDestination, CUSTOM_ORDER_TYPES, WOMENS_COLLECTION_TYPES } = await import('../lib/inventory.ts')
  const leggings = inventory.products.find((p) => p.id === 'suffered-in-silence-leggings')
  assert.equal(leggings.price, 58.65)
  assert.equal(leggings.originalPrice, 69)
  assert.equal(leggings.size, "Women's 10 (XL Listing)")
  assert.equal(leggings.published, false)
  assert.equal(leggings.homepageCollection, true)
  assert.equal(isApparel(leggings), true)
  assert.equal(isWomensCollection(leggings), true)
  assert.equal(womensCollectionType(leggings), 'Leggings')
  assert.equal(WOMENS_COLLECTION_TYPES.length, 5)
  assert.deepEqual(galleryProducts(inventory, 'women'), [])
  assert.equal(paypalDestination(leggings), 'https://paypal.me/NathanialBearsley')
  assert.equal(productDestination(leggings), null)
  assert.ok(CUSTOM_ORDER_TYPES.includes('Custom Leggings'))
  assert.ok(CUSTOM_ORDER_TYPES.includes("Custom Women's Sets"))
  const data = copy()
  const copyLeggings = data.products.find((p) => p.id === leggings.id)
  copyLeggings.published = true
  assert.deepEqual(galleryProducts(data, 'women', 'Leggings').map((p) => p.id), [leggings.id])
  assert.equal(galleryProducts(data, 'women', 'Sports Bras').length, 0)
  copyLeggings.sold = true
  assert.equal(galleryProducts(data, 'women', 'Leggings', 'available').length, 0)
  assert.equal(galleryProducts(data, 'women', 'Leggings', 'sold').length, 1)
  copyLeggings.homepageCollection = 'true'
  assert.throws(() => validateInventory(data), /Homepage Collection/)
})

test('homepage shows at most eight distinct approved products including the spotlight without limiting the full gallery', async () => {
  const { homepageProducts, homepageSpotlightProduct, homepageCollectionKey, HOMEPAGE_COLLECTIONS, galleryProducts } = await import('../lib/inventory.ts')
  assert.deepEqual(HOMEPAGE_COLLECTIONS.map(({ title }) => title), ['Matching Sets', 'Hero Pieces', 'Featured Apparel', 'Books & Digital Products', 'Custom Orders'])
  assert.deepEqual(homepageProducts(inventory), [])
  const data = copy()
  for (const product of data.products.filter((p) => p.ownerConfirmed)) product.published = true
  const selected = homepageProducts(data)
  assert.equal(selected.length, 8)
  assert.equal(new Set(selected.map((p) => p.id)).size, 8)
  assert.equal(selected[0].id, 'loose-lips-sink-ships-premium-3-piece-collection')
  const spotlight = homepageSpotlightProduct(data)
  const otherCards = selected.filter((p) => p.id !== spotlight.id)
  assert.equal(otherCards.length, 7)
  assert.equal(1 + otherCards.length, 8)
  assert.ok(galleryProducts(data).length > selected.length)
  const ids = HOMEPAGE_COLLECTIONS.flatMap(({ key }) => otherCards.filter((p) => homepageCollectionKey(p) === key).map((p) => p.id))
  assert.equal(ids.length, 7)
  assert.equal(new Set(ids).size, 7)
  data.products[0].homepageCollection = false
  assert.equal(homepageSpotlightProduct(data), null)
  assert.ok(!homepageProducts(data).some((p) => p.id === data.products[0].id))
  data.products[1].sold = true
  assert.ok(!homepageProducts(data).some((p) => p.id === data.products[1].id))
})

test('Matching Sets are physical apparel, lead the gallery when approved, and stay hidden while in draft', async () => {
  const { galleryProducts, homepageProducts, isApparel, productDestination, paypalDestination } = await import('../lib/inventory.ts')
  const data = copy()
  const set = data.products.find((p) => p.category === 'Matching Sets')
  assert.equal(set.price, 260)
  assert.equal(set.published, false)
  assert.equal(isApparel(set), true)
  assert.equal(productDestination(set), null)
  assert.equal(paypalDestination(set), null)
  assert.ok(!galleryProducts(data, 'matching-sets').length)
  assert.ok(!homepageProducts(data).some((p) => p.id === set.id))
  data.products[0].published = true
  set.published = true
  assert.equal(galleryProducts(data)[0].id, set.id)
  assert.deepEqual(galleryProducts(data, 'matching-sets').map((p) => p.id), [set.id])
  for (const category of ['hero', 'featured-apparel', 'hoodies', 'digital'])
    assert.ok(!galleryProducts(data, category).some((p) => p.id === set.id))
})

test('every selected Depop draft appears in Featured Apparel after approval', async () => {
  const { DEPOP_SHOP_URL, galleryProducts, homepageProducts, productDestination } = await import('../lib/inventory.ts')
  const data = copy()
  const selected = data.products.filter((p) => p.photos.some((url) => url.startsWith('/images/products/featured-depop/')))
  assert.equal(selected.length, 25)
  assert.ok(selected.every((p) => !p.published && p.featuredApparel && productDestination(p)?.url === DEPOP_SHOP_URL))
  assert.equal(galleryProducts(data, 'featured-apparel').length, 0)
  for (const product of selected) product.published = true
  assert.equal(galleryProducts(data, 'featured-apparel').length, 25)
  assert.ok(homepageProducts(data).every((p) => p.featuredApparel))
})

test('release shows all 25 owner-approved photo listings and only populated category tabs', async () => {
  const { DEPOP_SHOP_URL, galleryProducts, visibleGalleryCategories, paypalDestination, productDestination } = await import('../lib/inventory.ts')
  const pieces = galleryProducts(releasedInventory, 'featured')
  assert.equal(pieces.length, 25)
  assert.ok(pieces.every((p) => p.photos.length > 0 && p.ownerConfirmed && productDestination(p)?.url === DEPOP_SHOP_URL))
  assert.ok(pieces.every((p) => p.price === null ? !paypalDestination(p) : !!paypalDestination(p)))
  const visible = visibleGalleryCategories(releasedInventory).map((tab) => tab.id)
  assert.deepEqual(visible, ['featured', 'hoodies', 'shirts', 'denim', 'headwear', 'footwear', 'women', 'artwear'])
})
