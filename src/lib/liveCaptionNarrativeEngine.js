const DIRECTION_RE = /buat caption|susun caption|gaya caption|tone|mulakan dengan|kemudian sambung|fokus (pada|kepada)|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan|jangan reka|jangan tambah|jangan masukkan|jangan hard sell|tidak hard sell|bukan hard sell|jangan menjual|tidak menjual|non-selling|new hook|new cta|minimum|maksimum|baris/i
const UNSUPPORTED_RE = /RM\s?\d[\d,.]*|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|sold|reach|views?|followers?|viral/gi

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sentence(value = '') {
  const next = clean(value)
  if (!next) return ''
  return /[.!?…]$/.test(next) ? next : `${next}.`
}

function stableIndex(value = '', length = 1) {
  if (!length) return 0
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function subjectFor(form = {}) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'cerita ni'
}

function splitFacts(value = '') {
  return String(value || '')
    .split(/\n+|\s*;\s*|(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean)
    .filter((line) => !DIRECTION_RE.test(line))
    .map(sentence)
    .slice(0, 7)
}

const openings = {
  'Brand Awareness': [
    'Bukan semua post kena mula dengan produk.',
    'Kadang cerita Brutti paling ngam datang dari benda yang betul-betul berlaku.',
    'Ada benda yang simple, tapi sayang juga kalau tidak diceritakan.',
    'Kali ni kami mau cerita satu benda yang dekat dengan Brutti sendiri.',
    'Cerita macam ni tidak perlu kasi terlalu formal.',
  ],
  'Product Highlight': [
    '{subject} ni, kita tengok detail yang sudah confirm dulu.',
    'Kali ni kami cerita {subject} dari benda yang memang boleh disahkan.',
    'Sebelum fikir cantik ka tidak, kita tengok dulu apa yang sudah confirm pasal {subject}.',
    '{subject} masuk cerita kali ni, tapi bukan dengan ayat hard sell panjang-panjang.',
    'Kalau sedang compare pilihan, {subject} boleh dilihat dari fungsi dan detail dia dulu.',
  ],
  Educational: [
    'Ada benda simple yang terus jadi lebih jelas bila kita tengok cara ruang tu digunakan.',
    'Tip kali ni tidak complicated sangat.',
    'Kalau sedang plan ruang, benda kecil macam ni memang elok tengok awal-awal.',
    'Kadang solution bukan pasal tambah banyak benda, tapi faham fungsi dulu.',
    'Kali ni kami kasi satu point yang senang dibawa masuk masa planning.',
  ],
  'Behind the Scenes': [
    'Kali ni bukan cerita produk dulu — kita masuk belakang tabir sikit.',
    'Yang depan mata selalunya hasil akhir. Yang belakang dia ni jarang masuk feed.',
    'Ada juga hari yang cerita dia bukan pasal jual barang langsung.',
    'Kali ni kami kasi nampak sikit sisi team di belakang kerja harian.',
    'Bukan semua moment team masuk dalam post, tapi yang ni boleh juga disimpan.',
  ],
  'Customer Story': [
    'Cerita customer selalunya mula dari satu benda: apa yang ruang tu betul-betul perlukan.',
    'Setiap ruang datang dengan cerita yang lain-lain.',
    'Kali ni kami mula dari keperluan sebenar customer dulu.',
    'Sebelum fikir solution, cerita ruang tu kena faham dulu.',
    'Ada project yang direction dia jadi jelas bila customer cerita cara ruang tu digunakan.',
  ],
  Promotion: [
    'Promo tu bonus. Detail dia yang kena jelas dulu.',
    'Kalau ada offer, kami lagi suka kasi terang benda yang memang sudah confirm.',
    'Sebelum decide pasal promo, tengok dulu detail yang betul-betul ada.',
    'Offer boleh menarik, tapi info yang jelas lagi penting.',
    'Kali ni kita tengok offer ni tanpa kasi over sangat.',
  ],
}

const engagingOpenings = {
  'Brand Awareness': ['Kamurang pernah perasan ka, kadang cerita paling simple tu yang paling senang orang ingat? 👀', 'Kalau bukan cerita sebenar Brutti, apa lagi yang patut kami kongsi kan?'],
  'Product Highlight': ['Apa yang paling penting bila tengok {subject} — rupa dulu atau fungsi dia? 👀', 'Kalau tengok {subject}, detail mana satu yang kamu akan check dulu?'],
  Educational: ['Kalau ruang rasa tidak ngam, kamu check fungsi dulu atau terus tambah barang? 👀', 'Pernah ka satu benda simple terus kasi planning ruang jadi lebih jelas?'],
  'Behind the Scenes': ['Kamurang suka tengok hasil siap ja, atau mau juga sisi belakang tabir dia? 👀', 'Kalau bukan kerja harian, macam mana pula sisi team Brutti di belakang dia?'],
  'Customer Story': ['Kalau ruang kamu sendiri, apa benda pertama yang kamu mau kasi selesai? 👀', 'Pernah ka satu detail kecil dari customer terus ubah direction satu ruang?'],
  Promotion: ['Kalau ada promo, kamu jenis tengok harga dulu atau detail dia dulu? 👀', 'Offer nampak menarik, tapi apa benda pertama yang kamu akan confirm dulu?'],
}

const support = {
  'Brand Awareness': [
    'Benda macam ni yang kami suka simpan sebagai sebahagian cerita Brutti.',
    'Tidak payah kasi terlalu polished; cerita sebenar sudah cukup kuat.',
    'Kadang benda kecil lagi senang orang relate daripada ayat brand yang panjang-panjang.',
    'Bila cerita datang dari benda sebenar, nada dia pun terus rasa lebih dekat.',
    'Kami lagi suka cerita macam manusia daripada bunyi macam corporate statement.',
  ],
  'Product Highlight': [
    'Kali ni kami cerita fungsi dan detail dia dulu, bukan kasi ayat jualan panjang-panjang.',
    'Bila tengok detail satu-satu, senang sikit mau nampak piece ni ngam ka tidak dengan ruang.',
    'Kalau tengah compare pilihan, detail yang confirm memang paling berguna.',
    'Tidak semua orang perlukan benda yang sama, jadi function memang elok tengok dulu.',
    'Yang penting, apa yang belum confirm memang tidak payah kami tambah sendiri.',
  ],
  Educational: [
    'Tidak payah complicated sangat; ambil point yang boleh terus guna.',
    'Lain ruang, lain cara dia — sebab tu tidak semua benda kena ikut formula sama.',
    'Kalau function sudah jelas, planning pun lebih senang mau sambung.',
    'Benda practical macam ni memang bagus simpan dalam kepala masa susun ruang.',
    'Cuba tengok ikut keadaan ruang sendiri, bukan semata-mata ikut trend.',
  ],
  'Behind the Scenes': [
    'Kali ni kami kasi nampak sisi belakang tabir sikit, bukan cerita produk.',
    'Moment macam ni pun sebahagian daripada cerita team, bukan kerja siap saja.',
    'Di luar rutin biasa pun ada benda yang layak masuk dalam cerita Brutti.',
    'Tidak perlu kasi nampak perfect sangat; cukup cerita apa yang memang berlaku.',
    'Sisi team macam ni biasanya lagi natural bila dibiar simple.',
  ],
  'Customer Story': [
    'Cerita customer macam ni lagi senang difahami bila mula dari keperluan sebenar.',
    'Lain orang, lain cara guna ruang — itu yang bikin direction tidak boleh copy-paste.',
    'Bila keperluan jelas, barula senang nampak apa yang patut diberi perhatian.',
    'Kami lagi suka dengar cerita ruang dulu sebelum fikir ayat jualan.',
    'Yang penting, cerita customer jangan lari daripada detail yang memang sudah disahkan.',
  ],
  Promotion: [
    'Promo boleh tarik perhatian, tapi detail yang confirm tetap paling penting.',
    'Tidak payah rushing; tengok dulu offer tu memang ngam dengan apa yang dicari ka tidak.',
    'Kalau ada syarat atau tempoh, benda tu memang kena ikut info yang sudah confirm.',
    'Offer bagus pun tetap kena jelas supaya senang orang buat keputusan.',
    'Kami tidak mau tambah claim yang belum ada semata-mata mau kasi nampak menarik.',
  ],
}

const closings = {
  'Brand Awareness': [
    'Kamurang paling suka tengok cerita Brutti yang macam ni juga ka? 👀',
    'Kalau kamurang suka sisi Brutti yang lebih natural macam ni, kasi tau juga.',
    'Ada lagi cerita macam ni yang kamu mau kami share?'
  ],
  'Product Highlight': [
    'Kalau mau check detail piece ni, roger ja team Brutti.',
    'Kalau sedang compare untuk ruang sendiri, mesej ja team dan kita check detail yang ada.',
    'Mau tahu detail yang sudah confirm? Tanya ja team Brutti.'
  ],
  Educational: [
    'Kalau berguna, save dulu. Nanti senang refer balik masa planning.',
    'Cuba apply ikut ruang sendiri, lepas tu tengok mana yang paling ngam.',
    'Kalau ada topik ruang lain yang kamu mau kami kupas, kasi tau ja.'
  ],
  'Behind the Scenes': [
    'Kamurang suka juga ka tengok sisi belakang tabir macam ni? 👀',
    'Kalau mau lebih banyak cerita team macam ni, kasi tau ja.',
    'Yang ni satu lagi moment untuk simpan dalam cerita Brutti.'
  ],
  'Customer Story': [
    'Kalau ruang kamu ada isu yang sama, boleh cerita sama team Brutti.',
    'Lain ruang memang lain solution — kalau mau bincang, roger ja team.',
    'Kalau sedang fikir pasal ruang sendiri, boleh mesej team dan kita tengok sama-sama.'
  ],
  Promotion: [
    'Kalau mau confirm detail offer, mesej ja team Brutti.',
    'Sebelum proceed, roger team dulu kalau ada detail yang kamu mau check.',
    'Kalau offer ni masuk dalam list kamu, check detail terkini sama team dulu.'
  ],
}

function fillTemplate(value, subject) {
  return sentence(String(value || '').replaceAll('{subject}', subject))
}

function takeDistinct(pool = [], start = 0, count = 1, subject = '') {
  const result = []
  for (let offset = 0; offset < pool.length && result.length < count; offset += 1) {
    const item = fillTemplate(pool[(start + offset * 2) % pool.length], subject)
    if (item && !result.includes(item)) result.push(item)
  }
  return result
}

function unsupportedClaimsAreVerified(draft, verifiedText) {
  const facts = clean(verifiedText).toLowerCase()
  const tokens = draft.match(UNSUPPORTED_RE) || []
  return tokens.every((token) => facts.includes(token.toLowerCase()))
}

export function validateLiveNarrativeDraft(draft, verifiedText = '', mode = 'balanced') {
  const lines = String(draft || '').split('\n').map(clean).filter(Boolean)
  const min = 7
  const max = mode === 'shorten' ? 7 : 13
  if (lines.length < min || lines.length > max) return false
  if (new Set(lines).size !== lines.length) return false
  if (/#(?:[\p{L}\p{N}_-]+)/u.test(draft)) return false
  if (!unsupportedClaimsAreVerified(draft, verifiedText)) return false
  return true
}

export function buildLiveNarrativeDraft(form = {}, mode = 'balanced', variation = 0, cycle = 0) {
  if (form.language === 'English' || form.language === 'BM + English') return ''

  const facts = splitFacts(form.brief)
  if (!facts.length) return ''

  const type = openings[form.type] ? form.type : 'Brand Awareness'
  const subject = subjectFor(form)
  const version = Math.max(0, Math.min(2, Number(variation || 0)))
  const seed = stableIndex(`${form.title}|${form.product}|${form.brief}|${type}`, 1009)
  const hookPool = mode === 'engaging' || mode === 'hook' ? engagingOpenings[type] : openings[type]
  const hookIndex = (seed + version * 3 + (mode === 'hook' ? Number(cycle || 0) : 0)) % hookPool.length
  const opener = fillTemplate(hookPool[hookIndex], subject)

  const supportPool = support[type]
  const supportStart = (seed + version * 2) % supportPool.length
  const supportLines = takeDistinct(supportPool, supportStart, 5, subject)

  const closePool = closings[type]
  const closeIndex = (seed + version + (mode === 'cta' ? Number(cycle || 0) : 0)) % closePool.length
  const closer = fillTemplate(closePool[closeIndex], subject)

  let lines
  if (version === 1) {
    lines = [opener, supportLines[0], ...facts, supportLines[1], supportLines[2], closer]
  } else if (version === 2) {
    lines = [opener, ...facts.slice(0, 2), supportLines[0], ...facts.slice(2), supportLines[1], supportLines[2], closer]
  } else {
    lines = [opener, ...facts.slice(0, 1), supportLines[0], ...facts.slice(1), supportLines[1], supportLines[2], closer]
  }

  const unique = []
  for (const raw of lines) {
    const line = sentence(raw)
    if (line && !unique.includes(line)) unique.push(line)
  }

  const target = mode === 'shorten' ? 7 : Math.min(11, Math.max(8, facts.length + 5))
  let cursor = 3
  while (unique.length < target && cursor < supportLines.length) {
    const line = sentence(supportLines[cursor])
    if (line && !unique.includes(line)) unique.splice(Math.max(1, unique.length - 1), 0, line)
    cursor += 1
  }

  const max = mode === 'shorten' ? 7 : 13
  const result = unique.slice(0, max).join('\n')
  return validateLiveNarrativeDraft(result, form.brief, mode) ? result : ''
}
