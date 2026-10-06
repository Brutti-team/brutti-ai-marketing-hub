// Local Bahasa Malaysia captions for Content Studio. No network, no paid model.
// Voice: Brutti Soul Master, checked against Brutti's own Sep–Oct 2026 posts.
// Those posts open on a piece name or a short scene, one thought a line.
// Dialect that actually shows up: ni, ngam, ja, kan, sudah, boleh, bikin, kasi,
// tinguk, mau, and only rarely bah, teda, jaaa. mau stands where a stiff
// synonym would have been. Closes are a soft observation or a function line.
// Emoji, if any, sits at the end of a line. No hashtags. No copied post.
// No borrowed facts. No invented Dusun gloss.
// The caption uses the Product Name alone and does not append the category.
// Line 4 is the design line, from the design note, name descriptors, or colour.
// Price, size and material stay out of those lines. When a field has a value,
// a Product details list follows the 4-line caption. Blank fields are omitted.

const HUMOUR = {
  wardrobe: 'Baju banyak, tapi bilik masih boleh nampak kemas. 😆',
  storage: 'Barang kecil pun kena ada tempat. 😆',
  display: 'Kalau semua barang sama, teda yang orang nampak. 😆',
  kiosk: 'Meja jualan yang kemas, barang nampak dari jauh. 😆',
  bespoke: 'Ruang kecil pun boleh ada piece sendiri. 😆',
  general: 'Gambar orang lain cantik. Hidup kamu lain. 😆',
}

