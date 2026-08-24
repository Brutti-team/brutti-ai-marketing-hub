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

const VERSION_STYLES = ['story', 'relatable', 'practical']

const versionOpenings = {
  story: {
    'Brand Awareness': [
      'Kadang cerita Brutti paling ngam datang dari benda yang betul-betul berlaku.',
      'Ada benda yang simple, tapi sayang juga kalau tidak diceritakan.',
      'Kali ni kami mau cerita satu benda yang dekat dengan Brutti sendiri.',
    ],
    'Product Highlight': [
      'Setiap piece ada sebab kenapa dia dibuat, termasuk {subject}.',
      'Kali ni cerita bermula dari {subject} dan detail yang memang sudah confirm.',
      '{subject} ada cerita dia sendiri bila kita tengok cara dia digunakan.',
    ],
    Educational: [
      'Kadang satu benda kecil boleh ubah cara kita tengok satu ruang.',
      'Benda practical selalunya bermula dari satu soalan yang simple.',
      'Tip kali ni datang dari cara ruang tu betul-betul digunakan.',
    ],
    'Behind the Scenes': [
      'Kali ni bukan cerita produk dulu — kita masuk belakang tabir sikit.',
      'Yang depan mata selalunya hasil akhir. Yang belakang dia ni jarang masuk feed.',
      'Ada juga hari yang cerita dia bukan pasal jual barang langsung.',
    ],
    'Customer Story': [
      'Cerita customer selalunya mula dari apa yang ruang tu betul-betul perlukan.',
      'Setiap ruang datang dengan cerita yang lain-lain.',
      'Kali ni kami mula dari keperluan sebenar customer dulu.',
    ],
    Promotion: [
      'Promo tu bonus. Cerita sebenar dia tetap pada detail yang sudah confirm.',
      'Kalau ada offer, kami lagi suka mula dari benda yang memang jelas dulu.',
      'Sebelum decide pasal promo, tengok dulu apa yang betul-betul ada.',
    ],
  },
  relatable: {
    'Brand Awareness': [
      'Kamurang pun mesti pernah nampak kan, benda simple kadang paling senang orang ingat.',
      'Tidak semua cerita brand kena bunyi macam iklan.',
      'Kalau cerita tu memang real, senang ja orang mau relate.',
    ],
    'Product Highlight': [
      'Kalau sedang compare furniture, apa benda pertama yang kamu selalu check pada {subject}?',
      'Bila tengok {subject}, mesti ada satu detail yang terus bikin kamu fikir sesuai ka tidak.',
      'Kalau ruang kamu sendiri, fungsi {subject} ni memang benda pertama yang patut tengok.',
    ],
    Educational: [
      'Pernah ka ruang rasa semak walaupun barang sebenarnya tidak banyak?',
      'Kalau planning ruang selalu bikin pening, mula dari benda yang paling basic dulu.',
      'Kadang kita bukan perlukan lebih banyak barang — kita cuma perlukan susunan yang lebih masuk akal.',
    ],
    'Behind the Scenes': [
      'Kamurang selalu nampak hasil siap, tapi belakang dia ada banyak moment lain juga.',
      'Di luar kerja harian pun team Brutti ada cerita dia sendiri.',
      'Bukan semua moment team masuk feed, tapi yang ni memang rasa sayang kalau tidak share.',
    ],
    'Customer Story': [
      'Kalau ruang kamu sendiri ada masalah yang sama, mesti kamu pun mau solution yang betul-betul ngam kan?',
      'Lain customer, lain benda yang dia mau selesaikan dalam ruang.',
      'Kadang satu detail kecil dari customer terus ubah direction keseluruhan ruang.',
    ],
    Promotion: [
      'Kalau nampak promo, kamu jenis check harga dulu atau detail dia dulu?',
      'Offer nampak menarik memang okay, tapi detail dia tetap kena ngam dengan apa yang kamu cari.',
      'Promo bagus kalau memang kena dengan keperluan, bukan sebab nampak murah semata-mata.',
    ],
  },
  practical: {
    'Brand Awareness': [
      'Untuk cerita Brutti kali ni, kita terus pada benda yang memang boleh disahkan.',
      'Simple ja: cerita sebenar dulu, ayat marketing kemudian.',
      'Yang penting untuk post ni ialah benda yang memang betul-betul berlaku.',
    ],
    'Product Highlight': [
      'Untuk {subject}, kita terus tengok fungsi dan detail yang sudah confirm.',
      '{subject} ni senang dinilai kalau kita mula dari fakta dia dulu.',
      'Kalau mau check {subject}, mula dengan benda yang memang sudah disahkan.',
    ],
    Educational: [
      'Tip practical kali ni: tengok fungsi dulu sebelum tambah benda lain.',
      'Kalau mau planning lebih senang, mula dari apa yang ruang tu perlu buat.',
      'Satu langkah simple: check cara ruang digunakan sebelum pilih solution.',
    ],
    'Behind the Scenes': [
      'Untuk recap kali ni, kita terus pada moment yang memang berlaku.',
      'Belakang tabir ni simple ja — tunjuk apa yang team buat dan rasa masa tu.',
      'Kali ni kita kasi straight: ini antara moment sebenar team di luar rutin kerja.',
    ],
    'Customer Story': [
      'Untuk cerita customer ni, kita mula terus dari keperluan ruang.',
      'Yang paling penting ialah apa yang customer memang perlukan dari ruang tu.',
      'Sebelum fikir design, kita tengok dulu masalah sebenar yang customer mau selesaikan.',
    ],
    Promotion: [
      'Untuk offer ni, check detail yang sudah confirm dulu sebelum fikir next step.',
      'Promo ni senang dinilai bila harga, tempoh dan syarat memang jelas.',
      'Straight to the point: tengok dulu detail offer yang betul-betul ada.',
    ],
  },
}

