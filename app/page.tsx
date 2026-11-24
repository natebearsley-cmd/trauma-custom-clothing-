import { publicPageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/site-header'
import { LiveLaunchCollection } from '@/components/live-launch-collection'
import { Hero } from '@/components/hero'
import { FounderStory } from '@/components/founder-story'
import { FeaturedPieces } from '@/components/featured-pieces'
import { CustomInquiry } from '@/components/custom-inquiry'
import { InsiderPlacement } from '@/components/insider-placement'
import { DigitalShop } from '@/components/digital-shop'
import { SiteFooter } from '@/components/site-footer'

import { StructuredData } from '@/components/structured-data'
import { inventory } from '@/lib/inventory-store'
import { safeUrl, isApparel, storefrontProducts } from '@/lib/inventory'


export const metadata = publicPageMetadata('/')

export default function Page() {
  return (
    <>
      <StructuredData />
      <SiteHeader />
      <main id="main-content">
        <div className="border-b border-border">
          <div className="mx-auto grid max-w-7xl grid-cols-2">
            <a href="/custom-orders" className="flex min-h-14 items-center justify-center gap-1 bg-primary px-2 py-3 text-center text-sm font-bold text-primary-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-foreground sm:px-4">
              Get a Custom Quote <span aria-hidden="true">→</span>
            </a>
            <a href="/collections/live-launch" className="flex min-h-14 items-center justify-center gap-1 bg-background px-2 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-foreground sm:px-4">
              Shop the Live Launch Collection <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <Hero />
        <LiveLaunchCollection inventory={inventory} />
        <FounderStory />
        <FeaturedPieces inventory={inventory} />
        <InsiderPlacement placement="home" className="mx-auto max-w-7xl px-4 py-10 md:px-8" />
        <CustomInquiry
          action={process.env.CUSTOM_ORDER_FORM_ACTION && safeUrl(process.env.CUSTOM_ORDER_FORM_ACTION)
            ? process.env.CUSTOM_ORDER_FORM_ACTION : null}
          customProducts={storefrontProducts(inventory).filter(isApparel).map(({ id, name }) => ({ id, name }))}
        />
        <DigitalShop />
      </main>
      <SiteFooter />
    </>
  )
}
