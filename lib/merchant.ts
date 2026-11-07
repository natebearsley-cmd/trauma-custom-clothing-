// Suggest an identifier from the owner's entered name, never a product record.
// The save path checks the latest inventory and rejects duplicate SKUs.
export function suggestMerchantSku(name: string, existing: string[]): string {
  const words = name.normalize('NFKD').replace(/\b(?:trauma|custom|clothing)\b/gi, '').toUpperCase().match(/[A-Z0-9]+/g) ?? []
  const prefix = words.slice(0, 3).map((word) => word[0]).join('')
  if (!prefix) return ''
  const used = new Set(existing.map((sku) => sku.toUpperCase()))
  for (let index = 1; index <= 9999; index++) {
    const sku = `${prefix}-${String(index).padStart(3, '0')}`
    if (!used.has(sku)) return sku
  }
  return ''
}
