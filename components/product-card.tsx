'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { isPayhipProductUrl, type Product } from '@/lib/inventory'

export function ProductCard({
  product,
  featured = false,
}: {
  product: Product
  featured?: boolean
}) {
  const [photo, setPhoto] = useState(0)
  return (
    <li className="flex min-w-0 flex-col border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-background">
        <Image
          src={product.photos[photo]}
          unoptimized={
            product.photos[photo].startsWith('https://') &&
            new URL(product.photos[photo]).hostname !== 'images.depop.com'
          }
          alt={`${product.name}${photo ? ` — photo ${photo + 1}` : ''}`}
          fill
          sizes={
            featured
              ? '(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw'
              : '(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
          }
          className="object-contain p-3"
        />
        {product.sold && (
          <span className="absolute left-4 top-4 bg-foreground px-3 py-2 text-xs font-bold tracking-widest text-background">
            SOLD
          </span>
        )}
      </div>
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
              aria-label={`Show photo ${index + 1} of ${product.name}`}
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
          {[product.brand, product.category].filter(Boolean).join(' · ')}
        </p>
        <h3 className="text-xl font-semibold leading-snug">{product.name}</h3>
        {product.price !== null && (
          <p className="text-lg font-semibold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.currency,
            }).format(product.price)}
          </p>
        )}
        {featured && (
          <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
        <details className="border-t border-border pt-2">
          <summary className="flex min-h-12 cursor-pointer items-center text-sm font-semibold underline underline-offset-4">
            View Details<span className="sr-only"> for {product.name}</span>
          </summary>
          <div className="pb-4 pt-3">
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ['Brand', product.brand],
                ['Size', product.size],
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
        </details>
        {product.sold ? (
          <p className="mt-auto border-t border-border pt-4 text-sm font-bold uppercase tracking-widest">
            Sold · No longer available
          </p>
        ) : product.payhipUrl && isPayhipProductUrl(product.payhipUrl) ? (
          <a
            href={product.payhipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
          >
            Buy Now <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">
              {product.name} on Payhip (opens in new tab)
            </span>
          </a>
        ) : null}
      </div>
    </li>
  )
}
