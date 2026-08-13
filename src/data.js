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
    tone: 'Warm & confident',
    aiReview: 'Human Review Required',
    stage: 'Review',
    updatedAt: '13 Aug 2026, 2:40 PM',
    copy: 'Ruang yang tersusun membantu rutin harian terasa lebih tenang.\n\nKAANAGAN Open Concept Wardrobe with Drawers menggabungkan ruang gantung terbuka dan laci tambahan dalam rekaan BRUTTI yang ringkas serta praktikal.\n\nHubungi BRUTTI untuk mendapatkan maklumat produk yang telah disahkan.\n\n#BRUTTI #KAANAGAN #ProudlySabahan',
  },
  {
    id: 102,
    title: 'AHTAM XL Product Feature',
    platform: 'Facebook',
    type: 'Product Highlight',
    product: 'AHTAM XL Shelving Rack',
    language: 'BM + English',
    tone: 'Practical',
    aiReview: 'AI Approved',
    stage: 'Approved',
    updatedAt: '13 Aug 2026, 12:18 PM',
    copy: 'Susun ruang dengan lebih teratur bersama AHTAM XL Shelving Rack.\n\nA practical open shelving option for spaces that value easy access and a clean arrangement.\n\nHubungi BRUTTI untuk maklumat lanjut.\n\n#BRUTTI #AHTAMXL #StorageSolution',
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
    copy: 'Mulakan susunan ruang dengan mengasingkan barang mengikut fungsi dan kekerapan penggunaan. Pilih penyimpanan yang memudahkan capaian serta sesuai dengan ukuran ruang sebenar.\n\nSimpan tip ini untuk rujukan anda.\n\n#BRUTTI #StorageTips #RuangTeratur',
  },
  {
    id: 104,
    title: 'BRUTTI Workshop Story',
    platform: 'Facebook',
    type: 'Behind the Scenes',
    product: 'General / No Product',
    language: 'English',
    tone: 'Proud & purposeful',
    aiReview: 'Blocked',
    stage: 'Draft',
    updatedAt: '12 Aug 2026, 11:20 AM',
    copy: 'A first draft for a workshop story. Add verified workshop details and approved images before this content moves to review.',
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
      { title: 'Facebook Post', description: 'Generate a review-first Facebook caption from verified product details.', type: 'Facebook post' },
      { title: 'Instagram Caption', description: 'Create a concise visual-first caption for a future connected channel.', type: 'Instagram caption' },
      { title: 'TikTok Caption', description: 'Draft a short hook and caption without inventing trends or claims.', type: 'TikTok caption' },
      { title: 'Threads Post', description: 'Turn one verified idea into a natural short-form conversation starter.', type: 'Threads post' },
    ],
  },
  {
    category: 'Video',
    items: [
      { title: 'Reel Script', description: 'Structure hook, scenes, voice-over and CTA for a short product reel.', type: 'Reel script' },
      { title: 'TikTok Script', description: 'Create a paced short-video script using supplied product facts only.', type: 'TikTok script' },
      { title: 'Voice-over', description: 'Write a warm, practical voice-over for approved footage.', type: 'Voice-over' },
    ],
  },
  {
    category: 'Customer Service',
    items: [
      { title: 'Customer Reply', description: 'Prepare a helpful reply while flagging prices and delivery for verification.', type: 'Customer reply' },
      { title: 'Complaint Reply', description: 'Draft an empathetic response and hand-off for human confirmation.', type: 'Complaint reply' },
      { title: 'WhatsApp Reply', description: 'Create a concise response suitable for direct messaging.', type: 'WhatsApp reply' },
    ],
  },
  {
    category: 'Creative',
    items: [
      { title: 'Storytelling', description: 'Turn verified craft or founder notes into a purposeful brand story.', type: 'Brand story' },
      { title: 'Hook Generator', description: 'Generate multiple clear hooks without clickbait or unsupported claims.', type: 'Hook ideas' },
      { title: 'Product Visual Brief', description: 'Describe a realistic Malaysian setting while preserving the original product design.', type: 'Visual brief' },
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
