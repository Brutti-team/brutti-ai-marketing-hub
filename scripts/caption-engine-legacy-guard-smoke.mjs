import fs from 'node:fs'

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')
const stabilizer = fs.readFileSync(new URL('../src/SoulCaptionStabilizer.jsx', import.meta.url), 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const forbiddenRuntimeModules = [
  'ContentStudioController',
  'ContentStudioV2Enhancer',
  'BruttiSoulStudioEnhancer',
  'LiveCaptionNarrativeEnhancer',
  'FreeAssistOutputEnhancer',
  'FreeAssistOutputGuard',
  'SmartRewriteDirectionEnhancer',
]

assert(main.includes("import SoulCaptionStabilizer from './SoulCaptionStabilizer.jsx'"), 'SoulCaptionStabilizer must remain the mounted BM final-output owner.')
assert((main.match(/<SoulCaptionStabilizer\s*\/>/g) || []).length === 1, 'SoulCaptionStabilizer must be mounted exactly once.')
assert(stabilizer.includes("buildBruttiCaptionV3"), 'SoulCaptionStabilizer must use Brutti Caption Engine V3.')
assert(stabilizer.includes("panel.dataset.captionEngine = 'brutti-caption-engine-v3'"), 'V3 output ownership marker is missing.')

for (const moduleName of forbiddenRuntimeModules) {
  assert(!main.includes(moduleName), `Legacy caption module ${moduleName} must not be imported or mounted in main.jsx.`)
}

assert(!main.includes('contentStudioEngineV2'), 'Legacy Content Studio Engine V2 must not be wired into the live entrypoint.')
assert(!main.includes('liveCaptionNarrativeEngine'), 'Legacy narrative engine must not be wired into the live entrypoint.')

console.log('PASS: Caption Engine V3 is the sole mounted BM final-output owner; legacy caption engines remain unmounted and cannot be silently reintroduced without failing CI.')
