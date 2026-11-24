const ORDER_FIELDS = [
  ['product_type', 'Product type'],
  ['size', 'Size'],
  ['quantity', 'Quantity'],
  ['design_description', 'Design description'],
  ['additional_notes', 'Additional notes'],
] as const

const CONTACT_FIELDS = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
] as const

const TITLE = 'TRAUMA — CUSTOM QUOTE REQUEST'
const DISCLAIMER = 'Quote request only. Price, availability, and production timing require confirmation.'

function lines(form: FormData, fields: ReadonlyArray<readonly [string, string]>) {
  return fields.flatMap(([field, label]) => {
    const value = form.get(field)
    return typeof value === 'string' && value.trim() ? [`${label}: ${value.trim()}`] : []
  })
}

export function depopQuoteBrief(form: FormData, product?: string) {
  return [
    TITLE,
    ...(product ? [`Inventory piece: ${product}`] : []),
    ...lines(form, ORDER_FIELDS),
    DISCLAIMER,
  ].join('\n')
}

export function emailQuoteBrief(form: FormData, product: string | undefined, filenames: readonly string[]) {
  return [
    TITLE,
    ...(product ? [`Inventory piece: ${product}`] : []),
    ...lines(form, CONTACT_FIELDS),
    ...lines(form, ORDER_FIELDS),
    `Design files (attach separately): ${filenames.join(', ') || 'None selected'}`,
    DISCLAIMER,
  ].join('\n')
}
