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

assert(main.includes("import('./SoulCaptionStabilizer.jsx')"), 'SoulCaptionStabilizer must remain available through the page-scoped lazy loader.')
assert((main.match(/<SoulCaptionStabilizer\s*\/>/g) || []).length === 1, 'SoulCaptionStabilizer must be mounted exactly once.')
assert(main.includes("page === 'Content Studio' ? <SoulCaptionStabilizer /> : null"), 'SoulCaptionStabilizer must only run while Content Studio is active.')
assert(stabilizer.includes('buildBruttiCaptionV32'), 'SoulCaptionStabilizer must use direction-aware Brutti Caption Engine V3.2.')
assert(stabilizer.includes("panel.dataset.captionEngine = 'brutti-caption-engine-v3.2'"), 'V3.2 output ownership marker is missing.')
assert(stabilizer.includes("panel.dataset.captionDirectionMode"), 'Story-first direction marker is missing.')
assert(stabilizer.includes("panel.dataset.captionStyleMode = 'soft-reference'"), 'Soft-reference style marker is missing.')
assert(!stabilizer.includes('applyBruttiSoulPolicy'), 'Live caption output must not be routed through the strict Soul policy layer.')
assert(!stabilizer.includes('polishBruttiFinalCaption'), 'Live caption output must not be routed through the extra final-polish layer.')

for (const moduleName of forbiddenRuntimeModules) {
  assert(!main.includes(moduleName), `Legacy caption module ${moduleName} must not be imported or mounted in main.jsx.`)
}

assert(!main.includes('BruttiSoulSystemEnhancer'), 'The always-on legacy Soul DOM enhancer must stay out of the live entrypoint.')
assert(!main.includes('contentStudioEngineV2'), 'Legacy Content Studio Engine V2 must not be wired into the live entrypoint.')
assert(!main.includes('liveCaptionNarrativeEngine'), 'Legacy narrative engine must not be wired into the live entrypoint.')

console.log('PASS: Caption Engine V3.2 is story-first and page-scoped to Content Studio; Soul stays a soft reference and legacy rewrite layers remain outside the live output path.')
