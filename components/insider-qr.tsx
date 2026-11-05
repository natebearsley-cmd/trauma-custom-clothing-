import Image from 'next/image'
import { insiderHref, type InsiderPlacement } from '@/lib/insider'

export function InsiderQr({ placement, compact = false, standalone = false, onNavigate }: {
  placement: InsiderPlacement
  compact?: boolean
  standalone?: boolean
  onNavigate?: () => void
}) {
  const pixels = compact ? 84 : 116
  return (
    <a
      href={insiderHref(placement)}
      onClick={onNavigate}
      className={standalone
        ? 'inline-flex'
        : 'group flex max-w-xl items-center gap-4 border border-border border-l-accent bg-card p-3 transition-colors hover:border-accent sm:p-4'}
      aria-label="Go to TRAUMA Insider Club signup"
    >
      <Image
        src={'/images/insider/' + placement + '.png'}
        alt=""
        width={pixels}
        height={pixels}
        unoptimized
        className="h-auto shrink-0 bg-white"
        style={{ width: pixels }}
      />
      {!standalone && (
        <span className="min-w-0">
          <span className="block text-sm font-bold uppercase tracking-[0.1em]">TRAUMA Insider Club</span>
          <span className="mt-1 block text-sm text-muted-foreground">Get first look at the next drop.</span>
          <span className="mt-2 inline-block text-sm font-semibold text-accent underline underline-offset-4">
            Tap to join or scan
          </span>
        </span>
      )}
    </a>
  )
}
