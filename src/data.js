export const productNames = [
  'AHTAM XL Shelving Rack',
  'AHTAM M Shelving Rack',
  'GANTUNG Open Concept Cloth Rack',
  'BESPOKE RACK',
  'BESPOKE RACK – Open Concept Modular Closet',
  'ADUDU',
  'AGATANG Display Rack',
  'PALANGKO Pastry Rack',
  'PUSMA Display Rack',
  'POPO TV Console',
  'SULOB Bespoke Shoe Rack',
  'TOMODON Shawl/Sampin Organizer',
  'KAANAGAN Open Concept Wardrobe',
  'KAANAGAN Open Concept Wardrobe with Drawers',
  'KOTAK Modular Storage',
  'SUSUN Display Shelf',
]

const categories = ['Storage', 'Wardrobe', 'Display', 'Bespoke']

export const products = productNames.map((name, index) => ({
  id: `BR-${String(index + 1).padStart(3, '0')}`,
  name,
  category: categories[index % categories.length],
  photoConfirmed: index < 10,
  sourceStatus: 'Verified name',
}))

export const initialContent = [
  {
    id: 101,
    title: 'Facebook Brand Awareness Post – KAANAGAN',
    platform: 'Facebook',
    type: 'Brand Awareness',
    product: 'KAANAGAN Open Concept Wardrobe with Drawers',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    aiReview: 'Human Review Required',
    stage: 'Review',
    updatedAt: '13 Aug 2026, 2:40 PM',
    copy: 'Kalau ruang selalu bikin kita pusing cari barang, memang terasa juga tu.\n\nKali ni kami tengah tengok KAANAGAN Open Concept Wardrobe with Drawers.\n\nNama produk sudah verify dalam source Brutti.\n\nTapi detail macam ukuran, material, harga dan availability masih kena check dulu.\n\nJadi sebelum kami cerita lebih jauh, kami kasi pastikan fakta dia betul-betul ngam.\n\nBagi kami, cerita produk mesti mula dari keperluan sebenar ruang.\n\nBukan tambah benda yang kami sendiri belum confirm.\n\nKalau kamu mau tahu detail KAANAGAN, roger ja team Brutti.',
  },
  {
    id: 102,
    title: 'AHTAM XL Product Feature',
    platform: 'Facebook',
    type: 'Product Highlight',
    product: 'AHTAM XL Shelving Rack',
    language: 'BM + English',
    tone: 'Brutti Sabahan Casual',
    aiReview: 'Rule Check Passed',
    stage: 'Approved',
    updatedAt: '13 Aug 2026, 12:18 PM',
    copy: 'Nama dia AHTAM XL Shelving Rack.\n\nYang ni memang ada dalam product source Brutti.\n\nTapi kami tidak mau terus tambah cerita yang belum confirm.\n\nFungsi, ukuran, material dan harga kena ikut detail sebenar project atau product record.\n\nKalau ada cerita di sebalik piece ni, itu yang lagi best untuk dikongsi.\n\nSebab bagi kami furniture bukan setakat rupa.\n\nAda orang, ruang dan kegunaan sebenar di belakang dia.\n\nKalau mau check detail AHTAM XL, mesej ja kami.',
  },
  {
    id: 103,
    title: 'Storage Tips – Educational',
    platform: 'Facebook',
    type: 'Educational',
    product: 'General / No Product',
    language: 'Bahasa Melayu',
    tone: 'Helpful',
    aiReview: 'Human Review Required',
    stage: 'AI Generated',
    updatedAt: '12 Aug 2026, 4:05 PM',
    copy: 'Sebelum fikir mau tambah storage, cuba tinguk rutin ruang tu dulu.\n\nBarang apa yang selalu dicari?\n\nMana yang selalu bikin ruang cepat bersepah?\n\nDari situ baru senang nampak apa yang sebenarnya diperlukan.\n\nKadang solution paling ngam bukan yang paling banyak compartment.\n\nYang penting dia ikut cara ruang tu digunakan hari-hari.\n\nKalau detail ruang belum jelas, ukur dan check dulu sebelum decide.\n\nSimple ja, tapi banyak benda boleh selesai dari situ.',
  },
  {
    id: 104,
    title: 'BRUTTI Workshop Story',
    platform: 'Facebook',
    type: 'Behind the Scenes',
    product: 'General / No Product',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    aiReview: 'Blocked',
    stage: 'Draft',
    updatedAt: '12 Aug 2026, 11:20 AM',
    copy: 'Yang orang nampak selalunya hasil akhir ja.\n\nUntuk workshop story ni, kami belum masukkan detail sebab fakta sebenar belum diberi.\n\nSiapa artisan yang terlibat?\n\nApa benda yang dia sedang buat?\n\nAda process, cabaran atau babak yang betul-betul berlaku ka?\n\nKalau ada, itu yang patut jadi cerita.\n\nBukan ayat kosong pasal “team kami sangat berdedikasi”.\n\nMasukkan detail sebenar dulu sebelum content ni pergi ke review.',
  },
]

