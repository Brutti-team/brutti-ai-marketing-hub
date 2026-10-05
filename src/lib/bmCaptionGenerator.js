// Local Bahasa Malaysia captions for Content Studio. No network, no paid model.
// Primary voice: Brutti Soul Master (src/Brutti_Soul_MasterDoc.md).
// §2 Bahasa — loghat Sabah is the identity, not a garnish:
//   bah, la, ni, tu, kan, sia, bikin, ngam, antam, teda, tinguk, kasi.
//   Golden examples (§10) also write nda, jak, and "bikin".
// §2 Nada — macam kawan, first person kami/sia, bukan salesman, ayat pendek.
// §2 Humor — gelak diri sendiri, lebih kurang satu variasi dalam tiga.
// §6 Hook — babak atau nama, bukan "New Product Alert" / "Promo Hebat".
// §9 — setiap kapsyen ada loghat. "bah" duduk sekali pada ajakan.
// Founder stories (gaji, pandemik, Faznur, wallet) stay out of product captions.
// Blank price, material, size and colour are skipped.

const HUMOUR = {
  wardrobe: [
    'Baju yang "nanti saya pakai" selalunya yang rebut tempat kan.',
    'Sia pun pernah buka almari, pastu terus tutup balik.',
    'Kalau semua almari sama, bilik pun nampak sama jak.',
  ],
  storage: [
    'Barang yang "tadi ada" selalunya duduk di tempat yang nda disangka.',
    'Cari satu benda kecil kadang makan masa lebih lama dari masak kan.',
    'Rak yang semua orang beli sama, rumah pun nampak sama jak.',
  ],
  display: [
    'Paparan terlalu penuh, mata terus penat kan.',
    'Kalau semua barang menjerit, teda yang kedengaran.',
    'Kedai yang paparan dia sama dengan jiran, susah orang ingat bah.',
  ],
  kiosk: [
    'Kaunter berselerak, pelanggan pun segan nak datang dekat kan.',
    'Kotak terbuka di tepi kaunter dah nampak letih.',
    'Meja kosong tampal nama, orang pun rasa jak.',
  ],
  bespoke: [
    'Ruang pelik sikit memang nda muat barang katalog.',
    'Paksa ruang ikut perabot, akhirnya perabot yang menang kan.',
    'Barang yang semua rumah ada, ruang kamu pula yang kena mengalah.',
  ],
  general: [
    'Ruang kemas selalunya mula dari barang yang dipegang setiap hari.',
    'Ubah semua sekali memang penat. Satu sudut dulu pun dah lega kan.',
    'Gambar orang lain cantik. Hidup kamu lain jak.',
  ],
}

const CTA = {
  highlight: [
    'Nak tinguk, mesej kami bah.',
    'WhatsApp kami, cerita sikit pasal ruang kamu bah.',
    'Kalau antam nak tanya, mesej ja bah.',
  ],
  promo: [
    'Kalau ngam, WhatsApp kami bah.',
    'WhatsApp jak, kami balas bila sempat bah.',
    'DM kami kalau yang ni ngam bah.',
  ],
  customer: [
    'Mesej kami, kami dengar dulu bah.',
    'Cerita pada kami pasal ruang kamu bah.',
    'Hantar gambar ruang kamu, kami tinguk sama-sama bah.',
  ],
  behind: [
    'Nak tinguk hasil, mesej kami bah.',
    'Kalau nak yang ikut ruang kamu, WhatsApp kami bah.',
    'DM kami, kami cerita proses dia bah.',
  ],
  tips: [
    'Simpan dulu tip ni bah, kalau berguna.',
    'Nak kami tinguk ruang kamu, mesej jak bah.',
    'WhatsApp kami kalau nak susun sama-sama bah.',
  ],
}

const CTA_SHORT = {
  highlight: ['Mesej kami bah.', 'WhatsApp kami bah.', 'Mesej ja bah.'],
  promo: ['WhatsApp kami bah.', 'WhatsApp jak bah.', 'DM kami bah.'],
  customer: ['Mesej, kami dengar dulu bah.', 'Cerita pada kami bah.', 'Hantar gambar ruang kamu bah.'],
  behind: ['Mesej kami bah.', 'WhatsApp kami bah.', 'DM kami bah.'],
  tips: ['Simpan tip ni bah.', 'Mesej jak bah.', 'WhatsApp kami bah.'],
}

export const CAPTION_GOALS = [
  { id: 'highlight', label: 'Sorotan produk' },
  { id: 'promo', label: 'Promosi' },
  { id: 'customer', label: 'Projek atau maklum balas pelanggan' },
  { id: 'behind', label: 'Di sebalik tabir' },
  { id: 'tips', label: 'Tip' },
]

export const VARIATION_COUNT = 3

