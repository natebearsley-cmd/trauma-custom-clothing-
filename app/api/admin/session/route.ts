import { NextRequest, NextResponse } from 'next/server'
import { adminAuthorized, validAdminKey, sameOrigin } from '@/lib/admin-auth'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_SECONDS, createAdminSession } from '@/lib/admin-session'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }
export async function GET(request: NextRequest) {
  const authenticated = adminAuthorized(request)
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401, headers })
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers })
  try {
    const text = await request.text()
    if (text.length > 4096) throw new Error('Invalid sign-in request.')
    const body = JSON.parse(text)
    if (typeof body.key !== 'string' || !validAdminKey(body.key)) return NextResponse.json({ error: 'Could not sign in. Check your key and the one-time inventory setup.' }, { status: 401, headers })
    const response = NextResponse.json({ authenticated: true }, { headers })
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(process.env.INVENTORY_ADMIN_KEY!), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: ADMIN_SESSION_SECONDS })
    return response
  } catch { return NextResponse.json({ error: 'Could not sign in. Check your key and try again.' }, { status: 400, headers }) }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers })
  const response = NextResponse.json({ authenticated: false }, { headers })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
  return response
}
