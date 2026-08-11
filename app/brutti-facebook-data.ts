export type FacebookRequest = {
  name: string;
  product: string;
  objective: string;
  status: "New" | "Review";
  time: string;
  hasContent: boolean;
};

export const facebookRequests: FacebookRequest[] = [
  { name: "Facebook Brand Awareness Post - Test 6", product: "KAANAGAN Open Concept Wardrobe", objective: "Brand Awareness", status: "Review", time: "10 Aug 2026, 3:53 PM", hasContent: true },
  { name: "Facebook Brand Awareness Post - Test 5", product: "KAANAGAN Open Concept Wardrobe with Drawers", objective: "Brand Awareness", status: "Review", time: "10 Aug 2026, 3:02 PM", hasContent: true },
  { name: "Facebook Brand Awareness Post – KAANAGAN", product: "KAANAGAN Open Concept Wardrobe with Drawers", objective: "Brand Awareness", status: "Review", time: "10 Aug 2026, 2:53 PM", hasContent: true },
  { name: "TEST - Rebuilt Notion Module 2026-08-10", product: "AHTAM XL Shelving Rack", objective: "Brand Awareness", status: "Review", time: "10 Aug 2026, 2:31 PM", hasContent: true },
  { name: "TEST - AI Filter", product: "AHTAM XL Shelving Rack", objective: "Brand Awareness", status: "Review", time: "10 Aug 2026, 2:15 PM", hasContent: true },
  { name: "Facebook Brand Awareness Post - BRUTTI", product: "BRUTTI Custom Furniture", objective: "Brand Awareness", status: "Review", time: "10 Aug 2026, 9:59 AM", hasContent: true },
  { name: "TEST 02 - Facebook Product Post", product: "BRUTTI Custom Furniture", objective: "Product Awareness", status: "New", time: "8 Aug 2026, 1:37 PM", hasContent: false },
];

export const facebookGeneratedContent = [
  {
    title: "KAANAGAN Open Concept Wardrobe",
    status: "Review",
    content: `KAANAGAN Open Concept Wardrobe — gabungan reka bentuk terbuka yang elegan dan pertukangan berkualiti, diinspirasikan dari keindahan dan identiti Sabah. Setiap keping dihasilkan secara tempahan khas, menepati citarasa anda dan komitmen BRUTTI terhadap rekaan lestari dan mutu yang tahan lama.\n\nMahukan almari yang mencerminkan gaya hidup dan ruang anda? Hantar DM atau tinggalkan pertanyaan di komen — pasukan kami sedia membantu konsultasi reka bentuk dan tempahan khas.`,
  },
  {
    title: "KAANAGAN with Drawers",
    status: "Review",
    content: `KAANAGAN Open Concept Wardrobe with Drawers — reka bentuk terbuka, fungsi tersusun, hasil kerja tangan yang menyulam inspirasi Sabah ke dalam setiap helaian ruang.\n\nDi BRUTTI, kami menghasilkan perabot khas yang lestari dan disesuaikan mengikut citarasa serta keperluan anda. KAANAGAN menonjolkan estetika ringkas namun praktikal — sesuai untuk mereka yang menghargai kraf berkualiti dan sentuhan tempatan Sabah.\n\nIngin KAANAGAN direka khas untuk rumah anda? Hantar DM atau komen “Info” dan tim kami akan hubungi anda untuk perbincangan reka bentuk.`,
  },
  {
    title: "AHTAM XL Shelving Rack",
    status: "Review",
    content: `AHTAM XL Shelving Rack — penyelesaian storan BRUTTI yang praktikal untuk rumah yang lebih teratur.\n\nDireka khas oleh BRUTTI dengan jiwa Sabah, AHTAM XL menggabungkan rekaan tersuai dan kelestarian untuk menyusun ruang hidup anda dengan penuh elegan dan fungsi. Sesuai untuk ruang tamu, dapur atau bilik kerja — mudah diubah suai mengikut keperluan anda.\n\nHubungi kami hari ini untuk perbincangan reka bentuk tersuai.`,
  },
  {
    title: "Kenali BRUTTI",
    status: "Review",
    content: `Selamat datang ke BRUTTI — jiwa perabot dari Sabah. Kami mencipta perabot bespoke yang menggabungkan warisan kraf tempatan Sabah dengan prinsip lestari, menghasilkan rekaan eksklusif yang tahan lama dan bermakna untuk ruang anda.\n\nBRUTTI Furniture Collection menawarkan sentuhan peribadi, bahan yang dipilih rapi, dan pembuatan teliti — semua dengan penghormatan kepada alam dan komuniti setempat.\n\nTerokai koleksi kami hari ini atau hubungi kami untuk rundingan reka bentuk.`,
  },
] as const;

