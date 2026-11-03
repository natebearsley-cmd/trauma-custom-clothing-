import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuthorized, sameOrigin } from '@/lib/admin-auth'
import { MAX_PRODUCT_PHOTO_BYTES, UPLOAD_SESSION_PATTERN } from '@/lib/quick-add'
import { detectPhotoExtension, signPhotoReceipt } from '@/lib/product-photo-upload'
import { inventoryGitHub } from '@/lib/github-inventory-write'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }
export async function POST(request: NextRequest) {
  if (!adminAuthorized(request)) return NextResponse.json({ error: 'Enter your admin key. The inventory credentials must be configured.' }, { status: 401, headers })
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers })
  if (Number(request.headers.get('content-length') || 0) > MAX_PRODUCT_PHOTO_BYTES + 65536) return NextResponse.json({ error: 'Each photo must be 3 MB or smaller.' }, { status: 413, headers })
  try {
    const form = await request.formData()
    const file = form.get('photo')
    const session = String(form.get('session') ?? '')
    if (!UPLOAD_SESSION_PATTERN.test(session) || !(file instanceof File)) throw new Error('Choose a real product photo.')
    if (!file.size || file.size > MAX_PRODUCT_PHOTO_BYTES) return NextResponse.json({ error: 'Each photo must be nonempty and 3 MB or smaller.' }, { status: 413, headers })
    const bytes = new Uint8Array(await file.arrayBuffer())
    const extension = detectPhotoExtension(bytes)
    if (!extension) throw new Error('Use an original JPG, PNG, or WebP photo.')
    const response = await inventoryGitHub('git/blobs', 'POST', { content: Buffer.from(bytes).toString('base64'), encoding: 'base64' })
    if (!response.ok) return NextResponse.json({ error: 'Photo upload failed. Check GitHub write permissions and try again.' }, { status: 502, headers })
    const blob = await response.json()
    const receipt = signPhotoReceipt({ session, path: `public/images/products/admin/${randomUUID()}.${extension}`, sha: blob.sha }, process.env.INVENTORY_ADMIN_KEY!)
    return NextResponse.json({ receipt }, { headers })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Photo upload failed.' }, { status: 400, headers }) }
}
