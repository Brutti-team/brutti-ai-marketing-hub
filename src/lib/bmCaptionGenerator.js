// Local Bahasa Malaysia captions for Content Studio. No network, no paid model.
// Voice: Brutti Soul Master (short lines, first person, loghat Sabah, light humour)
// plus the shape of Brutti's own Sep 2026 posts: scene or "POV:" first, one point,
// words such as bah, teda, ngam, jaaa, kasi, ni and sia, one or two emojis at line ends,
// then a simple close. No hashtags. No copied post, no borrowed facts.
// A Dusun gloss is not invented when the product name has no verified meaning.
// Blank price, material, size and colour are skipped. Every caption is 4 lines,
// or 5 when a real note or a filled spec needs its own line.

const HUMOUR = {
  wardrobe: 'Sia pun pernah buka almari, pastu terus tutup balik. 🥰',
  storage: 'Cari satu benda kecil kadang makan masa lebih lama dari masak. 🥰',
  display: 'Kalau semua barang menjerit, teda yang kedengaran. 🥰',
  kiosk: 'Kotak terbuka di tepi kaunter dah nampak letih. 🥰',
  bespoke: 'Paksa ruang ikut perabot, akhirnya perabot yang menang. 🥰',
  general: 'Gambar orang lain cantik. Hidup kamu lain. 🥰',
}

const CTA = {
  highlight: [
    'Nak tinguk, mesej kami bah.',
    'Kalau ngam dengan ruang kamu, WhatsApp kami. 😍',
    'Mesej ja, kami dengar dulu. 🥰',
  ],
  promo: [
    'Kalau ngam, WhatsApp kami bah.',
    'Jom cerita pasal ruang kamu. ✨',
    'DM kami kalau piece ni mau kamu tinguk.',
  ],
  customer: [
    'Cerita pada kami pasal ruang kamu bah.',
    'Hantar gambar ruang tu, kami tinguk sama-sama. 🥰',
    'Mesej dulu, kami dengar sebelum cadang apa-apa.',
  ],
  behind: [
    'Nak tinguk hasil, mesej kami bah.',
    'WhatsApp kami kalau nak yang ikut ruang kamu. ✨',
    'DM kami, kami cerita proses dia. 😍',
  ],
  tips: [
    'Simpan dulu tip ni bah.',
    'Nak kami tinguk ruang kamu, mesej ja. 🥰',
    'Susun ikut cara kamu jaaa. ✨',
  ],
}

const CTA_SHORT = {
  highlight: ['Mesej kami bah. 🥰', 'WhatsApp kami. 😍', 'Mesej ja. ✨'],
  promo: ['WhatsApp kami bah.', 'Jom cerita. ✨', 'DM kami. 😍'],
  customer: ['Cerita pada kami bah.', 'Hantar gambar ruang tu. 🥰', 'Mesej, kami dengar dulu.'],
  behind: ['Mesej kami bah.', 'WhatsApp kami. ✨', 'DM kami. 😍'],
  tips: ['Simpan tip ni bah.', 'Mesej ja. 🥰', 'Ikut cara kamu jaaa. ✨'],
}