const OPEN = {
  highlight: {
    wardrobe: [(n) => `${n} ✨`, HUMOUR.wardrobe, 'POV: satu sudut bilik, baju ada tempat. ✨'],
    storage: [(n) => `${n} ✨`, HUMOUR.storage, 'Ada sudut yang barang dia banyak. ✨'],
    display: [(n) => `${n} ✨`, HUMOUR.display, 'Kadang display nampak penuh. ✨'],
    kiosk: [(n) => `${n} ✨`, HUMOUR.kiosk, 'Kaunter untuk jualan, barang nampak dari jauh. ✨'],
    bespoke: [(n) => `${n} ✨`, HUMOUR.bespoke, 'Ada ruang yang mau piece ikut dia. ✨'],
    general: [(n) => `${n} ✨`, HUMOUR.general, 'Satu sudut dulu, tidak perlu ubah semua sekali. ✨'],
  },
  promo: {
    wardrobe: [(n) => `${n} ✨`, 'Bilik yang baju dia banyak. 😆', 'Tempat gantung dan drawer, dalam satu piece. ✨'],
    storage: [(n) => `${n} 🌿`, 'Barang banyak, tapi setiap satu boleh ada tempat. ✨', 'Storage yang ngam ikut apa yang kamu simpan. 😉'],
    display: [(n) => `${n} ✨`, 'Display yang kemas, mata terus nampak. 😍', 'Barang penting, kasi dia nampak. 😉'],
    kiosk: [(n) => `${n} ✨`, 'Kaunter custom untuk jualan kamu. ✨', 'Bukan meja kosong. 😉'],
    bespoke: [(n) => `${n} ✨`, 'Ruang kecil pun boleh ada piece sendiri. ✨', 'Custom, ikut ruang kamu. 😍'],
    general: [(n) => `${n} ✨`, 'Barang yang kamu guna setiap hari, patut ada tempat. ✨', 'Susun satu sudut dulu. 😉'],
  },
  customer: {
    wardrobe: ['Ada bilik yang baju dia banyak. ✨', 'Wardrobe yang ngam mula dari bilik kamu. 😍', 'Lain rumah, lain cara simpan baju. 😉'],
    storage: ['Ada sudut yang barang dia banyak. ✨', 'Storage yang ngam mula dari barang kamu. 😍', 'Lain orang, lain barang yang kena tempat. 😉'],
    display: ['Ada display yang penuh. ✨', 'Display yang ngam mula dari ruang kamu. 😍', 'Lain client, lain barang yang mau nampak. 😉'],
    kiosk: ['Ada jualan yang kaunter dia masih meja kosong. ✨', 'Kiosk yang ngam mula dari cara kamu. 😍', 'Lain client, lain setup. 😉'],
    bespoke: ['Ada ruang yang piece biasa tidak muat. ✨', 'Piece custom mula bila kamu cerita ruang tu. 😍', 'Lain ruang, lain yang mau muat. 😉'],
    general: ['Ada sudut yang kamu guna setiap hari. ✨', 'Susun yang ngam mula bila kami nampak ruang kamu. 😍', 'Lain hari, lain barang yang kamu cari. 😉'],
  },
  behind: {
    wardrobe: ['Behind the scene. ✨', 'Yang nampak siap, ada kerja custom. 😉', 'Dari proses sampai siap. 😍'],
    storage: ['Behind the scene. ✨', 'Gambar yang kemas, ada proses sebelum dia siap. 😉', 'Custom, bukan piece yang semua orang dapat sama. 😍'],
    display: ['Behind the scene. ✨', 'Kami buat dulu, baru dia keluar. 😉', 'Client nampak display yang sudah siap. 😍'],
    kiosk: ['Behind the scene. ✨', 'Team buat dulu, baru dia ikut kamu. 😉', 'Bukan meja yang sudah siap dari orang lain. 😍'],
    bespoke: ['Piece custom, bila ada cerita. ✨', 'Cerita dulu, baru kami bikin. 😉', 'Ruang ni untuk apa. 😍'],
    general: ['Behind the scene. ✨', 'Gambar yang kemas ada proses. 😉', 'Nampak simple, tapi ada kerja. 😍'],
  },
  tips: {
    wardrobe: ['Baju untuk gantung, dan baju untuk drawer. ✨', 'Baju yang kamu guna minggu ni, letak di tempat yang senang. 😍', 'Yang sudah lama tidak kamu ambil, keluar dulu. 😉'],
    storage: ['Letak barang yang sama, bersama. ✨', 'Barang harian, letak di tempat yang senang sampai. 😍', 'Satu jenis, satu tempat. 😉'],
    display: ['Barang yang kamu selalu cari, kasi dia nampak. ✨', 'Kadang display nampak penuh. 😍', 'Barang penting, kasi nampak dari jauh. 😉'],
    kiosk: ['Barang patut nampak dari jauh. ✨', 'Susun dulu barang jualan, baru bawa keluar. 😍', 'Setup simple, barang masih nampak. 😉'],
    bespoke: ['Cerita apa yang mau muat. ✨', 'Bawa gambar ruang bila mau cerita. 😍', 'Hari biasa ruang tu, itu yang kami ikut. 😉'],
    general: ['Mula dari barang yang kamu guna setiap hari. ✨', 'Tinguk satu hari biasa dulu, baru ubah. 😍', 'Satu sudut dulu, baru pigi sudut lain. ✨'],
  },
}