const HASHTAG_SKIP = new Set([
  'tip', 'tips', 'untuk', 'dan', 'yang', 'dari', 'satu', 'the', 'and', 'promo', 'projek', 'produk', 'custom',
])

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function isBlankField(value) {
  const text = clean(value)
  if (!text) return true
  if (/^(?:-|—|–|n\/?a|na|null|undefined|none|nil|tiada|tbd|tba|kosong|blank|unknown|tidak ada)$/i.test(text)) return true
  if (/^saved kiosk or project reference$/i.test(text)) return true
  return false
}

function readField(value) {
  const text = clean(value)
  return isBlankField(text) ? '' : text
}

function tidyNote(note) {
  const text = readField(note)
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function categoryKind(category = '') {
  const value = clean(category).toLowerCase()
  if (!value) return 'general'
  if (value.includes('wardrobe') || value.includes('almari')) return 'wardrobe'
  if (value.includes('display') || value.includes('papar')) return 'display'
  if (value.includes('kiosk')) return 'kiosk'
  if (value.includes('storage') || value.includes('rak') || value.includes('stor')) return 'storage'
  if (value.includes('bespoke') || value.includes('custom')) return 'bespoke'
  return 'general'
}

function kindFrom(name = '', category = '') {
  const named = clean(name).toLowerCase()
  if (/wardrobe|almari/.test(named)) return 'wardrobe'
  if (/display|paparan|pastry|shelf/.test(named)) return 'display'
  if (/kiosk/.test(named)) return 'kiosk'
  if (/shelv|shoe|cloth|storage|console/.test(named)) return 'storage'
  if (/bespoke|custom/.test(named)) return 'bespoke'
  if (/rack|rak/.test(named)) return 'storage'
  return categoryKind(category)
}

function paragraphs(parts) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join('\n\n')
}

function hashtagsFor(name, category) {
  const kind = kindFrom(name, category)
  const tags = ['#Brutti', '#PerabotSabah', '#BuatanSabah']
  const extra = {
    wardrobe: '#Almari',
    display: '#Paparan',
    kiosk: '#KioskCustom',
    storage: '#Storan',
    bespoke: '#CustomSabah',
    general: '#CustomSabah',
  }[kind]
  tags.push(extra)
  const token = clean(name).split(/\s+/)[0].replace(/[^A-Za-z0-9]/g, '')
  if (token.length >= 3 && token.length <= 24 && !HASHTAG_SKIP.has(token.toLowerCase())) {
    const tag = `#${token}`
    if (!tags.some((item) => item.toLowerCase() === tag.toLowerCase())) tags.push(tag)
  }
  return tags.slice(0, 5).join(' ')
}

function spokenSpecs(specs) {
  const parts = []
  for (const spec of specs) {
    if (spec.key === 'price') parts.push(`Harga dia ${spec.value}.`)
    if (spec.key === 'material') parts.push(`Kami guna ${spec.value}.`)
    if (spec.key === 'dimensions') parts.push(`Saiz dia ${spec.value}.`)
    if (spec.key === 'colour') parts.push(`Warna dia ${spec.value}.`)
  }
  return parts.join(' ')
}

function specsFromProduct(product = {}) {
  const specs = []
  const price = readField(product.price)
  const material = readField(product.material)
  const dimensions = readField(product.dimensions || product.dimension)
  const colour = readField(product.colour || product.color)
  if (price) specs.push({ key: 'price', value: price })
  if (material) specs.push({ key: 'material', value: material })
  if (dimensions) specs.push({ key: 'dimensions', value: dimensions })
  if (colour) specs.push({ key: 'colour', value: colour })
  return specs
}

