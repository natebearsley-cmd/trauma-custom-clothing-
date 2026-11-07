'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { DEPOP_SHOP_URL, productDestination, paypalDestination, paypalBuyNowDestination, productPhotoLabel, isApparel, isCustomApparel, type Product } from '@/lib/inventory'

export function ProductCard({
  product,
  featured = false,
  apparelShowcase = false,
}: {
  product: Product
  featured?: boolean
  apparelShowcase?: boolean
}) {
  const [photo, setPhoto] = useState(0)
  const destination = productDestination(product)
  const buyNow = paypalBuyNowDestination(product)
  const paypalUrl = paypalDestination(product)
  const apparel = isApparel(product)
  const custom = isCustomApparel(product)
  const formatPrice = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(value)
  return (
    <li className={`group flex min-w-0 flex-col border border-border bg-card motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 ${apparelShowcase ? "transition-colors hover:border-accent" : ""}`}>
      <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`} className="relative block aspect-[4/5] overflow-hidden bg-background">
        <Image
          src={product.photos[photo]}
          unoptimized={
            product.photos[photo].startsWith('https://') &&
            new URL(product.photos[photo]).hostname !== 'images.depop.com'
          }
          alt={`${product.name} — ${productPhotoLabel(product, photo)}`}
          fill
          quality={apparelShowcase ? 90 : 75}
          sizes={
            apparelShowcase
              ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
              : featured
                ? '(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw'
              : '(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
          }
          className="object-contain p-3 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]"
        />
        {product.sold && (
          <span className="absolute left-4 top-4 bg-foreground px-3 py-2 text-xs font-bold tracking-widest text-background">
            SOLD
          </span>
        )}
      </Link>
      {product.photos.length > 1 && (
        <div
          className="flex flex-wrap gap-2 px-5 pt-4"
          role="group"
          aria-label={`Photos of ${product.name}`}
        >
          {product.photos.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={photo === index}
              aria-label={`Show ${productPhotoLabel(product, index)} of ${product.name}`}
              onClick={() => setPhoto(index)}
              className={`min-h-11 min-w-11 border px-3 text-sm ${photo === index ? 'border-accent bg-accent text-accent-foreground' : 'border-border'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {[product.brand, product.productType || product.category].filter(Boolean).join(' · ')}
        </p>
        <h3 className="text-xl font-semibold leading-snug"><Link href={`/products/${product.id}`} className="hover:underline underline-offset-4">{product.name}</Link></h3>
        {product.subtitle && <p className="text-sm leading-relaxed text-muted-foreground">{product.subtitle}</p>}
        {!custom && product.price !== null && (
          <p className="text-lg font-semibold">
            <span>{formatPrice(product.price)}</span>
            {product.originalPrice != null && product.originalPrice > product.price && (
              <del className="ml-3 text-sm font-normal text-muted-foreground"><span className="sr-only">Original price </span>{formatPrice(product.originalPrice)}</del>
            )}
          </p>
        )}
        {custom && <p className="text-sm font-semibold">Request a Custom Quote</p>}
        {featured && (
          <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
        {(!apparelShowcase || !destination || !!product.themes?.length || !!product.keyArtwork?.length || !!product.features?.length) && <details className="border-t border-border pt-2">
          <summary className="flex min-h-12 cursor-pointer items-center text-sm font-semibold underline underline-offset-4">
            {apparel && !destination && !product.sold ? "View Item" : "View Details"}<span className="sr-only"> for {product.name}</span>
          </summary>
          <div className="pb-4 pt-3">
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            {([['Themes', product.themes], ['Key artwork', product.keyArtwork], ['Features', product.features]] as const).map(([label, items]) => items?.length ? (
              <div key={label} className="mt-5 text-sm">
                <h4 className="font-semibold">{label}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
              </div>
            ) : null)}
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Brand', product.brand],
                ['Size', product.size],
                ['Inseam', product.inseam],
                ['Condition', product.condition],
                ['Color', product.color],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </details>}
        {product.sold ? (
          <p className="mt-auto border-t border-border pt-4 text-sm font-bold uppercase tracking-widest">
            Sold · No longer available
          </p>
        ) : custom ? (
          <a href={`/?customProduct=${encodeURIComponent(product.id)}#custom`}
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent">
            Request Quote <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only"> for {product.name}</span>
          </a>
        ) : buyNow ? (
          <a href={buyNow} aria-label={`Buy ${product.name} now with PayPal`} className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent">
            BUY NOW <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        ) : destination ? (
          <a
            href={destination.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
          >
            {apparel ? (destination.url === DEPOP_SHOP_URL ? "Visit TRAUMA on Depop" : "View On Depop") : "Buy on Payhip"} <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">
              {product.name} on {destination.platform} (opens in new tab)
            </span>
          </a>
        ) : null}
        {paypalUrl && !buyNow && (
          <a href={`/checkout/${product.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-input px-4 py-3 text-sm font-semibold hover:border-accent">
            Review shipping & PayPal <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only"> for {product.name}</span>
          </a>
        )}
        {apparel && !custom && !product.sold && !buyNow && product.requestCustomPiece && (
          <a href={`/?customProduct=${encodeURIComponent(product.id)}#custom`}
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-input px-4 py-3 text-sm font-semibold hover:border-accent">
            Request Custom Piece <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only"> inspired by {product.name}</span>
          </a>
        )}
      </div>
    </li>
  )
}
