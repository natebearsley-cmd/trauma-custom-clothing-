import { StoreInfo } from '@/components/store-info'
import { publicPageMetadata } from '@/lib/seo'

export const metadata = publicPageMetadata('/gives-back')

const focusAreas = [
  'Addiction recovery',
  'Rehabilitation programs',
  'Mental health support',
  'Community assistance efforts',
]

export default function GivesBackPage() {
  return <StoreInfo title="TRAUMA Gives Back" label="Strength Through Adversity">
    <p className="max-w-2xl text-lg text-muted-foreground">
      TRAUMA grew out of recovery. We want to use what we build to support people doing the work of rebuilding.
      Future campaigns may direct a portion of selected sales, donations, or community fundraising proceeds
      to organizations supporting these areas:
    </p>
    <ul className="grid gap-3 sm:grid-cols-2">
      {focusAreas.map((area) => <li key={area} className="border border-border border-l-accent bg-card p-4 font-semibold">{area}</li>)}
    </ul>
    <section className="border border-border bg-card p-5 sm:p-7">
      <h2 className="font-display text-2xl uppercase">Campaign status</h2>
      <p className="mt-3">No fundraiser is active, and no current purchase includes a promised donation.</p>
      <p className="mt-3 text-muted-foreground">
        For any future campaign, we’ll publish the recipient, dates, eligible sales, and how the contribution is calculated.
        After the campaign, we’ll report what was delivered and when.
      </p>
    </section>
  </StoreInfo>
}