const OPEN = {
  highlight: {
    wardrobe: [
      'POV: baju bertindih sampai susah nak cari. 🌿',
      HUMOUR.wardrobe,
      'Baju banyak, tapi sudut bilik masih boleh nampak kemas. ✨',
    ],
    storage: [
      'POV: barang hilang sebab teda tempat tetap. 🌿',
      HUMOUR.storage,
      'Rumah atau kedai nampak sesak sebab barang bertindih. ✨',
    ],
    display: [
      'POV: paparan kedai penuh, mata terus pening. 🌿',
      HUMOUR.display,
      'Kedai kecil pun boleh nampak kemas, asalkan paparan dia tak berebut. ✨',
    ],
    kiosk: [
      'POV: kaunter dari jauh, pelanggan dah boleh nampak barang. 🌿',
      HUMOUR.kiosk,
      'Bisnes yang keluar jualan perlukan kaunter yang kemas. ✨',
    ],
    bespoke: [
      'POV: ruang kamu tak muat dengan barang katalog. 🌿',
      HUMOUR.bespoke,
      'Ada ruang yang memang minta piece ikut dia, bukan sebaliknya. ✨',
    ],
    general: [
      'POV: satu sudut dulu, jangan ubah semua sekali. 🌿',
      HUMOUR.general,
      'Barang yang kamu pegang setiap hari patut ada tempat tetap. ✨',
    ],
  },
  promo: {
    wardrobe: [
      'Nak almari yang ikut cara kamu simpan baju? 🌿',
      'Bilik yang baju dia dah teda muat, memang penat tiap pagi. 🥰',
      'Tempat gantung dan tempat lipat, dalam satu piece. ✨',
    ],
    storage: [
      'Nak rak yang ikut barang kamu, bukan yang semua orang beli sama? 🌿',
      'Penat tinguk barang berlonggok, tapi nda tau nak mula dari mana. 🥰',
      'Rak yang ngam ikut barang kamu, bukan ikut katalog. ✨',
    ],
    display: [
      'Nak paparan yang pelanggan nampak terus? 🌿',
      'Kedai yang dah susun berkali-kali, tapi masih nampak sesak. 🥰',
      'Paparan yang jelas, mata tak perlu cari-cari. ✨',
    ],
    kiosk: [
      'Nak kaunter yang ikut cara kamu jualan? 🌿',
      'Penat sewa meja, dengan kotak berlonggok di tepi. 🥰',
      'Kaunter custom, senang dibawa bila pigi event. ✨',
    ],
    bespoke: [
      'Nak piece yang ikut ruang kamu, bukan ikut katalog? 🌿',
      'Barang biasa teda muat, katalog pun dah menyerah. 🥰',
      'Ruang pelik sikit pun boleh ada piece sendiri. ✨',
    ],
    general: [
      'Nak susunan yang ikut cara kamu hidup? 🌿',
      'Ubah semua sekali memang penat. Satu sudut dulu pun dah lega. 🥰',
      'Barang harian dulu, yang jarang keluar biar di tepi. ✨',
    ],
  },
  customer: {
    wardrobe: [
      'Ada bilik yang baju dia selalu bertindih. Kami dengar cerita tu. 🌿',
      'Almari yang ngam selalunya mula dari bilik sebenar, bukan katalog. 🥰',
      'Lain rumah, lain cara simpan baju. ✨',
    ],
    storage: [
      'Ada sudut yang barang dia berlonggok. Itu yang pelanggan tunjuk. 🌿',
      'Rak yang ngam mula dari barang sebenar, bukan dari gambar katalog. 🥰',
      'Lain orang, lain barang yang kena tempat. ✨',
    ],
    display: [
      'Ada kedai yang paparan dia penuh, pelanggan lalu saja. 🌿',
      'Paparan yang ngam mula dari kaunter sebenar. 🥰',
      'Lain kedai, lain barang yang mau ditonjol. ✨',
    ],
    kiosk: [
      'Ada bisnes yang kaunter dia masih meja kosong. 🌿',
      'Kiosk yang ngam mula dari cara kamu layan pelanggan. 🥰',
      'Lain bisnes, lain cara jualan. ✨',
    ],
    bespoke: [
      'Ada ruang yang barang kedai memang tak masuk. 🌿',
      'Piece custom mula bila kamu cerita ruang tu digunakan untuk apa. 🥰',
      'Lain ruang, lain yang wajib muat. ✨',
    ],
    general: [
      'Ada sudut yang kamu sentuh setiap hari, tapi masih bersepah. 🌿',
      'Susunan yang ngam mula bila kami nampak ruang sebenar. 🥰',
      'Lain hari, lain barang yang kamu cari. ✨',
    ],
  },
  behind: {
    wardrobe: [
      'Sebelum almari ni sampai ke bilik, dia melalui tangan kami dulu. 🌿',
      'Yang nampak siap dalam gambar, belakang dia ada kerja custom. 🥰',
      'Orang nampak almari yang dah siap. Kami nampak masa dia masih papan. ✨',
    ],
    storage: [
      'Sebelum rak ni dipasang, kami bikin dia di bengkel. 🌿',
      'Gambar yang kemas tu, ada orang semak sebelum dia keluar. 🥰',
      'Rak ni teda datang dari kontena. ✨',
    ],
    display: [
      'Sebelum rak paparan ni berdiri di kedai, kami bikin dia dulu. 🌿',
      'Kami tinguk dulu dia selesa dipandang, baru dia keluar. 🥰',
      'Pelanggan nampak rak yang dah berisi. Kami ingat rangka dia. ✨',
    ],
    kiosk: [
      'Sebelum kaunter ni ikut kamu keluar jualan, kami siapkan dulu. 🌿',
      'Masa dia masih di bengkel, kami dah bayang pelanggan berdiri di depan. 🥰',
      'Bukan gerai tempahan yang kami tampal logo. ✨',
    ],
    bespoke: [
      'Piece custom ni teda dalam katalog siap. 🌿',
      'Kerja dia banyak masa masih perbincangan, lepas jelas baru kami bikin. 🥰',
      'Soalan pertama kami: ruang ni untuk apa. ✨',
    ],
    general: [
      'Sebelum susunan ni keluar, ada orang yang ukur, potong dan semak. 🌿',
      'Gambar yang kemas tu ada proses di belakang. 🥰',
      'Bukan barang siap yang ditampal nama. ✨',
    ],
  },
  tips: {
    wardrobe: [
      'Sebelum isi almari, asingkan baju gantung dengan baju lipat. 🌿',
      'Baju yang dipakai setiap minggu, letak di tempat tangan terus sampai. 🥰',
      'Pintu almari tersangkut? Keluarkan dulu yang dah nda dipakai. ✨',
    ],
    storage: [
      'Sebelum isi rak, kumpul barang yang sejenis. 🌿',
      'Barang harian, letak di tempat tangan terus sampai. 🥰',
      'Satu paras, satu tugas. Jangan campur aduk. ✨',
    ],
    display: [
      'Barang yang orang selalu tanya, jangan sorok di belakang. 🌿',
      'Paparan yang sesak, orang lalu saja. Bagi dia ruang kosong sikit. 🥰',
      'Pilih satu barang utama. Yang lain sokong dia. ✨',
    ],
    kiosk: [
      'Pastikan pelanggan nampak barang tanpa menjenguk. 🌿',
      'Sebelum bawa kaunter keluar, susun dulu barang yang nak dijual. 🥰',
      'Cuba buka dan tutup sekali sebelum keluar, nanti tak panik. ✨',
    ],
    bespoke: [
      'Sebelum minta piece custom, senaraikan apa yang wajib muat. 🌿',
      'Bawa contoh barang bila nak bincang. Tekaan selalunya meleset. 🥰',
      'Cerita hari biasa ruang tu, bukan hari raya saja. ✨',
    ],
    general: [
      'Mula dengan barang yang kamu pegang setiap hari. 🌿',
      'Tinguk satu hari biasa dulu, baru ubah susunan. 🥰',
      'Jangan ubah serentak. Satu sudut, kemudian sudut seterusnya. ✨',
    ],
  },
}

