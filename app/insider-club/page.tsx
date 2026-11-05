import Link from 'next/link'
import { EmailSignup } from '@/components/email-signup'
import { InsiderQr } from '@/components/insider-qr'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { insiderEligibleIds, insiderSignupAction, insiderSource } from '@/lib/insider'
import { inventory } from '@/lib/inventory-store'
import { publicPageMetadata } from '@/lib/seo'

export const metadata = publicPageMetadata('/insider-club')

const benefits = [
  ['Early access', 'Get first notice when a drop opens to Insiders.'],
  ['Exclusive previews', 'See new graphics and one-of-one work before the drop.'],
  ['VIP announcements', 'Get release dates and news from TRAUMA in your inbox.'],
]

export default async function InsiderPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  const source = insiderSource((await searchParams).from)
  const action = insiderSignupAction()
  const discount = insiderEligibleIds(inventory.products).size > 0

  return <><SiteHeader /><main id="main-content">
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:py-20 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="self-center">
          <p className="eyebrow">Respect The Scars. Wear Your Story.</p>
          <h1 className="mt-4 font-display text-5xl uppercase leading-[1.05] sm:text-7xl">TRAUMA<br />Insider Club</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Get the first look at new graphics, reworked denim and one-of-one pieces from TRAUMA Custom Clothing.
          </p>
          <div className="mt-7 flex items-center gap-4">
            <InsiderQr placement="club" compact standalone />
            <p className="max-w-48 text-sm text-muted-foreground">Scan from another device to open the club.</p>
          </div>
        </div>
        <section id="join" aria-labelledby="join-heading" className="scroll-mt-24 border border-border border-t-2 border-t-accent bg-background p-5 sm:p-8">
          <p className="eyebrow">TRAUMA by email</p>
          <h2 id="join-heading" className="mt-3 font-display text-3xl uppercase sm:text-4xl">Get first look</h2>
          {discount && <p className="mt-3 leading-relaxed">
            Confirm your subscription for 10% off your first eligible direct apparel order.
            <a href="#insider-offer" className="ml-2 text-accent underline underline-offset-4">Offer details</a>
          </p>}
          {action ? <EmailSignup action={action} source={source} /> : <>
            <p className="mt-4 text-muted-foreground">Email signup is currently closed.</p>
            <Link href="/collections" className="mt-5 inline-flex min-h-12 items-center bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground">Shop current pieces</Link>
          </>}
        </section>
      </div>
    </section>
    <section aria-labelledby="club-benefits" className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h2 id="club-benefits" className="section-title">Inside the club</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {benefits.map(([title, text]) => <article key={title} className="border border-border border-t-2 border-t-accent bg-card p-5">
          <h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-muted-foreground">{text}</p>
        </article>)}
      </div>
      {discount && <section id="insider-offer" className="mt-7 scroll-mt-24 border border-border p-5">
        <h3 className="font-bold">10% welcome offer</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          One use per confirmed subscriber. Ask for the Insider offer before paying an eligible direct TRAUMA invoice.
          Use the same email you signed up with so TRAUMA can verify your subscription. The discount applies to eligible
          merchandise before shipping and taxes. Marketplace orders, digital products, custom work, one-of-one pieces
          and sale items are excluded. Offers cannot be combined.
        </p>
      </section>}
      <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
        No giveaway is open. If TRAUMA runs a drawing, the announcement will include official rules and a free entry option.
        {' '}<Link href="/gives-back" className="text-accent underline underline-offset-4">TRAUMA Gives Back</Link>
      </p>
    </section>
  </main><SiteFooter /></>
}