const BODY = {
  highlight: {
    wardrobe: [
      () => 'Ngam ni untuk simpan baju, dengan drawer untuk yang dilipat.',
      (n) => `${n} ni sudah ada tempat gantung, dengan drawer sekali.`,
      (n) => `${n} ni kami buat custom, ikut cara kamu simpan.`,
    ],
    storage: [
      () => 'Ngam ni untuk storage yang mau setiap barang ada tempat.',
      (n) => `${n} ni untuk ruang rumah yang barang dia banyak.`,
      (n) => `${n} ni kami buat custom, ikut apa yang kamu simpan.`,
    ],
    display: [
      () => 'Ngam ni untuk display barang dengan kemas.',
      (n) => `${n} ni kasi barang penting nampak dari jauh.`,
      (n) => `${n} ni untuk setup yang simple, barang masih nampak.`,
    ],
    kiosk: [
      () => 'Ngam ni untuk jualan, barang nampak dari jauh.',
      (n) => `${n} ni kaunter custom, bukan meja kosong.`,
      (n) => `${n} ni kami buat untuk setup kamu.`,
    ],
    bespoke: [
      () => 'Ngam ni untuk ruang yang piece biasa tidak muat.',
      (n) => `${n} ni ikut ruang kamu.`,
      (n) => `${n} ni kami buat custom.`,
    ],
    general: [
      () => 'Ngam ni untuk susun ruang, satu sudut dulu.',
      (n) => `${n} ni, barang harian ada tempat.`,
      (n) => `${n} ni kami buat ikut cara kamu.`,
    ],
  },
  promo: {
    wardrobe: [
      () => 'Ngam ni untuk simpan baju kamu, drawer untuk yang dilipat.',
      (n) => `${n} ni untuk bilik yang mau lebih kemas.`,
      (n) => `Kalau ${n} ngam dengan bilik kamu, kami bikin ikut cara kamu simpan.`,
    ],
    storage: [
      () => 'Ngam ni untuk storage yang mau setiap barang ada tempat.',
      (n) => `${n} ni kami buat custom, ikut apa yang kamu simpan.`,
      (n) => `${n} ni, bukan storage yang semua rumah dapat sama.`,
    ],
    display: [
      () => 'Ngam ni untuk display yang mau barang terus nampak.',
      (n) => `${n} ni kami bikin custom, ikut cara kamu susun barang.`,
      (n) => `${n} ni, bukan display yang semua ruang nampak sama.`,
    ],
    kiosk: [
      () => 'Ngam ni untuk jualan yang mau kaunter sendiri.',
      (n) => `${n} ni kami bikin custom.`,
      (n) => `${n} ni untuk setup kamu, barang nampak dari jauh.`,
    ],
    bespoke: [
      () => 'Ngam ni untuk ruang yang mau piece sendiri.',
      (n) => `${n} ni kami buat ikut hidup kamu.`,
      (n) => `${n} ni, kami cerita dulu baru bikin.`,
    ],
    general: [
      () => 'Ngam ni untuk ruang yang mau lebih kemas.',
      (n) => `${n} ni, satu sudut dulu sudah cukup.`,
      (n) => `${n} ni kami buat custom.`,
    ],
  },
  customer: {
    wardrobe: [
      (n) => `${n} ni untuk simpan baju, dengan drawer sekali.`,
      (n) => `${n} ni mula dari cara kamu simpan.`,
      (n) => `${n} ni ikut baju kamu. Lain rumah, lain cara.`,
    ],
    storage: [
      (n) => `${n} ni kami susun ikut barang yang kamu simpan.`,
      (n) => `${n} ni mula dari sudut yang penuh.`,
      (n) => `${n} ni tidak sama untuk setiap orang.`,
    ],
    display: [
      (n) => `${n} ni kasi barang penting duduk di tempat yang nampak.`,
      (n) => `${n} ni mula dari ruang kamu.`,
      (n) => `Display ${n} ni ikut cara kamu susun.`,
    ],
    kiosk: [
      (n) => `${n} ni untuk jualan kamu, barang nampak dari jauh.`,
      (n) => `${n} ni mula bila kamu cerita setup kamu.`,
      (n) => `${n} ni, lain client, lain susun.`,
    ],
    bespoke: [
      (n) => `${n} ni untuk ruang yang piece biasa tidak muat.`,
      (n) => `${n} ni mula dari cerita kamu.`,
      (n) => `${n} ni, bila kamu cerita, baru kami buat.`,
    ],
    general: [
      (n) => `Untuk ${n} ni, cerita macam mana kamu guna ruang tu.`,
      (n) => `${n} ni ikut ruang yang kami nampak.`,
      (n) => `Setiap cerita untuk ${n} ni, kami buat satu-satu.`,
    ],
  },
  behind: {
    wardrobe: [
      (n) => `${n} ni Team bikin, dari proses sampai siap.`,
      (n) => `Gambar ${n} ni kemas, sebab ada kerja custom.`,
      (n) => `${n} ni, dari tangan Team sampai dia siap.`,
    ],
    storage: [
      (n) => `${n} ni kami bikin sendiri.`,
      (n) => `${n} ni dibuat dulu, baru dia keluar.`,
      (n) => `${n} ni, kerja custom dari Team.`,
    ],
    display: [
      (n) => `${n} ni kami bikin untuk display.`,
      (n) => `Sebelum ${n} ni keluar, Team check dulu.`,
      (n) => `${n} ni kami buat untuk display kamu.`,
    ],
    kiosk: [
      (n) => `${n} ni kami buat sebelum dia ikut kamu keluar.`,
      (n) => `${n} ni tidak sama setiap satu.`,
      (n) => `${n} ni bukan kaunter yang kami ambil siap.`,
    ],
    bespoke: [
      (n) => `${n} ni kami bikin bila ada cerita dari kamu.`,
      (n) => `Cerita dulu, baru ${n} ni kami buat.`,
      (n) => `Dari ruang kamu, baru ${n} ni kami bikin.`,
    ],
    general: [
      (n) => `${n} ni kami bikin custom.`,
      (n) => `Ada kerja Team untuk ${n} ni sebelum gambar dia kemas.`,
      (n) => `${n} ni nampak simple. Ada kerja untuk dia.`,
    ],
  },
  tips: {
    wardrobe: [
      (n) => `Dalam ${n} ni, baju gantung dengan drawer untuk yang dilipat.`,
      (n) => `Dalam ${n} ni, baju minggu ni letak di tempat yang senang ambil.`,
      (n) => `${n} ni lebih kemas bila yang lama tidak kamu ambil, keluar dulu.`,
    ],
    storage: [
      (n) => `Barang yang sama, letak bersama dalam ${n} ni.`,
      (n) => `Dalam ${n} ni, barang harian di tempat yang senang.`,
      (n) => `${n} ni lebih senang bila satu jenis ada satu tempat.`,
    ],
    display: [
      (n) => `Dalam ${n} ni, bagi ruang sikit supaya display lebih kemas.`,
      (n) => `${n} ni, barang penting kasi nampak dari jauh.`,
      (n) => `Pada ${n} ni, satu barang dulu. Yang lain boleh duduk bersama.`,
    ],
    kiosk: [
      (n) => `Pada ${n} ni, barang patut nampak dari jauh.`,
      (n) => `Dalam ${n} ni, susun barang jualan dulu.`,
      (n) => `${n} ni lebih senang bila setup dia simple.`,
    ],
    bespoke: [
      (n) => `Cerita tu untuk ${n} ni.`,
      (n) => `Gambar ruang kami guna untuk ${n} ni.`,
      (n) => `Hari biasa ruang tu yang bagi ${n} ni fungsi dia.`,
    ],
    general: [
      (n) => `Untuk ${n} ni, barang harian letak di tempat yang senang.`,
      (n) => `Sebelum ubah ${n} ni, tinguk barang mana yang kamu cari.`,
      (n) => `${n} ni, satu sudut dulu sudah cukup.`,
    ],
  },
}