const BODY = {
  highlight: {
    wardrobe: [
      (n) => `${n} ni untuk tempat gantung, dan laci untuk yang dilipat.`,
      (n) => `${n} ngam bila baju banyak tapi bilik mau tetap lega.`,
      (n) => `Sebelah untuk gantung, sebelah untuk lipat. Itu guna ${n} ni.`,
    ],
    storage: [
      (n) => `${n} ni bagi setiap benda sudut dia sendiri.`,
      (n) => `${n} ngam bila ruang kecil, tapi barang yang kena simpan tetap banyak.`,
      (n) => `Barang yang bertindih, ${n} ni kasi nampak balik.`,
    ],
    display: [
      (n) => `${n} ni untuk susun barang supaya yang penting nampak dulu.`,
      (n) => `${n} ngam untuk kaunter atau dinding kedai.`,
      (n) => `Paparan kedai yang kemas, itu kerja ${n} ni.`,
    ],
    kiosk: [
      (n) => `${n} ni kaunter yang kami bikin ikut cara kamu layan pelanggan.`,
      (n) => `${n} ngam bila kamu jual di luar, barang jangan tertimbus.`,
      (n) => `Bukan meja kosong. ${n} ni untuk bisnes kamu.`,
    ],
    bespoke: [
      (n) => `${n} ni untuk ruang yang barang kedai tak muat.`,
      (n) => `${n} ngam bila katalog dah tak cukup.`,
      (n) => `Ikut ruang kamu. Itu ${n} ni.`,
    ],
    general: [
      (n) => `${n} ni, kami cadang ikut cara kamu guna ruang tu.`,
      (n) => `${n} ngam bila satu sudut dikemaskan dulu.`,
      (n) => `Barang harian ada tempat. Itu mula untuk ${n} ni.`,
    ],
  },
  promo: {
    wardrobe: [
      (n) => `${n} ni kami bikin custom kat Sabah, ikut baju kamu.`,
      (n) => `${n} untuk bilik yang almari lama dia dah tak muat.`,
      (n) => `Kalau ${n} ngam dengan bilik kamu, kami bikin ikut cara kamu simpan.`,
    ],
    storage: [
      (n) => `${n} ni untuk rumah atau kedai yang barang dia selalu berlonggok.`,
      (n) => `${n} kami bikin custom kat Sabah, ikut barang yang kamu simpan.`,
      (n) => `${n} ni, bukan rak yang semua rumah dapat sama.`,
    ],
    display: [
      (n) => `${n} ni untuk kedai yang mau pelanggan nampak barang terus.`,
      (n) => `${n} kami bikin custom kat Sabah, ikut cara kedai kamu jual.`,
      (n) => `${n} ni, bukan rak pajang yang semua kedai nampak sama.`,
    ],
    kiosk: [
      (n) => `${n} ni kami bikin custom kat Sabah, untuk jualan kamu.`,
      (n) => `${n} untuk event, pop-up atau kedai yang mau kaunter sendiri.`,
      (n) => `${n} ni untuk jualan yang mau kaunter sendiri.`,
    ],
    bespoke: [
      (n) => `${n} ni kami bikin kat Sabah bila katalog tak cukup.`,
      (n) => `${n} untuk ruang yang ikut hidup kamu, bukan ikut orang lain.`,
      (n) => `${n} ni, kami dengar dulu baru bikin.`,
    ],
    general: [
      (n) => `${n} ni, kalau ada kena dengan ruang kamu, kami bikin custom kat Sabah.`,
      (n) => `${n} untuk yang mau susunan lebih kemas, tanpa teka.`,
      (n) => `Nak bincang ${n}? Kami kat Sabah.`,
    ],
  },
  customer: {
    wardrobe: [
      (n) => `Kalau baju kamu macam tu, ${n} ni boleh jadi tempat gantung dan lipat.`,
      (n) => `${n} selalunya mula bila seseorang tunjuk bilik dia.`,
      (n) => `${n} ni ikut baju kamu. Lain rumah, lain susunan.`,
    ],
    storage: [
      (n) => `Kalau barang kamu macam tu, ${n} ni kami susun ikut apa yang kena duduk.`,
      (n) => `${n} selalunya mula dari sudut yang berlonggok.`,
      (n) => `${n} ni tak sama untuk setiap orang.`,
    ],
    display: [
      (n) => `Kalau kedai kamu macam tu, ${n} ni kasi barang penting duduk depan.`,
      (n) => `${n} selalunya mula dari kaunter kedai yang sebenar.`,
      (n) => `Paparan ${n} ikut cara kedai tu jual.`,
    ],
    kiosk: [
      (n) => `Kalau jualan kamu macam tu, ${n} ni ikut cara kamu layan orang.`,
      (n) => `${n} mula bila kamu cerita pasal bisnes, bukan salin gerai orang.`,
      (n) => `${n} ni, lain bisnes, lain susunan.`,
    ],
    bespoke: [
      (n) => `Kalau ruang kamu macam tu, ${n} ni kami dengar dulu.`,
      (n) => `${n} mula dari senarai apa yang wajib muat.`,
      (n) => `Kerja ${n}, lepas jelas baru kami bikin kat Sabah.`,
    ],
    general: [
      (n) => `Untuk ${n} ni, cerita macam mana kamu guna ruang tu setiap hari.`,
      (n) => `${n} lagi jelas bila kami nampak ruang sebenar.`,
      (n) => `Setiap permintaan pasal ${n} kami layan satu-satu.`,
    ],
  },
  behind: {
    wardrobe: [
      (n) => `${n} ni kami bikin kat Sabah. Bukan almari tampal nama.`,
      (n) => `Belakang gambar ${n}, ada tangan yang semak sebelum dia keluar.`,
      (n) => `${n} ni masa masih papan. Itu yang kami nampak dulu.`,
    ],
    storage: [
      (n) => `${n} ni kami bikin sendiri. Bukan rak tampal logo.`,
      (n) => `${n} disemak dulu, baru dia keluar dari bengkel.`,
      (n) => `${n} ni keluar dari kerja kami kat Sabah.`,
    ],
    display: [
      (n) => `${n} ni kami bikin untuk kedai, bukan rak pajang beli lalu letak nama.`,
      (n) => `Sebelum ${n} tunjuk barang orang, kami pastikan dia selesa dipandang.`,
      (n) => `Rangka ${n} dulu. Barang kemudian.`,
    ],
    kiosk: [
      (n) => `${n} ni kami siapkan kat Sabah sebelum dia ikut kamu keluar.`,
      (n) => `${n} tak sama setiap satu, sebab cara jualan kamu pun tak sama.`,
      (n) => `${n} ni bukan gerai yang kami tempah siap.`,
    ],
    bespoke: [
      (n) => `${n} ni kami bikin bila permintaan tu sampai, bukan dari katalog siap.`,
      (n) => `Perbincangan dulu, kemudian ${n} baru kami buat.`,
      (n) => `Dari soalan ruang tu, baru ${n} kami bikin.`,
    ],
    general: [
      (n) => `${n} ni kami bikin custom kat Sabah.`,
      (n) => `Ada orang di belakang ${n} sebelum gambar dia kemas.`,
      (n) => `${n} nampak mudah. Belakang dia ada keputusan kecil.`,
    ],
  },
  tips: {
    wardrobe: [
      (n) => `Dalam ${n} ni, baju gantung sebelah, baju lipat sebelah.`,
      (n) => `Dalam ${n}, baju mingguan jangan kasi baju setahun rebut tempat depan.`,
      (n) => `${n} pun lega bila yang dah tak dipakai dikeluarkan dulu.`,
    ],
    storage: [
      (n) => `Lepas dikumpul, baru isi ${n} ni. Rak terus nampak lebih lapang.`,
      (n) => `Kat ${n} ni, barang harian di paras tangan. Yang jarang, atas sekali.`,
      (n) => `${n} lagi berguna bila satu paras buat satu kerja.`,
    ],
    display: [
      (n) => `Kat ${n} ni, kasi dia duduk depan. Yang lain, tepi sikit.`,
      (n) => `Jangan sesakkan ${n}. Ruang kosong sikit kasi barang nampak.`,
      (n) => `Pada ${n} ni, satu barang utama. Yang lain sokong.`,
    ],
    kiosk: [
      (n) => `Kat ${n} ni, barang patut nampak tanpa menjenguk.`,
      (n) => `Yang tinggal, biar dalam kotak. Jangan kasi ${n} nampak macam stor.`,
      (n) => `${n} lagi senang dijaga kalau kamu dah cuba buka tutup sekali.`,
    ],
    bespoke: [
      (n) => `Senarai tu jadikan permulaan untuk ${n} ni.`,
      (n) => `Contoh barang bantu kami faham ${n}, lebih dari tekaan.`,
      (n) => `Hari biasa ruang tu yang tunjuk ${n} patut disusun macam mana.`,
    ],
    general: [
      (n) => `Untuk ${n} ni, bagi barang harian tempat tetap dulu.`,
      (n) => `Sebelum ubah ${n} ni, tinguk barang mana yang dicari dan yang hanya lalu.`,
      (n) => `${n} tak perlu diubah serentak. Satu sudut dulu.`,
    ],
  },
}

