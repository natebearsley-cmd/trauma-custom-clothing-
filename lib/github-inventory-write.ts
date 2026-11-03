import type { Inventory, Product } from './inventory'
export class InventoryWriteError extends Error {
  status: number
  constructor(message: string, status = 502) { super(message); this.status = status }
}
export async function inventoryGitHub(path: string, method = 'GET', body?: unknown, fetcher: typeof fetch = fetch) {
  return fetcher(`https://api.github.com/repos/natebearsley-cmd/trauma-custom-clothing-/${path}`, {
    method, cache: 'no-store', headers: {
      Authorization: `Bearer ${process.env.INVENTORY_GITHUB_TOKEN}`, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json',
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}
export async function commitQuickAdd({ product, images, expectedSha, assertInventory, fetcher = fetch }: {
  product: Product; images: { path: string; sha: string }[]; expectedSha: string
  assertInventory: (value: unknown) => void; fetcher?: typeof fetch
}) {
  const branch = encodeURIComponent(process.env.INVENTORY_BRANCH || 'main')
  async function json(path: string, method = 'GET', body?: unknown) {
    const response = await inventoryGitHub(path, method, body, fetcher)
    if (!response.ok) throw new InventoryWriteError('GitHub could not complete this save. Check repository permissions and branch protection.')
    return response.json()
  }
  const ref = await json(`git/ref/heads/${branch}`)
  const head = ref.object.sha as string
  const file = await json(`contents/data/inventory.json?ref=${encodeURIComponent(head)}`)
  const current: Inventory = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'))
  assertInventory(current)
  // Same request ID is safe to retry after a lost response; never append twice.
  const previous = current.products.find((item) => item.id === product.id)
  if (previous) {
    if (JSON.stringify(previous) !== JSON.stringify(product)) throw new InventoryWriteError('This product was already saved with different details. Open it in the full manager, or start a new product.', 409)
    return { sha: file.sha as string, product: previous, replayed: true }
  }
  if (file.sha !== expectedSha) throw new InventoryWriteError('Inventory changed while you were adding this piece. Refresh inventory and save again; your form and photos are kept.', 409)
  const next: Inventory = { ...current, products: [...current.products, product] }
  assertInventory(next)
  const content = JSON.stringify(next, null, 2) + '\n'
  if (Buffer.byteLength(content) > 900000) throw new InventoryWriteError('Inventory is too large. Use the full manager to review it.', 413)
  const parent = await json(`git/commits/${head}`)
  const inventoryBlob = await json('git/blobs', 'POST', { content: Buffer.from(content).toString('base64'), encoding: 'base64' })
  const tree = await json('git/trees', 'POST', {
    base_tree: parent.tree.sha,
    tree: [...images.map((image) => ({ path: image.path, mode: '100644', type: 'blob', sha: image.sha })),
      { path: 'data/inventory.json', mode: '100644', type: 'blob', sha: inventoryBlob.sha }],
  })
  const commit = await json('git/commits', 'POST', { message: `Add TRAUMA apparel: ${product.name}`, tree: tree.sha, parents: [head] })
  const updated = await inventoryGitHub(`git/refs/heads/${branch}`, 'PATCH', { sha: commit.sha, force: false }, fetcher)
  if (updated.status === 409 || updated.status === 422) throw new InventoryWriteError('Another change reached the repository first. Refresh inventory and save again; your form and photos are kept.', 409)
  if (!updated.ok) throw new InventoryWriteError('The branch did not accept the save. Check repository permissions and branch protection.')
  return { sha: inventoryBlob.sha as string, product, commit: commit.sha as string, replayed: false }
}
