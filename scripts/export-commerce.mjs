import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { validateInventory } from '../lib/inventory.ts'
import { commerceMasterRows, commerceMasterCsv, tiktokPublicationRecords } from '../lib/commerce-master.ts'

const source = await fs.readFile(new URL('../data/inventory.json', import.meta.url), 'utf8')
const inventory = JSON.parse(source)
validateInventory(inventory)
const origin = process.env.SITE_URL || 'https://tra-coral.vercel.app'
const directory = path.resolve(process.argv[2] || 'commerce-exports')
await fs.mkdir(directory, { recursive: true })
const output = { generatedAt: new Date().toISOString(), sourceFile: 'data/inventory.json',
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  note: 'Generated catalog snapshot. Local statuses are not a live PayPal or TikTok sync. The TikTok preparation JSON is not an official upload template.',
  master: commerceMasterRows(inventory, origin), tiktok: tiktokPublicationRecords(inventory, origin) }
await fs.writeFile(path.join(directory, 'TRAUMA_COMMERCE_MASTER.json'), JSON.stringify(output, null, 2) + '\n')
await fs.writeFile(path.join(directory, 'TRAUMA_COMMERCE_MASTER.csv'), commerceMasterCsv(inventory, origin))
await fs.writeFile(path.join(directory, 'TIKTOK_PUBLICATION_PREP.json'), JSON.stringify(output.tiktok, null, 2) + '\n')
console.log(`Exported ${output.master.length} launch SKUs. ${output.tiktok.filter((p) => p.importReady).length} passed local publication checks. Use the current Seller Center category template for import.`)