const engagingOpenings = {
  'Brand Awareness': ['Kamurang pernah perasan ka, kadang cerita paling simple tu yang paling senang orang ingat? 👀', 'Kalau bukan cerita sebenar Brutti, apa lagi yang patut kami kongsi kan?', 'Cerita brand macam mana yang kamurang sebenarnya suka baca — formal atau yang real-real ja?'],
  'Product Highlight': ['Apa yang paling penting bila tengok {subject} — rupa dulu atau fungsi dia? 👀', 'Kalau tengok {subject}, detail mana satu yang kamu akan check dulu?', 'Kalau {subject} ada depan kamu sekarang, benda pertama yang kamu mau tahu apa?'],
  Educational: ['Kalau ruang rasa tidak ngam, kamu check fungsi dulu atau terus tambah barang? 👀', 'Pernah ka satu benda simple terus kasi planning ruang jadi lebih jelas?', 'Kalau boleh kasi ruang lebih senang guna dengan satu perubahan, kamu mula dari mana?'],
  'Behind the Scenes': ['Kamurang suka tengok hasil siap ja, atau mau juga sisi belakang tabir dia? 👀', 'Kalau bukan kerja harian, macam mana pula sisi team Brutti di belakang dia?', 'Mau tengok Brutti versi belakang tabir sikit ka? 👀'],
  'Customer Story': ['Kalau ruang kamu sendiri, apa benda pertama yang kamu mau kasi selesai? 👀', 'Pernah ka satu detail kecil terus ubah direction satu ruang?', 'Kalau kamu jadi customer ni, apa benda paling penting kamu mau ruang tu selesaikan?'],
  Promotion: ['Kalau ada promo, kamu jenis tengok harga dulu atau detail dia dulu? 👀', 'Offer nampak menarik, tapi apa benda pertama yang kamu akan confirm dulu?', 'Promo boleh tarik mata, tapi kamu akan check apa dulu sebelum decide?'],
}

