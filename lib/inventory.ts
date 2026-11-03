export type Product = {
  id: string
  name: string
  brand: string
  category: string
  size: string
  color: string
  condition: string
  photos: string[]
  description: string
  price: number | null
  currency: string
  purchaseUrl: string
  payhipUrl: string
  sold: boolean
  soldDisplay: 'show' | 'archive'
  published: boolean
  featured: boolean
  ownerConfirmed: boolean
  source: 'repository' | 'depop' | 'payhip' | 'manual'
  sourceUrl: string
}

export type Inventory = { version: 1; products: Product[] }

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

export function validateInventory(value: unknown): asserts value is Inventory {
  if (!value || typeof value !== 'object') throw new Error('Invalid inventory')
  const inventory = value as Inventory
  if (
    inventory.version !== 1 ||
    !Array.isArray(inventory.products) ||
    inventory.products.length > 1000
  )
    throw new Error('Inventory requires version 1 and at most 1,000 products')
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
    if (p.source === 'depop' && (!p.sourceUrl || !isDepopUrl(p.sourceUrl)))
      throw new Error('Depop products require a Depop source URL')
    if (p.source === 'payhip' && !isPayhipProductUrl(p.sourceUrl))
      throw new Error('Payhip products require a direct Payhip source product URL')
    if (
      p.published &&
      (!p.ownerConfirmed ||
        !p.photos.length ||
        !p.category.trim() ||
        !p.description.trim() ||
        (p.payhipUrl && p.price === null))
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
  return ['apparel', 'tops', 'outerwear', 'headwear'].includes(
    product.category.trim().toLowerCase(),
  )
}

export function featuredApparel(inventory: Inventory): Product[] {
  return featuredProducts(inventory).filter(isApparel)
}

// Management-only filtering; never changes records or storefront visibility.
export type InventoryFilters = {
  search: string
  status: 'all' | 'draft' | 'published' | 'sold'
  category: string
  source: string
  featured: 'all' | 'products' | 'apparel' | 'none'
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
      (!filters.category || p.category === filters.category) &&
      (!filters.source || p.source === filters.source) &&
      (filters.featured === 'all' ||
        (filters.featured === 'none' && !p.featured) ||
        (filters.featured === 'apparel' && p.featured && isApparel(p)) ||
        (filters.featured === 'products' && p.featured && !isApparel(p)))
  })
}
