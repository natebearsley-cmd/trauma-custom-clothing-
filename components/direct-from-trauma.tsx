'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { isPayPalUrl, safeUrl, type PaymentSettings } from '@/lib/inventory'

export function DirectFromTrauma({ payments }: { payments?: PaymentSettings }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (!payments?.paypalUrl || !isPayPalUrl(payments.paypalUrl)) return null
  const qrImage = payments.paypalQrImage
  const showQr = !!qrImage && safeUrl(qrImage, true) && !imageFailed
  return (
    <section id="direct" aria-labelledby="direct-heading" className="scroll-mt-24 border-b border-border bg-card py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow">TRAUMA · Independent by design</p>
          <h2 id="direct-heading" className="section-title">Direct From TRAUMA</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Purchase select pieces directly from TRAUMA Custom Clothing using PayPal.</p>
          <h3 className="mt-8 font-display text-3xl uppercase">Pay With PayPal</h3>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Confirm your piece, availability, shipping, and total with TRAUMA before paying. You can open PayPal directly on your phone{showQr ? ' or scan the code with another device' : ''}.</p>
          <a href={payments.paypalUrl} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-accent">
            Buy With PayPal <ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
          <p className="mt-3 break-all text-sm"><a href={payments.paypalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">{payments.paypalUrl}<span className="sr-only"> (opens in new tab)</span></a></p>
        </div>
        {showQr && (
          <figure className="mx-auto w-full max-w-sm">
            <a href={payments.paypalUrl} target="_blank" rel="noopener noreferrer" aria-label="Open TRAUMA payment link on PayPal (opens in new tab)" className="block border border-border bg-white p-5 sm:p-8">
              {/* Display the supplied original file; do not regenerate or stylize the code. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImage} width={360} height={360} alt="Scan TRAUMA’s PayPal payment QR code" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className="aspect-square h-auto w-full object-contain" />
            </a>
            <figcaption className="mt-4 text-center text-sm text-muted-foreground">Scan to open PayPal, or tap Buy With PayPal on this device.</figcaption>
          </figure>
        )}
        {imageFailed && <p role="status" className="text-sm text-muted-foreground">The QR image could not load. Use Buy With PayPal to open the payment link.</p>}
      </div>
    </section>
  )
}