const HIGHLIGHT = {
  wardrobe: [
    [
      'Baju bertindih sampai susah nak cari kan.',
      (name) => `${name} ni untuk bilik yang perlu tempat gantung, dan tempat lipat. Kami bikin custom kat Sabah.`,
    ],
    [
      (name) => `${name} ni, untuk bilik yang almari dia nda muat tutup.`,
      HUMOUR.wardrobe[1],
    ],
    [
      'Baju banyak, tapi nda mau almari yang penuh sesak.',
      (name) => `${name} kami bikin kat Sabah. Sebelah untuk gantung, laci untuk yang dilipat. Bukan almari yang semua rumah dapat sama.`,
    ],
  ],
  storage: [
    [
      'Barang yang teda tempat tetap, memang senang hilang.',
      (name) => `${name} ni untuk rumah atau kedai yang nak setiap benda ada sudut dia. Rak ni kami bikin custom kat Sabah, ikut barang kamu.`,
    ],
    [
      (name) => `${name} ngam bila ruang kecil, tapi barang yang kena simpan tetap banyak.`,
      HUMOUR.storage[1],
    ],
    [
      'Rumah atau kedai nampak sesak sebab barang bertindih kan?',
      (name) => `${name} kasi asing supaya nampak. Kami bikin rak ni sendiri kat Sabah.`,
    ],
  ],
  display: [
    [
      'Paparan kedai terlalu penuh, pelanggan nda tau nak tinguk yang mana.',
      (name) => `${name} ni untuk susun barang supaya yang penting nampak dulu. Kami bikin kat Sabah, ikut cara kedai kamu berniaga.`,
    ],
    [
      (name) => `${name} ni untuk kaunter atau dinding kedai yang nak tunjuk barang dengan jelas.`,
      HUMOUR.display[1],
    ],
    [
      'Kedai kecil pun boleh nampak kemas, asalkan paparan dia nda berebut.',
      (name) => `${name} kami bikin kat Sabah. Bukan rak pajang yang semua kedai nampak sama.`,
    ],
  ],
  kiosk: [
    [
      'Bisnes yang keluar jualan, kaunter dia kena nampak kemas dari jauh kan.',
      (name) => `${name} ni kami bikin custom kat Sabah, ikut cara kamu layan pelanggan.`,
    ],
    [
      'Jual di luar premis? Jangan kasi barang tertimbus dalam kotak.',
      (name) => `${name} untuk susunan tu. ${HUMOUR.kiosk[1]}`,
    ],
    [
      (name) => `${name} bukan meja kosong yang kami kasi nama jak.`,
      'Dia kaunter yang kami bikin untuk bisnes kamu. Custom, kat Sabah.',
    ],
  ],
  bespoke: [
    [
      'Ada ruang yang barang kedai memang nda muat.',
      (name) => `${name} ni untuk situasi tu. Kami dengar dulu macam mana kamu guna ruang tu, baru bikin kat Sabah.`,
    ],
    [
      'Kalau ruang kamu lain dari rumah biasa, jangan paksa dia ikut katalog.',
      (name) => `${name} boleh ikut ruang tu. ${HUMOUR.bespoke[1]}`,
    ],
    [
      (name) => `${name} ni, bila barang katalog dah nda cukup.`,
      'Kamu dah tau apa yang perlu. Kami siapkan kat Sabah.',
    ],
  ],
  general: [
    [
      'Sebelum ubah susunan, tinguk dulu barang mana yang kamu pegang setiap hari.',
      (name) => `Untuk ${name} ni, kami cadang ikut cara kamu hidup. Custom kat Sabah, bukan ikut gambar orang lain.`,
    ],
    [
      (name) => `${name}. Satu sudut dulu jak. Jangan ubah semua sekali.`,
      HUMOUR.general[2],
    ],
    [
      (name) => `${name} ni lagi senang bila barang harian ada tempat tetap.`,
      'Yang jarang keluar, biar di tepi. Kami boleh bikin susunan tu kat Sabah.',
    ],
  ],
}

const PROMO = {
  wardrobe: [
    (name) => `Nak almari yang ikut cara kamu simpan baju, bukan yang kamu kena paksa muat? ${name} ni kami bikin custom kat Sabah.`,
    (name) => `${name} ni untuk bilik yang baju dia dah nda muat. Bukan salah bilik kan. Almari dia yang tak cukup.`,
    (name) => `Kalau ${name} ngam dengan bilik kamu, kami bikin dia kat Sabah ikut baju kamu.`,
  ],
  storage: [
    (name) => `Nak rak yang ikut barang kamu, bukan rak yang semua orang beli sama? ${name} ni kami bikin custom kat Sabah.`,
    (name) => `${name} ni untuk yang dah penat tinguk barang berlonggok, tapi nda tau nak mula dari mana.`,
    (name) => `Rumah atau kedai kamu perlu rak yang ikut barang, bukan ikut katalog kan? ${name} ni kami bikin kat Sabah.`,
  ],
  display: [
    (name) => `Nak paparan yang pelanggan nampak terus, tanpa mata pening? ${name} ni kami bikin custom kat Sabah.`,
    (name) => `${name} ni untuk kedai yang dah susun berkali-kali, tapi masih nampak sesak kan.`,
    (name) => `${name} kalau ngam untuk kedai kamu, kami bikin dia kat Sabah.`,
  ],
  kiosk: [
    (name) => `Nak kaunter yang ikut cara kamu jualan? ${name} ni kami bikin custom kat Sabah.`,
    (name) => `${name} ni untuk bisnes yang dah bosan sewa meja, dengan kotak berlonggok di tepi kan.`,
    (name) => `${name} ngam dengan cara kamu berniaga? Kami bikin kiosk tu kat Sabah.`,
  ],
  bespoke: [
    (name) => `Nak sesuatu yang ikut ruang kamu, bukan ikut katalog? ${name} ni kami bikin kat Sabah.`,
    (name) => `${name} ni untuk ruang yang barang biasa nda masuk. Katalog dah menyerah kan.`,
    (name) => `${name} kalau macam yang kamu cari, kerja custom dia kami bikin kat Sabah.`,
  ],
  general: [
    (name) => `${name} ni, kalau ada kena dengan ruang kamu, kami bikin custom kat Sabah.`,
    (name) => `${name} ni untuk yang nak susunan lebih kemas, tanpa teka-teki kan.`,
    (name) => `Nak bincang ${name}? Kami kat Sabah. Cerita jak macam mana ruang tu.`,
  ],
}

