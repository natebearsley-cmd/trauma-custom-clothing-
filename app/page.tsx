import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { FeaturedProducts } from '@/components/featured-products'
import { ProductShowcase } from '@/components/product-showcase'
import { FounderStory } from '@/components/founder-story'
import { CustomInquiry } from '@/components/custom-inquiry'
import { SiteFooter } from '@/components/site-footer'

import { StructuredData } from '@/components/structured-data'
import { inventory } from '@/lib/inventory-store'
import { JourneyVault } from '@/components/journey-vault'
import { safeUrl } from '@/lib/inventory'

export default function Page() {
  return (
    <>
      <StructuredData />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <FeaturedProducts inventory={inventory} />
        <FeaturedProducts inventory={inventory} apparel />
        <ProductShowcase inventory={inventory} />
        <FounderStory />
        <CustomInquiry />
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
