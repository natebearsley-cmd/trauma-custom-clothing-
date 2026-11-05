import { insiderSignupAction } from '@/lib/insider'
import { SiteHeaderNavigation } from '@/components/site-header-navigation'

export function SiteHeader() {
  return <SiteHeaderNavigation insiderEnabled={Boolean(insiderSignupAction())} />
}
