import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { siteUrl } from '@/lib/seo'

const anton = localFont({
  src: '../public/fonts/Anton-Regular.ttf',
  weight: '400',
  display: 'swap',
  variable: '--font-anton',
})
const inter = localFont({
  src: '../public/fonts/Inter-Variable.ttf',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'TRAUMA CC | Trauma Custom Clothing',
  description:
    'Original garments, books, and digital products from Nathanial Bearsley — founder, author, recovery coach, and entrepreneur behind TRAUMA CC. Shop on Payhip.',
  metadataBase: siteUrl,
  alternates: { canonical: '/' },
  applicationName: 'TRAUMA CC',
  twitter: {
    card: 'summary_large_image',
    title: 'TRAUMA CC | Trauma Custom Clothing',
    description:
      'Original garments and pieces from Nathanial Bearsley’s own inventory.',
    images: ['/images/hero.png'],
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'TRAUMA CC',
    locale: 'en_US',
    title: 'TRAUMA CC | Built From Trauma. Never Broke Just Bent.',
    description:
      'Streetwear forged through survival. 1-of-1 cuts and limited garments.',
    images: ['/images/hero.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} bg-background`}
    >
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] bg-foreground p-4 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
