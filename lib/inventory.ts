export type PhotoView = 'front' | 'back' | 'detail' | 'branding' | 'other'
export const PHOTO_VIEW_LABELS: Record<PhotoView, string> = { front: 'Front view', back: 'Back view', detail: 'Detail view', branding: 'Branding / tag', other: 'Photo' }

export type Product = {
  id: string
  name: string
  brand: string
  category: string
  size: string
  color: string
  condition: string
  photos: string[]
  photoViews?: PhotoView[]
  description: string
  price: number | null
  originalPrice?: number | null
  currency: string
  purchaseUrl: string
  payhipUrl: string
  depopUrl?: string
  paypalUrl?: string
  orderType?: 'ready-made' | 'custom'
  productType?: string
  subtitle?: string
  collection?: string
  homepageSpotlight?: boolean
  homepageCollection?: boolean
  inseam?: string
  features?: string[]
  themes?: string[]
  keyArtwork?: string[]
  requestCustomPiece?: boolean
  sold: boolean
  soldDisplay: 'show' | 'archive'
  published: boolean
  featured: boolean
  featuredCollection?: boolean
  featuredApparel?: boolean
  ownerConfirmed: boolean
  source: 'repository' | 'depop' | 'payhip' | 'manual'
  sourceUrl: string
}

export type PaymentSettings = { paypalUrl: string; paypalQrImage: string }
export type Inventory = { version: 1; products: Product[]; payments?: PaymentSettings }

