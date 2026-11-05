export function EmailSignup({ action, source }: { action: string; source: string }) {
  return (
    <form action={action} method="post" className="mt-5 grid gap-4">
      <input type="hidden" name="source" value={source} />
      <label htmlFor="insider-email" className="font-semibold">Email address</label>
      <input id="insider-email" name="email" type="email" autoComplete="email" maxLength={254}
        required className="min-h-12 w-full min-w-0 border border-input bg-background px-4 text-base" />
      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="marketing_consent" value="yes" required className="mt-1 size-5 shrink-0" />
        I agree to receive TRAUMA drop alerts and news by email. I can unsubscribe anytime.
      </label>
      <button className="min-h-12 bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground">
        Join Insider Club
      </button>
      <p className="text-sm text-muted-foreground">
        Our email provider processes signup. Confirm through the email it sends to finish joining.
      </p>
    </form>
  )
}
