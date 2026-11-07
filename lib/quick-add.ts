import { tiktokReadinessIssues } from './tiktok-shop.ts'
import type { Product, PhotoView } from './inventory'
export const QUICK_APPAREL_CATEGORIES = ['Matching Sets', 'Apparel', 'Tops', 'Outerwear', 'Denim', 'Headwear', "Women's Collection", 'Footwear']
export const QUICK_PRODUCT_CATEGORIES = [...QUICK_APPAREL_CATEGORIES, 'Books', 'Guides', 'Wallpapers', 'Digital Downloads']
export const MAX_PRODUCT_PHOTO_BYTES = 3 * 1024 * 1024
export const MAX_PRODUCT_PHOTOS = 12
export const UPLOAD_SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export type QuickAddFields = {
  name: string; description: string; price: number; category: string
  depopUrl: string; paypalUrl: string; payhipUrl: string
  size?: string; condition?: string; color?: string; collection?: string; productType?: string
  featuredCollection?: boolean; featuredApparel?: boolean; photoViews?: PhotoView[]
  tiktokReady?: boolean
  prepareTikTok?: boolean
  sku?: string; physicalInventoryTag?: string; stockQuantity?: number
  featured: boolean; published: boolean; ownerConfirmed: boolean; reviewApproved: boolean
}
export function buildQuickAddProduct(fields: QuickAddFields, paths: string[], session: string): Product {
  if (!UPLOAD_SESSION_PATTERN.test(session)) throw new Error('Reload Quick Add before saving.')
  if (!fields || typeof fields !== 'object') throw new Error('Enter your product details.')
  for (const field of ['name', 'description', 'category', 'depopUrl', 'paypalUrl', 'payhipUrl'] as const)
    if (typeof fields[field] !== 'string') throw new Error(`Invalid ${field}.`)
  if (!fields.name.trim() || fields.name.length > 200) throw new Error('Enter the real product name (up to 200 characters).')
  if (!fields.description.trim() || fields.description.length > 5000) throw new Error('Paste your real description (up to 5,000 characters).')
  if (!Number.isFinite(fields.price) || fields.price < 0 || fields.price > 1000000 || Math.abs(fields.price * 100 - Math.round(fields.price * 100)) > 0.000001) throw new Error('Enter a valid price with at most two decimal places.')
  if (!QUICK_PRODUCT_CATEGORIES.includes(fields.category)) throw new Error('Select a product category.')
  const apparel = QUICK_APPAREL_CATEGORIES.includes(fields.category)
  if (apparel && fields.payhipUrl.trim()) throw new Error('Apparel uses Depop or PayPal. Use Payhip for books and digital products.')
  if (!apparel && (fields.depopUrl.trim() || fields.paypalUrl.trim())) throw new Error('Books and digital products use Payhip, not apparel payment links.')
  for (const field of ['featured', 'published', 'ownerConfirmed', 'reviewApproved'] as const)
    if (typeof fields[field] !== 'boolean') throw new Error('Review the product status fields.')
  if (!fields.ownerConfirmed) throw new Error('Confirm this is your real TRAUMA product with accurate details and photos.')
  if (fields.published && !fields.reviewApproved) throw new Error('Review and approve this product before publishing.')
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > MAX_PRODUCT_PHOTOS || paths.some((path) => !/^\/images\/products\/admin\/[a-z0-9-]+\.(jpg|png|webp)$/.test(path))) throw new Error('Upload between 1 and 12 real product photos.')
  for (const field of ['size', 'condition', 'color', 'collection', 'productType'] as const)
    if (fields[field] !== undefined && (typeof fields[field] !== 'string' || fields[field]!.length > 200)) throw new Error(`Invalid ${field}.`)
  for (const field of ['sku', 'physicalInventoryTag'] as const)
    if (fields[field] !== undefined && (typeof fields[field] !== 'string' || fields[field]!.length > 64 ||
      (fields[field] !== '' && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(fields[field]!)))) throw new Error(`Invalid ${field}.`)
  if (fields.stockQuantity !== undefined && (!Number.isSafeInteger(fields.stockQuantity) || fields.stockQuantity < 0)) throw new Error('Inventory must be a nonnegative whole number.')
  for (const flag of ['featuredCollection', 'featuredApparel'] as const) if (fields[flag] !== undefined && typeof fields[flag] !== 'boolean') throw new Error('Review your featured selections.')
  const featuredCollection = fields.featuredCollection ?? fields.featured
  const featuredApparel = apparel && fields.category !== 'Matching Sets' && (fields.featuredApparel ?? fields.featured)
  if (fields.tiktokReady !== undefined && typeof fields.tiktokReady !== 'boolean') throw new Error('Invalid TikTok Shop readiness.')
  if (fields.prepareTikTok !== undefined && typeof fields.prepareTikTok !== 'boolean') throw new Error('Invalid TikTok preparation selection.')
  const product: Product = {
    id: `product-${session}`, name: fields.name.trim(), description: fields.description.trim(),
    brand: apparel ? 'Trauma Custom Clothing' : '', category: fields.category,
    size: fields.size?.trim() ?? '', condition: fields.condition?.trim() ?? '', color: fields.color?.trim() ?? '',
    collection: fields.collection?.trim() || (fields.category === 'Matching Sets' ? 'Matching Sets' : fields.category === "Women's Collection" ? "Women's Collection" : ''),
    productType: fields.productType?.trim() ?? '', orderType: apparel ? 'ready-made' : undefined, photos: paths,
    photoViews: fields.photoViews ?? paths.map(() => 'other'),
    price: fields.price, currency: 'USD', purchaseUrl: '',
    depopUrl: fields.depopUrl.trim(), paypalUrl: fields.paypalUrl.trim(), payhipUrl: fields.payhipUrl.trim(),
    source: fields.depopUrl.trim() ? 'depop' : fields.payhipUrl.trim() ? 'payhip' : 'manual', sourceUrl: fields.depopUrl.trim() || fields.payhipUrl.trim(),
    sold: false, soldDisplay: 'show', published: fields.published, featured: featuredCollection || featuredApparel, featuredCollection, featuredApparel,
    ownerConfirmed: true, requestCustomPiece: apparel,
    ...(fields.sku?.trim() ? { sku: fields.sku.trim().toUpperCase() } : {}),
    ...(fields.physicalInventoryTag?.trim() ? { physicalInventoryTag: fields.physicalInventoryTag.trim() } : {}),
    ...(fields.stockQuantity === undefined ? {} : { stockQuantity: fields.stockQuantity }),
    ...(fields.tiktokReady ? { tiktokShopStatus: 'ready' as const } : fields.prepareTikTok ? { tiktokShopStatus: 'in-preparation' as const } : {}),
  }
  if (fields.tiktokReady && tiktokReadinessIssues(product).length) throw new Error('Complete the product details before marking it ready for TikTok Shop.')
  return product
}