export function safeUrl(value: string, local = false): boolean {
  if (
    local &&
    /^\/images\/[a-zA-Z0-9_./-]+$/.test(value) &&
    !value.includes('..')
  )
    return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

export function isPayhipProductUrl(value: string): boolean {
  if (!safeUrl(value)) return false
  const url = new URL(value)
  return (
    (url.hostname === 'payhip.com' || url.hostname === 'www.payhip.com') &&
    /^\/b\/[^/]+\/?$/.test(url.pathname)
  )
}

export function isDepopUrl(value: string): boolean {
  if (!safeUrl(value)) return false
  const host = new URL(value).hostname
  return (
    host === 'depop.com' ||
    host === 'www.depop.com' ||
    host === 'depop.app.link'
  )
}

export function isDepopProductUrl(value: string): boolean {
  if (!isDepopUrl(value)) return false
  const url = new URL(value)
  if (url.hostname === 'depop.app.link') return /^\/[a-zA-Z0-9]+\/?$/.test(url.pathname)
  return (url.hostname === 'depop.com' || url.hostname === 'www.depop.com') &&
    /^\/products\/[^/]+\/?$/.test(url.pathname)
}

export function isPayPalUrl(value: string): boolean {
  if (!safeUrl(value)) return false
  const url = new URL(value)
  if (url.port) return false
  if (['paypal.me', 'www.paypal.me'].includes(url.hostname))
    return /^\/[a-zA-Z0-9._-]+(?:\/[0-9]+(?:\.[0-9]{1,2})?)?\/?$/.test(url.pathname)
  return ['paypal.com', 'www.paypal.com'].includes(url.hostname) &&
    /^\/(?:paypalme\/[^/]+|ncp\/payment\/[^/]+|qrcodes\/[^/]+\/[^/]+|cgi-bin\/webscr|checkoutnow)\/?$/.test(url.pathname)
}

export function paypalDestination(product: Product): string | null {
  return isApparel(product) && !product.sold && !isCustomApparel(product) &&
    product.paypalUrl && isPayPalUrl(product.paypalUrl) ? product.paypalUrl : null
}

export function productDestination(product: Product): { url: string; platform: 'Depop' | 'Payhip' } | null {
  if (product.sold || isCustomApparel(product)) return null
  if (isApparel(product)) {
    const url = [product.depopUrl, product.sourceUrl].find((value) => value && isDepopProductUrl(value))
    return url ? { url, platform: 'Depop' } : null
  }
  return isPayhipProductUrl(product.payhipUrl) ? { url: product.payhipUrl, platform: 'Payhip' } : null
}

export function validateInventory(value: unknown): asserts value is Inventory {
  if (!value || typeof value !== 'object') throw new Error('Invalid inventory')
  const inventory = value as Inventory
  if (
    inventory.version !== 1 ||
    !Array.isArray(inventory.products) ||
    inventory.products.length > 1000
  )
    throw new Error('Inventory requires version 1 and at most 1,000 products')
  if (inventory.payments !== undefined) {
    const payments = inventory.payments
    if (!payments || typeof payments !== 'object' ||
      typeof payments.paypalUrl !== 'string' || payments.paypalUrl.length > 2000 ||
      (payments.paypalUrl !== '' && !isPayPalUrl(payments.paypalUrl)) ||
      typeof payments.paypalQrImage !== 'string' || payments.paypalQrImage.length > 2000 ||
      (payments.paypalQrImage !== '' && (!safeUrl(payments.paypalQrImage, true) || !payments.paypalUrl)))
      throw new Error('Payment settings require a valid PayPal link and an optional HTTPS QR image URL or /images/ path')
  }
  const ids = new Set<string>()
  for (const p of inventory.products) {
    if (!p || typeof p !== 'object') throw new Error('Invalid product')
    for (const key of [
      'id',
      'name',
      'brand',
      'category',
      'size',
      'color',
      'condition',
      'description',
      'currency',
      'purchaseUrl',
      'payhipUrl',
      'sourceUrl',
    ] as const) {
      if (
        typeof p[key] !== 'string' ||
        p[key].length > (key === 'description' ? 5000 : 2000)
      )
        throw new Error(`Invalid ${key}`)
    }
    if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(p.id) || ids.has(p.id))
      throw new Error('Product IDs must be unique lowercase slugs')
    ids.add(p.id)
    if (!p.name.trim()) throw new Error('Product name is required')
    if (
      p.price !== null &&
      (typeof p.price !== 'number' ||
        !Number.isFinite(p.price) ||
        p.price < 0 ||
        p.price > 1000000 ||
        Math.abs(p.price * 100 - Math.round(p.price * 100)) > 0.000001)
    )
      throw new Error(
        'Price must be nonnegative with at most two decimal places',
      )
    if (p.originalPrice !== undefined && p.originalPrice !== null &&
      (typeof p.originalPrice !== 'number' || !Number.isFinite(p.originalPrice) ||
        p.originalPrice < 0 || p.originalPrice > 1000000 ||
        Math.abs(p.originalPrice * 100 - Math.round(p.originalPrice * 100)) > 0.000001 ||
        (p.price !== null && p.originalPrice < p.price)))
      throw new Error('Original price must be a valid amount at least as large as the current price')
    if (!['USD', 'GBP', 'EUR', 'CAD', 'AUD'].includes(p.currency))
      throw new Error('Unsupported currency')
    if (
      !Array.isArray(p.photos) ||
      p.photos.length > 12 ||
      p.photos.some(
        (url) =>
          typeof url !== 'string' || url.length > 2000 || !safeUrl(url, true),
      )
    )
      throw new Error('Use up to 12 HTTPS photo URLs or /images/ paths')
    if (p.photoViews !== undefined && (!Array.isArray(p.photoViews) || p.photoViews.length !== p.photos.length || p.photoViews.some((view) => !Object.hasOwn(PHOTO_VIEW_LABELS, view))))
      throw new Error('Choose a valid front, back, detail, branding, or other label for every photo')
    for (const field of ['featuredCollection', 'featuredApparel'] as const)
      if (p[field] !== undefined && typeof p[field] !== 'boolean') throw new Error('Featured selections must be boolean values')
    if (p.inseam !== undefined && (typeof p.inseam !== 'string' || p.inseam.length > 40))
      throw new Error('Inseam must be text, at most 40 characters')
    if (p.homepageCollection !== undefined && typeof p.homepageCollection !== 'boolean')
      throw new Error('Homepage Collection must be a boolean')
    if (p.homepageSpotlight !== undefined && typeof p.homepageSpotlight !== 'boolean')
      throw new Error('Homepage Spotlight must be a boolean')
    if (p.collection !== undefined && (typeof p.collection !== 'string' || p.collection.length > 200))
      throw new Error('Collection must be text, at most 200 characters')
    if (p.subtitle !== undefined && (typeof p.subtitle !== 'string' || p.subtitle.length > 300))
      throw new Error('Subtitle must be text, at most 300 characters')
    for (const field of ['themes', 'keyArtwork', 'features'] as const) {
      if (p[field] !== undefined && (!Array.isArray(p[field]) || p[field]!.length > 12 ||
        p[field]!.some((item) => typeof item !== 'string' || !item.trim() || item.length > 300)))
        throw new Error(`${field} must contain up to 12 nonempty text entries`)
    }
    if (p.requestCustomPiece !== undefined && typeof p.requestCustomPiece !== 'boolean')
      throw new Error('Request Custom Piece must be a boolean')
    if (p.productType !== undefined && (typeof p.productType !== 'string' || p.productType.length > 200))
      throw new Error('Product type must be text, at most 200 characters')
    if (p.orderType !== undefined && !['ready-made', 'custom'].includes(p.orderType))
      throw new Error('Order type must be ready-made or custom')
    if (p.orderType === 'custom' && !isApparel(p))
      throw new Error('Custom order type is for apparel only')
    if (p.paypalUrl !== undefined && (typeof p.paypalUrl !== 'string' || p.paypalUrl.length > 2000 ||
      (p.paypalUrl !== '' && !isPayPalUrl(p.paypalUrl))))
      throw new Error('PayPal URL must be a direct HTTPS PayPal.me or PayPal payment link')
    if (p.depopUrl !== undefined &&
      (typeof p.depopUrl !== 'string' || p.depopUrl.length > 2000 ||
        (p.depopUrl !== '' && !isDepopProductUrl(p.depopUrl))))
      throw new Error('Depop URL must be a direct HTTPS product listing (https://www.depop.com/products/...)')
    if (p.purchaseUrl && !safeUrl(p.purchaseUrl))
      throw new Error('Purchase link must use HTTPS')
    if (p.payhipUrl && !isPayhipProductUrl(p.payhipUrl))
      throw new Error(
        'Payhip URL must be a direct HTTPS product page (https://payhip.com/b/...)',
      )
    if (p.sourceUrl && !safeUrl(p.sourceUrl))
      throw new Error('Source link must use HTTPS')
    if (
      !['repository', 'depop', 'payhip', 'manual'].includes(p.source) ||
      !['show', 'archive'].includes(p.soldDisplay)
    )
      throw new Error('Invalid product source or sold display')
    if (
      ['sold', 'published', 'featured', 'ownerConfirmed'].some(
        (key) => typeof p[key as keyof Product] !== 'boolean',
      )
    )
      throw new Error('Invalid product status')
    if (p.source === 'depop' && ((p.sourceUrl && !isDepopUrl(p.sourceUrl)) || (p.published && !p.sourceUrl)))
      throw new Error('Depop products require a Depop source URL')
    if (p.source === 'payhip' && !isPayhipProductUrl(p.sourceUrl))
      throw new Error('Payhip products require a direct Payhip source product URL')
    if (
      p.published &&
      (!p.ownerConfirmed ||
        !p.photos.length ||
        !p.category.trim() ||
        !p.description.trim() ||
        (!isApparel(p) && p.payhipUrl && p.price === null))
    )
      throw new Error(
        `Add photos, a category and description, and confirm ownership before publishing ${p.name}. Products with a Payhip URL also need a price.`,
      )
  }
}