const MID = {
  wardrobe: [
    'Kami bikin dia custom kat Sabah, ikut cara kamu simpan baju.',
    'Bukan almari yang semua rumah dapat sama bah.',
    'Custom kat Sabah, satu bilik dengan bilik lain memang lain.',
  ],
  storage: [
    'Kami bikin dia custom kat Sabah.',
    'Ikut barang kamu, bukan ikut rak orang bah.',
    'Satu rak, satu permintaan. Kerja dia kat Sabah.',
  ],
  display: [
    'Kami bikin dia custom kat Sabah, ikut cara kedai kamu berniaga.',
    'Bukan rak pajang yang semua kedai nampak sama bah.',
    'Kasi paparan tu jelas, pelanggan terus tau mana nak tinguk.',
  ],
  kiosk: [
    'Kami bikin dia custom kat Sabah.',
    'Ikut cara kamu jualan, bukan salin gerai orang bah.',
    'Custom kat Sabah, satu kaunter dengan kaunter lain lain.',
  ],
  bespoke: [
    'Kami dengar dulu, baru bikin kat Sabah.',
    'Bukan barang katalog yang dipaksa masuk bah.',
    'Kerja custom dia kami siapkan kat Sabah.',
  ],
  general: [
    'Custom kat Sabah, ikut kehidupan harian kamu.',
    'Bukan susunan gambar orang lain bah.',
    'Satu sudut dulu pun dah rasa lain.',
  ],
}

