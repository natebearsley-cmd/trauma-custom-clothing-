import { createHash, timingSafeEqual } from 'node:crypto'
import { ADMIN_SESSION_COOKIE, validAdminSession } from './admin-session'
export function validAdminKey(supplied: string): boolean {
  const key = process.env.INVENTORY_ADMIN_KEY
  if (!key || key.length < 32 || !process.env.INVENTORY_GITHUB_TOKEN) return false
  return timingSafeEqual(createHash('sha256').update(key).digest(), createHash('sha256').update(supplied).digest())
}
export function adminAuthorized(request: Request): boolean {
  const key = process.env.INVENTORY_ADMIN_KEY
  if (!key || key.length < 32 || !process.env.INVENTORY_GITHUB_TOKEN) return false
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  if (supplied && validAdminKey(supplied)) return true
  const cookie = request.headers.get('cookie')?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
  if (!cookie) return false
  try { return validAdminSession(decodeURIComponent(cookie.slice(ADMIN_SESSION_COOKIE.length + 1)), key) } catch { return false }
}
export function sameOrigin(request: Request): boolean { return request.headers.get('origin') === new URL(request.url).origin }