export function storefrontProducts(
  inventory: Inventory,
  archive = false,
): Product[] {
  return inventory.products.filter(
    (p) =>
      p.published &&
      p.ownerConfirmed &&
      (archive
        ? p.sold && p.soldDisplay === 'archive'
        : !(p.sold && p.soldDisplay === 'archive')),
  )
}

export function featuredProducts(inventory: Inventory): Product[] {
  return inventory.products.filter(
    (p) => p.published && p.ownerConfirmed && p.featured && !p.sold,
  )
}

export function isApparel(product: Product): boolean {
  return ['apparel', 'tops', 'outerwear', 'headwear', 'hats & beanies', 'hats', 'beanies', 'footwear', 'denim', "women's collection"].includes(
    product.category.trim().toLowerCase(),
  )
}

export function isCustomApparel(product: Product): boolean {
  return isApparel(product) && product.orderType === 'custom'
}

export function isTraumaApparel(product: Product): boolean {
  const brand = product.brand.trim().toLowerCase().replace(/[.]/g, '').replace(/\s+/g, ' ')
  return isApparel(product) && ['trauma', 'trauma cc', 'trauma custom clothing', 'trauma custom clothing (tcc)', 'trauma custom clothing (trauma cc)'].includes(brand)
}

export function featuredApparel(inventory: Inventory): Product[] {
  return featuredProducts(inventory).filter((product) => isTraumaApparel(product) && !isCustomApparel(product) && (product.featuredApparel ?? product.featured)).slice(0, 7)
}

