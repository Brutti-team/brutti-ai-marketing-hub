// Local Bahasa Malaysia captions for Content Studio.
// Tone source: Brutti Soul Master and the Brand Library voice card —
// short lines, first person, Sabah small-business speech, light humour.
// No network and no paid model. Blank product fields are skipped.
// "bah" sits in one highlight closing only, so it stays occasional.

const HUMOUR = {
  wardrobe: [
    'Baju yang "nanti saya pakai" selalunya yang rebut tempat.',
    'Kami pun pernah buka almari, pastu terus tutup balik.',
    'Kalau semua almari sama, bilik pun nampak sama ja.',
  ],
  storage: [
    'Barang yang "tadi ada" selalunya duduk di tempat yang tak disangka.',
    'Cari satu benda kecil kadang makan masa lebih lama dari masak.',
    'Rak yang semua orang beli sama, rumah pun nampak sama.',
  ],
  display: [
    'Paparan terlalu penuh, mata terus penat.',
    'Kalau semua barang menjerit, tak ada yang kedengaran.',
    'Kedai yang paparan dia sama dengan jiran, susah orang ingat.',
  ],
  kiosk: [
    'Kaunter berselerak, pelanggan pun segan nak datang dekat.',
    'Kotak terbuka di tepi kaunter dah nampak letih.',
    'Meja kosong tampal nama, orang pun rasa.',
  ],
  bespoke: [
    'Ruang pelik sikit memang nda muat barang katalog.',
    'Paksa ruang ikut perabot, akhirnya perabot yang menang.',
    'Barang yang semua rumah ada, ruang kamu pula yang kena mengalah.',
  ],
  general: [
    'Ruang kemas selalunya mula dari barang yang dipegang setiap hari.',
    'Ubah semua sekali memang penat. Satu sudut dulu pun dah lega.',
    'Gambar orang lain cantik. Hidup kamu lain.',
  ],
}

const CTA = {
  highlight: [
    'Nak tinguk, mesej kami ja.',
    'WhatsApp kami, cerita sikit pasal ruang kamu.',
    'Kalau nak tanya, mesej kami bah.',
  ],
  promo: [
    'Nak tanya, WhatsApp kami.',
    'WhatsApp je, kami balas bila sempat.',
    'DM kami kalau yang ni ngam.',
  ],
  customer: [
    'Mesej kami, kami dengar dulu.',
    'Cerita pada kami pasal ruang kamu.',
    'Hantar gambar ruang kamu, kami tinguk sama-sama.',
  ],
  behind: [
    'Nak tinguk hasil, mesej kami.',
    'Kalau nak yang ikut ruang kamu, WhatsApp kami.',
    'DM kami, kami cerita proses dia.',
  ],
  tips: [
    'Simpan dulu kalau tip ni berguna.',
    'Nak kami tinguk ruang kamu, mesej je.',
    'WhatsApp kami kalau nak susun sama-sama.',
  ],
}