export const initialPlans = [
  { id: 201, title: 'KAANAGAN brand awareness', date: '2026-08-17', channel: 'Facebook', type: 'Brand Awareness', status: 'Scheduled', product: 'KAANAGAN Open Concept Wardrobe with Drawers' },
  { id: 202, title: 'Storage tips carousel', date: '2026-08-18', channel: 'Facebook', type: 'Educational', status: 'Review', product: 'General / No Product' },
  { id: 203, title: 'PUSMA product highlight', date: '2026-08-20', channel: 'Facebook', type: 'Product Highlight', status: 'Idea', product: 'PUSMA Display Rack' },
  { id: 204, title: 'BRUTTI workshop story', date: '2026-08-21', channel: 'Facebook', type: 'Behind the Scenes', status: 'Draft', product: 'General / No Product' },
]

export const promptLibrary = [
  {
    category: 'Writing',
    items: [
      { title: 'Facebook Post', description: 'Generate from verified facts using Brutti Soul Master voice, story-first hooks and no hashtags.', type: 'Facebook post' },
      { title: 'Instagram Caption', description: 'Keep the same Brutti Soul voice for a future connected visual channel; never invent context from an image.', type: 'Instagram caption' },
      { title: 'TikTok Caption', description: 'Build a short story-first hook from verified scenes without inventing trends, reactions or claims.', type: 'TikTok caption' },
      { title: 'Threads Post', description: 'Turn one real observation into a natural first-person conversation starter in Brutti voice.', type: 'Threads post' },
    ],
  },
  {
    category: 'Video',
    items: [
      { title: 'Reel Script', description: 'Structure real scenes, story hook, short voice-over and CTA using verified project or people details.', type: 'Reel script' },
      { title: 'TikTok Script', description: 'Create a paced short-video story from supplied facts only, with no invented trend or process detail.', type: 'TikTok script' },
      { title: 'Voice-over', description: 'Write short, human spoken lines from approved footage and verified project facts.', type: 'Voice-over' },
    ],
  },
  {
    category: 'Customer Service',
    items: [
      { title: 'Customer Reply', description: 'Prepare a human reply while keeping price, availability, delivery and specifications verification-first.', type: 'Customer reply' },
      { title: 'Complaint Reply', description: 'Acknowledge the issue, use verified facts and follow Brutti’s principle: when something goes wrong, explain and fix it.', type: 'Complaint reply' },
      { title: 'WhatsApp Reply', description: 'Create a concise, natural response without filling missing details with assumptions.', type: 'WhatsApp reply' },
    ],
  },
  {
    category: 'Creative',
    items: [
      { title: 'Storytelling', description: 'Build from a real artisan story, story behind the piece, founder moment, transparency, daily scene, naming story or Brutti Builders vision.', type: 'Brand story' },
      { title: 'Hook Generator', description: 'Generate story-first hooks using a scene, number or name — not generic promo labels or unsupported clickbait.', type: 'Hook ideas' },
      { title: 'Product Visual Brief', description: 'Describe a realistic setting while preserving verified product design, material and visual references.', type: 'Visual brief' },
    ],
  },
]

export const campaignIdeas = [
  { title: 'Ruang Kemas, Rutin Mudah', pillar: 'Educational + Product', objective: 'Build awareness around practical storage', readiness: 'Ready to plan' },
  { title: 'Proudly Crafted in Sabah', pillar: 'Brand Story', objective: 'Introduce BRUTTI craft and local roots', readiness: 'Needs verified assets' },
  { title: 'Product of the Week', pillar: 'Product Highlight', objective: 'Create a repeatable Facebook series', readiness: 'Ready to plan' },
]

export const pipelineStages = ['Idea', 'Draft', 'AI Generated', 'Review', 'Approved', 'Scheduled', 'Published', 'Archived']

export const verifiedSnapshot = [
  { label: 'Facebook followers', value: '12,001', note: 'Exported records; not live Meta Insights', icon: 'users' },
  { label: 'Incoming reactions', value: '728', note: '390 unique accounts in supplied export', icon: 'heart' },
  { label: 'Product source records', value: '88', note: '16 named previews currently embedded', icon: 'box' },
  { label: 'Marketing requests', value: '7', note: 'Verified embedded request records', icon: 'file' },
]
