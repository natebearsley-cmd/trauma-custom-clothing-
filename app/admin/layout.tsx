import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, validAdminSession } from '@/lib/admin-session'
import { AdminDashboard } from '@/components/admin-dashboard'
export const dynamic = 'force-dynamic'
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const key = process.env.INVENTORY_ADMIN_KEY
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!key || key.length < 32 || !process.env.INVENTORY_GITHUB_TOKEN || !session || !validAdminSession(session, key)) {
    return <main id="main-content" className="mx-auto min-h-svh max-w-xl px-4 py-12"><h1 className="section-title">TRAUMA Admin sign in</h1><AdminDashboard /></main>
  }
  return children
}