const CTA_SHORT = {
  highlight: ['Mesej kami ja.', 'WhatsApp kami.', 'Mesej kami bah.'],
  promo: ['WhatsApp kami.', 'WhatsApp je.', 'DM kami.'],
  customer: ['Mesej, kami dengar dulu.', 'Cerita pada kami.', 'Hantar gambar ruang kamu.'],
  behind: ['Mesej kami.', 'WhatsApp kami.', 'DM kami.'],
  tips: ['Simpan dulu.', 'Mesej je.', 'WhatsApp kami.'],
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
      'Baju bertindih sampai susah nak cari. Rasa macam tu?',
      (name) => `${name} ni untuk bilik yang perlu tempat gantung, dan tempat lipat. Kami buat custom di Sabah.`,
    ],
    [
      (name) => `${name} untuk bilik yang almari dia dah tak muat tutup.`,
      HUMOUR.wardrobe[1],
    ],
    [
      'Baju banyak, tapi tak nak almari yang penuh sesak.',
      (name) => `${name} kami buat di Sabah. Sebelah untuk gantung, laci untuk yang dilipat. Bukan almari yang semua rumah dapat sama.`,
    ],
  ],
  storage: [
    [
      'Barang yang tak ada tempat tetap, memang senang hilang.',
      (name) => `${name} untuk rumah atau kedai yang nak setiap benda ada sudut dia. Rak ni kami buat custom di Sabah, ikut barang kamu.`,
    ],
    [
      (name) => `${name} ngam bila ruang kecil, tapi barang yang kena simpan tetap banyak.`,
      HUMOUR.storage[1],
    ],
    [
      'Rumah atau kedai nampak sesak sebab barang bertindih?',
      (name) => `${name} tolong asingkan supaya nampak. Kami buat rak ni sendiri di Sabah.`,
    ],
  ],
  display: [
    [
      'Paparan kedai terlalu penuh, pelanggan tak tahu nak tinguk yang mana.',
      (name) => `${name} untuk susun barang supaya yang penting nampak dulu. Kami buat di Sabah, ikut cara kedai kamu berniaga.`,
    ],
    [
      (name) => `${name} untuk kaunter atau dinding kedai yang nak tunjuk barang dengan jelas.`,
      HUMOUR.display[1],
    ],
    [
      'Kedai kecil pun boleh nampak kemas, asalkan paparan dia tak berebut.',
      (name) => `${name} kami buat di Sabah. Bukan rak pajang yang semua kedai nampak sama.`,
    ],
  ],
  kiosk: [
    [
      'Bisnes yang keluar jualan, kaunter dia kena nampak kemas dari jauh.',
      (name) => `${name} kami buat custom di Sabah, ikut cara kamu layan pelanggan.`,
    ],
    [
      'Jual di luar premis? Jangan bagi barang tertimbus dalam kotak.',
      (name) => `${name} bantu susunan tu. ${HUMOUR.kiosk[1]}`,
    ],
    [
      (name) => `${name} bukan meja kosong yang kami beri nama.`,
      'Dia kaunter yang kami buat untuk bisnes kamu. Custom, di Sabah.',
    ],
  ],
  bespoke: [
    [
      'Ada ruang yang barang kedai memang tak muat.',
      (name) => `${name} untuk situasi tu. Kami dengar dulu macam mana kamu guna ruang tu, baru buat di Sabah.`,
    ],
    [
      'Kalau ruang kamu lain dari rumah biasa, jangan paksa dia ikut katalog.',
      (name) => `${name} boleh ikut ruang tu. ${HUMOUR.bespoke[1]}`,
    ],
    [
      (name) => `${name}, bila barang katalog dah tak cukup.`,
      'Kamu dah tahu apa yang perlu. Kami siapkan di Sabah.',
    ],
  ],
  general: [
    [
      'Sebelum ubah susunan, tinguk dulu barang mana yang kamu pegang setiap hari.',
      (name) => `Untuk ${name}, kami cadang ikut cara kamu hidup. Custom di Sabah, bukan ikut gambar orang lain.`,
    ],
    [
      (name) => `${name}. Satu sudut dulu. Jangan ubah semua sekali.`,
      HUMOUR.general[2],
    ],
    [
      (name) => `${name} lagi senang bila barang harian ada tempat tetap.`,
      'Yang jarang keluar, biar di tepi. Kami boleh buat susunan tu di Sabah.',
    ],
  ],
}