const IG_OPEN = {
  highlight: {
    wardrobe: ['Baju bertindih, susah cari kan. 🌿', 'Almari penuh sampai susah tutup. 🥰', 'Gantung sebelah, lipat sebelah. ✨'],
    storage: ['Barang hilang sebab teda tempat. 🌿', 'Ruang kecil, barang tetap banyak. 🥰', 'Barang bertindih di satu sudut. ✨'],
    display: ['Paparan penuh, mata pening. 🌿', 'Semua barang menjerit serentak. 🥰', 'Kedai kecil, paparan tetap kemas. ✨'],
    kiosk: ['Kaunter kena nampak dari jauh. 🌿', 'Barang jangan tertimbus dalam kotak. 🥰', 'Bukan meja kosong. ✨'],
    bespoke: ['Barang kedai tak muat. 🌿', 'Katalog dah tak cukup. 🥰', 'Ruang kamu yang tentukan. ✨'],
    general: ['Satu sudut dulu. 🌿', 'Jangan ubah semua sekali. 🥰', 'Barang harian ada tempat. ✨'],
  },
  promo: {
    wardrobe: ['Nak almari ikut baju kamu? 🌿', 'Baju dah teda muat. 🥰', 'Tempat gantung, tempat lipat. ✨'],
    storage: ['Nak rak ikut barang kamu? 🌿', 'Barang dah berlonggok. 🥰', 'Bukan rak katalog. ✨'],
    display: ['Nak paparan yang terus nampak? 🌿', 'Kedai masih sesak. 🥰', 'Mata tak payah cari. ✨'],
    kiosk: ['Nak kaunter ikut jualan kamu? 🌿', 'Penat sewa meja. 🥰', 'Senang bawa bila pigi event. ✨'],
    bespoke: ['Nak ikut ruang kamu? 🌿', 'Barang biasa tak masuk. 🥰', 'Ruang pelik pun boleh. ✨'],
    general: ['Nak susunan ikut hidup kamu? 🌿', 'Satu sudut dulu pun lega. 🥰', 'Barang harian dulu. ✨'],
  },
  customer: {
    wardrobe: ['Cerita baju apa yang kena tempat. 🌿', 'Mula dari bilik sebenar. 🥰', 'Lain rumah, lain almari. ✨'],
    storage: ['Cerita barang apa yang kena tempat. 🌿', 'Mula dari sudut berlonggok. 🥰', 'Lain orang, lain rak. ✨'],
    display: ['Cerita barang yang kamu jual. 🌿', 'Mula dari kaunter kedai. 🥰', 'Lain kedai, lain tonjolan. ✨'],
    kiosk: ['Cerita cara kamu jualan. 🌿', 'Mula dari bisnes kamu. 🥰', 'Lain bisnes, lain kiosk. ✨'],
    bespoke: ['Cerita apa yang wajib muat. 🌿', 'Mula dari ruang sebenar. 🥰', 'Lain ruang, lain piece. ✨'],
    general: ['Cerita macam mana ruang tu diguna. 🌿', 'Lebih jelas bila kami nampak. 🥰', 'Kami layan satu-satu. ✨'],
  },
  behind: {
    wardrobe: ['Kami bikin kat Sabah. 🌿', 'Belakang gambar ada kerja custom. 🥰', 'Masa dia masih papan. ✨'],
    storage: ['Dari bengkel kami. 🌿', 'Disemak dulu sebelum keluar. 🥰', 'Teda dari kontena. ✨'],
    display: ['Kami bikin untuk kedai. 🌿', 'Kami tinguk dia selesa dipandang. 🥰', 'Rangka dulu, barang kemudian. ✨'],
    kiosk: ['Disiapkan sebelum keluar jualan. 🌿', 'Pelanggan kami bayang dari bengkel. 🥰', 'Bukan gerai tampal logo. ✨'],
    bespoke: ['Teda dalam katalog siap. 🌿', 'Perbincangan dulu, baru bikin. 🥰', 'Ruang ni untuk apa. ✨'],
    general: ['Custom, kat Sabah. 🌿', 'Ada proses di belakang gambar. 🥰', 'Nampak mudah, ada keputusan kecil. ✨'],
  },
  tips: {
    wardrobe: ['Asingkan baju gantung dan baju lipat. 🌿', 'Baju mingguan, tempat senang capai. 🥰', 'Keluarkan yang dah lama diam. ✨'],
    storage: ['Kumpul barang sejenis dulu. 🌿', 'Barang harian di paras tangan. 🥰', 'Satu paras, satu tugas. ✨'],
    display: ['Jangan sorok barang yang selalu ditanya. 🌿', 'Bagi ruang kosong sikit. 🥰', 'Satu barang utama saja. ✨'],
    kiosk: ['Barang patut nampak tanpa menjenguk. 🌿', 'Susun jualan sebelum keluar. 🥰', 'Cuba buka tutup sekali dulu. ✨'],
    bespoke: ['Senaraikan yang wajib muat. 🌿', 'Bawa contoh barang. 🥰', 'Cerita hari biasa. ✨'],
    general: ['Mula dari barang harian. 🌿', 'Tinguk satu hari biasa dulu. 🥰', 'Satu sudut, kemudian sebelah. ✨'],
  },
}