const versionSupport = {
  story: {
    'Brand Awareness': ['Benda macam ni yang kami suka simpan sebagai sebahagian cerita Brutti.', 'Tidak payah kasi terlalu polished; cerita sebenar sudah cukup kuat.', 'Bila cerita datang dari benda sebenar, nada dia pun terus rasa lebih dekat.', 'Kami lagi suka cerita macam manusia daripada bunyi macam corporate statement.'],
    'Product Highlight': ['Kali ni kami cerita apa yang piece ni betul-betul bawa dalam kegunaan harian.', 'Detail yang confirm tu yang bikin cerita produk ni lebih masuk akal.', 'Bila fungsi jelas, senang sikit mau faham kenapa piece ni wujud.', 'Yang belum confirm memang kita tinggalkan dulu.'],
    Educational: ['Benda practical macam ni memang bagus simpan dalam kepala masa susun ruang.', 'Bila faham sebab di belakang satu tip, lagi senang mau apply ikut ruang sendiri.', 'Tidak semestinya semua ruang kena ikut formula yang sama.', 'Yang penting point dia boleh dipakai dalam situasi sebenar.'],
    'Behind the Scenes': ['Moment macam ni pun sebahagian daripada cerita team, bukan kerja siap saja.', 'Tidak perlu kasi nampak perfect sangat; cukup cerita apa yang memang berlaku.', 'Sisi team macam ni biasanya lagi natural bila dibiar simple.', 'Kadang moment luar rutin ni yang paling senang jadi kenangan.'],
    'Customer Story': ['Cerita customer macam ni lagi senang difahami bila mula dari keperluan sebenar.', 'Dari detail kecil tu barula direction keseluruhan mula nampak.', 'Keperluan customer tetap jadi pusat cerita, bukan ayat jualan.', 'Yang penting, cerita jangan lari daripada detail yang memang sudah disahkan.'],
    Promotion: ['Promo boleh tarik perhatian, tapi cerita dia tetap kena datang dari info yang betul.', 'Kalau ada syarat atau tempoh, benda tu memang kena ikut info yang sudah confirm.', 'Tidak payah kasi over; detail yang jelas sudah cukup.', 'Yang belum confirm memang tidak kita tambah sendiri.'],
  },
  relatable: {
    'Brand Awareness': ['Bila ayat rasa dekat dengan cara orang bercakap, cerita pun lebih senang masuk.', 'Kadang orang bukan mau dengar tagline panjang — dorang cuma mau tahu cerita sebenar.', 'Benda kecil yang real selalunya lagi senang orang ingat.', 'Sebab tu kali ni kita kasi santai ja.'],
    'Product Highlight': ['Bila compare pilihan, kita semua memang akan cari benda yang paling kena dengan cara guna sendiri.', 'Rupa penting, tapi function yang ngam tu biasanya bikin orang lebih yakin.', 'Tidak semua ruang perlukan benda yang sama, jadi detail memang elok check satu-satu.', 'Kalau detail dia ngam dengan keperluan, barula senang mau fikir next step.'],
    Educational: ['Lain ruang, lain perangai dia — memang tidak boleh copy-paste satu cara untuk semua.', 'Kalau function sudah jelas, planning pun kurang la trial and error.', 'Benda simple macam ni selalunya yang orang terlupa masa mula susun ruang.', 'Cuba tengok balik rutin sendiri, situ biasanya clue paling senang.'],
    'Behind the Scenes': ['Moment macam ni bikin team rasa lebih manusia, bukan kerja-kerja saja.', 'Ada masa ketawa, ada masa penat, semua tu memang sebahagian daripada team.', 'Di luar rutin biasa pun boleh nampak cara team connect sesama sendiri.', 'Yang best tu bila moment dia natural, tidak perlu plan sangat.'],
    'Customer Story': ['Lain orang, lain cara guna ruang — itu yang bikin direction tidak boleh copy-paste.', 'Kadang customer cuma sebut satu benda kecil, tapi dari situ semua jadi lebih jelas.', 'Bila masalah dia relatable, senang juga kita faham kenapa solution tu penting.', 'Yang ngam untuk satu rumah belum tentu ngam untuk rumah lain.'],
    Promotion: ['Promo bagus kalau memang benda tu sudah ada dalam list kamu.', 'Tidak payah rushing; compare dulu dengan apa yang kamu betul-betul perlukan.', 'Kalau detail jelas, senang juga mau decide tanpa rasa kena push.', 'Offer tu patut bantu keputusan, bukan bikin lagi pening.'],
  },
  practical: {
    'Brand Awareness': ['Pegang satu rule ja: fakta dulu, kemudian baru gaya.', 'Ayat boleh santai, tapi maksud asal jangan lari.', 'Tidak perlu tambah claim untuk kasi cerita nampak menarik.', 'Biar orang faham point utama tanpa pusing panjang.'],
    'Product Highlight': ['Tengok fungsi dia dulu, kemudian check sama ada detail tu match dengan ruang kamu.', 'Kalau detail belum confirm, jangan masukkan dalam keputusan dulu.', 'Practical punya cara: compare berdasarkan kegunaan sebenar.', 'Bila fakta sudah jelas, barula senang mau pilih.'],
    Educational: ['Mula dari function, kemudian tengok susunan yang paling masuk akal.', 'Ukur atau check keadaan ruang sebelum confirm apa-apa.', 'Tidak payah ubah semua sekali gus; satu langkah yang tepat pun boleh membantu.', 'Simpan point yang boleh terus digunakan, buang yang tidak relevan.'],
    'Behind the Scenes': ['Kasi simple: apa berlaku, siapa terlibat, dan moment apa yang paling terasa.', 'Tidak perlu tambah drama kalau moment sebenar sudah cukup.', 'Recap yang natural lagi senang orang baca sampai habis.', 'Fokus pada team moment, bukan ayat corporate.'],
    'Customer Story': ['Kenal pasti masalah ruang dulu sebelum fikir solution.', 'Detail customer yang sudah confirm jadi rujukan utama.', 'Elak andaian tentang cara customer guna ruang kalau dia tidak sebut.', 'Bila keperluan jelas, barula solution senang dinilai.'],
    Promotion: ['Check harga, tempoh dan syarat hanya kalau semua sudah disahkan.', 'Jangan tambah urgency yang tidak wujud.', 'Bandingkan offer dengan keperluan sebenar sebelum proceed.', 'Kalau ada detail kabur, check dengan team dulu.'],
  },
}

