'use client'

import { useState, type FormEvent } from 'react'

export function JourneyVault({ action }: { action: string | null }) {
  const [notice, setNotice] = useState('')
  function handleUnconnected(event: FormEvent<HTMLFormElement>) {
    if (!action) {
      event.preventDefault()
      setNotice(
        'The waitlist is not open yet. Your email has not been saved or sent.',
      )
    }
  }
  return (
    <section
      id="journeyvault"
      className="scroll-mt-24 border-b border-border bg-card py-16 md:py-24"
    >
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-8">
        <div className="min-w-0">
          <p className="eyebrow">Coming soon</p>
          <h2 className="section-title">JourneyVault</h2>
          <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
            A forthcoming project from Nathanial Bearsley, exploring the
            stories, lessons, and turning points that shape a life. More details
            will be shared here as the project develops.
          </p>
        </div>
        <div className="min-w-0 self-center border border-border p-6 md:p-8">
          <h3 className="text-xl font-semibold">
            Hear when JourneyVault opens
          </h3>
          <p
            id="waitlist-help"
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
          >
            {action
              ? 'Enter your email to request launch updates. Your email will be sent to our signup provider for JourneyVault updates.'
              : 'Email signup is coming soon. This form does not collect or save email addresses yet.'}
          </p>
          <form
            action={action ?? undefined}
            method="post"
            onSubmit={handleUnconnected}
            className="mt-6 flex flex-col gap-4"
          >
            <label htmlFor="waitlist-email" className="text-sm font-semibold">
              Email address
            </label>
            <input
              id="waitlist-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              aria-describedby="waitlist-help"
              className="min-h-12 min-w-0 border border-input bg-background px-4 text-base"
            />
            <button
              type="submit"
              className="min-h-12 bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent"
            >
              {action ? 'Join the waitlist' : 'Check signup availability'}
            </button>
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