const MID = {
  wardrobe: [
    'Piece ni kami bikin custom. Simple, tapi fungsi dia terus nampak.',
    'Bukan wardrobe yang semua rumah dapat sama.',
    'Tempat gantung, dengan drawer sekali.',
  ],
  storage: [
    'Shelving ni kami bikin custom. Boleh ikut apa yang kamu simpan.',
    'Setiap barang boleh ada tempat sendiri.',
    'Rack ni untuk ruang yang mau kemas.',
  ],
  display: [
    'Piece ni kami bikin custom. Simple, untuk display yang kemas.',
    'Bukan display yang semua ruang nampak sama.',
    'Kasi barang penting nampak dari jauh.',
  ],
  kiosk: [
    'Piece ni kami bikin custom untuk jualan kamu.',
    'Kaunter yang kemas, barang nampak dari jauh.',
    'Setup simple pun sudah cukup.',
  ],
  bespoke: [
    'Kami buat dia custom, ikut ruang kamu.',
    'Bukan piece yang semua rumah dapat sama.',
    'Ruang kecil pun boleh ada fungsi.',
  ],
  general: [
    'Piece ni custom, ikut ruang kamu.',
    'Satu sudut dulu sudah cukup.',
    'Barang harian ada tempat sendiri.',
  ],
}

