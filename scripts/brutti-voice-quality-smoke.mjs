import { evaluateBruttiVoiceQuality, lockBruttiVoice, refineBruttiVoice } from '../src/lib/bruttiVoiceQuality.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const form = {
  title: 'KAANAGAN Product Highlight',
  platform: 'Facebook',
  type: 'Product Highlight',
  product: 'KAANAGAN Open Concept Wardrobe with Drawers',
  language: 'Bahasa Melayu',
  tone: 'Brutti Sabahan Casual',
  brief: 'KAANAGAN ialah open concept wardrobe dengan drawers. Material plywood.',
}

const mixedDraft = [
  'KAANAGAN ialah open concept wardrobe dengan drawers.',
  'Material plywood.',
  'Function dia simple: bagi ruang simpanan nampak lebih organised.',
  'Open concept design ni memang senang nampak apa yang ada dalam ruang.',
  'Details yang belum confirm memang kita tidak tambah.',
  'No hard sell, just the details yang memang relevant.',
  'Kalau mau tengok lebih dekat, boleh check dengan team dulu.',
].join('\n')

const refinedA = refineBruttiVoice(mixedDraft, form, 0)
const refinedB = refineBruttiVoice(mixedDraft, form, 0)
assert(refinedA === refinedB, 'Light voice refinement must remain deterministic.')

const locked = lockBruttiVoice(mixedDraft, form, 0)
assert(locked.copy, 'Light quality guard must return a caption.')
assert(locked.report.pass, `Expected lightweight caption guard to pass: ${JSON.stringify(locked.report.checks)}`)
assert(locked.report.lineCount >= 7 && locked.report.lineCount <= 13, 'Caption must remain within 7–13 lines.')
assert(locked.report.emojiCount <= 3, 'Caption must keep emoji use controlled.')
assert(!/#BRUTTI/i.test(locked.copy), 'Caption must not contain hashtags.')
assert(locked.report.styleMode === 'soft-reference', 'Soul/voice mode must be soft-reference, not strict lock.')
assert(/Function|organised|No hard sell/i.test(locked.copy), 'Natural BM + English mixing must be preserved.')

const noFirstPerson = mixedDraft
  .replace('kita tidak tambah', 'tidak ditambah')
  .replace('boleh check dengan team dulu', 'boleh check details dulu')
const advisoryReport = evaluateBruttiVoiceQuality(noFirstPerson, form)
assert(advisoryReport.pass, 'First-person and Sabahan markers must be advisory, not required for a valid caption.')
assert(advisoryReport.checks.find((check) => check.key === 'first-person-reference')?.required === false, 'First-person check must be advisory.')
assert(advisoryReport.checks.find((check) => check.key === 'sabahan-reference')?.required === false, 'Sabahan style check must be advisory.')

const noisyDraft = [
  'Pihak Brutti memperkenalkan tawaran hebat #BRUTTI 😂😂😂😂',
  ...mixedDraft.split('\n').slice(1),
].join('\n')
const cleaned = refineBruttiVoice(noisyDraft, form, 1)
assert(!/pihak Brutti|memperkenalkan|tawaran hebat/i.test(cleaned), 'Corporate template language must be softened.')
assert(!/#BRUTTI/i.test(cleaned), 'Hashtags must be removed.')
assert((cleaned.match(/\p{Extended_Pictographic}/gu) || []).length <= 3, 'Refinement must cap emojis at three.')

const unsupported = `${locked.copy}\nHarga RM99.`
const unsupportedReport = evaluateBruttiVoiceQuality(unsupported, form)
assert(!unsupportedReport.pass, 'Unsupported commercial claims must fail the safety guard.')
assert(unsupportedReport.unsupportedClaims.some((claim) => /RM99/i.test(claim)), 'Unsupported RM claim must be identified.')

const supportedForm = { ...form, brief: `${form.brief} Harga RM99.` }
const supportedReport = evaluateBruttiVoiceQuality(unsupported, supportedForm)
assert(supportedReport.unsupportedClaims.length === 0, 'Verified commercial claims must remain allowed.')

console.log('PASS: Lightweight caption voice guard allows natural BM-English mix, treats Brutti/Sabahan style as a soft reference, keeps 7–13 lines, removes hashtags, controls emoji and blocks unsupported claims.')
