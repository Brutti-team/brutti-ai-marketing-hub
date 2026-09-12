import { buildBruttiCaptionV3 } from './bruttiCaptionEngineV3'
import { lockBruttiVoice } from './bruttiVoiceQuality'
import { readBruttiSoulStyleProfile, selectBruttiSoulReference } from './bruttiSoulStyleLibrary'

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

function sentenceCase(value = '') {
  const next = clean(value)
  return next ? `${next.charAt(0).toUpperCase()}${next.slice(1)}` : ''
}

function rewriteVerifiedDetail(value = '') {
  return clean(value)
    .replace(/\s*&\s*/g, ' dan ')
    .replace(/\bboleh guna untuk\s+/gi, 'boleh digunakan untuk ')
    .replace(/\bsenang dibawa ke mana-mana\b/gi, 'mudah dibawa ikut keperluan')
    .replace(/\bboleh dibuka menjadi luas bila perlu guna banyak ruang untuk\s+/gi, 'boleh dibuka bila perlukan ruang lebih untuk ')
    .replace(/\bmau buat jadi decoration pun boleh\b/gi, 'kalau mau jadikan decoration pun ngam juga')
    .replace(/\bjadi decoration pun ngam\b/gi, 'kalau mau jadikan decoration pun memang ngam')
    .replace(/\bdalam bentuk\s+([A-Za-z]+)\s*size\b/gi, 'saiz $1')
    .replace(/\b([A-Za-z]+)\s+Queen\s+size\s+dan\s+ada\s+(\d+)\s+storage\s+di\s+tepi\s+katil\b/gi, '$1 saiz Queen, dengan $2 ruang storage di tepi katil')
    .replace(/\b([A-Za-z]+)\s+size\s+dan\s+ada\s+(\d+)\s+storage\b/gi, '$1 saiz, dengan $2 ruang storage')
    .replace(/\s{2,}/g, ' ')
    .trim()
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

const IDEA_STOPWORDS = new Set('yang dan untuk dari dalam dengan bila kalau mau boleh pun ni dia ada kita kami kamu piece ruang fungsi hasil bukan tetap sudah lebih terus nampak'.split(' '))

function ideaTokens(value = '') {
  return new Set(clean(value).toLowerCase().split(/[^a-z0-9à-ÿ]+/i).filter((word) => word.length > 3 && !IDEA_STOPWORDS.has(word)))
}

function sameIdea(left, right) {
  const a = ideaTokens(left); const b = ideaTokens(right)
  if (!a.size || !b.size) return false
  return [...a].filter((word) => b.has(word)).length / Math.min(a.size, b.size) >= 0.6
}

function guardRepeatedIdeas(lines = []) {
  const alternatives = [
    'Bila masuk ruang, manfaat dia lebih senang nampak.',
    'Senang digunakan bila ruang betul-betul perlukan.',
    'Benda yang dibuat dengan tujuan biasanya lebih lama tinggal.',
  ]
  const result = []
  lines.forEach((line, index) => {
    let next = clean(line)
    if (index > 1 && result.some((previous) => sameIdea(previous, next))) {
      next = alternatives.find((candidate) => !result.some((previous) => sameIdea(previous, candidate))) || next
    }
    result.push(next)
  })
  return result
}

function referenceHook(subject, form, style, reference, variation) {
  const focus = String(form.type || '').toLowerCase()
  const hooks = focus.includes('behind')
    ? [`${subject} ni bermula dari kerja tangan dan detail kecil.`, `Di belakang ${subject}, ada proses yang buat piece ni jadi.`, `${subject} bukan terus nampak siap — ada cerita di belakangnya.`]
    : focus.includes('customer')
      ? [`${subject} ni dibuat ikut cara ruang tu digunakan.`, `Bila keperluan client jelas, senang direction ${subject} ikut betul-betul.`, `Cerita ${subject} ni bermula dari apa yang ruang tu perlukan.`]
      : focus.includes('promotion')
        ? [`Kalau sedang cari ${subject}, tengok dulu apa yang boleh dia bantu.`, `${subject} ni boleh jadi pilihan bila fungsi dan bajet sama-sama kena.`, `Yang ni mungkin sesuai kalau ruang kamu perlukan ${subject}.`]
        : [`${subject} ni bukan sekadar nampak kemas.`, `${subject} ni jenis piece yang terus nampak gunanya.`, `Yang ni nampak simple, tapi ada sebab kenapa ia dibuat.`]
  const offset = reference?.structure?.dashHook ? 1 : reference?.structure?.firstPerson && style.firstPerson ? 1 : 0
  return hooks[(variation + offset) % hooks.length]
}

function dynamicUseCase(subject, profile = {}, variation = 0) {
  const text = profile.factualLines.join(' ')
  if (/extend|buka|luas|ramai/i.test(text)) return ['Boleh extend bila perlukan ruang untuk duduk ramai-ramai.', 'Bila ruang perlu berubah, piece ni boleh ikut keperluan.', 'Buka bila perlu, simpan kemas bila ruang mau digunakan seperti biasa.'][variation % 3]
  if (/storage|simpan|ruang letak/i.test(text)) return ['Storage dia kasi barang harian lebih senang disusun.', 'Ruang simpan di tepi bantu barang kecil tidak bersepah.', 'Ada tempat untuk simpan barang, jadi fungsi dia bukan setakat pada rupa.'][variation % 3]
  if (/sidai|towel|sejadah|kain/i.test(text)) return ['Towel dan sejadah senang dicapai bila perlu.', 'Bila barang harian ada tempat sendiri, ruang pun lebih senang dijaga.', 'Guna untuk sidai barang boleh, jadikan sebahagian daripada ruang pun ngam.'][variation % 3]
  if (/foldable|lipat|mudah dibawa|portable|kiosk/i.test(text)) return ['Bila perlu setup, kiosk ni boleh dibawa dan digunakan ikut ruang.', 'Foldable macam ni senang ikut berubahnya setup event atau ruang.', 'Simpan bila tidak digunakan, buka bila ruang perlukan fungsi dia.'][variation % 3]
  if (/display|event|setup|indoor|outdoor|gula|jajan/i.test(text)) return ['Setup dia boleh ikut ruang yang kamu ada.', 'Boleh bergerak dari satu setup ke setup lain tanpa hilang fungsi dia.', 'Bila masuk dalam event, susunan barang pun lebih senang diatur.'][variation % 3]
  if (/panel|dinding|islam|islamic|decoration|hias|nampak|kemas/i.test(text)) return ['Panel ni bantu ruang nampak lebih tersusun tanpa hilang fungsi utama.', 'Bila detail dinding sudah kena, ruang terus rasa lebih lengkap.', 'Rupa dia jadi sebahagian daripada ruang, bukan hiasan yang berdiri sendiri.'][variation % 3]
  if (/decoration|hias|nampak|kemas/i.test(text)) return ['Mau guna untuk fungsi harian boleh, jadikan decoration pun ngam.', 'Rupa dia boleh ikut ruang tanpa mengganggu kegunaan utama.', 'Bila fungsi dan rupa sama-sama kena, ruang pun rasa lebih teratur.'][variation % 3]
  return [
    `Guna ${subject} ikut apa yang ruang kamu perlukan hari-hari.`,
    `${subject} dibuat supaya senang masuk dalam rutin ruang kamu.`,
    `Yang penting, fungsi ${subject} tetap jelas bila sudah digunakan.`,
  ][variation % 3]
}

function categoryAngle(form = {}, style = {}, reference = null, variation = 0) {
  const focus = String(form.type || '').toLowerCase()
  if (focus.includes('behind')) return ['Hasil akhir dia nampak simple, tapi setiap detail tetap ada sebabnya.', 'Bila nampak hasil akhir, jangan lupa ada proses sebelum dia sampai tahap ni.', 'Kami lebih suka cerita apa yang dibuat, bukan sekadar tunjuk barang siap.'][variation % 3]
  if (focus.includes('customer')) return ['Direction dia datang dari cara ruang tu digunakan, bukan dari template yang sama untuk semua.', 'Bila keperluan sebenar jelas, senang team susun piece ikut situasi.', 'Lain ruang, lain cara guna — itu yang buat setiap project ada cerita sendiri.'][variation % 3]
  if (focus.includes('promotion')) return ['Kalau detail dia sesuai dengan keperluan kamu, boleh pertimbangkan sebagai salah satu pilihan.', 'Semak fungsi dan ukuran dulu supaya pilihan memang kena dengan ruang.', 'Tidak perlu ikut trend; pilih yang betul-betul akan digunakan.'][variation % 3]
  const referenceSequence = reference?.structure?.sequence || []
  if (referenceSequence.includes('brand-reflection') || style.firstPerson) {
    const facts = String(form.brief || '').toLowerCase()
    if (/foldable|kiosk|event|setup/.test(facts)) return ['Untuk setup yang selalu berubah, fungsi macam ni memang senang terasa.', 'Bila satu piece boleh ikut ruang dan keadaan, kerja setup pun lebih lancar.', 'Kiosk yang boleh digunakan semula biasanya lebih berguna daripada yang sekadar nampak siap.'][variation % 3]
    if (/sidai|towel|sejadah|kain/.test(facts)) return ['Barang yang selalu digunakan memang patut senang dicapai.', 'Bila fungsi harian jelas, tidak perlu ayat panjang untuk faham nilainya.', 'Piece macam ni senang tinggal dalam rutin sebab kegunaan dia memang nyata.'][variation % 3]
    if (/panel|dinding|islam|islamic/.test(facts)) return ['Bila rupa dan fungsi sama-sama kena, ruang pun rasa lebih teratur.', 'Detail pada dinding boleh ubah rasa ruang tanpa perlu berlebihan.', 'Panel yang dibuat ikut ruang akan lebih senang menyatu dengan suasana rumah.'][variation % 3]
    return ['Kami suka hasil yang boleh bercakap melalui cara ia digunakan.', 'Yang penting bukan puji panjang — fungsi dia sendiri sudah cukup bercerita.', 'Bila masuk dalam situasi sebenar, manfaat dia lebih senang nampak.'][variation % 3]
  }
  return ['Satu piece yang dibuat untuk digunakan, bukan sekadar dipandang.', 'Benda yang praktikal biasanya paling lama tinggal dalam rutin harian.', 'Bila masuk dengan ruang, manfaat dia lebih senang nampak.'][variation % 3]
}

function applyReferenceSequence(lines = [], reference = null, variation = 0) {
  const sequence = reference?.structure?.sequence || []
  if (!sequence.length) return lines
  const roleIndexes = {
    story: [0],
    'fact-or-use': [1, 2],
    'brand-reflection': [3],
  }
  const ordered = []
  const used = new Set()
  sequence.forEach((role) => {
    const candidates = roleIndexes[role] || []
    const index = candidates.find((candidate) => !used.has(candidate))
    if (index === undefined || !lines[index]) return
    used.add(index)
    ordered.push(lines[index])
  })
  const remaining = lines.filter((_, index) => !used.has(index))
  if (variation === 1 && ordered.length > 2) {
    const first = ordered.shift()
    ordered.splice(Math.min(1, ordered.length), 0, first)
  }
  return [...ordered, ...remaining].slice(0, lines.length)
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

  // Short, direct briefs should stay short. This keeps the Content Studio
  // aligned with the concise Brutti Soul examples instead of expanding them
  // into the long story-first template below.
  const conciseBrief = form.length !== 'full'
    && clean(form.brief).length <= 180
    && !TECHNICAL_RE.test(form.brief)
    && !/(?:panjang|detail|long caption|minimum\s*\d|\d+\s*baris)/i.test(form.brief)
  if (conciseBrief) {
    const style = readBruttiSoulStyleProfile()
    const reference = selectBruttiSoulReference(form, form.brief)
    const subject = (form.product && form.product !== 'General / No Product' ? form.product : form.title)
      .replace(/^(behind the scene|behind the scenes|product highlight)\s*/i, '')
      .split(/[–—-]/)[0].trim() || 'Yang ni'
    const factLine = profile.factualLines.slice(0, 2).map((line) => sentenceCase(line.replace(/[.!?]+$/g, ''))).join('. ')
    const polishedFactLine = sentenceCase(rewriteVerifiedDetail(factLine))
    const language = form.language === 'English' ? 'en' : 'bm'
    const variationKey = ([...`${subject}${factLine}`].reduce((sum, char) => sum + char.charCodeAt(0), 0) + version) % 3
    const lines = language === 'en'
      ? [
          [`${subject} is simple, but it can do a lot.`, factLine ? sentence(factLine) : 'Use it according to what your space needs.', 'It can work as part of the room too, if you want something more decorative.', 'A practical piece that still feels easy on the eyes.'],
          [`Meet ${subject} — made to fit into everyday spaces.`, factLine ? sentence(factLine) : 'Useful for the things you reach for every day.', 'Keep it simple, or let it become part of the room.', 'Small details, but a piece that earns its place.'],
          [`${subject} brings function without making the space feel heavy.`, factLine ? sentence(factLine) : 'Built around the way the space is actually used.', 'It can stay practical while still looking right at home.', 'That balance is what makes a piece feel considered.'],
        ][variationKey]
      : [
          [referenceHook(subject, form, style, reference, 0), polishedFactLine ? sentence(polishedFactLine) : 'Boleh guna ikut keperluan ruang kamu.', dynamicUseCase(subject, profile, 0), categoryAngle(form, style, reference, 0)],
          [referenceHook(subject, form, style, reference, 1), polishedFactLine ? sentence(polishedFactLine) : 'Guna ikut apa yang kamu perlukan hari-hari.', dynamicUseCase(subject, profile, 1), categoryAngle(form, style, reference, 1)],
          [referenceHook(subject, form, style, reference, 2), polishedFactLine ? sentence(polishedFactLine) : 'Dibuat untuk benda yang memang kamu guna.', dynamicUseCase(subject, profile, 2), categoryAngle(form, style, reference, 2)],
        ][variationKey]
    const structuredLines = applyReferenceSequence(lines, reference, variationKey)
    const copy = guardRepeatedIdeas(structuredLines).join('\n')
    return {
      copy,
      report: { pass: true, checks: [], reason: 'concise-verified-input' },
      refined: false,
      fallback: false,
      meta: {
        engine: 'brutti-caption-v3.2', storyPillar: 'concise-product-story', structure: 'four-line-soul', version: version + 1,
        inputKey: inputKey(form, version), factCount: profile.factualLines.length, directionCount: profile.directionLines.length,
        technicalFactsSkipped: 0, directionMode: 'reference-mode', styleSource: style.source, styleReferenceCount: style.count, referenceUsed: Boolean(reference), referenceStructure: reference?.structure?.sequence?.join('>') || 'rule-fallback',
      },
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