const TIP_MID = {
  wardrobe: [
    'Drawer untuk yang dilipat. Tempat gantung untuk yang lain.',
    'Yang kamu guna minggu ni, letak supaya senang ambil.',
    'Mau susun macam mana, ikut kamu jaaa. ✨',
  ],
  storage: [
    'Kamu tidak perlu cari lama untuk satu barang.',
    'Yang tidak selalu kamu guna, tempat yang jauh pun boleh.',
    'Cuba satu jenis barang dulu.',
  ],
  display: [
    'Display lebih senang nampak bila ada ruang kosong.',
    'Barang penting letak di tempat yang senang nampak.',
    'Kalau semua barang sama, teda yang orang nampak.',
  ],
  kiosk: [
    'Dari jauh, barang terus nampak.',
    'Kaunter tidak perlu nampak penuh.',
    'Bila pigi keluar, setup sudah kemas.',
  ],
  bespoke: [
    'Cerita kamu buat piece tu lebih ngam.',
    'Gambar ruang pun kami guna.',
    'Hari biasa yang kami ikut.',
  ],
  general: [
    'Barang harian di tempat yang senang.',
    'Dari sana baru susun.',
    'Satu sudut dulu, baru pigi ke sudut lain.',
  ],
}

const IG_OPEN = {
  highlight: {
    wardrobe: ['Drawer untuk baju yang dilipat. ✨', 'Bilik yang baju dia banyak. 😆', 'Satu sudut, satu fungsi. 😍'],
    storage: ['Setiap barang, satu tempat. ✨', 'Barang kecil pun kena tempat. 😆', 'Ruang rumah, barang masih banyak. 😍'],
    display: ['Display barang dengan kemas. ✨', 'Kadang semua barang sama kuat. 😆', 'Dari jauh, barang terus nampak. 😍'],
    kiosk: ['Kaunter untuk jualan. ✨', 'Meja jualan yang kemas. 😆', 'Barang nampak dari jauh. 😍'],
    bespoke: ['Piece ikut ruang. ✨', 'Ruang kecil, piece sendiri. 😆', 'Custom untuk ruang kamu. 😍'],
    general: ['Satu sudut dulu. ✨', 'Gambar orang lain, hidup kamu lain. 😆', 'Barang harian ada tempat. 😍'],
  },
  promo: {
    wardrobe: ['Untuk baju kamu. ✨', 'Bilik yang mau kemas. 😉', 'Gantung dan drawer, satu piece. 😍'],
    storage: ['Storage untuk barang kamu. 🌿', 'Setiap barang boleh ada tempat. ✨', 'Ikut apa yang kamu simpan. 😉'],
    display: ['Display yang kemas. ✨', 'Mata terus nampak. 😍', 'Barang penting kasi nampak. 😉'],
    kiosk: ['Kaunter custom. ✨', 'Untuk jualan kamu. 😉', 'Bukan meja kosong. 😍'],
    bespoke: ['Piece untuk ruang kamu. ✨', 'Ruang kecil pun boleh. 😉', 'Ikut ruang kamu. 😍'],
    general: ['Untuk ruang kamu. ✨', 'Barang setiap hari ada tempat. 😉', 'Satu sudut dulu. 😍'],
  },
  customer: {
    wardrobe: ['Lain rumah, lain baju. ✨', 'Mula dari bilik kamu. 😍', 'Ikut cara kamu simpan. 😉'],
    storage: ['Lain barang, lain tempat. ✨', 'Mula dari barang kamu. 😍', 'Tidak sama setiap orang. 😉'],
    display: ['Lain client, lain barang. ✨', 'Mula dari ruang kamu. 😍', 'Barang yang mau nampak. 😉'],
    kiosk: ['Kaunter masih meja kosong. ✨', 'Mula dari cara kamu. 😍', 'Lain client, lain setup. 😉'],
    bespoke: ['Piece biasa tidak muat. ✨', 'Mula dari cerita kamu. 😍', 'Lain ruang, lain piece. 😉'],
    general: ['Sudut yang kamu guna. ✨', 'Bila kami nampak ruang kamu. 😍', 'Lain hari, lain barang. 😉'],
  },
  behind: {
    wardrobe: ['Behind the scene. ✨', 'Ada kerja custom. 😉', 'Dari proses sampai siap. 😍'],
    storage: ['Behind the scene. ✨', 'Ada proses sebelum siap. 😉', 'Bukan piece yang sama untuk semua. 😍'],
    display: ['Behind the scene. ✨', 'Buat dulu, baru keluar. 😉', 'Display yang sudah siap. 😍'],
    kiosk: ['Behind the scene. ✨', 'Team buat dulu. 😉', 'Bukan meja siap dari orang lain. 😍'],
    bespoke: ['Bila ada cerita. ✨', 'Cerita dulu, baru bikin. 😉', 'Ruang ni untuk apa. 😍'],
    general: ['Behind the scene. ✨', 'Gambar kemas ada proses. 😉', 'Nampak simple, ada kerja. 😍'],
  },
  tips: {
    wardrobe: ['Baju gantung, baju drawer. ✨', 'Baju minggu ni, tempat yang senang. 😍', 'Yang lama, keluar dulu. 😉'],
    storage: ['Barang yang sama, bersama. ✨', 'Barang harian, tempat yang senang. 😍', 'Satu jenis, satu tempat. 😉'],
    display: ['Yang kamu selalu cari, kasi nampak. ✨', 'Kadang nampak penuh. 😍', 'Penting, nampak dari jauh. 😉'],
    kiosk: ['Patut nampak dari jauh. ✨', 'Susun dulu, baru bawa keluar. 😍', 'Setup simple. 😉'],
    bespoke: ['Cerita apa yang mau muat. ✨', 'Bawa gambar ruang. 😍', 'Hari biasa yang kami ikut. 😉'],
    general: ['Barang yang kamu guna setiap hari. ✨', 'Tinguk hari biasa dulu. 😍', 'Satu sudut, baru sudut lain. 😉'],
  },
}

