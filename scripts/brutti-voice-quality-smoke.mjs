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

const baseDraft = [
  'Kalau nampak piece ni, jangan tengok rupa ja dulu. Ada sebab kenapa dia dibikin begitu. 👀',
  'KAANAGAN ialah open concept wardrobe dengan drawers.',
  'Material plywood.',
  'Kami tengok fungsi dan keperluan dulu, baru rupa dan style dia.',
  'Kalau piece tu ada cerita nama, orang atau proses, itu yang bikin dia lebih berjiwa.',
  'Detail yang belum confirm memang kena check dulu dengan team.',
  'Yang penting, fakta dia memang kena jelas.',
  'Bagi kami, cerita produk tidak perlu bunyi macam hard sell.',
  'Kalau mau tahu cerita atau detail dia lebih lanjut, mesej ja kami.',
].join('\n')

const refinedA = refineBruttiVoice(baseDraft, form, 0)
const refinedB = refineBruttiVoice(baseDraft, form, 0)
assert(refinedA === refinedB, 'Voice refinement must be deterministic for the same input and version.')

const locked = lockBruttiVoice(baseDraft, form, 0)
assert(locked.copy, 'Quality lock must return a caption.')
assert(locked.report.pass, `Expected Brutti voice quality lock to pass: ${JSON.stringify(locked.report.checks)}`)
assert(locked.report.lineCount >= 7 && locked.report.lineCount <= 13, 'Caption must remain within 7–13 lines.')
assert(locked.report.emojiCount <= 3, 'Caption must keep emoji use controlled.')
assert(!/#BRUTTI/i.test(locked.copy), 'Caption must not contain hashtags.')
assert(/\b(kami|aku|sia|saya)\b/i.test(locked.copy), 'Caption must keep first-person Brutti voice.')

const noisyDraft = [
  'Pihak Brutti memperkenalkan tawaran hebat #BRUTTI 😂😂😂😂',
  ...baseDraft.split('\n').slice(1),
].join('\n')
const cleaned = refineBruttiVoice(noisyDraft, form, 1)
assert(!/pihak Brutti|memperkenalkan|tawaran hebat/i.test(cleaned), 'Corporate template language must be removed by refinement.')
assert(!/#BRUTTI/i.test(cleaned), 'Hashtags must be removed by refinement.')
assert((cleaned.match(/\p{Extended_Pictographic}/gu) || []).length <= 3, 'Refinement must cap emojis at three.')

const unsupported = `${locked.copy}\nHarga RM99.`
const unsupportedReport = evaluateBruttiVoiceQuality(unsupported, form)
assert(!unsupportedReport.pass, 'Unsupported commercial claims must fail the quality lock.')
assert(unsupportedReport.unsupportedClaims.some((claim) => /RM99/i.test(claim)), 'Unsupported RM claim must be identified.')

const supportedForm = { ...form, brief: `${form.brief} Harga RM99.` }
const supportedReport = evaluateBruttiVoiceQuality(unsupported, supportedForm)
assert(supportedReport.unsupportedClaims.length === 0, 'Verified commercial claims must be allowed when supplied in the source.')

console.log('PASS: Brutti Voice Refinement + Quality Lock is deterministic, Soul-shaped, 7–13 lines, first-person, hashtag-free, emoji-controlled, anti-corporate, and guards unsupported claims.')
