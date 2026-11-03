'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { productDestination, paypalDestination, productPhotoLabel, productCollection, isApparel, isCustomApparel, type Product } from '@/lib/inventory'

export function ProductDetail({ product }: { product: Product }) {
  const [photo, setPhoto] = useState(0)
  const apparel = isApparel(product)
  const custom = isCustomApparel(product)
  const destination = productDestination(product)
  const paypal = paypalDestination(product)
  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(value)
  const external = (url: string) => url.startsWith('https://') && new URL(url).hostname !== 'images.depop.com'
  return <article className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
    <Link href="/collections" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"><ArrowLeft className="size-4" aria-hidden="true" />Back to TRAUMA Collections</Link>
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-[4/5] border border-border bg-card" tabIndex={0} role="group" aria-label={`Product photos for ${product.name}`} onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); setPhoto((current) => (current + 1) % product.photos.length) }
          if (event.key === 'ArrowLeft') { event.preventDefault(); setPhoto((current) => (current - 1 + product.photos.length) % product.photos.length) }
        }}>
          <Image src={product.photos[photo]} alt={`${product.name} — ${productPhotoLabel(product, photo)}`} fill quality={90} sizes="(min-width: 1024px) 50vw, 100vw" unoptimized={external(product.photos[photo])} className="object-contain p-4" priority />
        </div>
        {product.photos.length > 1 && <><div className="mt-4 flex items-center justify-between gap-3"><button type="button" aria-label="Previous photo" onClick={() => setPhoto((current) => (current - 1 + product.photos.length) % product.photos.length)} className="inline-flex size-12 items-center justify-center border border-input hover:border-accent"><ArrowLeft className="size-4" /></button><p role="status" className="text-sm text-muted-foreground">{productPhotoLabel(product, photo)} · {photo + 1} of {product.photos.length}</p><button type="button" aria-label="Next photo" onClick={() => setPhoto((current) => (current + 1) % product.photos.length)} className="inline-flex size-12 items-center justify-center border border-input hover:border-accent"><ArrowRight className="size-4" /></button></div><div className="mt-4 flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Choose a product photo">{product.photos.map((url, index) => <button key={`${index}-${url}`} type="button" aria-label={`View ${productPhotoLabel(product, index)}`} aria-pressed={photo === index} onClick={() => setPhoto(index)} className={`relative size-20 shrink-0 border bg-card ${photo === index ? 'border-accent' : 'border-border'}`}><Image src={url} alt="" fill sizes="80px" unoptimized={external(url)} className="object-contain p-1" /></button>)}</div></>}
        <a href={product.photos[photo]} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4">View original image<span className="sr-only"> (opens in new tab)</span></a>
      </div>
      <div>
        <p className="eyebrow">{productCollection(product)}</p>
        <h1 className="mt-4 break-words font-display text-5xl uppercase leading-none md:text-6xl">{product.name}</h1>
        {product.subtitle && <p className="mt-4 text-lg text-muted-foreground">{product.subtitle}</p>}
        <p className="mt-6 text-2xl font-semibold">{custom ? 'Request a Custom Quote' : product.price !== null ? money(product.price) : 'Price on request'}{!custom && product.price !== null && product.originalPrice != null && product.originalPrice > product.price && <del className="ml-3 text-base font-normal text-muted-foreground"><span className="sr-only">Original price </span>{money(product.originalPrice)}</del>}</p>
        <dl className="mt-8 grid grid-cols-2 gap-5 border-y border-border py-6 text-sm">
          {([['Collection', productCollection(product)], ['Availability', product.sold ? 'Sold — unavailable' : custom ? 'Quote request' : 'Available'], ['Size', product.size], ['Type', product.productType], ['Brand', product.brand], ['Condition', product.condition], ['Color', product.color], ['Inseam', product.inseam]] as const).filter(([, value]) => value).map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}
        </dl>
        <p className="mt-8 whitespace-pre-line leading-relaxed text-muted-foreground">{product.description}</p>
        {([['Features', product.features], ['Key artwork', product.keyArtwork], ['Themes', product.themes]] as const).map(([title, items]) => items?.length ? <div key={title} className="mt-6"><h2 className="font-semibold">{title}</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div> : null)}
        <div className="mt-8 flex flex-col gap-3">
          {destination && <a href={destination.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 py-4 font-semibold text-primary-foreground hover:bg-accent">{apparel ? 'View On Depop' : 'Buy on Payhip'}<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>}
          {paypal && <a href={paypal} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 border border-input px-5 py-4 font-semibold hover:border-accent">Pay With PayPal<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>}
          {apparel && !product.sold && <Link href={`/custom-orders?customProduct=${encodeURIComponent(product.id)}`} className="inline-flex min-h-12 items-center justify-center gap-2 border border-input px-5 py-4 font-semibold hover:border-accent">{custom ? 'Request Custom Order' : 'Request Custom Piece'}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>}
          {paypal && <p className="text-xs leading-relaxed text-muted-foreground">Confirm this piece, availability, shipping, and total with TRAUMA before paying.</p>}
        </div>
      </div>
    </div>
  </article>
}
