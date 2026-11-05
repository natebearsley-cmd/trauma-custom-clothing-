import type { Product } from './inventory'

export const TIKTOK_STATUSES = ['not-started', 'in-preparation', 'ready', 'listed'] as const
export type TikTokShopStatus = typeof TIKTOK_STATUSES[number]
export const TIKTOK_STATUS_LABELS: Record<TikTokShopStatus, string> = {
  'not-started': 'Not started', 'in-preparation': 'In preparation', ready: 'Ready for TikTok Shop', listed: 'Listed manually',
}

const priorities = [
  [/\bhoodie\b/i, 'Hoodies'],
  [/(?:one.of.one|1.of.1|1\/1|1\s*of\s*1|1of1).*jacket|jacket.*(?:one.of.one|1.of.1|1\/1|1\s*of\s*1|1of1)/i, 'One-of-one jackets'],
  [/\b(?:denim|jeans|capris)\b/i, 'Custom denim'],
  [/\b(?:hat|trucker|cap)\b/i, 'Hats'],
  [/\bbeanie\b/i, 'Beanies'],
  [/\b(?:sneakers?|shoes?|trainers?|high.tops?|footwear)\b/i, 'Shoes'],
  [/\b(?:matching sets?|3.piece|three.piece)\b/i, 'Matching sets'],
] as const

export function tiktokPriority(product: Product) {
  const detail = [product.name, product.productType, product.category, product.description].filter(Boolean).join(' ')
  // A matching set can include a hoodie or other pieces.
  const match = /\bmatching sets?\b/i.test(product.category) ? 6 : priorities.findIndex(([rule]) => rule.test(detail))
  return { rank: match < 0 ? priorities.length : match, label: priorities[match]?.[1] ?? 'Other inventory' }
}

export function tiktokReadinessIssues(product: Product): string[] {
  return [
    ...(!product.ownerConfirmed ? ['Confirm this is a real TRAUMA product.'] : []),
    ...(product.sold ? ['This item is marked sold.'] : []),
    ...(product.orderType === 'custom' ? ['This piece is set up for custom quotes.'] : []),
    ...(!product.name.trim() || !product.category.trim() || !product.description.trim() ? ['Add the title, category and description.'] : []),
    ...(!product.photos.length ? ['Add real product photos.'] : []),
    ...(product.price === null ? ['Confirm the price.'] : []),
  ]
}

export function tiktokReviewFlags(product: Product): string[] {
  const text = [product.name, product.brand, product.productType, product.description].filter(Boolean).join(' ')
  return [
    ...(product.fulfillmentType === 'digital' || product.inventoryType === 'digital' || /\bdigital\b/i.test(product.category)
      ? ['Verify Virtual Goods category approval before considering this item.'] : []),
    ...(!product.condition.trim() || /like new|excellent|pre.owned|used/i.test(product.condition)
      ? ['Verify actual condition; used items require an approved category.'] : []),
    ...(/\b(adidas|nike|ecko|louis vuitton|LV patched|BKE|cro(f|ft)t?\s*&\s*barrow)\b/i.test(text)
      ? ['Third-party brand or artwork indicated. Verify the base, authenticity and any required rights or authorization before listing or promotion.'] : []),
    ...(/\b(?:matching sets?|3.piece|three.piece)\b/i.test([product.name, product.category].join(' '))
      ? ['Verify exact contents and bundle eligibility; compare against existing listings and component stock.'] : []),
    ...(!product.packedWeightOz ? ['Measure packed weight and dimensions before entering shipping details.'] : []),
  ]
}

function cleanCopy(value: string): string {
  return value.replace(/(?:https?:\/\/|www\.)[^\s]+/gi, '').replace(/#[\p{L}\p{N}_]+/gu, '')
    .split(/\r?\n/).filter((line) => !/\b(?:depop|payhip|paypal)\b|\b(?:message|dm)\s+(?:me|us)\s+(?:to|for)\b/i.test(line))
    .map((line) => line.replace(/[\t ]+/g, ' ').trim()).filter(Boolean).join('\n')
}

export function generateTikTokListing(product: Product) {
  if (!product.ownerConfirmed || !product.photos.length || !product.description.trim()) return null
  const name = cleanCopy(product.name).replace(/\b(?:rare find|high quality|must have)\b/gi, '').replace(/\s+/g, ' ').trim()
  const type = cleanCopy(product.productType ?? '')
  const baseTitle = name && type && !name.toLowerCase().includes(type.toLowerCase()) ? `${name} — ${type}` : name
  const size = cleanCopy(product.size)
  const simpleSize = /^(?:XS|S|M|L|XL|XXL|[2-6]XL|W\d{2}|\d{2}(?:\.5)?)$/i.test(size)
  const hasSize = simpleSize && new RegExp(`(?:^|[\\s(/-])${size.replace('.', '\\.')}(?:$|[\\s)/-])`, 'i').test(baseTitle)
  const title = baseTitle && simpleSize && !hasSize ? `${baseTitle} ${size}` : baseTitle
  const description = cleanCopy(product.description)
  if (!title || !description) return null
  const details = [['Size', product.size], ['Condition', product.condition], ['Color', product.color], ['Inseam', product.inseam]]
    .flatMap(([label, value]) => value && cleanCopy(value) ? [`${label}: ${cleanCopy(value)}`] : [])
  const facts = [...new Set([type, ...details, ...(product.features ?? []).map(cleanCopy), ...(product.keyArtwork ?? []).map(cleanCopy)].filter(Boolean))]
  const bullets = facts.length ? facts : description.split(/\n|(?<=[.!?])\s+/).slice(0, 3)
  const keywords = [...new Set([title, cleanCopy(product.category), cleanCopy(product.productType ?? ''), cleanCopy(product.collection ?? ''), ...((product.keyArtwork ?? []).map(cleanCopy))].filter(Boolean))]
  const tag = (value: string) => value.replace(/[^\p{L}\p{N}]/gu, '')
  const hashtags = [...new Set(['TRAUMACC', 'TraumaCustomClothing', tag(product.productType || product.category)].filter(Boolean))].map((value) => `#${value}`)
  const caption = `${title}. A closer look at this piece from TRAUMA. ${hashtags.join(' ')}`
  const price = product.price === null ? '' : new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)
  return { title, category: cleanCopy(product.category), description: [description, ...details].join('\n\n'), bullets, keywords, hashtags, caption, price }
}
