import type { Metadata } from 'next'
import { InventoryManager } from '@/components/inventory-manager'

export const metadata: Metadata = {
  title: 'Inventory manager | TRAUMA CC',
  robots: { index: false, follow: false },
}
export default function AdminPage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <a href="/" className="underline">
        ← Back to TRAUMA CC
      </a>
      <h1 className="section-title">Inventory manager</h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Manage your real Payhip products, books, wallpapers, and apparel here. Nothing is
        published until you confirm it and complete its details.
      </p>
      <InventoryManager />
    </main>
  )
}
