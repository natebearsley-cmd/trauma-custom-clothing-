import { NextRequest, NextResponse } from 'next/server'
import { adminAuthorized, sameOrigin } from '@/lib/admin-auth'
import { buildQuickAddProduct, MAX_PRODUCT_PHOTOS } from '@/lib/quick-add'
import { validPhotoReceipt, type PhotoReceipt } from '@/lib/product-photo-upload'
import { validateInventory } from '@/lib/inventory'
import { commitQuickAdd, InventoryWriteError } from '@/lib/github-inventory-write'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }
export async function POST(request: NextRequest) {
  if (!adminAuthorized(request)) return NextResponse.json({ error: 'Enter your admin key. The inventory credentials must be configured.' }, { status: 401, headers })
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers })
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 100000) return NextResponse.json({ error: 'Product details are too large.' }, { status: 413, headers })
    const body = JSON.parse(text)
    if (typeof body.sha !== 'string' || !/^[a-f0-9]{40}$/.test(body.sha)) throw new Error('Refresh the latest inventory before saving.')
    const receipts: PhotoReceipt[] = body.photos
    if (!Array.isArray(receipts) || receipts.length < 1 || receipts.length > MAX_PRODUCT_PHOTOS || receipts.some((receipt) => !validPhotoReceipt(receipt, body.session, process.env.INVENTORY_ADMIN_KEY!)) || new Set(receipts.map((receipt) => receipt.path)).size !== receipts.length) throw new Error('Upload your product photos again before saving.')
    const product = buildQuickAddProduct(body.product, receipts.map((receipt) => receipt.path.replace(/^public/, '')), body.session)
    validateInventory({ version: 1, products: [product] })
    const result = await commitQuickAdd({ product, images: receipts, expectedSha: body.sha, assertInventory: validateInventory })
    return NextResponse.json({ sha: result.sha, productId: result.product.id, published: result.product.published, replayed: result.replayed,
      message: result.product.published ? 'Saved with publication approved. The product page, gallery, collection, and selected featured placement appear after the connected deployment succeeds.' : 'Draft saved with its photos. It will stay out of public pages and galleries until you approve publishing it.' }, { headers })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save this product.' }, { status: error instanceof InventoryWriteError ? error.status : 400, headers }) }
}