const CUSTOMER_NOTE = [
  (name) => `Ada yang guna ${name} ni, dan dia cerita pada kami.`,
  (name) => `${name} ni, pelanggan yang ceritakan macam mana dia duduk dalam ruang dia.`,
  (name) => `Kami simpan cerita ni pasal ${name}. Dia datang dari ruang sebenar kan.`,
]

const CUSTOMER_OPEN = {
  wardrobe: [
    (name) => `Nak almari macam ${name} ni untuk bilik kamu? Bagi tahu baju apa yang kena ada tempat. Gantung atau lipat, dua-dua kami boleh ikut.`,
    (name) => `${name} ni selalunya mula bila seseorang tunjuk bilik dia. Bukan bila kami tolak katalog kan.`,
    (name) => `Almari macam ${name} lain rumah, lain keperluan. Yang sama, kami bikin dia kat Sabah.`,
  ],
  storage: [
    (name) => `Nak rak macam ${name} ni? Cerita dulu barang apa yang kena duduk di situ. Rumah dan kedai, lain susunan.`,
    (name) => `${name} ni selalunya mula bila pelanggan tunjuk sudut yang berlonggok. Katalog nda nampak sudut tu kan.`,
    (name) => `Rak macam ${name} nda sama untuk setiap orang. Kami bikin dia kat Sabah, ikut barang kamu.`,
  ],
  display: [
    (name) => `Nak paparan macam ${name} ni untuk kedai kamu? Bagi tahu barang apa yang kamu nak pelanggan tinguk dulu.`,
    (name) => `${name} ni selalunya mula dari kaunter kedai yang sebenar. Bukan dari gambar kedai orang kan.`,
    (name) => `Paparan macam ${name} ikut cara kedai tu jual. Kami bikin dia kat Sabah.`,
  ],
  kiosk: [
    (name) => `Nak kaunter macam ${name} ni? Cerita macam mana kamu biasa layan pelanggan. Dari situ baru kami bentuk dia.`,
    (name) => `${name} ni mula bila pemilik bisnes cerita pasal jualan dia. Bukan salin gerai orang kan.`,
    (name) => `Kiosk macam ${name}, lain bisnes, lain susunan. Kami bikin kat Sabah ikut cara kamu jualan.`,
  ],
  bespoke: [
    (name) => `Nak bikin sesuatu macam ${name} ni? Cerita apa yang ruang tu kena tampung. Yang wajib, dan yang boleh tinggal, asingkan.`,
    (name) => `${name} ni mula dari ruang yang nda cukup dengan barang sedia kedai.`,
    (name) => `Kerja macam ${name}, kami dengar dulu. Lepas jelas, baru bikin kat Sabah.`,
  ],
  general: [
    (name) => `Nak sesuatu untuk ${name} ni? Cerita macam mana kamu guna ruang tu setiap hari.`,
    (name) => `${name} ni lagi jelas bila kami nampak ruang sebenar. Tekaan selalunya meleset kan.`,
    (name) => `Setiap permintaan pasal ${name} kami layan satu-satu. Dari Sabah jak.`,
  ],
}