const PROMO = {
  wardrobe: [
    (name) => `Nak almari yang ikut cara kamu simpan baju, bukan yang kamu kena paksa muat? ${name} kami buat custom di Sabah.`,
    (name) => `${name} untuk bilik yang baju dia dah tak muat. Bukan salah bilik. Almari dia yang tak cukup.`,
    (name) => `Kalau ${name} ngam dengan bilik kamu, kami buat dia di Sabah ikut baju kamu.`,
  ],
  storage: [
    (name) => `Nak rak yang ikut barang kamu, bukan rak yang semua orang beli sama? ${name} kami buat custom di Sabah.`,
    (name) => `${name} untuk yang dah penat tengok barang berlonggok, tapi tak tahu nak mula dari mana.`,
    (name) => `Rumah atau kedai kamu perlukan rak yang ikut barang, bukan ikut katalog? ${name} kami buat di Sabah.`,
  ],
  display: [
    (name) => `Nak paparan yang pelanggan nampak terus, tanpa mata pening? ${name} kami buat custom di Sabah.`,
    (name) => `${name} untuk kedai yang dah susun berkali-kali, tapi masih nampak sesak.`,
    (name) => `${name} kalau menarik untuk kedai kamu, kami buat dia di Sabah.`,
  ],
  kiosk: [
    (name) => `Nak kaunter yang ikut cara kamu jualan? ${name} kami buat custom di Sabah.`,
    (name) => `${name} untuk bisnes yang dah bosan sewa meja, dengan kotak berlonggok di tepi.`,
    (name) => `${name} ngam dengan cara kamu berniaga? Kami buat kiosk tu di Sabah.`,
  ],
  bespoke: [
    (name) => `Nak sesuatu yang ikut ruang kamu, bukan ikut katalog? ${name} kami buat di Sabah.`,
    (name) => `${name} untuk ruang yang barang biasa tak masuk. Katalog dah menyerah.`,
    (name) => `${name} kalau macam yang kamu cari, kerja custom dia kami buat di Sabah.`,
  ],
  general: [
    (name) => `${name}, kalau ada kena dengan ruang kamu, kami buat custom di Sabah.`,
    (name) => `${name} untuk yang nak susunan lebih kemas, tanpa teka-teki.`,
    (name) => `Nak bincang ${name}? Kami di Sabah. Cerita je macam mana ruang tu.`,
  ],
}

const CUSTOMER_NOTE = [
  (name) => `Ada yang guna ${name}, dan dia cerita pada kami.`,
  (name) => `${name} ni, pelanggan yang ceritakan macam mana dia duduk dalam ruang dia.`,
  (name) => `Kami simpan cerita ni pasal ${name}. Dia datang dari ruang sebenar.`,
]

const CUSTOMER_OPEN = {
  wardrobe: [
    (name) => `Nak almari macam ${name} untuk bilik kamu? Bagi tahu baju apa yang kena ada tempat. Gantung atau lipat, dua-dua kami boleh ikut.`,
    (name) => `${name} selalunya mula bila seseorang tunjuk bilik dia. Bukan bila kami tolak katalog.`,
    (name) => `Almari macam ${name} lain rumah, lain keperluan. Yang sama, kami buat dia di Sabah.`,
  ],
  storage: [
    (name) => `Nak rak macam ${name}? Cerita dulu barang apa yang kena duduk di situ. Rumah dan kedai, lain susunan.`,
    (name) => `${name} selalunya mula bila pelanggan tunjuk sudut yang berlonggok. Katalog tak nampak sudut tu.`,
    (name) => `Rak macam ${name} tak sama untuk setiap orang. Kami buat dia di Sabah, ikut barang kamu.`,
  ],
  display: [
    (name) => `Nak paparan macam ${name} untuk kedai kamu? Bagi tahu barang apa yang kamu nak pelanggan nampak dulu.`,
    (name) => `${name} selalunya mula dari kaunter kedai yang sebenar. Bukan dari gambar kedai orang.`,
    (name) => `Paparan macam ${name} ikut cara kedai tu jual. Kami buat dia di Sabah.`,
  ],
  kiosk: [
    (name) => `Nak kaunter macam ${name}? Cerita macam mana kamu biasa layan pelanggan. Dari situ baru bentuk dia.`,
    (name) => `${name} mula bila pemilik bisnes cerita pasal jualan dia. Bukan salin gerai orang.`,
    (name) => `Kiosk macam ${name}, lain bisnes, lain susunan. Kami buat di Sabah ikut cara kamu jualan.`,
  ],
  bespoke: [
    (name) => `Nak buat sesuatu macam ${name}? Cerita apa yang ruang tu kena tampung. Yang wajib, dan yang boleh tinggal, asingkan.`,
    (name) => `${name} mula dari ruang yang tak cukup dengan barang sedia kedai.`,
    (name) => `Kerja macam ${name}, kami dengar dulu. Lepas jelas, baru buat di Sabah.`,
  ],
  general: [
    (name) => `Nak sesuatu untuk ${name}? Cerita macam mana kamu guna ruang tu setiap hari.`,
    (name) => `${name} lagi jelas bila kami nampak ruang sebenar. Tekaan selalunya meleset.`,
    (name) => `Setiap permintaan pasal ${name} kami layan satu-satu. Dari Sabah.`,
  ],
}

