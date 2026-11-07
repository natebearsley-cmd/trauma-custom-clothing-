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
        <a href="/collections/tiktok" className="block bg-primary px-4 py-4 text-center font-bold text-primary-foreground hover:bg-accent">Shop the Live Showcase →</a>
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
