import { siteUrl } from '@/lib/seo'

export function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl.origin}/#organization`,
        name: 'TRAUMA Custom Clothing',
        alternateName: 'TRAUMA CC',
        url: siteUrl.origin,
        founder: { '@id': `${siteUrl.origin}/#founder` },
        sameAs: [
          'https://payhip.com/Thereversal1',
          'https://www.depop.com/atec911/',
          'https://www.tiktok.com/@nateb19841',
        ],
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl.origin}/#founder`,
        name: 'Nathanial Bearsley',
        jobTitle: ['Founder', 'Author', 'Recovery Coach', 'Entrepreneur'],
      },
      {
        '@type': 'WebSite',
        name: 'TRAUMA CC',
        url: siteUrl.origin,
        publisher: { '@id': `${siteUrl.origin}/#organization` },
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
