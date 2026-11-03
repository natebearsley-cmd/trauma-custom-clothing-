import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { FounderStory } from '@/components/founder-story'
import { FeaturedPieces } from '@/components/featured-pieces'
import { CustomInquiry } from '@/components/custom-inquiry'
import { DigitalShop } from '@/components/digital-shop'
import { SiteFooter } from '@/components/site-footer'

import { StructuredData } from '@/components/structured-data'
import { inventory } from '@/lib/inventory-store'
import { safeUrl, isApparel, storefrontProducts } from '@/lib/inventory'


export default function Page() {
  return (
    <>
      <StructuredData />
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <FounderStory />
        <FeaturedPieces inventory={inventory} />
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