const IG_BODY = {
  wardrobe: [
    (n) => `${n} ni. Drawer untuk yang dilipat.`,
    (n) => `${n} ni untuk bilik yang mau kemas.`,
    (n) => `${n} ni, Team bikin custom.`,
  ],
  storage: [
    (n) => `${n} ni untuk storage yang kemas.`,
    (n) => `${n} ni bila barang masih banyak.`,
    (n) => `${n} ni, kami bikin custom.`,
  ],
  display: [
    (n) => `${n} ni, kasi barang penting nampak.`,
    (n) => `${n} ni untuk display yang kemas.`,
    (n) => `${n} ni, simple dan custom.`,
  ],
  kiosk: [
    (n) => `${n} ni untuk jualan kamu.`,
    (n) => `${n} ni, barang nampak dari jauh.`,
    (n) => `${n} ni kami bikin custom.`,
  ],
  bespoke: [
    (n) => `${n} ni ikut ruang kamu.`,
    (n) => `${n} ni bila piece biasa tidak muat.`,
    (n) => `${n} ni kami buat custom.`,
  ],
  general: [
    (n) => `${n} ni, ikut cara kamu.`,
    (n) => `${n} ni, satu sudut dulu.`,
    (n) => `${n} ni kami bikin custom.`,
  ],
}

const IG_MID = [
  'Kami bikin piece ni custom.',
  'Simple sudah, tapi fungsi nampak.',
  'Ikut ruang kamu.',
]

