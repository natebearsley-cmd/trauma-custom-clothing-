import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { LiveLaunchCollection } from '@/components/live-launch-collection'
import { inventory } from '@/lib/inventory-store'

export const metadata = { title: 'Featured Live Collection | TRAUMA Custom Clothing', description: 'Shop the featured live collection from TRAUMA Custom Clothing.' }

export default function LiveLaunchPage() {
  return <><SiteHeader /><main id="main-content"><LiveLaunchCollection inventory={inventory} /></main><SiteFooter /></>
}