// Management-only filtering; never changes records or storefront visibility.
export type InventoryFilters = {
  search: string
  status: 'all' | 'draft' | 'published' | 'sold'
  category: string
  source: string
  featured: 'all' | 'products' | 'apparel' | 'none' | 'featured'
}

export function filterInventoryProducts(
  products: Product[],
  filters: InventoryFilters,
): Product[] {
  const terms = filters.search.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return products.filter((p) => {
    const searchable = [p.name, p.id, p.brand, p.category, p.description, p.size, p.color]
      .join(' ').toLowerCase()
    return terms.every((term) => searchable.includes(term)) &&
      (filters.status === 'all' ||
        (filters.status === 'draft' && !p.published) ||
        (filters.status === 'published' && p.published) ||
        (filters.status === 'sold' && p.sold)) &&
      (!filters.category || (filters.category === 'digital' ? !isApparel(p) : p.category === filters.category)) &&
      (!filters.source || p.source === filters.source) &&
      (filters.featured === 'all' ||
        (filters.featured === 'featured' && (p.featured || p.featuredCollection || p.featuredApparel)) ||
        (filters.featured === 'none' && !p.featured && !p.featuredCollection && !p.featuredApparel) ||
        (filters.featured === 'apparel' && (p.featuredApparel ?? p.featured) && isApparel(p)) ||
        (filters.featured === 'products' && p.featured && !isApparel(p)))
  })
}

export const GALLERY_CATEGORIES = [
  { id: 'featured', label: '🖤 Featured Pieces' },
  { id: 'featured-apparel', label: '👕 Featured Apparel' },
  { id: 'hero', label: '🔥 Hero Collection' },
  { id: 'shirts', label: '👕 Shirts' },
  { id: 'hoodies', label: '🧥 Hoodies' },
  { id: 'denim', label: '👖 Denim' },
  { id: 'women', label: "🖤 Women's Collection" },
  { id: 'headwear', label: '🧢 Hats & Beanies' },
  { id: 'footwear', label: '👟 Footwear' },
  { id: 'custom-shoes', label: '👟 Custom Shoes' },
  { id: 'artwear', label: '🎨 One-of-One Artwear' },
  { id: 'digital', label: '📚 Books & Guides' },
] as const
export const HEADWEAR_COLLECTIONS = ['Trauma CC Beanies', 'Made In Chaos Beanies', 'UNSPOKEN Hats', 'Trauma CC Trucker Hats', 'Custom Headwear']
export const CUSTOM_GALLERY_TYPES = ['Custom Hats', 'Custom Shoes', 'Custom Hoodies', 'Custom T-Shirts', 'Custom Jeans', 'Custom Jackets', 'Custom Sports Bras', 'Custom Bras', 'Custom Leggings', "Custom Women's Sets", 'Custom Beanies', 'Custom Denim']
export const CUSTOM_CREATION_TYPES = ['Custom Hats', 'Custom Beanies', 'Custom Shoes', 'Custom Hoodies', 'Custom Jackets', 'Custom Denim', 'Custom Sports Bras', 'Custom Bras', 'Custom Leggings', "Custom Women's Sets"]
export const WOMENS_COLLECTION_TYPES = ['Leggings', 'Sports Bras', 'Bras', "Women's Hoodies", "Women's Custom Pieces"]
export const CUSTOM_ORDER_TYPES = [...new Set([...CUSTOM_GALLERY_TYPES, ...CUSTOM_CREATION_TYPES, 'Custom Joggers', 'Custom Headwear', 'Memorial apparel', 'Business apparel', 'Team apparel', 'One-off custom pieces'])]

export function isWomensCollection(product: Product): boolean {
  return [product.category, product.collection ?? ''].some((value) => value.trim().toLowerCase() === "women's collection")
}
export function womensCollectionType(product: Product): string {
  const text = `${product.productType ?? ''} ${product.name}`.toLowerCase()
  if (/leggings/.test(text)) return 'Leggings'
  if (/sports? bras?/.test(text)) return 'Sports Bras'
  if (/\bbras?\b/.test(text)) return 'Bras'
  if (/hoodie/.test(text)) return "Women's Hoodies"
  return "Women's Custom Pieces"
}