const BEHIND = {
  wardrobe: [
    [
      (name) => `Sebelum ${name} ni sampai ke bilik, kami bikin dia kat Sabah.`,
      'Bukan almari siap yang kami tampal nama.',
    ],
    [
      (name) => `${name} yang nampak siap dalam gambar, belakang dia ada kerja custom.`,
      'Kami semak apa yang nda kena, baru dia keluar. Kadang nampak kecil kan, tapi pelanggan yang rasa.',
    ],
    [
      (name) => `Orang nampak ${name} yang dah siap. Kami nampak masa dia masih papan.`,
      'Itu kerja harian kami kat Sabah.',
    ],
  ],
  storage: [
    [
      (name) => `Sebelum ${name} ni dipasang, kami bikin dia kat bengkel Sabah.`,
      'Bukan rak siap yang kami letak logo.',
    ],
    [
      (name) => `Gambar ${name} yang kemas tu, ada orang semak sebelum dia keluar kan.`,
      'Kami bikin dia sendiri. Bukan ambil dari luar, lepas tu letak nama.',
    ],
    [
      (name) => `${name} ni nda datang dari kontena.`,
      'Dia keluar dari kerja kami kat Sabah. Satu rak, satu permintaan.',
    ],
  ],
  display: [
    [
      (name) => `${name} yang berdiri di kedai, asalnya kami bikin kat Sabah.`,
      'Bukan rak pajang yang dibeli, lepas tu letak nama.',
    ],
    [
      (name) => `Sebelum ${name} ni tunjuk barang orang, kami tinguk dulu dia selesa dipandang.`,
      'Kerja tu kat Sabah. Paparan yang menyakitkan mata, kami nda lepaskan.',
    ],
    [
      (name) => `Pelanggan nampak ${name} yang dah berisi. Kami ingat rangka dia masa belum siap kan.`,
      'Custom, dari Sabah.',
    ],
  ],
  kiosk: [
    [
      (name) => `${name} ni kami siapkan kat Sabah sebelum dia ikut kamu keluar jualan.`,
      'Bukan gerai tempahan yang kami tampal logo.',
    ],
    [
      (name) => `Masa ${name} masih di bengkel, kami dah bayang pelanggan berdiri di depan kan.`,
      'Baru kami siapkan. Nanti di luar, dia kena berfungsi, bukan cantik dalam gambar jak.',
    ],
    [
      (name) => `${name} nda sama setiap satu. Cara jualan kamu pun nda sama.`,
      'Sebab tu kami bikin dia kat Sabah.',
    ],
  ],
  bespoke: [
    [
      (name) => `${name} ni teda dalam katalog siap. Kami bikin bila permintaan tu sampai.`,
      'Kami mula dari ruang. Kerja dia kat Sabah.',
    ],
    [
      (name) => `Kerja ${name} banyak masa dia masih perbincangan kan.`,
      'Bila dah jelas, baru kami bikin. Itu biasa bagi kami.',
    ],
    [
      (name) => `Orang nampak ${name} yang dah jadi. Kami ingat soalan pertama: ruang ni untuk apa?`,
      'Dari situ baru kami bikin kat Sabah.',
    ],
  ],
  general: [
    [
      (name) => `Pasal ${name} ni, kami bikin custom kat Sabah.`,
      'Bukan barang siap yang ditampal nama.',
    ],
    [
      (name) => `Sebelum ${name} keluar, ada orang yang ukur, potong, dan semak kan.`,
      'Kerja tu kat Sabah. Gambar yang kemas tu ada proses di belakang.',
    ],
    [
      (name) => `${name} nampak mudah dalam gambar.`,
      'Belakang dia ada keputusan kecil yang kami bikin satu-satu.',
    ],
  ],
}

const TIPS = {
  wardrobe: [
    [
      (name) => `Sebelum isi ${name} ni, asingkan baju gantung dengan baju lipat.`,
      'Dari situ baru nampak dia lega, atau masih sesak.',
    ],
    [
      (name) => `Baju yang dipakai setiap minggu, letak di tempat senang capai dalam ${name}.`,
      'Yang setahun sekali, jangan rebut tempat depan. Nanti kamu yang penat kan.',
    ],
    [
      (name) => `Pintu almari tersangkut sebab baju menolak dari dalam? ${name} pun susah nak bantu.`,
      'Keluarkan dulu yang dah nda dipakai. Baru susun semula.',
    ],
  ],
  storage: [
    [
      (name) => `Sebelum isi ${name} ni, kumpul barang yang sejenis.`,
      'Rak terus nampak lebih lapang. Kamu nda payah gali untuk cari satu benda.',
    ],
    [
      (name) => `Barang harian, letak di tempat tangan terus sampai. Kat ${name} ni.`,
      'Yang jarang dipakai, atas sekali pun nda mengapa kan.',
    ],
    [
      (name) => `${name} lagi berguna bila satu paras, satu tugas.`,
      'Jangan campur aduk. Cuba satu jenis barang dulu jak.',
    ],
  ],
  display: [
    [
      'Barang yang orang selalu tanya, jangan sorok la.',
      (name) => `Kat ${name} ni, kasi duduk depan. Yang lain, tepi sikit.`,
      'Pelanggan nda payah cari-cari.',
    ],
    [
      (name) => `Paparan ${name} ni yang sesak, orang lalu jak.`,
      'Bagi sikit ruang kosong di keliling barang. Dia nampak lebih jelas kan.',
    ],
    [
      (name) => `Pilih satu barang utama untuk ${name} ni.`,
      'Yang lain sokong dia. Kalau semua sama kuat, teda yang diingat.',
    ],
  ],
  kiosk: [
    [
      (name) => `Kat ${name} ni, pastikan pelanggan nampak barang tanpa menjenguk.`,
      'Laluan depan kaunter, biar jelas.',
    ],
    [
      (name) => `Sebelum bawa ${name} keluar, susun dulu barang yang nak dijual hari tu.`,
      'Yang tinggal, biar dalam kotak. Jangan kasi kaunter nampak macam stor kan.',
    ],
    [
      (name) => `${name} lagi senang dijaga kalau kamu dah cuba buka dan tutup sekali sebelum keluar.`,
      'Nanti di luar, nda perlu panik.',
    ],
  ],
  bespoke: [
    [
      (name) => `Sebelum minta ${name} ni, senaraikan apa yang wajib muat, dan apa yang boleh tinggal.`,
      'Perbualan dengan kami terus lebih jelas.',
    ],
    [
      (name) => `Bawa contoh barang yang akan diletakkan bila nak bincang ${name}.`,
      'Gambar ruang pun membantu. Tekaan selalunya meleset kan.',
    ],
    [
      (name) => `Untuk ${name}, cerita hari biasa ruang tu. Bukan hari raya jak.`,
      'Hari biasa yang tunjuk susunan yang patut.',
    ],
  ],
  general: [
    [
      (name) => `Untuk ${name} ni, mula dengan barang yang kamu pegang setiap hari.`,
      'Kasi dia tempat tetap. Yang jarang keluar, jangan duduk di depan.',
    ],
    [
      (name) => `Sebelum ubah ${name} ni, tinguk satu hari biasa dulu.`,
      'Barang mana yang dicari, barang mana yang hanya lalu. Dari situ baru susun.',
    ],
    [
      (name) => `${name} nda perlu diubah serentak.`,
      'Pilih satu sudut. Kemaskan. Baru pergi ke sudut seterusnya kan.',
    ],
  ],
}

