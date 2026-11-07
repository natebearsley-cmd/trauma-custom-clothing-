import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { paypalBuyNowDestination, type Product } from '@/lib/inventory'

export function PayPalProductGrid({ products, priority = false }: { products: Product[]; priority?: boolean }) {
  return <ul className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
    {products.map((product, index) => {
      const checkout = paypalBuyNowDestination(product)
      if (!checkout) return null
      return <li key={product.id} className="flex min-w-0 flex-col border border-border border-t-2 border-t-accent bg-card">
        <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`} className="relative block aspect-[4/5] bg-background">
          <Image src={product.photos[0]} alt={product.name} fill
            sizes="(min-width: 1280px) 390px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={priority && index === 0}
            unoptimized={product.photos[0].startsWith('https://') && new URL(product.photos[0]).hostname !== 'images.depop.com'}
            className="object-contain p-3" />
        </Link>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <h2 className="text-xl font-semibold leading-snug"><Link href={`/products/${product.id}`} className="hover:underline underline-offset-4">{product.name}</Link></h2>
          <p className="text-xl font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price!)}</p>
          <a href={checkout} aria-label={`Buy ${product.name} now with PayPal`} className="mt-auto inline-flex min-h-14 w-full items-center justify-center gap-2 bg-primary px-5 py-4 font-bold text-primary-foreground hover:bg-accent">BUY NOW<ArrowUpRight className="size-4" aria-hidden="true" /></a>
          <p className="text-center text-sm text-muted-foreground">Secure checkout with PayPal</p>
        </div>
      </li>
    })}
  </ul>
}