export function galleryCategory(product: Product): string {
  if (!isApparel(product)) return 'digital'
  const text = `${product.category} ${product.productType ?? ''} ${product.name}`.toLowerCase()
  if (/beanie|headwear|hat\b|hats\b|trucker/.test(text)) return 'headwear'
  if (/footwear|shoes|sneakers/.test(text)) return 'footwear'
  if (/hoodie/.test(text)) return 'hoodies'
  if (/jeans|denim|capris|carpenter/.test(text)) return 'denim'
  if (/t-shirt|tshirt|\btee\b|shirt/.test(text) && !/sweatshirt/.test(text)) return 'shirts'
  return isWomensCollection(product) ? 'women' : 'artwear'
}

export function productCollection(product: Product): string {
  if (product.collection?.trim()) return product.collection
  const id = galleryCategory(product)
  return GALLERY_CATEGORIES.find((category) => category.id === id)?.label.replace(/^\S+\s/, '') ?? 'TRAUMA originals'
}

export function galleryProducts(inventory: Inventory, category = 'all', collection = '', availability = 'all'): Product[] {
  return inventory.products.filter((p) => {
    if (!p.published || !p.ownerConfirmed || (isApparel(p) && !isTraumaApparel(p))) return false
    if (availability === 'available' && p.sold) return false
    if (availability === 'sold' && !p.sold) return false
    if (category === 'women') {
      if (!isWomensCollection(p) || (collection && womensCollectionType(p) !== collection)) return false
    } else if (collection && productCollection(p) !== collection) return false
    if (category === 'featured') return (p.featuredCollection ?? p.featured) && !p.sold && (!isApparel(p) || isTraumaApparel(p)) && !isCustomApparel(p)
    if (category === 'featured-apparel') return (p.featuredApparel ?? p.featured) && !p.sold && isTraumaApparel(p) && !isCustomApparel(p)
    if (category === 'hero') return p.homepageSpotlight === true || productCollection(p).toLowerCase() === 'hero collection'
    if (category === 'women') return true
    if (category === 'apparel') return isApparel(p)
    if (category === 'artwear') return isApparel(p) && /1.of.1|one.of.one|wearable art/i.test(`${p.productType ?? ''} ${p.subtitle ?? ''} ${p.description}`)
    return category === 'all' || galleryCategory(p) === category
  })
}


export function homepageSpotlightProduct(inventory: Inventory): Product | null {
  return galleryProducts(inventory, 'featured').find((product) => isTraumaApparel(product) && product.homepageSpotlight && product.homepageCollection !== false) ?? null
}

export const HOMEPAGE_COLLECTIONS = [
  { key: 'hero', id: 'hero-collection', title: '🔥 Hero Collection', href: '/collections?category=hero' },
  { key: 'apparel', id: 'featured-apparel', title: '👕 Apparel', href: '/collections?category=apparel' },
  { key: 'denim', id: 'denim', title: '👖 Denim', href: '/collections?category=denim' },
  { key: 'headwear', id: 'headwear', title: '🧢 Hats & Beanies', href: '/collections?category=headwear' },
  { key: 'footwear', id: 'custom-footwear', title: '👟 Custom Footwear', href: '/custom-orders?type=Custom%20Shoes' },
  { key: 'women', id: 'womens-collection', title: "🖤 Women's Collection", href: '/collections?category=women' },
  { key: 'digital', id: 'featured', title: '📚 Books & Guides', href: '/collections?category=digital' },
  { key: 'custom', id: 'custom-creations', title: '🎨 Custom Orders', href: '/custom-orders' },
] as const

export function homepageProducts(inventory: Inventory): Product[] {
  const eligible = galleryProducts(inventory, 'all', '', 'available')
    .filter((product) => product.featured && !isCustomApparel(product) && product.homepageCollection !== false)
  const spotlight = homepageSpotlightProduct(inventory)
  return (spotlight ? [spotlight, ...eligible.filter((product) => product.id !== spotlight.id)] : eligible).slice(0, 8)
}

export function homepageCollectionKey(product: Product): string {
  if (product.homepageSpotlight || product.collection?.trim().toLowerCase() === 'hero collection') return 'hero'
  if (isWomensCollection(product)) return 'women'
  const category = galleryCategory(product)
  return ['denim', 'headwear', 'footwear', 'digital'].includes(category) ? category : 'apparel'
}


export function productPhotoLabel(product: Product, index: number): string {
  const view = product.photoViews?.[index] ?? 'other'
  return view === 'other' ? `Photo ${index + 1}` : `${PHOTO_VIEW_LABELS[view]} — photo ${index + 1}`
}