const engagingSupport = {
  'Brand Awareness': ['Bila cerita tu real, orang pun lebih senang mau masuk dalam cerita sama-sama.', 'Kita kasi ruang untuk orang respond, bukan sekadar baca lalu.'],
  'Product Highlight': ['Bukan pasal kasi produk nampak hebat sangat — lebih kepada bagi orang nampak kenapa detail dia berguna.', 'Bila orang boleh bayang cara guna, barula cerita produk tu terasa hidup.'],
  Educational: ['Kalau point tu senang apply, orang pun lebih mudah mau cuba sendiri.', 'Kita kasi orang satu benda untuk fikir, bukan long list yang bikin penat baca.'],
  'Behind the Scenes': ['Sisi macam ni bikin orang rasa dorang kenal team, bukan sekadar nampak brand.', 'Moment yang natural memang lebih senang orang react daripada ayat formal.'],
  'Customer Story': ['Bila masalah tu dekat dengan pengalaman orang lain, cerita pun lebih senang relate.', 'Kita bagi ruang untuk orang fikir, “eh, ruang aku pun macam ni juga.”'],
  Promotion: ['Kita bagi orang sebab untuk check detail, bukan paksa dorang terus beli.', 'Soalan yang jelas lagi useful daripada hype yang panjang.'],
}