const IG_LEAD = {
  highlight: {
    wardrobe: [
      (name) => `Baju bertindih, susah cari kan?\n\n${name} ni.\nTempat gantung, tempat lipat.`,
      (name) => `${name} ni.\n\nAlmari nda muat tutup? Sia pun pernah tutup balik.`,
      (name) => `Tempat gantung. Tempat lipat.\n\n${name} ni, kami bikin kat Sabah.`,
    ],
    storage: [
      (name) => `Barang hilang sebab teda tempat?\n\n${name} ni, untuk rumah atau kedai.`,
      (name) => `${name} ni.\n\nRuang kecil. Barang tetap banyak kan.`,
      (name) => `Barang bertindih kan?\n\n${name} kasi asing supaya nampak.`,
    ],
    display: [
      (name) => `Paparan penuh, mata pening.\n\n${name} ni susun yang penting dulu.`,
      (name) => `${name} ni.\n\nUntuk kaunter atau dinding kedai.`,
      (name) => `Paparan nda payah berebut.\n\n${name}, custom kat Sabah.`,
    ],
    kiosk: [
      (name) => `Kaunter kena nampak dari jauh kan.\n\n${name} ni, kami bikin kat Sabah.`,
      (name) => `${name} ni.\n\nBarang nampak. Bukan tertimbus.`,
      (name) => `Bukan meja kosong jak.\n\n${name} untuk bisnes kamu.`,
    ],
    bespoke: [
      (name) => `Barang kedai nda muat?\n\n${name} ni.`,
      (name) => `${name} ni.\n\nIkut ruang kamu, bukan katalog.`,
      (name) => `Katalog dah nda cukup.\n\n${name} kami bikin kat Sabah.`,
    ],
    general: [
      (name) => `${name} ni.\n\nTinguk barang yang kamu pegang setiap hari dulu.`,
      (name) => `Satu sudut dulu jak.\n\n${name}.`,
      (name) => `${name} ni.\n\nBarang harian ada tempat tetap.`,
    ],
  },
  promo: {
    wardrobe: [
      (name) => `Nak almari ikut cara kamu simpan baju?\n\n${name} ni.`,
      (name) => `${name} ni.\n\nBaju dah nda muat. Bukan salah bilik kan.`,
      (name) => `${name} ngam dengan bilik kamu?\n\nKami bikin ikut baju kamu.`,
    ],
    storage: [
      (name) => `Nak rak ikut barang kamu?\n\n${name} ni.`,
      (name) => `${name} ni.\n\nUntuk barang yang dah berlonggok kan.`,
      (name) => `Rak ikut barang, bukan katalog.\n\n${name} ni.`,
    ],
    display: [
      (name) => `Nak paparan yang terus nampak?\n\n${name} ni.`,
      (name) => `${name} ni.\n\nKedai masih nampak sesak kan?`,
      (name) => `${name} ni.\n\nKami bikin kat Sabah.`,
    ],
    kiosk: [
      (name) => `Nak kaunter ikut cara kamu jualan?\n\n${name} ni.`,
      (name) => `${name} ni.\n\nDah bosan sewa meja kan?`,
      (name) => `${name} ngam dengan bisnes kamu?`,
    ],
    bespoke: [
      (name) => `Nak ikut ruang kamu?\n\n${name} ni.`,
      (name) => `${name} ni.\n\nBarang biasa nda masuk. Katalog dah menyerah.`,
      (name) => `${name} ni.\n\nKerja custom kat Sabah.`,
    ],
    general: [
      (name) => `${name} ni.\n\nCustom kat Sabah, kalau ada kena dengan ruang kamu.`,
      (name) => `${name} ni.\n\nNak susunan lebih kemas kan.`,
      (name) => `Nak bincang ${name}?\n\nCerita jak.`,
    ],
  },
  customer: {
    wardrobe: [
      (name) => `Nak almari macam ${name} ni?\n\nBagi tahu baju apa yang kena tempat.`,
      (name) => `${name} ni.\n\nMula dari bilik sebenar, bukan katalog.`,
      (name) => `Lain rumah, lain almari.\n\n${name} kami bikin kat Sabah.`,
    ],
    storage: [
      (name) => `Nak rak macam ${name} ni?\n\nCerita barang apa yang kena tempat.`,
      (name) => `${name} ni.\n\nMula dari sudut yang berlonggok kan.`,
      (name) => `Lain orang, lain rak.\n\n${name} kami bikin kat Sabah.`,
    ],
    display: [
      (name) => `Nak paparan macam ${name} ni?\n\nCerita barang yang kamu jual.`,
      (name) => `${name} ni.\n\nMula dari kaunter kedai.`,
      (name) => `Ikut cara kedai kamu jual.\n\n${name} ni.`,
    ],
    kiosk: [
      (name) => `Nak kaunter macam ${name} ni?\n\nCerita cara kamu jualan.`,
      (name) => `${name} ni.\n\nMula dari bisnes kamu kan.`,
      (name) => `Lain bisnes, lain kiosk.\n\n${name}.`,
    ],
    bespoke: [
      (name) => `Nak bikin macam ${name} ni?\n\nCerita apa yang ruang tu kena tampung.`,
      (name) => `${name} ni.\n\nUntuk ruang yang barang kedai nda muat.`,
      (name) => `Kami dengar dulu.\n\nBaru bikin ${name}.`,
    ],
    general: [
      (name) => `${name} ni.\n\nCerita macam mana kamu guna ruang tu.`,
      (name) => `${name} ni.\n\nLebih jelas bila kami nampak ruangnya kan.`,
      (name) => `${name} ni.\n\nKami layan satu-satu.`,
    ],
  },
  behind: {
    wardrobe: [
      (name) => `${name} ni.\n\nKami bikin kat Sabah. Bukan almari tampal nama.`,
      (name) => `Belakang gambar ${name} ni, ada kerja custom.`,
      (name) => `${name} masa masih papan.\n\nItu yang kami nampak dulu kan.`,
    ],
    storage: [
      (name) => `${name} ni.\n\nDari bengkel kami kat Sabah.`,
      (name) => `${name} disemak dulu sebelum keluar kan.`,
      (name) => `${name} ni nda datang dari kontena.`,
    ],
    display: [
      (name) => `${name} ni.\n\nKami bikin kat Sabah untuk kedai.`,
      (name) => `Sebelum ${name} tunjuk barang, kami tinguk dia selesa dipandang.`,
      (name) => `Rangka ${name} dulu.\n\nBarang kemudian kan.`,
    ],
    kiosk: [
      (name) => `${name} ni.\n\nDisiapkan kat Sabah sebelum keluar jualan.`,
      (name) => `Kami bayang pelanggan berdiri di depan ${name} kan.`,
      (name) => `${name} nda sama setiap satu.`,
    ],
    bespoke: [
      (name) => `${name} ni.\n\nTeda dalam katalog siap.`,
      (name) => `${name} banyak masa dia masih perbincangan kan.`,
      (name) => `Soalan pertama untuk ${name}:\n\nRuang ni untuk apa?`,
    ],
    general: [
      (name) => `${name} ni.\n\nCustom, kat Sabah.`,
      (name) => `Ada orang yang siapkan ${name} sebelum dia keluar kan.`,
      (name) => `${name} nampak mudah.\n\nBelakang dia ada keputusan kecil.`,
    ],
  },
  tips: {
    wardrobe: [
      (name) => `Asingkan baju gantung dan baju lipat dulu.\n\nBaru isi ${name} ni.`,
      (name) => `Baju mingguan, tempat senang capai.\n\nDalam ${name} kan.`,
      (name) => `Pintu almari tersangkut?\n\nKeluarkan yang dah nda dipakai. ${name} pun lega.`,
    ],
    storage: [
      (name) => `Kumpul barang sejenis dulu.\n\nBaru isi ${name} ni.`,
      (name) => `Barang harian, tempat tangan terus sampai.\n\nKat ${name}.`,
      (name) => `Satu paras, satu tugas.\n\n${name} ni terus berguna.`,
    ],
    display: [
      (name) => `Barang yang selalu ditanya, jangan sorok la.\n\n${name} ni, kasi duduk depan.`,
      (name) => `Jangan sesakkan ${name} ni.\n\nBagi dia ruang kosong sikit.`,
      (name) => `Satu barang utama pada ${name}.\n\nYang lain sokong kan.`,
    ],
    kiosk: [
      (name) => `Kat ${name} ni, barang patut nampak tanpa menjenguk.`,
      (name) => `Susun barang jualan dulu, sebelum bawa ${name} keluar kan.`,
      (name) => `Cuba buka dan tutup ${name} sekali sebelum keluar.`,
    ],
    bespoke: [
      (name) => `Senaraikan apa yang wajib muat, sebelum minta ${name} ni.`,
      (name) => `Bawa contoh barang bila nak bincang ${name} kan.`,
      (name) => `Cerita hari biasa ruang tu, bila nak ${name}.`,
    ],
    general: [
      (name) => `Untuk ${name} ni, mula dengan barang yang dipegang setiap hari.`,
      (name) => `Sebelum ubah ${name}, tinguk satu hari biasa dulu kan.`,
      (name) => `${name} nda perlu diubah serentak.\n\nSatu sudut dulu jak.`,
    ],
  },
}

