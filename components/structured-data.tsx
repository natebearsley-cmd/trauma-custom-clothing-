import { organizationStructuredData, serializeStructuredData } from '@/lib/search-schema'
export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(organizationStructuredData()) }} />
}
