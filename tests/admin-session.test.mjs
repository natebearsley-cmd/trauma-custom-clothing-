import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdminSession, validAdminSession, ADMIN_SESSION_SECONDS } from '../lib/admin-session.ts'
test('admin sessions are signed, expire, and cannot be forged or reused after key rotation', () => {
  const secret = 'local-unit-test-only-not-a-production-secret'
  const now = 1800000000000
  const token = createAdminSession(secret, now)
  assert.equal(validAdminSession(token, secret, now), true)
  assert.equal(validAdminSession(token, secret, now + 1000), true)
  assert.equal(validAdminSession(token, secret, now + ADMIN_SESSION_SECONDS * 1000), false)
  assert.equal(validAdminSession(token, 'rotated-test-key', now), false)
  assert.equal(validAdminSession(`${token}.extra`, secret, now), false)
  assert.equal(validAdminSession('invalid', secret, now), false)
  const [payload, signature] = token.split('.')
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
  data.expiresAt += 1000000000
  assert.equal(validAdminSession(`${Buffer.from(JSON.stringify(data)).toString('base64url')}.${signature}`, secret, now), false)
})
