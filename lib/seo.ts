// Set SITE_URL to the preferred public domain in production.
export const siteUrl = new URL(
  process.env.SITE_URL || 'https://tra-coral.vercel.app',
)
