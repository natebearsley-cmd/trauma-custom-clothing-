import { notFound } from 'next/navigation'
import { StoreInfo } from '@/components/store-info'

export const metadata = { robots: { index: false, follow: false }, title: 'QuietWork AI | TRAUMA', description: 'QuietWork AI helps service businesses organize inquiries and quote requests.', alternates: { canonical: '/quietwork' } }

const quietworkEmail = 'mailto:traumacustomclothingofficial@gmail.com?subject=QuietWork%20AI%20Demo%20Request'

export default function QuietWorkPage() {
  if (process.env.ENABLE_QUIETWORK_PUBLIC !== 'true') notFound()
  return <StoreInfo title="QuietWork AI" label="From the founder of TRAUMA">
    <section className="border-l-2 border-accent pl-5">
      <h2 className="text-2xl font-bold">Let QuietWork Lighten The Workload.</h2>
      <p className="mt-4 text-muted-foreground">QuietWork helps service businesses collect customer details, organize quote requests, and keep track of follow-ups. The quote tools are currently in testing.</p>
    </section>
    <section className="border border-border bg-card p-5 sm:p-7">
      <p className="eyebrow">Flat Rate</p>
      <h2 className="mt-2 font-display text-4xl">$59 Per Year</h2>
      <p className="mt-3 text-muted-foreground">No setup fee. Request a demo to learn more about the annual plan.</p>
      <a className="mt-5 inline-flex min-h-12 items-center bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent" href={quietworkEmail}>Request a Demo</a>
    </section>
  </StoreInfo>
}