const TT_OPEN = {
  wardrobe: ['Baju dengan drawer. ✨', 'Bilik yang kemas. 😆', 'Satu wardrobe. 😍'],
  storage: ['Storage untuk barang kamu. 🌿', 'Setiap barang, satu tempat. ✨', 'Ruang rumah lebih kemas. 😉'],
  display: ['Display yang kemas. ✨', 'Barang nampak dari jauh. 😍', 'Ruang kosong sikit. 😉'],
  kiosk: ['Kaunter untuk jualan. ✨', 'Barang nampak dari jauh. 😍', 'Setup simple. 😉'],
  bespoke: ['Piece ikut ruang. ✨', 'Custom untuk kamu. 😍', 'Ruang sendiri. 😉'],
  general: ['Satu sudut dulu. ✨', 'Barang harian. 😍', 'Ruang kamu. 😉'],
}

const TT_MID = {
  wardrobe: ['Tempat baju dengan drawer.', 'Bilik lebih kemas.', 'Custom dari Team.'],
  storage: ['Setiap barang ada tempat.', 'Untuk ruang rumah.', 'Storage yang kemas.'],
  display: ['Barang penting nampak.', 'Display dengan kemas.', 'Dari jauh terus nampak.'],
  kiosk: ['Untuk jualan kamu.', 'Barang nampak dari jauh.', 'Setup yang simple.'],
  bespoke: ['Ikut ruang kamu.', 'Piece custom.', 'Untuk ruang sendiri.'],
  general: ['Ikut cara kamu.', 'Satu sudut dulu.', 'Barang harian ada tempat.'],
}

export const CAPTION_GOALS = [
  { id: 'highlight', label: 'Sorotan produk' },
  { id: 'promo', label: 'Promosi' },
  { id: 'customer', label: 'Projek atau maklum balas pelanggan' },
  { id: 'behind', label: 'Di sebalik tabir' },
  { id: 'tips', label: 'Tip' },
]

export const VARIATION_COUNT = 3

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

const FINISH_WORD = /\b(?:coatings?|finish(?:es|ing)?|varnish(?:es)?|lacquers?|paints?|sealers?)\b/i

const NEUTRAL_LOOK = [
  'Nampak simple, dan kemas. 😍',
  'Nampak simple, tapi ada kerja. 😉',
  'Piece ni simple, senang mata nampak. ✨',
]

function finishLine(text) {
  const value = clean(text)
  return /[.!?]$/.test(value) ? value : `${value}.`
}

function designDescriptors(name) {
  const found = []
  const pattern = /open concept|modular|fold(?:ing|able)|extend(?:ed|able)/gi
  for (const match of clean(name).matchAll(pattern)) {
    const word = match[0]
    if (!found.some((item) => item.toLowerCase() === word.toLowerCase())) found.push(word)
  }
  return found
}

function designLine(name, colour, note, index) {
  const noteRaw = readField(note)
  const colourText = readField(colour)
  const noteKey = noteRaw.toLowerCase()
  const descriptors = designDescriptors(name).filter((item) => !noteKey.includes(item.toLowerCase()))
  const showColour = Boolean(colourText) && !noteKey.includes(colourText.toLowerCase())
  const slot = ((Number(index) || 0) % NEUTRAL_LOOK.length + NEUTRAL_LOOK.length) % NEUTRAL_LOOK.length
  if (!noteRaw && !descriptors.length && !showColour) return NEUTRAL_LOOK[slot]
  if (!noteRaw && !descriptors.length) {
    const colourLines = [
      `Warna dia ${colourText}.`,
      `Warna dia ${colourText}, nampak pada piece ni.`,
      `Piece ni warna dia ${colourText}.`,
    ]
    return finishLine(colourLines[slot])
  }
  const bits = []
  if (descriptors.length) bits.push(descriptors.join(', '))
  if (noteRaw) bits.push(noteRaw)
  if (showColour) bits.push(`warna dia ${colourText}`)
  const detail = bits.join(', ')
  const leads = [
    `Design ni ${detail}.`,
    `Piece ni ${detail}.`,
    `${detail}, itu design dia.`,
  ]
  return finishLine(leads[slot])
}