const TIKTOK_LINE = {
  wardrobe: 'Untuk susun baju. Kami bikin kat Sabah.',
  storage: 'Untuk barang yang selalu dicari kan.',
  display: 'Untuk paparan kedai yang lebih jelas.',
  kiosk: 'Kaunter custom. Kami bikin kat Sabah.',
  bespoke: 'Kami bikin ikut ruang kamu.',
  general: 'Ikut cara ruang tu diguna.',
}

function blocksFor(goal, kind, name, variation) {
  if (goal === 'highlight') return HIGHLIGHT[kind][variation].map((line) => (typeof line === 'function' ? line(name) : line))
  if (goal === 'promo') return [PROMO[kind][variation](name)]
  if (goal === 'customer') return [CUSTOMER_OPEN[kind][variation](name)]
  if (goal === 'behind') return BEHIND[kind][variation].map((line) => (typeof line === 'function' ? line(name) : line))
  return TIPS[kind][variation].map((line) => (typeof line === 'function' ? line(name) : line))
}

function promoPriceLine(name, price, variation) {
  return [
    `${name} ni. Harga dia ${price}.`,
    `Kalau ${name} yang kamu mau, harga dia ${price}.`,
    `Harga ${name} ni, ${price}.`,
  ][variation]
}

export function generateBmCaptions({ product = null, topic = '', goal = 'highlight', note = '', variation = 0 } = {}) {
  const record = product || {}
  const name = readField(record.name || record.productName) || readField(topic)
  const index = ((Number(variation) || 0) % VARIATION_COUNT + VARIATION_COUNT) % VARIATION_COUNT
  const selectedGoal = CAPTION_GOALS.some((item) => item.id === goal) ? goal : 'highlight'

  if (!name) {
    return {
      facebook: '',
      instagram: '',
      tiktok: '',
      variation: index,
      structureId: 'empty',
      usedFacts: [],
    }
  }

  const kind = kindFrom(name, readField(record.category))
  const specs = specsFromProduct(record)
  const price = specs.find((item) => item.key === 'price')
  const noteText = tidyNote(note)
  const specText = spokenSpecs(selectedGoal === 'promo' && price ? specs.filter((item) => item.key !== 'price') : specs)
  const blocks = blocksFor(selectedGoal, kind, name, index)
  const facebookLead = selectedGoal === 'promo' && price
    ? [promoPriceLine(name, price.value, index), blocks[0]]
    : blocks
  const customerLead = selectedGoal === 'customer' && noteText
    ? [CUSTOMER_NOTE[index](name)]
    : facebookLead

  const facebook = paragraphs([
    ...customerLead,
    noteText,
    specText,
    selectedGoal === 'customer' && noteText ? 'Kalau ruang kamu lain, cerita jak. Kami bikin custom kat Sabah.' : '',
    CTA[selectedGoal][index],
  ])

  const igLead = IG_LEAD[selectedGoal][kind][index](name)
  const igPrice = selectedGoal === 'promo' && price ? promoPriceLine(name, price.value, index) : ''
  const instagram = paragraphs([
    igPrice || igLead,
    selectedGoal === 'promo' && price ? igLead : '',
    noteText,
    specText,
    CTA_SHORT[selectedGoal][index],
    hashtagsFor(name, readField(record.category)),
  ])

  const tiktokSecond = noteText || specText || TIKTOK_LINE[kind]
  const tiktokHooks = [
    `${name} ni.`,
    `${name} ni kan.`,
    `Untuk ruang kamu, ${name} ni.`,
  ]
  const tiktok = [tiktokHooks[index], tiktokSecond, CTA_SHORT[selectedGoal][index]].filter(Boolean).join('\n')

  return {
    facebook,
    instagram,
    tiktok,
    variation: index,
    structureId: `${selectedGoal}-${kind}-${index}`,
    usedFacts: specs.map((item) => item.key),
  }
}