export const facebookAnalytics = {
  sourcePeriod: "7 Apr 2025 – 23 May 2026",
  verifiedAt: "11 Aug 2026",
  groupPostRows: 5164,
  uniquePosts: 1234,
  pendingRows: 303,
  replyRows: 11,
  groups: 6,
  productMentions: 519,
  attachments: 2177,
  monthly: [
    { month: "Apr 2025", rows: 528, unique: 101 },
    { month: "May 2025", rows: 687, unique: 130 },
    { month: "Jun 2025", rows: 582, unique: 127 },
    { month: "Jul 2025", rows: 674, unique: 117 },
    { month: "Aug 2025", rows: 541, unique: 128 },
    { month: "Sep 2025", rows: 458, unique: 136 },
    { month: "Oct 2025", rows: 387, unique: 108 },
    { month: "Nov 2025", rows: 390, unique: 114 },
    { month: "Dec 2025", rows: 237, unique: 81 },
    { month: "Jan 2026", rows: 370, unique: 100 },
    { month: "Feb 2026", rows: 306, unique: 90 },
    { month: "May 2026", rows: 4, unique: 2 },
  ],
  groupsByActivity: [
    { name: "Penduduk PAPAR/KINARUT/BONGAWAN/KIMANIS", rows: 1393 },
    { name: "KOTA BELUD KINI", rows: 1013 },
    { name: "Rumah sewa beli/perabot baru/terpakai Sabah", rows: 781 },
    { name: "PERABOT SABAH (MARKETPLACE)", rows: 776 },
    { name: "Brunei Buy And Sell Items", rows: 612 },
    { name: "SME Sabah Community", rows: 589 },
  ],
  pillars: [
    { name: "Craftsmanship / bespoke", rows: 1122 },
    { name: "General / other", rows: 353 },
    { name: "Brand / Sabah identity", rows: 20 },
    { name: "Behind the scenes / team", rows: 19 },
    { name: "Product showcase", rows: 14 },
    { name: "Promotion / sales", rows: 6 },
  ],
} as const;

export const facebookCalendar = [
  { day: "Monday", theme: "Product spotlight", product: "KAANAGAN Wardrobe", format: "Facebook post", status: "Draft" },
  { day: "Tuesday", theme: "Craftsmanship", product: "BRUTTI workshop", format: "Photo story", status: "Draft" },
  { day: "Wednesday", theme: "Customer FAQ", product: "Custom furniture", format: "FAQ post", status: "Draft" },
  { day: "Thursday", theme: "Product spotlight", product: "AHTAM XL Rack", format: "Facebook post", status: "Draft" },
  { day: "Friday", theme: "Sabah identity", product: "BRUTTI brand", format: "Brand story", status: "Draft" },
  { day: "Saturday", theme: "Behind the scenes", product: "Artisan team", format: "Photo story", status: "Draft" },
  { day: "Sunday", theme: "Community engagement", product: "BRUTTI collection", format: "Question post", status: "Draft" },
] as const;

export const faqSignals = [
  "Location / showroom",
  "Contact / private message",
  "Payment method",
  "Promotion period",
  "Price / rental",
  "Availability",
] as const;

export const systemFiles = [
  { label: "Facebook marketing requests", status: "7 records embedded" },
  { label: "Facebook generated content", status: "4 drafts embedded" },
  { label: "Product database", status: "88 products · photos pending" },
  { label: "Facebook analytics", status: "Verified snapshot" },
] as const;

export const links = {
  marketingRequests: "https://app.notion.com/p/0275f137041243a78b2debfb6188a42b?pvs=204",
  dailyPlanner: "https://app.notion.com/p/aa9bba5017fd4d279bbb82a2247424d4",
  plannerSheet: "https://docs.google.com/spreadsheets/d/10o2HcCKqbkcvTPx58MKiKG2bx6cnvBtuJULEIEWG8xQ/edit",
  facebookDashboard: "https://docs.google.com/spreadsheets/d/15wgDxhcMq2qup5NiLCXmt_ibI6mVbOLQ0zAO_LSCfNM",
} as const;
