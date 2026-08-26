import { buildBruttiCaptionV3 } from './bruttiCaptionEngineV3'
import { lockBruttiVoice } from './bruttiVoiceQuality'

const META_DIRECTION_RE = /buat caption|susun caption|gaya caption|style caption|tone|mulakan dengan|kemudian sambung|fokus(?:kan)?(?: pada| kepada)?|content direction|arah cerita|highlight|tekankan|tonjolkan|ceritakan|gunakan gaya|tulis dalam|jangan reka|jangan tambah|jangan masukkan|jangan hard sell|non-selling|objective|target audience|cta|minimum|maksimum|baris/i
const TECHNICAL_RE = /\bmaterials?\b\s*:|\bmaterial\b|plywood|pinewood|solid wood|pallet|repurposed wood|metal|besi|kayu|mm\b|cm\b|inch|inches|\d+(?:\.\d+)?\s*[”"x×]\s*\d|thickness|ketebalan|dimension|dimensions|ukuran|vertical support|support poles?|frame size|specification|specifications|specs?\b/i
const CUSTOMER_RE = /client|customer|pelanggan/i
const REPEAT_RE = /repeat|pernah.*(?:order|buat|project|brutti)|sebelum ni|sebelum ini|kali kedua|kedua|datang balik|datang semula|contact balik|hubungi.*lagi|kembali/i
const DESIGN_RE = /design|reference|rujukan|idea|drawing|inspiration|inspirasi/i
const OWN_DESIGN_RE = /sendiri.{0,30}(?:design|reference|rujukan|idea|cari)|(?:design|reference|rujukan|idea).{0,30}sendiri/i
const TRUST_RE = /percaya|trust|sudah tahu|dah tahu|tahu (?:kami|kita|brutti).*boleh|sebab tahu/i
const REALISE_RE = /realis|realiz|jadikan|hidupkan|translate|ikut design|ikut detail|buatkan|bikinkan/i
const DETAIL_RE = /detail|request|permintaan|ikut.*minta|spec/i

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sentence(value = '') {
  const next = clean(value)
  if (!next) return ''
  return /[.!?…]$/.test(next) ? next : `${next}.`
}

function normalizeShorthand(value = '') {
  return clean(value)
    .replace(/\bdgn\b/gi, 'dengan')
    .replace(/\byg\b/gi, 'yang')
    .replace(/\bsblm\b/gi, 'sebelum')
    .replace(/\bsbb\b/gi, 'sebab')
    .replace(/\butk\b/gi, 'untuk')
    .replace(/\btdk\b/gi, 'tidak')
    .replace(/\bblh\b/gi, 'boleh')
    .replace(/\bdr\b/gi, 'dari')
    .replace(/\bsy\b/gi, 'saya')
}

function splitBrief(value = '') {
  return String(value || '')
    .split(/\n+|\s*;\s*|(?<=[.!?])\s+/)
    .map(normalizeShorthand)
    .filter(Boolean)
    .slice(0, 14)
}

function unique(lines = []) {
  const seen = new Set()
  return lines.filter(Boolean).map(clean).filter((line) => {
    const key = line.toLowerCase().replace(/[.!?…]+$/g, '')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function explicitFocus(text = '') {
  if (/(?:fokus|cerita|highlight|direction).{0,35}(?:client|customer|pelanggan|repeat|trust|design)/i.test(text)) return 'customer-story'
  if (/(?:fokus|cerita|highlight|direction).{0,35}(?:artisan|tukang|workshop|craft)/i.test(text)) return 'artisan-story'
  if (/(?:fokus|cerita|highlight|direction).{0,35}(?:founder|lukman|faznur|origin)/i.test(text)) return 'founder-moment'
  if (/(?:fokus|cerita|highlight|direction).{0,35}(?:community|komuniti|purpose)/i.test(text)) return 'community-purpose'
  if (/(?:fokus|cerita|highlight|direction).{0,35}(?:promo|promotion|offer|harga)/i.test(text)) return 'verified-promotion'
  if (/(?:fokus|cerita|highlight|direction).{0,35}(?:material|educational|tip|explain)/i.test(text)) return 'educational-story'
  return ''
}

function inferFocus(form = {}, profile = {}) {
  const directionText = profile.directionLines.join(' ')
  const factText = profile.factualLines.join(' ')
  const combined = `${directionText} ${factText}`
  const forced = explicitFocus(directionText)
  if (forced) return forced

  if (/Customer Story/i.test(form.type || '')) return 'customer-story'
  if (/Promotion|Promo|Offer/i.test(form.type || '')) return 'verified-promotion'
  if (/Educational/i.test(form.type || '')) return 'educational-story'

  // For broad Brand Awareness / BTS inputs, the human story wins over product keywords.
  if (CUSTOMER_RE.test(combined) && (REPEAT_RE.test(combined) || DESIGN_RE.test(combined) || /keperluan|order|ruang/i.test(combined))) return 'customer-story'
  if (/founder|lukman|faznur|pkp|pandemik|survive|asalnya/i.test(combined)) return 'founder-moment'
  if (/community|komuniti|charity|berkongsi rezeki/i.test(combined)) return 'community-purpose'
  if (/retreat|team|aktiviti|games|makan-makan|moment/i.test(combined) && /Behind the Scenes/i.test(form.type || '')) return 'daily-human-moment'
  if (/artisan|tukang|gaji|payroll|maruah artisan/i.test(combined)) return 'artisan-story'
  if (/promo|promotion|offer|diskaun|discount|harga/i.test(combined)) return 'verified-promotion'
  if (/product|produk|piece|rack|table|wardrobe|shelf|kiosk|counter|display|signage|custom|bespoke/i.test(combined)) return 'piece-story'
  return 'brand-story'
}

export function parseDirectionAwareBrief(value = '', form = {}) {
  const allLines = splitBrief(value)
  const directionLines = allLines.filter((line) => META_DIRECTION_RE.test(line))
  const factualLines = allLines.filter((line) => !META_DIRECTION_RE.test(line))
  const technicalFacts = factualLines.filter((line) => TECHNICAL_RE.test(line))
  const narrativeFacts = factualLines.filter((line) => !TECHNICAL_RE.test(line))
  const explicitTechnicalFocus = /(?:fokus|highlight|cerita|explain).{0,30}(?:material|spec|technical|ukuran|dimension)/i.test(directionLines.join(' '))
  const profile = { allLines, directionLines, factualLines, technicalFacts, narrativeFacts, explicitTechnicalFocus }
  return { ...profile, focus: inferFocus(form, profile) }
}

function subjectFor(form = {}) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'project ni'
}

function customerSignals(profile = {}) {
  const text = profile.factualLines.join(' ')
  return {
    repeat: REPEAT_RE.test(text),
    design: DESIGN_RE.test(text),
    ownDesign: OWN_DESIGN_RE.test(text),
    trust: TRUST_RE.test(text),
    realise: REALISE_RE.test(text),
    detail: DETAIL_RE.test(text),
  }
}

function customerDraft(form = {}, profile = {}, variation = 0) {
  const subject = subjectFor(form)
  const signal = customerSignals(profile)

  const repeatLine = signal.repeat ? 'Client ni pernah buat order dengan Brutti sebelum ni.' : ''
  const designLine = signal.ownDesign
    ? 'Kali ni dia datang dengan design yang dia sendiri sudah pilih.'
    : signal.design ? 'Design atau reference dari client jadi starting point untuk project ni.' : ''
  const trustLine = signal.trust ? 'Ada trust pada team Brutti, jadi dia datang semula dengan direction yang sudah jelas.' : ''
  const realiseLine = signal.realise ? 'Dari situ, team Brutti bantu translate idea tu ikut apa yang memang diminta.' : ''
  const detailLine = signal.detail ? 'Detail yang client minta tetap jadi rujukan sepanjang project ni.' : ''
  const subjectLine = `${subject} kali ni bermula dari apa yang client memang sudah ada dalam kepala.`

  const support = [
    'Custom work memang macam ni — lain client, lain direction.',
    'Yang penting, kita faham dulu apa yang dia mau sebelum masuk benda lain.',
    'Bila idea sudah jelas, senang team fokus pada benda yang betul-betul penting.',
    'Idea utama dia jelas dulu, detail lain boleh ikut kemudian.',
    'Bagi kami, cerita client dan idea dia dulu yang kasi project ni ada context.',
  ]

  const endings = [
    'Benda macam ni yang bikin custom project rasa lebih personal, bukan template.',
    'Simple ja: client bawa idea, team bantu kasi dia jadi lebih jelas.',
    'Lain project, lain cerita — dan itu memang part yang kami suka pasal custom work.',
  ]

  const layouts = [
    [repeatLine || subjectLine, trustLine, designLine, subjectLine, realiseLine, detailLine, support[0], support[4], endings[0]],
    [designLine || subjectLine, subjectLine, repeatLine, realiseLine, trustLine, detailLine, support[1], support[2], endings[1]],
    [subjectLine, designLine, realiseLine, detailLine, repeatLine, trustLine, support[0], support[2], endings[2]],
  ]

  const chosen = unique(layouts[Math.max(0, Math.min(2, variation))])
  const fillers = support.filter((line) => !chosen.includes(line))
  while (chosen.length < 8 && fillers.length) chosen.splice(Math.max(1, chosen.length - 1), 0, fillers.shift())
  return chosen.slice(0, 11).join('\n')
}

function prepareBaseForm(form = {}, profile = {}) {
  let usable = profile.narrativeFacts
  if (profile.explicitTechnicalFocus || profile.focus === 'educational-story') {
    usable = [...profile.narrativeFacts, ...profile.technicalFacts]
  } else if (!usable.length) {
    usable = profile.technicalFacts.slice(0, 2)
  }

  return {
    ...form,
    brief: usable.map(sentence).join('\n'),
  }
}

function inputKey(form = {}, variation = 0) {
  return `v32|${clean(form.title)}|${clean(form.product)}|${clean(form.type)}|${clean(form.brief)}|${Math.max(0, Math.min(2, Number(variation) || 0))}`
}

export function buildBruttiCaptionV32(form = {}, variation = 0, options = {}) {
  const version = Math.max(0, Math.min(2, Number(variation) || 0))
  const profile = parseDirectionAwareBrief(form.brief || '', form)

  if (!clean(form.title) || !profile.factualLines.length) {
    return {
      copy: '',
      report: { pass: false, checks: [], reason: 'missing-verified-input' },
      meta: { engine: 'brutti-caption-v3.2', storyPillar: 'unknown', structure: 'none', version: version + 1 },
    }
  }

  if (profile.focus === 'customer-story') {
    const draft = customerDraft(form, profile, version)
    const guarded = lockBruttiVoice(draft, form, version)
    return {
      ...guarded,
      meta: {
        engine: 'brutti-caption-v3.2',
        storyPillar: 'customer-story',
        structure: ['trust-led', 'idea-led', 'collaboration-led'][version],
        version: version + 1,
        inputKey: inputKey(form, version),
        factCount: profile.factualLines.length,
        directionCount: profile.directionLines.length,
        technicalFactsSkipped: profile.explicitTechnicalFocus ? 0 : profile.technicalFacts.length,
        directionMode: 'story-first',
      },
    }
  }

  const preparedForm = prepareBaseForm(form, profile)
  const base = buildBruttiCaptionV3(preparedForm, version, options)
  return {
    ...base,
    meta: {
      ...base.meta,
      engine: 'brutti-caption-v3.2',
      inputKey: inputKey(form, version),
      directionCount: profile.directionLines.length,
      technicalFactsSkipped: profile.explicitTechnicalFocus || profile.focus === 'educational-story' ? 0 : profile.technicalFacts.length,
      directionMode: 'story-first',
    },
  }
}