const shortSupport = {
  'Brand Awareness': ['Cerita real lagi senang orang ingat.', 'Ayat santai, fakta tetap kena tepat.', 'Tidak payah kasi over.'],
  'Product Highlight': ['Fungsi dulu, baru rupa.', 'Check detail yang sudah confirm.', 'Yang belum confirm, jangan tambah.'],
  Educational: ['Mula dari fungsi.', 'Apply ikut keadaan ruang sendiri.', 'Simple, tapi boleh terus guna.'],
  'Behind the Scenes': ['Tunjuk moment sebenar.', 'Tidak perlu kasi terlalu polished.', 'Biar team story rasa natural.'],
  'Customer Story': ['Mula dari keperluan customer.', 'Lain ruang, lain solution.', 'Fakta customer jangan lari.'],
  Promotion: ['Check detail offer dulu.', 'Jangan tambah urgency sendiri.', 'Confirm sama team kalau ragu.'],
}

const closings = {
  'Brand Awareness': ['Kamurang paling suka tengok cerita Brutti yang macam ni juga ka? 👀', 'Kalau kamurang suka sisi Brutti yang lebih natural macam ni, kasi tau juga.', 'Ada lagi cerita macam ni yang kamu mau kami share?'],
  'Product Highlight': ['Kalau mau check detail piece ni, roger ja team Brutti.', 'Kalau sedang compare untuk ruang sendiri, mesej ja team dan kita check detail yang ada.', 'Mau tahu detail yang sudah confirm? Tanya ja team Brutti.'],
  Educational: ['Kalau berguna, save dulu. Nanti senang refer balik masa planning.', 'Cuba apply ikut ruang sendiri, lepas tu tengok mana yang paling ngam.', 'Kalau ada topik ruang lain yang kamu mau kami kupas, kasi tau ja.'],
  'Behind the Scenes': ['Kamurang suka juga ka tengok sisi belakang tabir macam ni? 👀', 'Kalau mau lebih banyak cerita team macam ni, kasi tau ja.', 'Yang ni satu lagi moment untuk simpan dalam cerita Brutti.'],
  'Customer Story': ['Kalau ruang kamu ada isu yang sama, boleh cerita sama team Brutti.', 'Lain ruang memang lain solution — kalau mau bincang, roger ja team.', 'Kalau sedang fikir pasal ruang sendiri, boleh mesej team dan kita tengok sama-sama.'],
  Promotion: ['Kalau mau confirm detail offer, mesej ja team Brutti.', 'Sebelum proceed, roger team dulu kalau ada detail yang kamu mau check.', 'Kalau offer ni masuk dalam list kamu, check detail terkini sama team dulu.'],
}

const engagingClosings = {
  'Brand Awareness': ['Kamurang mau lebih banyak cerita Brutti yang real-real macam ni ka? 👀', 'Kalau kena pilih, kamurang suka post brand yang santai atau yang formal?'],
  'Product Highlight': ['Kalau kamu yang pilih, detail mana satu paling penting untuk ruang kamu? 👀', 'Mau kami share lagi detail yang sudah confirm pasal piece ni?'],
  Educational: ['Kalau kamu cuba tip ni, benda pertama yang kamu mau ubah apa? 👀', 'Ada masalah ruang lain yang selalu bikin pening? Kasi tau ja.'],
  'Behind the Scenes': ['Kamurang mau lagi banyak sisi team macam ni ka? 👀', 'Next belakang tabir, kamurang mau tengok part apa pula?'],
  'Customer Story': ['Kalau ruang kamu ada isu macam ni, apa yang paling kamu mau selesaikan dulu? 👀', 'Cerita ruang kamu lain pula macam mana?'],
  Promotion: ['Kalau offer ni masuk list kamu, detail apa yang kamu mau check dulu? 👀', 'Mau kami bantu check detail yang sudah confirm?'],
}

