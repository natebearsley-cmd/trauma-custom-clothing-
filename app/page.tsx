import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { ProductShowcase } from '@/components/product-showcase'
import { FounderStory } from '@/components/founder-story'
import { CustomInquiry } from '@/components/custom-inquiry'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProductShowcase />
        <FounderStory />
        <CustomInquiry />
      </main>
      <SiteFooter />
    </>
  )
}
