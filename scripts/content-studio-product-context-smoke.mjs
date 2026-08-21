import path from 'node:path'
import { createServer } from 'vite'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const modulePath = path.resolve(process.cwd(), 'src/lib/contentStudioProductContext.js').replaceAll('\\', '/')
  const context = await server.ssrLoadModule(`/@fs/${modulePath}`)

  const nameOnly = {
    name: 'KAANAGAN Open Concept Wardrobe with Drawers',
    category: 'Demo Category That Must Not Leak',
    sourceStatus: 'Verified name',
  }
  const nameFacts = context.productFactsFromRecord(nameOnly)
  assert(nameFacts.length === 1, 'Verified-name fallback must expose product name only')
  assert(!nameFacts.join(' ').includes('Demo Category'), 'Embedded demo category leaked into verified facts')

  const notionRecord = {
    name: 'AHTAM XL Shelving Rack',
    category: 'Shelving Rack',
    price: 'RM 999',
    material: 'Steel',
    dimensions: '1200 x 450 x 1800 mm',
    colour: 'Black',
    status: 'Active',
    sourceStatus: 'Verified Notion source',
  }
  const notionFacts = context.productFactsFromRecord(notionRecord)
  assert(notionFacts.some((line) => line.includes('RM 999')), 'Verified price was not included')
  assert(notionFacts.some((line) => line.includes('Steel')), 'Verified material was not included')
  assert(notionFacts.some((line) => line.includes('1200 x 450 x 1800 mm')), 'Verified dimensions were not included')
  assert(notionFacts.some((line) => line.includes('Black')), 'Verified colour was not included')

  const unverified = context.productFactsFromRecord({ name: 'Unknown Product', price: 'RM 1', sourceStatus: 'Imported draft' })
  assert(unverified.length === 0, 'Unverified source must not become product facts')

  const oldBlock = 'Old Product ialah produk Brutti.\nHarga yang direkodkan: RM 10.'
  const nextBlock = context.productContextBlock(notionRecord)
  const merged = context.mergeProductContext('User verified fact.\n\n' + oldBlock, oldBlock, nextBlock)
  assert(merged.includes('User verified fact.'), 'User-entered verified fact must be preserved')
  assert(!merged.includes('Old Product'), 'Previous auto product context must be removed when product changes')
  assert(merged.includes('AHTAM XL Shelving Rack ialah produk Brutti.'), 'New verified product context was not merged')

  console.log('\n=== CONTENT STUDIO PRODUCT CONTEXT TEST ===')
  console.log(`Name-only fallback: ${nameFacts.length} verified fact`)
  console.log(`Verified Notion record: ${notionFacts.length} verified facts`)
  console.log('PASS: demo metadata is blocked, Notion verified fields are allowed, unverified records are blocked, and user facts survive product changes.')
} finally {
  await server.close()
}