const IG_BODY = {
  wardrobe: [
    (n) => `${n} ni. Tempat gantung, tempat lipat.`,
    (n) => `${n} untuk bilik yang mau lega.`,
    (n) => `${n}, kami bikin kat Sabah.`,
  ],
  storage: [
    (n) => `${n} ni, untuk rumah atau kedai.`,
    (n) => `${n} bila barang tetap banyak.`,
    (n) => `${n}, kami bikin kat Sabah.`,
  ],
  display: [
    (n) => `${n} ni, kasi yang penting duduk depan.`,
    (n) => `${n} untuk kaunter kedai.`,
    (n) => `${n} ni, custom kat Sabah.`,
  ],
  kiosk: [
    (n) => `${n} ni untuk jualan kamu.`,
    (n) => `${n}, barang nampak bukan tertimbus.`,
    (n) => `${n} kami bikin kat Sabah.`,
  ],
  bespoke: [
    (n) => `${n} ni ikut ruang kamu.`,
    (n) => `${n} bila katalog tak cukup.`,
    (n) => `${n} kami bikin kat Sabah.`,
  ],
  general: [
    (n) => `${n} ni, ikut cara kamu hidup.`,
    (n) => `${n}, satu sudut dulu.`,
    (n) => `${n} kami bikin kat Sabah.`,
  ],
}

