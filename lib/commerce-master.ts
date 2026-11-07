import { isApparel, isCustomApparel, isPayPalProductUrl, paypalBuyNowDestination, safeUrl, type Inventory, type Product } from './inventory.ts'
import { commerceSkus } from './commerce.ts'
import { generateTikTokListing, TIKTOK_STATUS_LABELS, tiktokReadinessIssues } from './tiktok-shop.ts'

export function websiteProductUrl(product: Product, origin: string): string | null {
  if (!product.published || !product.ownerConfirmed || !product.name.trim() || !product.photos.length) return null
  const base = new URL(origin)
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Website origin must use HTTPS')
  // Derive the route from the canonical product ID. Do not expose private draft
  // URLs or let an outdated saved link point buyers to another item.
  return new URL(`/products/${product.id}`, base.origin).href
}

export function tiktokPublicationIssues(product: Product): string[] {
  const issues = tiktokReadinessIssues(product).filter((issue) => issue !== 'Add the title, category and description.')
  if (!product.name.trim()) issues.push('Confirmed product name')
  if (!product.category.trim()) issues.push('Product category')
  if (!product.description.trim()) issues.push('Approved product description')
  if (!product.sku?.trim()) issues.push('Seller SKU')
  if (!product.condition.trim()) issues.push('Confirmed condition')
  if (!product.size.trim()) issues.push('Confirmed size')
  if (!product.physicalInventoryTag?.trim()) issues.push('Physical inventory tag')
  if (!Number.isSafeInteger(product.stockQuantity) || product.stockQuantity! < 1) issues.push('Available inventory quantity')
  if (!product.packedWeightOz) issues.push('Measured packed weight (oz)')
  if (!product.packageDimensionsIn) issues.push('Measured package length, width and height (in)')
  if (!product.tiktokCategoryId || !product.tiktokCategoryPath) issues.push('Seller Center leaf category')
  if (!product.tiktokPhotosApproved) issues.push('Actual photo review')
  if (!product.tiktokListingChecked) issues.push('Exact SKU check in Seller Center to prevent duplicates')
  if (isCustomApparel(product) || !isApparel(product)) issues.push('Eligible ready-made apparel')
  if (/(?:https?:\/\/|www\.|\b(?:paypal|depop|payhip)\b)/i.test([product.tiktokTitle, product.tiktokDescription].filter(Boolean).join(' ')))
    issues.push('Remove off-platform ordering information from TikTok draft copy')
  return [...new Set(issues)]
}

export function commerceMasterRows(inventory: Inventory, origin: string) {
  return commerceSkus(inventory).map((sku) => {
    const product = inventory.products.find((p) => p.sku?.toUpperCase() === sku)
    if (!product) return { sku, productName: null, physicalInventoryTag: null, price: null, currency: 'USD',
      inventory: null, productUrl: null, paypalUrl: null, paypalProductId: null,
      tiktokStatus: 'not-started', tiktokStatusLabel: 'Not started', tiktokProductId: null,
      condition: null, websiteStatus: 'Not connected', publicationIssues: ['Connect the confirmed product record'] }
    return { sku, productName: product.name.trim() || null, physicalInventoryTag: product.physicalInventoryTag || null,
      price: product.price, currency: product.currency, inventory: product.stockQuantity ?? null,
      productUrl: websiteProductUrl(product, origin),
      paypalUrl: product.paypalUrl && isPayPalProductUrl(product.paypalUrl) ? product.paypalUrl : null,
      paypalProductId: product.paypalProductId || null,
      tiktokStatus: product.tiktokShopStatus ?? 'not-started',
      tiktokStatusLabel: TIKTOK_STATUS_LABELS[product.tiktokShopStatus ?? 'not-started'],
      tiktokProductId: product.tiktokProductId || null, condition: product.condition || null,
      websiteStatus: paypalBuyNowDestination(product) ? 'BUY NOW connected' : product.published ? 'Published; checkout incomplete' : 'Private incomplete record',
      publicationIssues: tiktokPublicationIssues(product) }
  })
}

export function tiktokPublicationRecords(inventory: Inventory, origin: string) {
  return commerceSkus(inventory).flatMap((sku) => {
    const product = inventory.products.find((p) => p.sku?.toUpperCase() === sku)
    if (!product) return []
    const listing = generateTikTokListing(product)
    const title = product.tiktokTitle?.trim() || listing?.title || ''
    const description = product.tiktokDescription?.trim() || listing?.description || ''
    const issues = tiktokPublicationIssues(product)
    if (!title) issues.push('TikTok title')
    if (!description) issues.push('TikTok description')
    const photos = product.photos.map((url) => url.startsWith('/images/') ? new URL(url, origin).href : url).filter((url) => safeUrl(url))
    return [{ sku, productId: product.id, tiktokProductId: product.tiktokProductId || null,
      action: product.tiktokProductId ? 'Review existing TikTok listing' : 'Prepare draft after exact SKU check',
      title, description, categoryId: product.tiktokCategoryId || null, categoryPath: product.tiktokCategoryPath || null,
      price: product.price, currency: product.currency, inventory: product.stockQuantity ?? null,
      size: product.size, color: product.color, condition: product.condition, photos,
      packedWeightOz: product.packedWeightOz ?? null, packageDimensionsIn: product.packageDimensionsIn ?? null,
      status: product.tiktokShopStatus ?? 'not-started', publicationIssues: [...new Set(issues)],
      importReady: issues.length === 0, uploadTemplateRequired: true }]
  })
}

export function commerceMasterCsv(inventory: Inventory, origin: string): string {
  const rows = commerceMasterRows(inventory, origin)
  const csvCell = (value: unknown) => {
    let text = value === null || value === undefined ? '' : String(value)
    // Prevent spreadsheet formula execution and retain identifier leading zeroes.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  const headers = ['Product Name', 'SKU', 'Physical Inventory Tag', 'Price', 'Currency', 'Inventory', 'Product URL', 'PayPal URL', 'TikTok Status', 'TikTok Product ID']
  return [headers, ...rows.map((r) => [r.productName, r.sku, r.physicalInventoryTag ? `'${r.physicalInventoryTag}` : '', r.price,
    r.currency, r.inventory, r.productUrl, r.paypalUrl, r.tiktokStatusLabel, r.tiktokProductId])]
    .map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