const BEHIND = {
  wardrobe: [
    [
      (name) => `Sebelum ${name} sampai ke bilik, dia dibuat di Sabah.`,
      'Bukan almari siap yang kami tampal nama.',
    ],
    [
      (name) => `${name} yang nampak siap dalam gambar, belakang dia ada kerja custom.`,
      'Kami semak apa yang tak kena, baru dia keluar. Kadang nampak kecil, tapi pelanggan yang rasa.',
    ],
    [
      (name) => `Orang nampak ${name} yang dah siap. Kami nampak masa dia masih papan.`,
      'Itu kerja harian kami di Sabah.',
    ],
  ],
  storage: [
    [
      (name) => `Sebelum ${name} dipasang, dia dibuat di bengkel kami di Sabah.`,
      'Bukan rak siap yang kami letak logo.',
    ],
    [
      (name) => `Gambar ${name} yang kemas tu, ada orang semak sebelum dia keluar.`,
      'Kami buat dia sendiri. Bukan ambil dari luar, lepas tu letak nama.',
    ],
    [
      (name) => `${name} tak datang dari kontena.`,
      'Dia keluar dari kerja kami di Sabah. Satu rak, satu permintaan.',
    ],
  ],
  display: [
    [
      (name) => `${name} yang berdiri di kedai, asalnya kami buat di Sabah.`,
      'Bukan rak pajang yang dibeli, lepas tu letak nama.',
    ],
    [
      (name) => `Sebelum ${name} tunjuk barang orang, kami tinguk dulu dia selesa dipandang.`,
      'Kerja tu di Sabah. Paparan yang menyakitkan mata, kami tak lepaskan.',
    ],
    [
      (name) => `Pelanggan nampak ${name} yang dah berisi. Kami ingat rangka dia masa belum siap.`,
      'Custom, dari Sabah.',
    ],
  ],
  kiosk: [
    [
      (name) => `${name} kami siapkan di Sabah sebelum dia ikut kamu keluar jualan.`,
      'Bukan gerai tempahan yang kami tampal logo.',
    ],
    [
      (name) => `Masa ${name} masih di bengkel, kami dah bayang pelanggan berdiri di depan.`,
      'Baru kami siapkan. Nanti di luar, dia kena berfungsi, bukan cantik dalam gambar ja.',
    ],
    [
      (name) => `${name} tak sama setiap satu. Cara jualan kamu pun tak sama.`,
      'Sebab tu kami buat dia di Sabah.',
    ],
  ],
  bespoke: [
    [
      (name) => `${name} tak ada dalam katalog siap. Dia dibuat bila permintaan tu sampai.`,
      'Kami mula dari ruang. Kerja dia di Sabah.',
    ],
    [
      (name) => `Kerja ${name} banyak masa dia masih perbincangan.`,
      'Bila dah jelas, baru kami buat. Itu biasa bagi kami.',
    ],
    [
      (name) => `Orang nampak ${name} yang dah jadi. Kami ingat soalan pertama: ruang ni untuk apa?`,
      'Dari situ baru kami buat di Sabah.',
    ],
  ],
  general: [
    [
      (name) => `Pasal ${name}, kami buat custom di Sabah.`,
      'Bukan barang siap yang ditampal nama.',
    ],
    [
      (name) => `Sebelum ${name} keluar, ada orang yang ukur, potong, dan semak.`,
      'Kerja tu di Sabah. Gambar yang kemas tu ada proses di belakang.',
    ],
    [
      (name) => `${name} nampak mudah dalam gambar.`,
      'Belakang dia ada keputusan kecil yang kami buat satu-satu.',
    ],
  ],
}

