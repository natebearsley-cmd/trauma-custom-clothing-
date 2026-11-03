import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
export const ADMIN_SESSION_COOKIE = 'trauma_admin_session'
export const ADMIN_SESSION_SECONDS = 7 * 24 * 60 * 60
function signature(payload: string, secret: string) { return createHmac('sha256', secret).update(`trauma-admin-session.v1:${payload}`).digest('hex') }
export function createAdminSession(secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ v: 1, expiresAt: now + ADMIN_SESSION_SECONDS * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url')
  return `${payload}.${signature(payload, secret)}`
}
export function validAdminSession(value: string, secret: string, now = Date.now()): boolean {
  try {
    const [payload, signed, extra] = value.split('.')
    if (extra || !payload || !/^[a-f0-9]{64}$/.test(signed)) return false
    if (!timingSafeEqual(Buffer.from(signed, 'hex'), Buffer.from(signature(payload, secret), 'hex'))) return false
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return data.v === 1 && /^[a-f0-9]{32}$/.test(data.nonce) && Number.isFinite(data.expiresAt) && data.expiresAt > now && data.expiresAt <= now + ADMIN_SESSION_SECONDS * 1000
  } catch { return false }
}
