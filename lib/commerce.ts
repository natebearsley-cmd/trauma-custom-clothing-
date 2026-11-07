import { isApparel, isCustomApparel, isPayPalProductUrl, paypalBuyNowDestination, type Inventory, type Product } from './inventory.ts'

// Owner-named launch queue, not public product records. Inventory remains the
// single source of product photos, copy, pricing, stock and payment links.
export const PAYPAL_LAUNCH_SKUS = ['PMH-001', 'RTS-001', 'ANX-001'] as const
export function commerceSkus(inventory: Inventory): string[] {
  return [...new Set<string>([...PAYPAL_LAUNCH_SKUS, ...inventory.products.flatMap((p) => p.sku ? [p.sku.toUpperCase()] : [])])]
}

export function paypalShopProducts(inventory: Inventory): Product[] {
  return inventory.products.filter((product) => paypalBuyNowDestination(product) !== null)
}

export function commerceRequirements(product?: Product): string[] {
  if (!product) return ['Connect existing product']
  const missing: string[] = []
  if (!product.sku?.trim()) missing.push('SKU')
  if (!product.physicalInventoryTag?.trim()) missing.push('Physical inventory tag')
  if (!product.photos.length) missing.push('Original photos')
  if (!product.description.trim()) missing.push('Approved description')
  if (product.price === null || !Number.isFinite(product.price) || product.price <= 0) missing.push('Price')
  if (!Number.isSafeInteger(product.stockQuantity) || product.stockQuantity! < 1) missing.push('Available stock')
  if (!isApparel(product) || isCustomApparel(product)) missing.push('Ready-made apparel')
  if (product.sold) missing.push('Available item')
  if (!product.ownerConfirmed) missing.push('Owner confirmation')
  if (!product.published) missing.push('Publish product')
  if (!product.paypalUrl || !isPayPalProductUrl(product.paypalUrl)) missing.push('Product-specific PayPal checkout URL')
  return missing
}

export function commerceCatalog(inventory: Inventory) {
  const skus = commerceSkus(inventory)
  return skus.map((sku) => {
    const product = inventory.products.find((p) => p.sku?.toUpperCase() === sku)
    return { sku, product, name: product?.name || '',
      physicalInventoryTag: product?.physicalInventoryTag || null,
      paypalUrl: product?.paypalUrl && isPayPalProductUrl(product.paypalUrl) ? product.paypalUrl : null,
      missing: commerceRequirements(product) }
  })
}
