import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/inventory'

export function GalleryCard({ product }: { product: Product }) {
  return (
    <li className="min-w-0">
      <Link href={`/products/${product.id}`} className="group flex h-full flex-col border border-white/10 border-t-2 border-t-[#a52d41] bg-[#211f23] transition-colors hover:border-[#e98793] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e98793]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#171619]">
          <Image src={product.photos[0]} alt={product.name} fill sizes="(min-width: 1024px) 30vw, 48vw" className="object-contain p-2 sm:p-3" />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 py-3 sm:px-5 sm:py-4">
          <h3 className="break-words text-sm font-bold leading-snug text-white sm:text-base">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <p className="text-xs text-[#f191a0] sm:text-sm">{[product.sold ? 'Sold' : product.price === null ? '' : new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price), product.size].filter(Boolean).join(' · ')}</p>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#f191a0]" />
          </div>
        </div>
      </Link>
    </li>
  )
}