const ctaClosings = {
  'Brand Awareness': ['Kalau kamurang suka content macam ni, kasi tau ja supaya kami boleh share lagi.', 'Share sama kawan yang suka tengok sisi sebenar brand tempatan.', 'Kalau ada cerita Brutti yang kamu mau tahu, drop ja di komen.'],
  'Product Highlight': ['Mesej ja team Brutti kalau mau check detail yang sudah confirm.', 'Kalau mau compare dengan ruang sendiri, roger team dan kita tengok sama-sama.', 'Simpan dulu post ni kalau piece ni masuk dalam shortlist kamu.', 'Kalau ada soalan pasal {subject}, tanya ja team Brutti.'],
  Educational: ['Save dulu kalau tip ni berguna untuk planning kamu.', 'Share sama orang yang tengah susun ruang juga.', 'Kalau mau kami kupas topik lain, tulis ja di komen.', 'Cuba apply dulu, nanti boleh refer balik post ni.'],
  'Behind the Scenes': ['Kalau mau lagi banyak cerita team, kasi tau ja di komen.', 'Share sama geng yang suka tengok behind-the-scenes macam ni.', 'Simpan moment ni sama-sama dalam cerita Brutti.', 'Next time mau tengok sisi team yang mana pula?'],
  'Customer Story': ['Kalau ruang kamu ada isu yang sama, mesej ja team Brutti.', 'Kalau mau bincang ruang sendiri, roger team dan kita tengok sama-sama.', 'Simpan cerita ni kalau kamu masih cari idea untuk ruang sendiri.', 'Ada masalah ruang yang hampir sama? Cerita ja sama team.'],
  Promotion: ['Kalau mau confirm detail offer, mesej ja team Brutti.', 'Simpan dulu kalau offer ni memang dalam radar kamu.', 'Kalau ada syarat yang kurang jelas, roger team dulu sebelum proceed.', 'Mau check detail terkini? Tanya ja team Brutti.'],
}

function fillTemplate(value, subject) {
  return sentence(String(value || '').replaceAll('{subject}', subject))
}

function takeDistinct(pool = [], start = 0, count = 1, subject = '') {
  const result = []
  for (let offset = 0; offset < pool.length * 2 && result.length < count; offset += 1) {
    const item = fillTemplate(pool[(start + offset) % pool.length], subject)
    if (item && !result.includes(item)) result.push(item)
  }
  return result
}

function unsupportedClaimsAreVerified(draft, verifiedText) {
  const facts = clean(verifiedText).toLowerCase()
  const tokens = draft.match(UNSUPPORTED_RE) || []
  return tokens.every((token) => facts.includes(token.toLowerCase()))
}

function uniqueLines(lines = []) {
  const unique = []
  lines.forEach((raw) => {
    const line = sentence(raw)
    if (line && !unique.includes(line)) unique.push(line)
  })
  return unique
}

function chooseCloser(type, subject, seed, version, mode, cycle) {
  if (mode === 'engaging') {
    const pool = engagingClosings[type]
    return fillTemplate(pool[(seed + version + cycle) % pool.length], subject)
  }
  if (mode === 'cta') {
    const pool = ctaClosings[type]
    return fillTemplate(pool[(seed + version + Math.max(1, cycle)) % pool.length], subject)
  }
  const pool = closings[type]
  return fillTemplate(pool[(seed + version) % pool.length], subject)
}

