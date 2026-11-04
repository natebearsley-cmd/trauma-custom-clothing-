import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CustomInquiry } from '@/components/custom-inquiry'
import { inventory } from '@/lib/inventory-store'
import { CUSTOM_ORDER_TYPES, safeUrl, isApparel, storefrontProducts } from '@/lib/inventory'
export const metadata = { title: 'Request a Custom Order | TRAUMA', description: 'Request a custom apparel quote from TRAUMA Custom Clothing.', alternates: { canonical: '/custom-orders' } }
export default async function CustomOrdersPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const query = await searchParams
  const action = process.env.CUSTOM_ORDER_FORM_ACTION
  return <><SiteHeader /><main id="main-content"><h1 className="mx-auto max-w-7xl px-4 pt-12 font-display text-4xl uppercase md:px-8">Request Custom Order</h1><CustomInquiry initialType={typeof query.type === 'string' && CUSTOM_ORDER_TYPES.includes(query.type) ? query.type : ''} action={action && safeUrl(action) ? action : null} customProducts={storefrontProducts(inventory).filter(isApparel).map(({ id, name }) => ({ id, name }))} /></main><SiteFooter /></>
}
