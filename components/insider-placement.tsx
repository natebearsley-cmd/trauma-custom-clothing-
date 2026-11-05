import { InsiderQr } from '@/components/insider-qr'
import { insiderSignupAction, type InsiderPlacement as Placement } from '@/lib/insider'

export function InsiderPlacement({ placement, compact, className }: {
  placement: Placement
  compact?: boolean
  className?: string
}) {
  if (!insiderSignupAction()) return null
  const callout = <InsiderQr placement={placement} compact={compact} />
  return className ? <section aria-label="TRAUMA Insider Club" className={className}>{callout}</section> : callout
}