const TIPS = {
  wardrobe: [
    [
      (name) => `Sebelum isi ${name}, asingkan baju gantung dengan baju lipat.`,
      'Dari situ baru nampak dia lega, atau masih sesak.',
    ],
    [
      (name) => `Baju yang dipakai setiap minggu, letak di tempat senang capai dalam ${name}.`,
      'Yang setahun sekali, jangan rebut tempat depan. Nanti kamu yang penat.',
    ],
    [
      (name) => `Pintu almari tersangkut sebab baju menolak dari dalam? ${name} pun susah nak bantu.`,
      'Keluarkan dulu yang dah tak dipakai. Baru susun semula.',
    ],
  ],
  storage: [
    [
      (name) => `Sebelum isi ${name}, kumpul barang yang sejenis.`,
      'Rak terus nampak lebih lapang. Kamu tak payah gali untuk cari satu benda.',
    ],
    [
      (name) => `Barang harian, letak di tempat tangan terus sampai. Pada ${name}.`,
      'Yang jarang dipakai, atas sekali pun tak mengapa.',
    ],
    [
      (name) => `${name} lagi berguna bila satu paras, satu tugas.`,
      'Jangan campur aduk. Cuba satu jenis barang dulu.',
    ],
  ],
  display: [
    [
      'Barang yang orang selalu tanya, jangan sorok.',
      (name) => `Pada ${name}, letak dia di depan. Yang lain, tepi sikit. Pelanggan tak payah cari-cari.`,
    ],
    [
      (name) => `Paparan ${name} yang sesak, orang lalu ja.`,
      'Bagi sikit ruang kosong di keliling barang. Dia nampak lebih jelas.',
    ],
    [
      (name) => `Pilih satu barang utama untuk ${name}.`,
      'Yang lain sokong dia. Kalau semua sama kuat, tak ada yang diingat.',
    ],
  ],
  kiosk: [
    [
      (name) => `Pada ${name}, pastikan pelanggan nampak barang tanpa menjenguk.`,
      'Laluan depan kaunter, biar jelas.',
    ],
    [
      (name) => `Sebelum bawa ${name} keluar, susun dulu barang yang nak dijual hari tu.`,
      'Yang tinggal, biar dalam kotak. Jangan bagi kaunter nampak macam stor.',
    ],
    [
      (name) => `${name} lagi senang dijaga kalau kamu dah cuba buka dan tutup sekali sebelum keluar.`,
      'Nanti di luar, tak perlu panik.',
    ],
  ],
  bespoke: [
    [
      (name) => `Sebelum minta ${name}, senaraikan apa yang wajib muat, dan apa yang boleh tinggal.`,
      'Perbualan dengan kami terus lebih jelas.',
    ],
    [
      (name) => `Bawa contoh barang yang akan diletakkan bila nak bincang ${name}.`,
      'Gambar ruang pun membantu. Tekaan selalunya meleset.',
    ],
    [
      (name) => `Untuk ${name}, cerita hari biasa ruang tu. Bukan hari raya ja.`,
      'Hari biasa yang tunjuk susunan yang patut.',
    ],
  ],
  general: [
    [
      (name) => `Untuk ${name}, mula dengan barang yang kamu pegang setiap hari.`,
      'Bagi dia tempat tetap. Yang jarang keluar, jangan duduk di depan.',
    ],
    [
      (name) => `Sebelum ubah ${name}, tinguk satu hari biasa dulu.`,
      'Barang mana yang dicari, barang mana yang hanya lalu. Dari situ baru susun.',
    ],
    [
      (name) => `${name} tak perlu diubah serentak.`,
      'Pilih satu sudut. Kemaskan. Baru pergi ke sudut seterusnya.',
    ],
  ],
}