const TIP_MID = {
  wardrobe: [
    'Dari situ baru nampak dia lega, atau masih sesak.',
    'Yang jarang dipakai, jangan rebut tempat depan.',
    'Baru susun semula. Almari pun rasa lega.',
  ],
  storage: [
    'Kamu tak payah gali untuk cari satu benda.',
    'Yang jarang keluar, atas sekali pun tak mengapa.',
    'Cuba satu jenis barang dulu.',
  ],
  display: [
    'Pelanggan terus tau mana nak tinguk.',
    'Barang nampak lebih jelas bila ada ruang.',
    'Kalau semua sama kuat, teda yang diingat.',
  ],
  kiosk: [
    'Laluan depan kaunter, biar jelas.',
    'Kaunter tak perlu nampak macam stor.',
    'Nanti di luar, lebih tenang.',
  ],
  bespoke: [
    'Perbualan dengan kami terus lebih jelas.',
    'Gambar ruang pun membantu.',
    'Hari biasa yang tunjuk susunan yang patut.',
  ],
  general: [
    'Yang jarang keluar, jangan duduk di depan.',
    'Dari situ baru susun.',
    'Kemaskan satu sudut, baru pergi ke sebelah.',
  ],
}

const IG_MID = [
  'Kami bikin custom kat Sabah.',
  'Ikut ruang kamu bah.',
  'Simple ja kan, tapi fungsi dia jelas.',
]

