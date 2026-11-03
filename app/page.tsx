import { SiteHeader } from '@/components/site-header'
import { HomepageSpotlight } from '@/components/homepage-spotlight'
import { Hero } from '@/components/hero'
import { TraumaCollections } from '@/components/trauma-collections'
import { DirectFromTrauma } from '@/components/direct-from-trauma'
import { FounderStory } from '@/components/founder-story'
import { CustomInquiry } from '@/components/custom-inquiry'
import { SiteFooter } from '@/components/site-footer'

import { StructuredData } from '@/components/structured-data'
import { inventory } from '@/lib/inventory-store'
import { JourneyVault } from '@/components/journey-vault'
import { safeUrl, isApparel } from '@/lib/inventory'

export default function Page() {
  return (
    <>
      <StructuredData />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <FounderStory />
        <HomepageSpotlight inventory={inventory} />
        <TraumaCollections inventory={inventory} />
        <DirectFromTrauma payments={inventory.payments} />
        <CustomInquiry
          action={process.env.CUSTOM_ORDER_FORM_ACTION && safeUrl(process.env.CUSTOM_ORDER_FORM_ACTION)
            ? process.env.CUSTOM_ORDER_FORM_ACTION : null}
          customProducts={inventory.products.filter(isApparel).map(({ id, name }) => ({ id, name }))}
        />
        <JourneyVault
          action={
            process.env.JOURNEYVAULT_WAITLIST_ACTION &&
            safeUrl(process.env.JOURNEYVAULT_WAITLIST_ACTION)
              ? process.env.JOURNEYVAULT_WAITLIST_ACTION
              : null
          }
        />
      </main>
      <SiteFooter />
    </>
  )
}