export function validateLiveNarrativeDraft(draft, verifiedText = '', mode = 'balanced') {
  const lines = String(draft || '').split('\n').map(clean).filter(Boolean)
  const min = 7
  const max = mode === 'shorten' ? 7 : 13
  if (lines.length < min || lines.length > max) return false
  if (mode === 'shorten' && lines.length !== 7) return false
  if (new Set(lines).size !== lines.length) return false
  if (/#(?:[\p{L}\p{N}_-]+)/u.test(draft)) return false
  if (!unsupportedClaimsAreVerified(draft, verifiedText)) return false
  return true
}

export function buildLiveNarrativeDraft(form = {}, mode = 'balanced', variation = 0, cycle = 0) {
  if (form.language === 'English' || form.language === 'BM + English') return ''

  const facts = splitFacts(form.brief)
  if (!facts.length) return ''

  const type = versionOpenings.story[form.type] ? form.type : 'Brand Awareness'
  const subject = subjectFor(form)
  const version = Math.max(0, Math.min(2, Number(variation || 0)))
  const style = VERSION_STYLES[version]
  const seed = stableIndex(`${form.title}|${form.product}|${form.brief}|${type}`, 1009)

  let openerPool = versionOpenings[style][type]
  if (mode === 'engaging' || mode === 'hook') openerPool = engagingOpenings[type]
  if (mode === 'shorten') openerPool = versionOpenings.practical[type]
  const openerShift = mode === 'hook' ? Math.max(1, Number(cycle || 0)) : mode === 'engaging' ? 1 : 0
  const opener = fillTemplate(openerPool[(seed + version * 2 + openerShift) % openerPool.length], subject)

  let supportPool = versionSupport[style][type]
  if (mode === 'engaging') supportPool = [...engagingSupport[type], ...versionSupport.relatable[type]]
  if (mode === 'shorten') supportPool = shortSupport[type]
  if (mode === 'hook') supportPool = [...versionSupport[style][type], ...engagingSupport[type]]
  if (mode === 'cta') supportPool = [...versionSupport[style][type], `Kalau point utama sudah jelas, next step biar orang pilih sendiri macam mana dorang mau respond.`]

  const supportStart = (seed + version * 3 + (mode === 'engaging' ? 2 : 0)) % supportPool.length
  const supportLines = takeDistinct(supportPool, supportStart, mode === 'shorten' ? 4 : 5, subject)
  const closer = chooseCloser(type, subject, seed, version, mode, cycle)

  if (mode === 'shorten') {
    const compact = uniqueLines([
      opener,
      ...facts.slice(0, 3),
      ...supportLines,
      closer,
    ])
    const result = compact.slice(0, 6).concat(compact.includes(closer) ? [] : [closer]).slice(0, 7)
    while (result.length < 7) {
      const next = supportLines.find((line) => !result.includes(line))
      if (!next) break
      result.splice(Math.max(1, result.length - 1), 0, next)
    }
    if (result[result.length - 1] !== closer) {
      if (result.length >= 7) result[result.length - 1] = closer
      else result.push(closer)
    }
    const draft = uniqueLines(result).slice(0, 7).join('\n')
    return validateLiveNarrativeDraft(draft, form.brief, mode) ? draft : ''
  }

  let lines
  if (style === 'story') {
    lines = [opener, ...facts.slice(0, 1), supportLines[0], ...facts.slice(1), supportLines[1], supportLines[2], closer]
  } else if (style === 'relatable') {
    lines = [opener, supportLines[0], ...facts.slice(0, 2), supportLines[1], ...facts.slice(2), supportLines[2], closer]
  } else {
    lines = [opener, ...facts.slice(0, 2), supportLines[0], supportLines[1], ...facts.slice(2), supportLines[2], closer]
  }

  if (mode === 'engaging') {
    lines = [opener, supportLines[0], ...facts.slice(0, 1), supportLines[1], ...facts.slice(1), supportLines[2], closer]
  } else if (mode === 'hook') {
    lines = [opener, ...facts.slice(0, 1), supportLines[0], ...facts.slice(1), supportLines[1], closer]
  } else if (mode === 'cta') {
    lines = [...lines.slice(0, -1), supportLines[3] || supportLines[1], closer]
  }

  const unique = uniqueLines(lines)
  const target = mode === 'engaging' ? Math.min(11, Math.max(9, facts.length + 6)) : Math.min(11, Math.max(8, facts.length + 5))
  let cursor = 3
  while (unique.length < target && cursor < supportLines.length) {
    const line = sentence(supportLines[cursor])
    if (line && !unique.includes(line)) unique.splice(Math.max(1, unique.length - 1), 0, line)
    cursor += 1
  }

  if (unique[unique.length - 1] !== closer) {
    const existingCloser = unique.indexOf(closer)
    if (existingCloser >= 0) unique.splice(existingCloser, 1)
    unique.push(closer)
  }

  const result = unique.slice(0, 13).join('\n')
  return validateLiveNarrativeDraft(result, form.brief, mode) ? result : ''
}