const IG_LEAD = {
  highlight: {
    wardrobe: [
      (name) => `Baju bertindih, susah nak cari?\n\n${name}. Sebelah gantung, sebelah lipat.`,
      (name) => `${name}\n\nAlmari dah tak muat tutup? Kami pun pernah tutup balik.`,
      (name) => `Tempat gantung. Tempat lipat.\n\n${name}, dibuat di Sabah.`,
    ],
    storage: [
      (name) => `Barang hilang sebab tak ada tempat?\n\n${name}, untuk rumah atau kedai.`,
      (name) => `${name}\n\nRuang kecil. Barang tetap banyak.`,
      (name) => `Barang bertindih?\n\n${name} asingkan supaya nampak.`,
    ],
    display: [
      (name) => `Paparan penuh, mata pening.\n\n${name} susun yang penting dulu.`,
      (name) => `${name}\n\nUntuk kaunter atau dinding kedai.`,
      (name) => `Paparan tak payah berebut.\n\n${name}, custom di Sabah.`,
    ],
    kiosk: [
      (name) => `Kaunter kena nampak dari jauh.\n\n${name}, dibuat di Sabah.`,
      (name) => `${name}\n\nBarang nampak. Bukan tertimbus.`,
      (name) => `Bukan meja kosong.\n\n${name} untuk bisnes kamu.`,
    ],
    bespoke: [
      (name) => `Barang kedai tak muat?\n\n${name}.`,
      (name) => `${name}\n\nIkut ruang kamu, bukan katalog.`,
      (name) => `Katalog dah tak cukup.\n\n${name} kami buat di Sabah.`,
    ],
    general: [
      (name) => `${name}\n\nTinguk barang yang kamu pegang setiap hari dulu.`,
      (name) => `Satu sudut dulu.\n\n${name}.`,
      (name) => `${name}\n\nBarang harian ada tempat tetap.`,
    ],
  },
  promo: {
    wardrobe: [
      (name) => `Nak almari ikut cara kamu simpan baju?\n\n${name}.`,
      (name) => `${name}\n\nBaju dah tak muat. Bukan salah bilik.`,
      (name) => `${name} ngam dengan bilik kamu?\n\nKami buat ikut baju kamu.`,
    ],
    storage: [
      (name) => `Nak rak ikut barang kamu?\n\n${name}.`,
      (name) => `${name}\n\nUntuk barang yang dah berlonggok.`,
      (name) => `Rak ikut barang, bukan katalog.\n\n${name}.`,
    ],
    display: [
      (name) => `Nak paparan yang terus nampak?\n\n${name}.`,
      (name) => `${name}\n\nKedai masih nampak sesak?`,
      (name) => `${name}\n\nKami buat di Sabah.`,
    ],
    kiosk: [
      (name) => `Nak kaunter ikut cara kamu jualan?\n\n${name}.`,
      (name) => `${name}\n\nDah bosan sewa meja?`,
      (name) => `${name} ngam dengan bisnes kamu?`,
    ],
    bespoke: [
      (name) => `Nak ikut ruang kamu?\n\n${name}.`,
      (name) => `${name}\n\nBarang biasa tak masuk. Katalog dah menyerah.`,
      (name) => `${name}\n\nKerja custom di Sabah.`,
    ],
    general: [
      (name) => `${name}\n\nCustom di Sabah, kalau ada kena dengan ruang kamu.`,
      (name) => `${name}\n\nNak susunan lebih kemas.`,
      (name) => `Nak bincang ${name}?\n\nCerita je.`,
    ],
  },
  customer: {
    wardrobe: [
      (name) => `Nak almari macam ${name}?\n\nBagi tahu baju apa yang kena tempat.`,
      (name) => `${name}\n\nMula dari bilik sebenar, bukan katalog.`,
      (name) => `Lain rumah, lain almari.\n\n${name} dibuat di Sabah.`,
    ],
    storage: [
      (name) => `Nak rak macam ${name}?\n\nCerita barang apa yang kena tempat.`,
      (name) => `${name}\n\nMula dari sudut yang berlonggok.`,
      (name) => `Lain orang, lain rak.\n\n${name} dibuat di Sabah.`,
    ],
    display: [
      (name) => `Nak paparan macam ${name}?\n\nCerita barang yang kamu jual.`,
      (name) => `${name}\n\nMula dari kaunter kedai.`,
      (name) => `Ikut cara kedai kamu jual.\n\n${name}.`,
    ],
    kiosk: [
      (name) => `Nak kaunter macam ${name}?\n\nCerita cara kamu jualan.`,
      (name) => `${name}\n\nMula dari bisnes kamu.`,
      (name) => `Lain bisnes, lain kiosk.\n\n${name}.`,
    ],
    bespoke: [
      (name) => `Nak buat macam ${name}?\n\nCerita apa yang ruang tu kena tampung.`,
      (name) => `${name}\n\nUntuk ruang yang barang kedai tak muat.`,
      (name) => `Kami dengar dulu.\n\nBaru buat ${name}.`,
    ],
    general: [
      (name) => `${name}\n\nCerita macam mana kamu guna ruang tu.`,
      (name) => `${name}\n\nLebih jelas bila kami nampak ruangnya.`,
      (name) => `${name}\n\nKami layan satu-satu.`,
    ],
  },
  behind: {
    wardrobe: [
      (name) => `${name}\n\nDibuat di Sabah. Bukan almari tampal nama.`,
      (name) => `Belakang gambar ${name}, ada kerja custom.`,
      (name) => `${name} masa masih papan.\n\nItu yang kami nampak dulu.`,
    ],
    storage: [
      (name) => `${name}\n\nDari bengkel kami di Sabah.`,
      (name) => `${name} disemak dulu sebelum keluar.`,
      (name) => `${name} tak datang dari kontena.`,
    ],
    display: [
      (name) => `${name}\n\nKami buat di Sabah untuk kedai.`,
      (name) => `Sebelum ${name} tunjuk barang, kami tinguk dia selesa dipandang.`,
      (name) => `Rangka ${name} dulu.\n\nBarang kemudian.`,
    ],
    kiosk: [
      (name) => `${name}\n\nDisiapkan di Sabah sebelum keluar jualan.`,
      (name) => `Kami bayang pelanggan berdiri di depan ${name}.`,
      (name) => `${name} tak sama setiap satu.`,
    ],
    bespoke: [
      (name) => `${name}\n\nTak ada dalam katalog siap.`,
      (name) => `${name} banyak masa dia masih perbincangan.`,
      (name) => `Soalan pertama untuk ${name}:\n\nRuang ni untuk apa?`,
    ],
    general: [
      (name) => `${name}\n\nCustom, di Sabah.`,
      (name) => `Ada orang yang siapkan ${name} sebelum dia keluar.`,
      (name) => `${name} nampak mudah.\n\nBelakang dia ada keputusan kecil.`,
    ],
  },
  tips: {
    wardrobe: [
      (name) => `Asingkan baju gantung dan baju lipat dulu.\n\nBaru isi ${name}.`,
      (name) => `Baju mingguan, tempat senang capai.\n\nDalam ${name}.`,
      (name) => `Pintu almari tersangkut?\n\nKeluarkan yang dah tak dipakai. ${name} pun lega.`,
    ],
    storage: [
      (name) => `Kumpul barang sejenis dulu.\n\nBaru isi ${name}.`,
      (name) => `Barang harian, tempat tangan terus sampai.\n\nPada ${name}.`,
      (name) => `Satu paras, satu tugas.\n\n${name} terus berguna.`,
    ],
    display: [
      (name) => `Barang yang selalu ditanya, letak di depan.\n\n${name} untuk susunan tu.`,
      (name) => `Jangan sesakkan ${name}.\n\nBagi dia ruang kosong sikit.`,
      (name) => `Satu barang utama pada ${name}.\n\nYang lain sokong.`,
    ],
    kiosk: [
      (name) => `Pada ${name}, barang patut nampak tanpa menjenguk.`,
      (name) => `Susun barang jualan dulu, sebelum bawa ${name} keluar.`,
      (name) => `Cuba buka dan tutup ${name} sekali sebelum keluar.`,
    ],
    bespoke: [
      (name) => `Senaraikan apa yang wajib muat, sebelum minta ${name}.`,
      (name) => `Bawa contoh barang bila nak bincang ${name}.`,
      (name) => `Cerita hari biasa ruang tu, bila nak ${name}.`,
    ],
    general: [
      (name) => `Untuk ${name}, mula dengan barang yang dipegang setiap hari.`,
      (name) => `Sebelum ubah ${name}, tinguk satu hari biasa dulu.`,
      (name) => `${name} tak perlu diubah serentak.\n\nSatu sudut dulu.`,
    ],
  },
}

const TIKTOK_LINE = {
  wardrobe: 'Untuk susun baju. Dibuat di Sabah.',
  storage: 'Untuk barang yang selalu dicari.',
  display: 'Untuk paparan kedai yang lebih jelas.',
  kiosk: 'Kaunter custom dari Sabah.',
  bespoke: 'Dibuat ikut ruang kamu.',
  general: 'Ikut cara ruang tu digunakan.',
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
    `${name}. Harga dia ${price}.`,
    `Kalau ${name} yang kamu minat, harga dia ${price}.`,
    `Harga ${name}: ${price}.`,
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
    selectedGoal === 'customer' && noteText ? 'Kalau ruang kamu lain, cerita ja. Kami buat custom di Sabah.' : '',
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
    `${name}.`,
    `Dari Sabah: ${name}.`,
    `Untuk ruang kamu — ${name}.`,
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
