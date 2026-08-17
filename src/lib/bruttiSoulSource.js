import soulMasterDoc from '../Brutti_Soul_MasterDoc.md?raw'

function section(number) {
  const pattern = new RegExp(`## ${number}\\.[\\s\\S]*?(?=\\n---\\n\\n## |$)`, 'i')
  return soulMasterDoc.match(pattern)?.[0] || ''
}

export const BRUTTI_SOUL = Object.freeze({
  full: soulMasterDoc,
  origin: section(1),
  voice: section(2),
  values: section(3),
  redLines: section(4),
  product: section(5),
  craft: section(6),
  pillars: section(7),
  vision: section(8),
  checklist: section(9),
  examples: section(10),
})

export const SOUL_SOURCE_LABEL = 'Brutti Soul Master · 3,436 real posts · verified by Lukman'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function stableIndex(value, length) {
  if (!length) return 0
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function sentence(value = '') {
  const text = clean(value).replace(/[.!?]+$/g, '')
  if (!text) return ''
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}

function verifiedFacts(value = '') {
  const normalized = clean(value)
  if (!normalized) return []
  return normalized
    .split(/(?<=[.!?])\s+|\s*;\s*|\n+/)
    .map(sentence)
    .filter(Boolean)
    .slice(0, 6)
}

function signals(text = '') {
  const value = clean(text).toLowerCase()
  return {
    origin: /asal|origin|anniversary|ulang tahun|2020|pkp|pandemik|car wash|survive|mula|bermula/.test(value),
    artisan: /artisan|tukang|gaji|payroll|craft|kilang|workshop|maruah|production/.test(value),
    founder: /lukman|faznur|founder|bini|isteri|wife|menyesal|syukur|terharu|silap|salah|belajar/.test(value),
    transparent: /telus|transparent|breakdown|kos|cost|defect|delay|silap|salah|betulkan|masalah|mistake/.test(value),
    naming: /nama|name|dangsanak|lexi|eunoia|adudu|borneo|sabah/.test(value),
    material: /pallet|repurposed|plywood|kayu|besi|metal|material/.test(value),
    builders: /builder|interior|design|build|renovation|ubahsuai/.test(value),
    funny: /lucu|kelakar|funny|ketawa|gelak|hint|whatsapp|babak/.test(value),
    community: /komuniti|community|charity|remaja|usahawan|berkongsi rezeki/.test(value),
    customer: /customer|client|pelanggan|order|ruang|homeowner|premis/.test(value),
  }
}

function soulFacts(sourceSignals, subject) {
  const lines = []

  if (sourceSignals.origin && BRUTTI_SOUL.origin) {
    lines.push('Kalau cerita pasal perjalanan Brutti, kami memang bermula masa PKP — dari hobi woodworking dan metalworking jadi jalan untuk survive.')
  }
  if (sourceSignals.artisan && BRUTTI_SOUL.values) {
    lines.push('Bagi kami, mereka bukan sekadar pekerja kilang. Mereka artisan, dan maruah orang yang bikin setiap piece tu memang penting.')
  }
  if (sourceSignals.transparent && BRUTTI_SOUL.values) {
    lines.push('Kalau ada benda yang silap atau tidak jadi macam plan, kami lebih rela cerita terus dan kasi betulkan daripada pura-pura perfect.')
  }
  if (sourceSignals.founder && BRUTTI_SOUL.voice) {
    lines.push('Cerita macam ni paling ngam bila kami cakap sebagai orang yang betul-betul lalui benda tu sendiri, bukan sebagai “pihak Brutti”.')
  }
  if (sourceSignals.naming && BRUTTI_SOUL.product && subject) {
    lines.push(`${subject} bukan sekadar nama kalau memang ada cerita sebenar di belakang dia — itu yang bikin satu piece rasa lebih personal.`)
  }
  if (sourceSignals.material && BRUTTI_SOUL.product) {
    lines.push('Untuk material, kami ikut keperluan sebenar project — Brutti memang biasa kerja dengan kayu pallet atau repurposed wood, plywood dan kadang-kadang besi.')
  }
  if (sourceSignals.builders && BRUTTI_SOUL.vision) {
    lines.push('Direction Brutti sekarang makin luas juga, dari furniture sampai interior design + build melalui Brutti Builders.')
  }
  if (sourceSignals.funny && BRUTTI_SOUL.voice) {
    lines.push('Kalau babak tu memang lucu, cerita ja macam biasa. Humor Brutti paling menjadi bila kami sendiri pun boleh ketawa sama kejadian tu.')
  }
  if (sourceSignals.community && BRUTTI_SOUL.values) {
    lines.push('Bila ada ruang untuk berkongsi rezeki atau kasi manfaat balik pada orang lain, itu memang sebahagian daripada cara kami fikir pasal Brutti.')
  }
  if (sourceSignals.customer && BRUTTI_SOUL.product) {
    lines.push('Kami lebih suka mula dari cerita ruang dan keperluan sebenar customer, baru fikir apa solution yang ngam.')
  }

  return lines.slice(0, 3)
}

const hooks = {
  'Brand Awareness': [
    'Ada cerita yang kalau kami fikir balik, rasa sayang kalau tidak dikongsi. 👀',
    'Bukan semua post kena mula dengan produk. Kadang benda yang betul-betul berlaku tu lagi kuat.',
    'Hari-hari ada benda kecil berlaku di Brutti yang sebenarnya layak jadi cerita.',
    'Kalau mau cerita pasal Brutti, kami lebih suka mula dari apa yang betul-betul jadi hari tu.',
  ],
  'Product Highlight': [
    'Kalau nampak piece ni, jangan tengok rupa ja dulu. Ada sebab kenapa dia dibikin begitu. 👀',
    'Kali ni kami mau cerita pasal satu piece dari sudut fungsi dan cerita dia.',
    'Nama satu piece mungkin simple, tapi selalunya ada sebab kenapa dia wujud.',
    'Sebelum cerita pasal cantik ka tidak, kami mau tengok dulu kenapa piece ni diperlukan.',
  ],
  Educational: [
    'Ada benda simple yang boleh kasi ruang jauh lebih senang digunakan. 👀',
    'Sebelum pilih furniture, cuba tinguk dulu apa yang betul-betul berlaku dalam ruang tu setiap hari.',
    'Tip ni simple ja, tapi memang berguna kalau kamu sedang plan ruang.',
    'Kadang solution paling ngam bukan yang paling fancy — yang penting dia kena dengan cara ruang tu digunakan.',
  ],
  'Behind the Scenes': [
    'Yang orang nampak selalunya hasil akhir ja. Di belakang tu, banyak benda berlaku satu-satu. 👀',
    'Sebelum satu piece siap, memang ada banyak tangan dan keputusan kecil di belakang dia.',
    'Nah, kali ni kami kasi nampak sikit cerita belakang tabir.',
    'Kalau nampak hasil siap tu senang, cuba tinguk dulu cerita sebelum dia sampai ke tahap tu.',
  ],
  'Customer Story': [
    'Setiap customer datang dengan cerita ruang yang lain-lain. Itu yang kami suka dengar dulu. 👀',
    'Kadang satu detail kecil dari customer tu yang bagi direction paling jelas.',
    'Kami suka mula dari cara customer betul-betul guna ruang, bukan dari template.',
    'Bila customer cerita apa yang dia perlukan, dari situ baru kami nampak arah sebenar satu project.',
  ],
  Promotion: [
    'Kalau offer tu memang ngam dengan apa yang kamu cari, barula dia ada makna.',
    'Kami tidak mau hard sell sangat. Tengok dulu benda ni memang sesuai ka dengan keperluan kamu. 👀',
    'Promo tu bonus. Yang penting detail dia betul dan kegunaan dia memang kena.',
  ],
}

const support = {
  'Brand Awareness': [
    'Bagi kami, Brutti ni pasal bisnes sebenar, orang sebenar dan cerita yang ada sebab untuk dikongsi.',
    'Kami lebih suka cerita benda yang memang berlaku daripada kasi nampak semua benda perfect.',
    'Kalau detail belum confirm, kami memang tidak kasi tambah sendiri.',
  ],
  'Product Highlight': [
    'Kami tengok fungsi dan keperluan dulu, baru rupa dan style dia.',
    'Kalau piece tu ada cerita nama, orang atau proses, itu yang bikin dia lebih berjiwa.',
    'Detail yang belum confirm memang kena check dulu dengan team.',
  ],
  Educational: [
    'Tidak payah complicated sangat kalau fungsi dia sudah jelas.',
    'Lain ruang, lain cara dia — tidak semestinya semua kena ikut formula sama.',
    'Cara kamu guna ruang hari-hari tu sebenarnya clue paling senang.',
  ],
  'Behind the Scenes': [
    'Banyak keputusan kecil berlaku sebelum satu piece nampak siap.',
    'Kalau ada artisan dalam cerita, sebut orangnya bila nama dan latar tu memang diketahui.',
    'Kami share proses sebab cerita di belakang hasil tu pun penting.',
  ],
  'Customer Story': [
    'Keperluan sebenar customer tetap jadi starting point.',
    'Kami tengok rutin dan fungsi ruang dulu sebelum fikir benda lain.',
    'Bila detail sudah jelas, baru senang susun direction yang ngam.',
  ],
  Promotion: [
    'Harga, tempoh dan syarat memang kena ikut info yang sudah confirm.',
    'Kalau ada benda belum jelas, roger ja team dulu.',
    'Tidak payah rushing kalau masih mau compare pilihan.',
  ],
}

const ctas = [
  'Kalau ada cerita atau ruang yang kamu mau bincang, roger ja team Brutti.',
  'Kalau ada detail yang kamu mau check, mesej ja team. Kami kasi tengok sama-sama.',
  'Kalau kamu pernah lalui benda yang sama, kasi tau juga — mana tau ada cerita yang ngam untuk dikongsi.',
  'Kalau mau tahu cerita atau detail dia lebih lanjut, mesej ja kami.',
]

function professionalise(line) {
  return line
    .replace(/tinguk/gi, 'lihat')
    .replace(/\bja\b/gi, 'sahaja')
    .replace(/\bmau\b/gi, 'mahu')
    .replace(/\bngam\b/gi, 'sesuai')
    .replace(/roger ja/gi, 'mesej')
    .replace(/tidak payah/gi, 'tidak perlu')
    .replace(/kasi /gi, '')
}

function enforceSoulShape(lines) {
  const unique = []
  for (const line of lines) {
    const next = clean(line)
    if (!next || unique.includes(next)) continue
    unique.push(next)
  }

  const limited = unique.slice(0, 13)
  let emojiSeen = 0
  return limited.map((line) => line.replace(/\p{Extended_Pictographic}/gu, (emoji) => {
    emojiSeen += 1
    return emojiSeen <= 3 ? emoji : ''
  }))
}

export function buildSoulDraft(form, mode = 'balanced', variation = 0) {
  const product = form.product && form.product !== 'General / No Product' ? form.product : ''
  const subject = product || clean(form.title) || 'piece ni'
  const type = hooks[form.type] ? form.type : 'Brand Awareness'
  const facts = verifiedFacts(form.brief)
  const sourceSignals = signals(`${form.title} ${form.brief} ${product} ${type}`)
  const seed = stableIndex(`${form.title}|${form.brief}|${product}|${type}|${mode}|${variation}|${BRUTTI_SOUL.full.length}`, 997)

  const pool = hooks[type]
  let hookIndex = (seed + Math.abs(variation)) % pool.length
  if (mode === 'hook') hookIndex = (hookIndex + 1) % pool.length
  let hook = pool[hookIndex]
  if (mode === 'engaging') hook = `Kamu pernah fikir ka pasal benda ni? ${hook}`
  if (mode === 'casual') hook = `Nah, ${hook.charAt(0).toLowerCase()}${hook.slice(1)}`

  let source = soulFacts(sourceSignals, subject)
  let supportLines = [...source, ...support[type]]

  if (mode === 'professional') {
    hook = professionalise(hook)
    source = source.map(professionalise)
    supportLines = [...source, ...support[type].map(professionalise)]
  }

  const target = mode === 'shorten' ? 7 : 10
  const candidate = [hook, ...facts, ...supportLines]
  const body = []
  for (const line of candidate) {
    if (!clean(line) || body.includes(clean(line))) continue
    body.push(clean(line))
    if (body.length >= target - 1) break
  }

  const ctaOffset = mode === 'cta' ? 1 : 0
  let cta = ctas[(seed + variation + ctaOffset) % ctas.length]
  if (mode === 'professional') cta = professionalise(cta)
  body.push(cta)

  return enforceSoulShape(body)
    .join('\n')
    .replace(/#[\p{L}\p{N}_-]+/gu, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const daily = [
  {
    title: 'Cerita orang di sebalik satu piece',
    idea: 'Hari ni fokus pada artisan atau orang sebenar di belakang satu hasil Brutti.',
    formType: 'Behind the Scenes',
    product: 'General / No Product',
    target: 'Local craft audience',
    objective: 'Trust + human story',
    suggested: 'Artisan story',
    reason: 'Soul Master letak maruah artisan sebagai nilai utama dan salah satu story pillar paling kuat.',
    direction: 'Pilih satu cerita sebenar tentang artisan Brutti. Masukkan nama, apa yang dia buat, satu detail real dari proses atau latar yang memang diketahui, dan kenapa kerja dia penting. Jangan reka detail peribadi.',
  },
  {
    title: 'Kenapa piece ni wujud?',
    idea: 'Ambil satu furniture atau project sebenar dan cerita sebab di sebalik dia.',
    formType: 'Product Highlight',
    product: 'General / No Product',
    target: 'Homeowner / custom furniture',
    objective: 'Product story + awareness',
    suggested: 'Story behind the piece',
    reason: 'Soul Master tekankan cerita di sebalik satu piece: proses, sebab client order dan momen serah.',
    direction: 'Pilih satu piece sebenar. Cerita masalah atau keperluan ruang, kenapa solution itu dipilih, dan satu detail proses atau momen serah yang memang benar. Kalau nama piece ada cerita yang sah, boleh masukkan.',
  },
  {
    title: 'Momen jujur di sebalik Brutti',
    idea: 'Gunakan satu benda yang team pelajari, silap, syukur atau rasa terharu — asalkan benar.',
    formType: 'Brand Awareness',
    product: 'General / No Product',
    target: 'Brutti followers',
    objective: 'Brand affinity',
    suggested: 'Founder / team moment',
    reason: 'Soul Master tekankan momen vulnerable founder dan radical transparency sebagai cerita yang paling Brutti.',
    direction: 'Pilih satu momen sebenar dari Lukman, Faznur atau team: keputusan susah, benda yang dipelajari, kesilapan, syukur atau sesuatu yang tidak jadi macam plan. Terangkan apa berlaku dan apa yang dipelajari tanpa tambah drama.',
  },
  {
    title: 'Babak harian yang layak jadi content',
    idea: 'Cari satu kejadian lucu atau relatable yang memang berlaku di workshop, installation atau office.',
    formType: 'Behind the Scenes',
    product: 'General / No Product',
    target: 'Community audience',
    objective: 'Engagement + relatability',
    suggested: 'Daily funny moment',
    reason: 'Soul Master jadikan babak lucu harian sebagai salah satu empat story pillars utama.',
    direction: 'Ambil satu babak lucu atau relatable yang betul-betul berlaku. Mulakan dengan scene itu, kemudian sambung dengan point Brutti yang relevan. Humor boleh self-deprecating, tapi jangan reka kejadian.',
  },
  {
    title: 'Cerita benda yang tidak perfect',
    idea: 'Kalau ada masalah sebenar minggu ni, jadikan ia content transparency — bukan tutup cerita.',
    formType: 'Brand Awareness',
    product: 'General / No Product',
    target: 'Existing followers',
    objective: 'Trust + transparency',
    suggested: 'What went wrong / lesson',
    reason: 'Soul Master jelas bahawa reputasi dibina melalui cara Brutti handle kesilapan secara terbuka.',
    direction: 'Pilih satu perkara sebenar yang silap, lambat, susah atau perlu diperbetulkan. Cerita apa jadi, bagaimana team handle dan apa yang dipelajari. Jangan cari drama kalau memang tiada isu sebenar.',
  },
  {
    title: 'Cerita di sebalik nama satu piece',
    idea: 'Kalau satu produk ada nama dengan makna sebenar, itu boleh jadi cerita hari ni.',
    formType: 'Product Highlight',
    product: 'General / No Product',
    target: 'Sabah / local identity audience',
    objective: 'Brand identity + product recall',
    suggested: 'Product naming story',
    reason: 'Soul Master tekankan nama piece sebagai sebahagian daripada jiwa dan identiti Sabah/Borneo Brutti.',
    direction: 'Pilih produk yang memang ada kisah nama. Cerita maksud nama, siapa yang bagi nama atau kaitannya dengan Sabah/Borneo jika fakta itu diketahui. Jangan reka maksud nama yang belum disahkan.',
  },
  {
    title: 'Dari last option untuk survive',
    idea: 'Ambil satu momen semasa dan kaitkan secara jujur dengan perjalanan Brutti yang bermula masa PKP.',
    formType: 'Brand Awareness',
    product: 'General / No Product',
    target: 'Brutti community',
    objective: 'Origin + brand affinity',
    suggested: 'Origin / milestone',
    reason: 'Soul Master merekod Brutti bermula 11 Oktober 2020 sebagai last option untuk survive selepas car wash terpaksa tutup.',
    direction: 'Gunakan satu momen semasa yang benar sebagai pintu masuk untuk cerita origin Brutti. Jangan ulang sejarah panjang; pilih satu perbandingan yang relevan antara dulu dan sekarang.',
  },
  {
    title: 'Apa maksud craft bagi Brutti?',
    idea: 'Gunakan satu hasil atau proses semasa untuk tunjuk kenapa Brutti tidak mahu hilang sentuhan tangan.',
    formType: 'Behind the Scenes',
    product: 'General / No Product',
    target: 'Craft / design audience',
    objective: 'Craftsmanship + differentiation',
    suggested: 'Craft red line',
    reason: 'Soul Master letak craftsmanship sebagai red line: Brutti tidak mahu jadi mass-production sampai hilang sentuhan tangan.',
    direction: 'Pilih satu proses sebenar yang menunjukkan sentuhan tangan, keputusan artisan atau custom detail. Cerita proses itu dahulu, kemudian kaitkan dengan prinsip craft Brutti tanpa bunyi seperti manifesto.',
  },
  {
    title: 'Material yang dipilih ikut project',
    idea: 'Buat content educational pasal cara Brutti fikir tentang material berdasarkan kegunaan sebenar.',
    formType: 'Educational',
    product: 'General / No Product',
    target: 'Homeowner / project audience',
    objective: 'Education + trust',
    suggested: 'Material story',
    reason: 'Soul Master nyatakan Brutti menggunakan pallet/repurposed wood, plywood dan kadang besi, fleksibel ikut client request.',
    direction: 'Pilih satu project sebenar dan terangkan material yang betul-betul digunakan serta sebab pemilihannya jika diketahui. Jangan generalise satu material sebagai terbaik untuk semua keadaan.',
  },
  {
    title: 'Brutti bukan mau jadi paling besar',
    idea: 'Gunakan satu cerita semasa untuk tunjuk direction Brutti: jujur, berjiwa dan angkat artisan tempatan.',
    formType: 'Brand Awareness',
    product: 'General / No Product',
    target: 'Brutti community',
    objective: 'Vision + brand affinity',
    suggested: 'Vision / Brutti Builders',
    reason: 'Soul Master letak visi Brutti sebagai craft Sabah yang jujur dan bermakna, termasuk perkembangan ke Brutti Builders.',
    direction: 'Kaitkan satu perkara semasa yang benar dengan direction Brutti sebagai craft Sabah yang jujur dan berjiwa. Jika relevan, boleh sentuh perkembangan interior design + build melalui Brutti Builders. Elakkan manifesto kosong; mesti ada cerita real hari itu.',
  },
]

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - start) / 86400000)
}

export function getSoulRecommendation(date = new Date()) {
  return daily[dayOfYear(date) % daily.length]
}

export const soulSourceReady = Boolean(
  BRUTTI_SOUL.full
  && BRUTTI_SOUL.origin
  && BRUTTI_SOUL.voice
  && BRUTTI_SOUL.values
  && BRUTTI_SOUL.product
  && BRUTTI_SOUL.craft
  && BRUTTI_SOUL.pillars
  && BRUTTI_SOUL.vision
  && BRUTTI_SOUL.checklist
  && BRUTTI_SOUL.examples
)
