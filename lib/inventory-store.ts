import data from '@/data/inventory.json'
import { validateInventory, type Inventory } from '@/lib/inventory'

const source: unknown = data
validateInventory(source)
// Never serialize private drafts into the public page.
export const inventory: Inventory = {
  version: 1,
  products: source.products.filter((p) => p.published && p.ownerConfirmed),
}
