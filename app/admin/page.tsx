import { AdminDashboard } from '@/components/admin-dashboard'
export const metadata = { title: 'TRAUMA Admin', robots: { index: false, follow: false }, appleWebApp: { capable: true, title: 'TRAUMA Admin', statusBarStyle: 'black-translucent' as const } }
export default function AdminPage() {
  return <main id="main-content" className="mx-auto min-h-svh max-w-4xl px-4 py-10 md:px-8"><p className="eyebrow">TRAUMA Custom Clothing</p><h1 className="section-title">Your Business. Your Control.</h1><p className="mt-5 text-muted-foreground">Add products, manage your gallery, and curate your collections.</p><AdminDashboard /></main>
}
