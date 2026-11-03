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
import soundtrack from '@/data/soundtrack.json'
import { validateSoundtrackSettings } from '@/lib/soundtrack'
import { TraumaSoundtrack } from '@/components/trauma-soundtrack'
import { safeUrl, isApparel } from '@/lib/inventory'

validateSoundtrackSettings(soundtrack)

export default function Page() {
  return (
    <>
      <StructuredData />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <FounderStory />
        <HomepageSpotlight inventory={inventory} />
        <section aria-label="TRAUMA Soundtrack" className="border-b border-border py-12 md:py-16"><div className="mx-auto max-w-3xl px-4 md:px-8"><TraumaSoundtrack soundtrack={soundtrack} /></div></section>
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