const TT_OPEN = {
  wardrobe: ['Baju bertindih lagi. 🌿', 'Almari penuh, mood pun penat. 🥰', 'Satu bilik, satu fungsi. ✨'],
  storage: ['Barang hilang lagi. 🌿', 'Masa habis cari satu benda. 🥰', 'Sudut yang sesak. ✨'],
  display: ['Mata pening kat paparan. 🌿', 'Barang terlalu ramai menjerit. 🥰', 'Kedai kecil boleh kemas. ✨'],
  kiosk: ['Kaunter dari jauh. 🌿', 'Kotak tepi nampak letih. 🥰', 'Bukan meja kosong. ✨'],
  bespoke: ['Ruang yang pelik sikit. 🌿', 'Katalog dah menyerah. 🥰', 'Ikut ruang kamu. ✨'],
  general: ['Satu sudut dulu. 🌿', 'Jangan ubah serentak. 🥰', 'Barang harian dulu. ✨'],
}

const TT_MID = {
  wardrobe: ['Tempat gantung, tempat lipat.', 'Bilik yang mau lega.', 'Kami bikin kat Sabah.'],
  storage: ['Setiap benda ada sudut.', 'Ikut barang kamu.', 'Kami bikin kat Sabah.'],
  display: ['Yang penting duduk depan.', 'Kasi paparan jelas.', 'Custom kat Sabah.'],
  kiosk: ['Barang nampak dari jauh.', 'Ikut cara kamu jualan.', 'Kami bikin kat Sabah.'],
  bespoke: ['Ikut ruang, bukan katalog.', 'Kami dengar dulu.', 'Kerja dia kat Sabah.'],
  general: ['Ikut cara kamu hidup.', 'Satu sudut dulu.', 'Custom kat Sabah.'],
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

function line(value, name) {
  const text = typeof value === 'function' ? value(name) : value
  return clean(text)
}

function render(parts) {
  return parts.map((part) => clean(part)).filter(Boolean).join('\n\n')
}

function compose(base, note, spec) {
  const [a, b, c, d] = base
  if (note && spec) return render([a, b, note, spec, d])
  if (note) return render([a, b, note, d])
  if (spec) return render([a, b, spec, c, d])
  return render([a, b, c, d])
}

function facebookLines(goal, kind, name, index) {
  return [
    line(OPEN[goal][kind][index], name),
    line(BODY[goal][kind][index], name),
    line(goal === 'tips' ? TIP_MID[kind][index] : MID[kind][index], name),
    line(CTA[goal][index], name),
  ]
}

function instagramLines(goal, kind, name, index) {
  return [
    line(IG_OPEN[goal][kind][index], name),
    line(IG_BODY[kind][index], name),
    line(IG_MID[index], name),
    line(CTA_SHORT[goal][index], name),
  ]
}

function tiktokLines(goal, kind, name, index) {
  return [
    line(TT_OPEN[kind][index], name),
    `${name} ni.`,
    line(TT_MID[kind][index], name),
    line(CTA_SHORT[goal][index], name),
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
  const specs = specsFromProduct(record)
  const noteText = tidyNote(note)
  const specText = spokenSpecs(specs)
  const facebook = compose(facebookLines(selectedGoal, kind, name, index), noteText, specText)
  const instagram = compose(instagramLines(selectedGoal, kind, name, index), noteText, specText)
  const tiktok = compose(tiktokLines(selectedGoal, kind, name, index), noteText, specText)

  return {
    facebook,
    instagram,
    tiktok,
    variation: index,
    structureId: `${selectedGoal}-${kind}-${index}`,
    usedFacts: specs.map((item) => item.key),
  }
}