function normalisePrice(value) {
  let text = clean(value)
  const leading = /^(?:(?:harga|price)\s+)?(?:bermula(?:\s+dari)?|starts?\s+from|from)\s+/i
  for (let guard = 0; guard < 4 && leading.test(text); guard += 1) {
    text = clean(text.replace(leading, ''))
  }
  return text
}

function splitMaterial(material) {
  const text = clean(material)
  if (!text) return { materials: '', finishing: '' }
  const withSplit = text.match(/^(.*?)\s+\bwith\b\s+(.+)$/i)
  if (withSplit && FINISH_WORD.test(withSplit[2])) {
    return { materials: clean(withSplit[1]), finishing: clean(withSplit[2]) }
  }
  if (FINISH_WORD.test(text)) {
    const remainder = text.replace(/\b(?:coatings?|finish(?:es|ing)?|varnish(?:es)?|lacquers?|paints?|sealers?)\b/gi, ' ').replace(/[&,/+–—-]+/g, ' ').replace(/\s+/g, ' ').trim()
    if (!remainder) return { materials: '', finishing: text }
  }
  return { materials: text, finishing: '' }
}

export function productDetails(product = {}) {
  const dimensions = readField(product.dimensions || product.dimension)
  const material = readField(product.material)
  const price = readField(product.price)
  const { materials, finishing } = splitMaterial(material)
  const lines = []
  if (dimensions) lines.push(`- Size: ${dimensions}`)
  if (materials) lines.push(`- Materials: ${materials}`)
  if (finishing) lines.push(`- Finishing: ${finishing}`)
  if (price) lines.push(`- Price starts from ${normalisePrice(price)}`)
  const used = []
  if (price) used.push('price')
  if (materials || finishing) used.push('material')
  if (dimensions) used.push('dimensions')
  return { text: lines.length ? `Product details:\n\n${lines.join('\n')}` : '', used }
}

export function captionBrief({ product = null, topic = '', note = '' } = {}) {
  const record = product || {}
  const name = readField(record.name || record.productName) || readField(topic)
  const colour = readField(record.colour || record.color)
  const noteText = readField(note)
  return {
    name,
    category: readField(record.category),
    colour,
    note: noteText,
    descriptors: designDescriptors(name),
    details: productDetails(record),
  }
}

function line(value, name) {
  const text = typeof value === 'function' ? value(name) : value
  return clean(text)
}

function render(parts) {
  return parts.map((part) => clean(part)).filter(Boolean).join('\n\n')
}

function attach(lines, design, details) {
  const body = render([...lines, design])
  return details ? `${body}\n\n${details}` : body
}

function facebookLines(goal, kind, name, index) {
  return [
    line(OPEN[goal][kind][index], name),
    line(BODY[goal][kind][index], name),
    line(goal === 'tips' ? TIP_MID[kind][index] : MID[kind][index], name),
  ]
}

function instagramLines(goal, kind, name, index) {
  return [
    line(IG_OPEN[goal][kind][index], name),
    line(IG_BODY[kind][index], name),
    line(IG_MID[index], name),
  ]
}

function tiktokLines(kind, name, index) {
  return [
    line(TT_OPEN[kind][index], name),
    `${name} ni.`,
    line(TT_MID[kind][index], name),
  ]
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
  const colour = readField(record.colour || record.color)
  const design = designLine(name, colour, note, index)
  const details = productDetails(record)
  const facebook = attach(facebookLines(selectedGoal, kind, name, index), design, details.text)
  const instagram = attach(instagramLines(selectedGoal, kind, name, index), design, details.text)
  const tiktok = attach(tiktokLines(kind, name, index), design, details.text)

  return {
    facebook,
    instagram,
    tiktok,
    variation: index,
    structureId: `${selectedGoal}-${kind}-${index}`,
    usedFacts: colour ? [...details.used, 'colour'] : details.used,
  }
}
