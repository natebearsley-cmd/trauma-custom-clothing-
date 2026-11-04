'use client'
import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
const actions = [
  ['🎬', 'TikTok Shop Prep', '/admin/tiktok-shop'],
  ['📦', 'Quick Add Product', '/admin/quick-add'],
  ['🖼', 'Manage Gallery', '/admin/inventory?view=gallery'],
  ['👕', 'Inventory', '/admin/inventory'],
  ['⭐', 'Featured Products', '/admin/inventory?featured=featured'],
  ['📚', 'Books & Digital Products', '/admin/inventory?category=digital'],
  ['🛒', 'View Website', '/'],
]
export function AdminDashboard() {
  const [state, setState] = useState<'checking' | 'signed-out' | 'signed-in'>('checking')
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; fetch('/api/admin/session', { cache: 'no-store' }).then((response) => { if (active) setState(response.ok ? 'signed-in' : 'signed-out') }).catch(() => { if (active) setState('signed-out') }); return () => { active = false } }, [])
  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try { const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setState('signed-in'); setKey(''); window.location.reload() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not sign in.') } finally { setBusy(false) }
  }
  async function signOut() {
    setBusy(true); setError('')
    try { const response = await fetch('/api/admin/session', { method: 'DELETE' }); if (!response.ok) throw new Error('Could not sign out. Try again.'); setState('signed-out'); window.location.reload() } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not sign out.') } finally { setBusy(false) }
  }
  return <div className="mt-8">
    {state === 'checking' ? <p role="status">Checking your saved session…</p> : state === 'signed-out' ? <form onSubmit={signIn} className="max-w-xl space-y-5 border border-border bg-card p-6">
      <input type="text" name="username" autoComplete="username" defaultValue="TRAUMA Admin" readOnly tabIndex={-1} className="sr-only" aria-label="Admin account" />
      <label className="block font-semibold" htmlFor="dashboard-password">Admin key<input id="dashboard-password" name="password" type="password" autoComplete="current-password" required value={key} onChange={(event) => setKey(event.target.value)} className="mt-2 min-h-12 w-full border border-input bg-background px-4 py-3 text-base" /></label>
      <p className="text-sm leading-relaxed text-muted-foreground">Sign in once and this device can stay signed in for up to seven days. You can save the key in your phone’s password manager; iPhone may use Face ID to unlock autofill.</p>
      <button disabled={busy} className="min-h-12 w-full bg-primary px-5 py-4 font-semibold text-primary-foreground disabled:opacity-50">{busy ? 'Signing in…' : 'Open TRAUMA Admin'}</button>
    </form> : <>
      <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Signed in · Your business tools in one place</p><button type="button" onClick={signOut} disabled={busy} className="min-h-11 border border-input px-4 text-sm">Sign out</button></div>
      <nav aria-label="Business dashboard" className="mt-6 grid gap-4 sm:grid-cols-2">{actions.map(([icon, label, href]) => <Link key={label} href={href} className="flex min-h-32 items-center gap-5 border border-border bg-card p-6 hover:border-accent motion-safe:transition-transform motion-safe:hover:-translate-y-1"><span aria-hidden="true" className="text-3xl">{icon}</span><span className="text-lg font-semibold">{label}</span></Link>)}</nav>
      <aside className="mt-8 border border-border p-5 text-sm leading-relaxed text-muted-foreground"><h2 className="font-semibold text-foreground">Save this dashboard to your phone</h2><p className="mt-2">On iPhone, open this page in Safari, tap Share, then Add to Home Screen. Use the same shortcut to return to your saved session.</p></aside>
    </>}
    {error && <p role="alert" className="mt-5 border border-accent p-4 text-sm">{error}</p>}
  </div>
}
