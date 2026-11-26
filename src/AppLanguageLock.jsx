import { useEffect } from 'react'
import { EXTRA_PAIRS, TEMPLATES, ATTRIBUTE_TEMPLATES, MONTH_PAIRS } from './lib/uiTranslations.js'

const STORAGE_KEY = 'brutti-ui-language-v1'
const LANGUAGE_EVENT = 'brutti:languagechange'
const SUPPORTED = new Set(['bm', 'en'])

// System interface copy only. Product names and user-entered content are deliberately excluded.
const PAIRS = [
  ['FREE CONTENT ASSIST', 'BANTUAN KANDUNGAN PERCUMA'],
  ['MARKETING CONTROL CENTRE', 'PUSAT KAWALAN PEMASARAN'],
  ['CONTENT CALENDAR', 'KALENDAR KANDUNGAN'],
  ['RULE-BASED OBSERVATION', 'PEMERHATIAN BERASASKAN PERATURAN'],
  ['CONTENT ACTIVITY', 'AKTIVITI KANDUNGAN'],
  ['← Previous', '← Sebelum'],
  ['Next →', 'Seterusnya →'],
  ['Add', 'Tambah'],
  ['MON', 'ISN'],
  ['TUE', 'SEL'],
  ['WED', 'RAB'],
  ['THU', 'KHA'],
  ['FRI', 'JUM'],
  ['SAT', 'SAB'],
  ['SUN', 'AHD'],
  ['FRI · TODAY', 'JUM · HARI INI'],
  ['Operational marketing analytics update from the workspace. Meta performance KPI stay excluded until a verified Insights source exists.', 'Analitik pemasaran operasi daripada ruang kerja. KPI prestasi Meta hanya dipaparkan apabila sumber Insight yang disahkan tersedia.'],
  ['Operational marketing analytics from the workspace with a verified daily Meta performance reference.', 'Analitik pemasaran operasi daripada ruang kerja dengan rujukan prestasi Meta harian yang disahkan.'],
  ['Meta KPI excluded', 'KPI Meta belum tersedia'],
  ['Notion backend sync is not configured yet; Google remains the current operational source.', 'Penyelarasan backend Notion belum disediakan; Google kekal sebagai sumber operasi semasa.'],
  ['Create and refine Facebook captions in Brutti Sabahan casual style, then send them for human review.', 'Cipta dan kemaskan kapsyen Facebook dalam gaya Brutti Sabahan yang santai, kemudian hantar untuk semakan manusia.'],
  ['Content direction', 'Arah kandungan'],
  ['Only use facts you can verify.', 'Gunakan fakta yang boleh disahkan sahaja.'],
  ['Content title', 'Tajuk kandungan'],
  ['Content type', 'Jenis kandungan'],
  ['Product', 'Produk'],
  ['Verified facts / direction', 'Fakta disahkan / arah kandungan'],
  ['Write your rough sentence or add confirmed product details and campaign direction.', 'Tulis ayat ringkas atau tambah butiran produk dan arah kempen yang telah disahkan.'],
  ['Generate free structured draft', 'Jana draf berstruktur'],
  ['Free Assist', 'Bantuan Percuma'],
  ['Content Library', 'Pustaka Kandungan'],
  ['Add content', 'Tambah kandungan'],
  ['Add asset', 'Tambah aset'],
  ['Save', 'Simpan'],
  ['Save changes', 'Simpan perubahan'],
  ['Delete', 'Padam'],
  ['Cancel', 'Batal'],
  ['Close', 'Tutup'],
  ['Edit', 'Sunting'],
  ['Preview', 'Pratonton'],
  ['Refresh', 'Muat semula'],
  ['Search assets…', 'Cari aset…'],
  ['Search products, category or price…', 'Cari produk, kategori atau harga…'],
  ['Search saved ideas…', 'Cari idea disimpan…'],
  ['Search name, product, project or tags…', 'Cari nama, produk, projek atau tag…'],
  ['All categories', 'Semua kategori'],
  ['All sources', 'Semua sumber'],
  ['All', 'Semua'],
  ['Show hidden', 'Tunjuk yang disembunyikan'],
  ['Use', 'Guna'],
  ['Use in Content Studio', 'Guna dalam Studio Kandungan'],
  ['Folders', 'Folder'],
  ['Mark read', 'Tanda dibaca'],
  ['Mark all read', 'Tanda semua dibaca'],
  ['Action Center', 'Pusat Tindakan'],
  ['Open Planner', 'Buka Perancang'],
  ['Open Review', 'Buka Semakan'],
  ['Check Settings', 'Semak Tetapan'],
  ['Today', 'Hari ini'],
  ['Previous', 'Sebelum'],
  ['Next', 'Seterusnya'],
  ['Week', 'Minggu'],
  ['Month', 'Bulan'],
  ['Show less', 'Tunjuk kurang'],
  ['Save Idea', 'Simpan Idea'],
  ['Idea / title', 'Idea / tajuk'],
  ['Notes / facts', 'Nota / fakta'],
  ['Future content', 'Kandungan masa depan'],
  ['Free Mode Ready', 'Mod Percuma Sedia'],
  ['Human Review Required', 'Semakan manusia diperlukan'],
  ['Google connected', 'Google bersambung'],
  ['Google workspace active', 'Ruang kerja Google aktif'],
  ['Local workspace active', 'Ruang kerja tempatan aktif'],
  ['Light', 'Cerah'],
  ['Dark', 'Gelap'],
  ['Connection status', 'Status sambungan'],
  ['Google Sheet sync', 'Penyelarasan Google Sheet'],
  ['Daily sheet snapshot', 'Snapshot harian Sheet'],
  ['Google Sheet synced today', 'Google Sheet diselaraskan hari ini'],
  ['Daily post performance reference', 'Rujukan prestasi siaran harian'],
  ['Highest Views', 'Tontonan tertinggi'],
  ['Highest Likes', 'Suka tertinggi'],
  ['Highest Comments', 'Komen tertinggi'],
  ['Highest Engagement', 'Penglibatan tertinggi'],
  ['Daily content reference', 'Rujukan kandungan harian'],
  ['Which post performed best?', 'Siaran manakah paling berprestasi?'],
  ['No verified post data yet', 'Belum ada data siaran yang disahkan'],
  ['No assets match this search.', 'Tiada aset sepadan dengan carian ini.'],
  ['No products match this search.', 'Tiada produk sepadan dengan carian ini.'],
  ['General / No Product', 'Umum / Tiada Produk'],
  ['Brand Awareness', 'Kesedaran Jenama'],
  ['Product Highlight', 'Sorotan Produk'],
  ['Educational', 'Pendidikan'],
  ['Behind the Scenes', 'Di Sebalik Tabir'],
  ['Customer Story', 'Cerita Pelanggan'],
  ['Promotion', 'Promosi'],
  ['CONTENT WORKFLOW', 'ALIRAN KANDUNGAN'],
  ['TODAY’S RECOMMENDATION', 'CADANGAN HARI INI'],
  ["TODAY'S RECOMMENDATION", 'CADANGAN HARI INI'],
  ['BEST TIME TO POST', 'MASA TERBAIK UNTUK SIAR'],
  ['POSTING TIME', 'WAKTU SIARAN'],
  ['TARGET', 'SASARAN'],
  ['OBJECTIVE', 'OBJEKTIF'],
  ['SUGGESTED FORMAT', 'FORMAT DICADANGKAN'],
  ['VERIFIED PRODUCT SOURCE', 'SUMBER PRODUK DISAHKAN'],
  ['CREATIVE SOURCE FILES', 'FAIL SUMBER KREATIF'],
  ['VERIFIED ACTIVITY DATA', 'DATA AKTIVITI DISAHKAN'],
  ['LIVE META INSIGHTS', 'INSIGHT META LANGSUNG'],
  ['DAILY CONTENT REFERENCE', 'RUJUKAN KANDUNGAN HARIAN'],
  ['Content Workflow', 'Aliran Kandungan'],
  ['Pipeline at a glance', 'Gambaran keseluruhan aliran'],
  ['View library', 'Lihat pustaka'],
  ['Idea', 'Idea'],
  ['Draft', 'Draf'],
  ['AI Generated', 'Dijana AI'],
  ['Review', 'Semakan'],
  ['Approved', 'Diluluskan'],
  ['Scheduled', 'Dijadualkan'],
  ['Published', 'Diterbitkan'],
  ['Archived', 'Diarkibkan'],
  ['Today’s Recommendation', 'Cadangan Hari Ini'],
  ['3 content ideas for today', '3 idea kandungan untuk hari ini'],
  ['Best time to post', 'Masa terbaik untuk siar'],
  ['Posting time', 'Waktu siaran'],
  ['Target', 'Sasaran'],
  ['Objective', 'Objektif'],
  ['Suggested format', 'Format dicadangkan'],
  ['Morning audience window', 'Waktu audiens pagi'],
  ['Midday audience window', 'Waktu audiens tengah hari'],
  ['Afternoon audience window', 'Waktu audiens petang'],
  ['Use This Idea', 'Guna Idea Ini'],
  ['Add to Planner', 'Tambah ke Perancang'],
  ['Campaign Planner', 'Perancang Kempen'],
  ['Content Calendar', 'Kalendar Kandungan'],
  ['A weekly planner for Brutti’s daily content operations.', 'Perancang mingguan untuk operasi kandungan Brutti setiap hari.'],
  ['Monthly content calendar for daily BRUTTI marketing operations.', 'Kalendar kandungan bulanan untuk operasi pemasaran Brutti setiap hari.'],
  ['Dynamic weekly planner for daily BRUTTI marketing operations.', 'Perancang mingguan dinamik untuk operasi pemasaran Brutti setiap hari.'],
  ['planned items', 'item dirancang'],
  ['planned item', 'item dirancang'],
  ['Idea Vault', 'Ruang Idea'],
  ['Save ideas without a date. They stay out of the calendar until you decide when to use them.', 'Simpan idea tanpa tarikh. Idea tidak masuk dalam kalendar sehingga anda memilih bila mahu menggunakannya.'],
  ['Example: Custom kiosk story for an event', 'Contoh: Cerita kiosk khas untuk acara'],
  ['Content Studio', 'Studio Kandungan'],
  ['Create and refine Facebook captions in Brutti style, then send them for human review.', 'Cipta dan kemaskan kapsyen Facebook mengikut gaya Brutti, kemudian hantar untuk semakan manusia.'],
  ['e.g. KAANAGAN product highlight', 'cth. sorotan produk KAANAGAN'],
  ['Product Library', 'Pustaka Produk'],
  ['Verified Product Source', 'Sumber Produk Disahkan'],
  ['Use verified product details from BRUTTI sources. Notion sync can load the full product table through the secured backend.', 'Gunakan butiran produk Brutti yang disahkan daripada sumber dalaman. Penyelarasan Notion boleh memuatkan jadual produk penuh melalui sistem selamat.'],
  ['loaded', 'dimuatkan'],
  ['Sync Notion products', 'Selaraskan produk Notion'],
  ['Syncing…', 'Sedang menyelaras…'],
  ['Photo confirmed', 'Foto disahkan'],
  ['Facebook post photo', 'Foto post Facebook'],
  ['Instagram post photo', 'Foto post Instagram'],
  ['Verified source', 'Sumber disahkan'],
  ['Uncategorised', 'Tanpa kategori'],
  ['Verified name. Add specifications from the source before making product claims.', 'Nama disahkan. Tambah spesifikasi daripada sumber sebelum membuat tuntutan produk.'],
  ['View details', 'Lihat butiran'],
  ['View full picture', 'Lihat gambar penuh'],
  ['Download', 'Muat turun'],
  ['Create product content', 'Cipta kandungan produk'],
  ['Asset Library', 'Pustaka Aset'],
  ['Creative Source Files', 'Fail Sumber Kreatif'],
  ['Find, organise and select approved visuals without changing the Content Studio workflow.', 'Cari, susun dan pilih visual yang diluluskan tanpa mengubah aliran Studio Kandungan.'],
  ['Drive assets loaded', 'Aset Drive dimuatkan'],
  ['Direct Drive files connected', 'Fail Drive terus bersambung'],
  ['Secure Drive connection', 'Sambungan Drive selamat'],
  ['Ready', 'Sedia'],
  ['Drive connected', 'Drive bersambung'],
  ['Analytics', 'Analitik'],
  ['Operational analytics based on verified workspace data. Meta KPI remain blank until a verified source is connected.', 'Analitik operasi berdasarkan data ruang kerja yang disahkan. KPI Meta kekal kosong sehingga sumber sah disambungkan.'],
  ['Meta insights connected', 'Insight Meta bersambung'],
  ['Content Records', 'Rekod Kandungan'],
  ['Scheduled Plans', 'Pelan Dijadualkan'],
  ['Drafts With Visual', 'Draf Dengan Visual'],
  ['Published Records', 'Rekod Diterbitkan'],
  ['awaiting review', 'menunggu semakan'],
  ['total planner items', 'jumlah item perancang'],
  ['Drive assets attached to content', 'Aset Drive dilampirkan pada kandungan'],
  ['Workspace publishing history', 'Sejarah penerbitan ruang kerja'],
  ['Live workflow distribution', 'Agihan aliran kerja semasa'],
  ['Workspace records', 'Rekod ruang kerja'],
  ['The review queue is clear.', 'Senarai semakan kosong.'],
  ['Notion planner sync is configured for shared planning records.', 'Penyelarasan perancang Notion telah disediakan untuk rekod perancangan bersama.'],
  ['Next data upgrade', 'Peningkatan data seterusnya'],
  ['Verified post URL + reach + views + engagements', 'URL siaran disahkan + capaian + tontonan + penglibatan'],
  ['Read-only Google Sheet data. The website caches one verified snapshot per day, so opening Analytics does not create extra Meta API calls.', 'Data Google Sheet baca sahaja. Laman ini menyimpan satu snapshot disahkan setiap hari, jadi membuka Analitik tidak membuat panggilan Meta API tambahan.'],
  ['Settings', 'Tetapan'],
  ['Marketing Tools', 'Alat Pemasaran'],
  ['Back', 'Kembali'],
  ['Choose a setting to review or update.', 'Pilih satu tetapan untuk semak atau kemaskini.'],
  ['Display', 'Paparan'],
  ['Theme, light/dark mode', 'Tema, mod terang/gelap'],
  ['Brightness and light or dark mode', 'Kecerahan dan mod terang atau gelap'],
  ['Brightness', 'Kecerahan'],
  ['Adjust brightness of the app display', 'Laraskan kecerahan paparan app'],
  ['Mode', 'Mod'],
  ['Choose light or dark appearance', 'Pilih rupa terang atau gelap'],
  ['Access', 'Akses'],
  ['Workspace key, connection and review rules', 'Kunci workspace, sambungan dan peraturan semakan'],
  ['Notification', 'Notifikasi'],
  ['Action Center reminders', 'Reminder Action Center'],
  ['Language', 'Bahasa'],
  ['Bahasa Melayu / English', 'Bahasa Melayu / English'],
  ['Reminders for review, today’s plan and workspace connection appear in the bell at the top of the app.', 'Reminder untuk semakan, pelan hari ini dan sambungan workspace muncul pada loceng di bahagian atas app.'],
  ['Notifications', 'Notifikasi'],
  ['Get reminders for review, today’s plan and workspace connection', 'Dapatkan reminder untuk semakan, pelan hari ini dan sambungan workspace'],
  ['Notifications options', 'Pilihan notifikasi'],
  ['On', 'Hidup'],
  ['Off', 'Mati'],
  ['Content waiting for review', 'Kandungan menunggu semakan'],
  ['Today’s posting plan', 'Pelan posting hari ini'],
  ['Google workspace not connected', 'Workspace Google belum disambung'],
  ['Show notification bell icon', 'Papar ikon loceng notifikasi'],
  ['Do not disturb', 'Jangan ganggu'],
  ['Hide the red count on the bell; reminders stay in the list', 'Sembunyikan nombor merah pada loceng; reminder kekal dalam senarai'],
  ['Workspace Configuration', 'Konfigurasi Ruang Kerja'],
  ['Manage display language and internal connections without exposing API keys in GitHub or the browser.', 'Urus bahasa paparan dan sambungan dalaman tanpa mendedahkan kunci API dalam GitHub atau pelayar.'],
  ['Internal Access', 'Akses Dalaman'],
  ['Google workspace connected', 'Ruang kerja Google bersambung'],
  ['Connected', 'Bersambung'],
  ['Google mode', 'Mod Google'],
  ['Google Sheets', 'Google Sheets'],
  ['Google Drive', 'Google Drive'],
  ['Refresh integration status', 'Muat semula status sambungan'],
  ['Disconnect', 'Putuskan sambungan'],
  ['Shared content, planner records, Drive assets and Free Assist tools are available.', 'Kandungan bersama, rekod perancang, aset Drive dan alat Bantuan Percuma tersedia.'],
  ['Integrations', 'Sambungan'],
  ['Workflow Rules', 'Peraturan Aliran Kerja'],
  ['Review-first controls', 'Kawalan semakan dahulu'],
  ['Human approval required', 'Kelulusan manusia diperlukan'],
  ['Block unsupported facts', 'Sekat fakta tanpa sokongan'],
  ['Facebook-only operations', 'Operasi Facebook sahaja'],
  ['Content must be approved before scheduling or publishing.', 'Kandungan mesti diluluskan sebelum dijadualkan atau diterbitkan.'],
  ['Flag prices, promotions, delivery dates and KPI without sources.', 'Tandakan harga, promosi, tarikh penghantaran dan KPI tanpa sumber.'],
  ['Other platforms remain disabled until data and connections exist.', 'Platform lain kekal dimatikan sehingga data dan sambungan tersedia.'],
  ["Add kiosk / project", "Tambah kiosk / projek"],
  ["FUTURE REFERENCE", "RUJUKAN MASA DEPAN"],
  ["Save a past kiosk or project", "Simpan kiosk atau projek terdahulu"],
  ["Edit kiosk or project reference", "Sunting rujukan kiosk atau projek"],
  ["Project / kiosk name", "Nama projek / kiosk"],
  ["Reference type", "Jenis rujukan"],
  ["Kiosk / Project", "Kiosk / Projek"],
  ["Custom Furniture", "Perabot Khas"],
  ["Event Setup", "Persediaan Acara"],
  ["Past Installation", "Pemasangan Terdahulu"],
  ["Location / client (optional)", "Lokasi / pelanggan (pilihan)"],
  ["Notes / posting direction", "Nota / arah siaran"],
  ["Reference image (optional)", "Imej rujukan (pilihan)"],
  ["Remove image", "Buang imej"],
  ["Saved reference image", "Imej rujukan disimpan"],
  ["Saved to the shared Google Sheet and Drive.", "Disimpan ke Google Sheet dan Drive yang dikongsi."],
  ["Connect Google Workspace to save a shared team reference.", "Sambungkan Ruang Kerja Google untuk menyimpan rujukan pasukan bersama."],
  ["Saving…", "Menyimpan…"],
  ["Save reference", "Simpan rujukan"],
  ["Edit reference", "Sunting rujukan"],
  ["Delete reference", "Padam rujukan"],
  ["Use an image file up to 1.2 MB.", "Gunakan fail imej sehingga 1.2 MB."],
  ["Kiosk / project reference saved for future content.", "Rujukan kiosk / projek disimpan untuk kandungan masa depan."],
  ["Shared kiosk / project reference updated.", "Rujukan kiosk / projek bersama dikemas kini."],
  ["Kiosk / project reference saved to Google Sheet and Drive.", "Rujukan kiosk / projek disimpan ke Google Sheet dan Drive."],
  ["Reference saved in this browser. Connect Google Workspace to share it with the team.", "Rujukan disimpan dalam pelayar ini. Sambungkan Ruang Kerja Google untuk berkongsi dengan pasukan."],
  ["Shared kiosk / project reference deleted.", "Rujukan kiosk / projek bersama dipadam."],
  ["Local kiosk / project reference deleted.", "Rujukan kiosk / projek tempatan dipadam."],
  ["Saved reference", "Rujukan disimpan"],
  ["Saved kiosk or project reference", "Rujukan kiosk atau projek disimpan"],
  ["BRUTTI shared kiosk / project reference", "Rujukan kiosk / projek Brutti yang dikongsi"],
  ["Proudly Sabahan.", "Bangga menjadi Sabahan."],
  ["Purposefully Crafted.", "Dihasilkan dengan tujuan."],
  ["Responsibly Made.", "Dihasilkan dengan bertanggungjawab."],
  ["Create with Assist", "Cipta dengan Bantuan"],
  ["Open planner", "Buka perancang"],
  ["View all content", "Lihat semua kandungan"],
  ["View library", "Lihat pustaka"],
  ["is on today’s plan.", "ada dalam pelan hari ini."],
  ["is on today's plan.", "ada dalam pelan hari ini."],
  ["No content is scheduled for today.", "Tiada kandungan dijadualkan untuk hari ini."],
  ["Content plan", "Pelan kandungan"],
  ["Add content plan", "Tambah pelan kandungan"],
  ["Edit content plan", "Sunting pelan kandungan"],
  ["Plan title", "Tajuk pelan"],
  ["Status", "Status"],
  ["Channel", "Saluran"],
  ["Save plan", "Simpan pelan"],
  ["Planner saved to BRUTTI DAILY CONTENT PLANNER.", "Perancang disimpan dalam PERANCANG KANDUNGAN HARIAN BRUTTI."],
  ["Plan deleted.", "Pelan dipadam."],
  ["Draft saved to the BRUTTI Google Sheet.", "Draf disimpan dalam Google Sheet BRUTTI."],
  ["Draft saved in this browser.", "Draf disimpan dalam pelayar ini."],
  ["Google workspace connected.", "Ruang kerja Google bersambung."],
  ["Google workspace disconnected. Local preview mode restored.", "Ruang kerja Google diputuskan. Mod pratonton tempatan dipulihkan."],
  ["Dashboard", "Papan Pemuka"],
  ["Brand Library", "Pustaka Jenama"],
  ["AI Tools", "Alat AI"],
  ["Core colour palette", "Palet warna utama"],
  ["Warm, confident and purposeful.", "Mesra, yakin dan bertujuan."],
  ["Always do", "Sentiasa lakukan"],
  ["Never invent", "Jangan reka"],
  ["Free AI Assist Mode", "Mod Bantuan AI Percuma"],
  ["Apps Script deployment required", "Penggunaan Apps Script diperlukan"],
  ["Enter the BRUTTI workspace key", "Masukkan kunci ruang kerja BRUTTI"],
  ["Setup required", "Persediaan diperlukan"],
  ["Not connected", "Tidak bersambung"],
  ["Available source snapshot", "Snapshot sumber tersedia"],
  ["Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang anda tulis tidak akan diubah.", "Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang anda tulis tidak akan diubah."],
  ["Choose one display language for Brutti AI. Product names and content you write will not be changed.", "Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang anda tulis tidak akan diubah."],
  ["e.g. SK Kiosk – Rail Station event", "cth. SK Kiosk – acara Stesen Kereta Api"],
  ["e.g. Kota Kinabalu", "cth. Kota Kinabalu"],
  ["What was made, useful facts, story angle or details for future posts.", "Apa yang dibuat, fakta berguna, sudut cerita atau butiran untuk siaran masa depan."],
  ["Search products, category or price…", "Cari produk, kategori atau harga…"],
  ["All", "Semua"],
  ["No products match this search.", "Tiada produk sepadan dengan carian ini."],
  ["Verified Product Source", "Sumber Produk Disahkan"],
  ["Product Library", "Pustaka Produk"],
  ["Content Studio", "Studio Kandungan"],
  ["Campaign Planner", "Perancang Kempen"],
  ["Analytics", "Analitik"],
  ["Settings", "Tetapan"],
  ["FIND AN OLD POST", "CARI POST LAMA"],
  ["Find a posted caption or visual", "Cari caption atau gambar yang sudah disiarkan"],
  ["Search Facebook and Instagram posts already synced. Opening a result does not publish it again.", "Cari post Facebook dan Instagram yang sudah ada. Buka satu hasil untuk lihat semula. Ia tidak disiarkan semula."],
  ["Caption words", "Perkataan dalam caption"],
  ["Search words in the caption…", "Cari perkataan dalam caption…"],
  ["Post date", "Tarikh post"],
  ["Clear date", "Kosongkan tarikh"],
  ["Type a caption word, choose Facebook or Instagram, or pick a date.", "Taip perkataan dalam caption, pilih Facebook atau Instagram, atau pilih tarikh."],
  ["Open post", "Buka post"],
  ["No image", "Tiada gambar"],
  ["Image could not be shown here.", "Gambar tidak dapat dipaparkan di sini."],
  ["No caption was synced for this post.", "Tiada caption dalam data yang diselaraskan."],
  ["Platform unavailable", "Platform tidak tersedia"],
  ["No synced posts match this search.", "Tiada post yang sepadan. Cuba perkataan, platform, atau tarikh lain."],
  ["Loading synced posts…", "Sedang memuatkan post yang diselaraskan…"],
  ["Synced posts could not be read.", "Post yang diselaraskan belum boleh dibaca."],
  ["No synced posts to search yet.", "Belum ada post yang diselaraskan untuk dicari."],

  ['Mon', 'Isn'], ['Tue', 'Sel'], ['Wed', 'Rab'], ['Thu', 'Kha'], ['Fri', 'Jum'], ['Sat', 'Sab'], ['Sun', 'Ahd'],
  ['Add note', 'Tambah nota'],
  ['Edit note', 'Sunting nota'],
  ['Save note', 'Simpan nota'],
  ['Title', 'Tajuk'],
  ['Date', 'Tarikh'],
  ['Time', 'Masa'],
  ['Type', 'Jenis'],
  ['Notes', 'Nota'],
  ['More options', 'Lebih banyak pilihan'],
  ['more...', 'lagi...'],
  ['No notes yet.', 'Belum ada nota.'],
  ['Content calendar', 'Kalendar kandungan'],
  ['System notifications', 'Notifikasi sistem'],
  ['Checklist', 'Senarai semak'],
  ['Add item', 'Tambah item'],
  ['Remove item', 'Buang item'],
  ['New item', 'Item baru'],
  ['Done', 'Siap'],
  ['Allow notifications', 'Benarkan notifikasi'],
  ['Allowed', 'Dibenarkan'],
  ['Blocked', 'Disekat'],
  ['Not supported', 'Tidak disokong'],
  ['Calendar Planner reminders pop up on this device while the app is open.', 'Reminder Calendar Planner akan keluar pada peranti ini semasa app dibuka.'],
  ['Blocked in the browser settings. Allow notifications for this site there.', 'Disekat dalam tetapan pelayar. Benarkan notifikasi untuk laman ini di sana.'],
  ['This browser does not support notifications. On iPhone, add the app to the Home Screen first.', 'Pelayar ini tidak menyokong notifikasi. Di iPhone, tambah app ke Skrin Utama dahulu.'],
  ['Allow pop-up reminders for Calendar Planner notes on this device.', 'Benarkan reminder pop-up untuk nota Calendar Planner pada peranti ini.'],
  ['Calendar for marketing work: events, important posts and reminders.', 'Kalendar untuk kerja pemasaran: acara, post penting dan reminder.'],
]

// Standard Bahasa Malaysia wording for the older entries above (they still carried English words).
const BM_FIXES = [
  ['posts?', 'siaran'], ['posting', 'siaran'], ['captions?', 'kapsyen'], ['reminders?', 'peringatan'],
  ['workspace', 'ruang kerja'], ['app', 'aplikasi'], ['team', 'pasukan'], ['insights?', 'wawasan'],
  ['snapshot', 'tangkapan data'], ['backend', 'bahagian belakang'], ['notifikasi', 'pemberitahuan'],
  ['pop-up', 'timbul'], ['tag', 'teg'], ['Calendar Planner', 'Perancang Kalendar'], ['Action Center', 'Pusat Tindakan'],
].map(([word, replacement]) => [new RegExp(`(?<![\\p{L}-])(${word})(?![\\p{L}-])`, 'giu'), replacement])
function fixBm(text) {
  return BM_FIXES.reduce((value, [pattern, replacement]) => value.replace(pattern, (match) => (
    match[0] !== match[0].toLowerCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement
  )), text)
}

const EN_TO_BM = Object.create(null)
const BM_TO_EN = Object.create(null)
const BRAND_CASE = /BRUTTI/g
function register(english, malay, aliases = []) {
  // BrandCasingEnhancer rewrites BRUTTI to Brutti in the page, so both spellings must match.
  const spellings = (text) => (BRAND_CASE.test(text) ? [text, text.replace(BRAND_CASE, 'Brutti')] : [text])
  BRAND_CASE.lastIndex = 0
  spellings(english).forEach((key) => { EN_TO_BM[key] = malay })
  spellings(malay).forEach((key) => { BM_TO_EN[key] = english })
  aliases.forEach((alias) => { spellings(alias).forEach((key) => { EN_TO_BM[key] = malay; BM_TO_EN[key] = english }) })
}
PAIRS.forEach(([english, malay]) => {
  const fixed = fixBm(malay)
  register(english, fixed, fixed === malay ? [] : [malay])
})
MONTH_PAIRS.forEach(([english, malay]) => register(english, malay))
EXTRA_PAIRS.forEach(([english, malay, ...aliases]) => register(english, malay, aliases))

const BM_NORMALIZE = {
  'Fakta disahkan / arah kandungan': 'Fakta disahkan / arah kandungan',
  'Simpan idea yang belum ada tarikh. Ia tidak masuk Calendar sehingga kamu sendiri decide bila mahu guna.': 'Simpan idea tanpa tarikh. Idea tidak masuk dalam kalendar sehingga anda memilih bila mahu menggunakannya.',
  'Verified facts, angle, hook, reference atau apa saja yang kamu tidak mahu lupa.': 'Fakta disahkan, sudut, pembuka, rujukan atau apa sahaja yang anda tidak mahu lupa.',
  'Data Meta terbaru telah diselaraskan; belum ada post ranking untuk hari ini.': 'Data Meta terbaru telah diselaraskan; belum ada siaran bertaraf untuk hari ini.',
  'Belum ada post-level metrics yang boleh dijadikan rujukan harian.': 'Belum ada metrik per siaran yang boleh dijadikan rujukan harian.',
  'Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang kamu tulis tidak akan diubah.': 'Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang anda tulis tidak akan diubah.',
}

// Templates: text with {1}, {2} for values (counts, dates, names) that are kept as they are.
const compileTemplate = (pattern) => {
  const order = []
  const source = pattern.split(/(\{\d\})/).map((part) => {
    const slot = part.match(/^\{(\d)\}$/)
    if (slot) { order.push(Number(slot[1])); return '(.+?)' }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }).join('')
  return { regex: new RegExp(`^${source}$`), order }
}
const fillTemplate = (pattern, match, order) => {
  const values = {}
  order.forEach((slot, index) => { values[slot] = match[index + 1] })
  return pattern.replace(/\{(\d)\}/g, (_, slot) => values[slot] ?? '')
}
const TO_BM_TEMPLATES = []
const TO_EN_TEMPLATES = []
const registerTemplate = ([english, malay, ...aliases], attributesOnly) => {
  TO_BM_TEMPLATES.push({ ...compileTemplate(english), output: malay, attributesOnly })
  TO_EN_TEMPLATES.push({ ...compileTemplate(malay), output: english, attributesOnly })
  aliases.forEach((alias) => {
    TO_BM_TEMPLATES.push({ ...compileTemplate(alias), output: malay, attributesOnly })
    TO_EN_TEMPLATES.push({ ...compileTemplate(alias), output: english, attributesOnly })
  })
}
TEMPLATES.forEach((entry) => registerTemplate(entry, false))
ATTRIBUTE_TEMPLATES.forEach((entry) => registerTemplate(entry, true))

// "November 2026" / "Nov 2025" style month labels.
const MONTH_LABEL = /^(\p{L}+) (\d{4})$/u
function translateMonthLabel(core, language) {
  const match = core.match(MONTH_LABEL)
  if (!match) return null
  const dictionary = language === 'bm' ? EN_TO_BM : BM_TO_EN
  const month = MONTH_PAIRS.some(([english, malay]) => (language === 'bm' ? english : malay) === match[1]) ? dictionary[match[1]] : null
  return month && month !== match[1] ? `${month} ${match[2]}` : null
}

const translationCache = new Map()
function lookup(core, language, isAttribute) {
  const key = `${language}|${isAttribute ? 'a' : 't'}|${core}`
  if (translationCache.has(key)) return translationCache.get(key)
  const dictionary = language === 'bm' ? EN_TO_BM : BM_TO_EN
  let result = Object.prototype.hasOwnProperty.call(dictionary, core) ? dictionary[core] : null
  if (result === null && language === 'bm' && BM_NORMALIZE[core]) result = BM_NORMALIZE[core]
  if (result === null) result = translateMonthLabel(core, language)
  if (result === null) {
    const templates = language === 'bm' ? TO_BM_TEMPLATES : TO_EN_TEMPLATES
    for (const template of templates) {
      if (template.attributesOnly && !isAttribute) continue
      const match = core.match(template.regex)
      if (match) { result = fillTemplate(template.output, match, template.order); break }
    }
  }
  if (translationCache.size > 5000) translationCache.clear()
  translationCache.set(key, result)
  return result
}

function readLanguage() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return SUPPORTED.has(saved) ? saved : 'bm'
}

function applyLanguage(language) {
  const next = SUPPORTED.has(language) ? language : 'bm'
  window.localStorage.setItem(STORAGE_KEY, next)
  document.documentElement.lang = next === 'bm' ? 'ms' : 'en'
  document.documentElement.dataset.bruttiUiLanguage = next
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: next } }))
  return next
}

function translateValue(value, language, isAttribute) {
  const original = value.trim()
  if (!original) return value
  const translated = lookup(original, language, isAttribute)
  // Do not touch unknown text nodes (especially whitespace): rewriting those re-triggers
  // the observer indefinitely and can freeze the browser.
  if (translated === null || translated === original) return value
  const leading = value.match(/^\s*/)?.[0] || ''
  const trailing = value.match(/\s*$/)?.[0] || ''
  return leading + translated + trailing
}

// Remember the text the page originally had, so switching language always starts from the original wording.
const textState = new WeakMap()
const attributeState = new WeakMap()
const SKIP = 'script, style, textarea, [contenteditable="true"], .app-language-control, [data-user-content], [data-lock-keep]'

function translateDocument(language) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    const parent = node.parentElement
    if (!parent || parent.closest(SKIP)) return
    const current = node.nodeValue || ''
    if (!current.trim()) return
    const record = textState.get(node)
    const source = record && record.shown === current ? record.source : current
    const next = translateValue(source, language, false)
    if (next !== source && parent.tagName === 'OPTION' && !parent.hasAttribute('value')) parent.setAttribute('value', source.trim())
    if (next !== current) node.nodeValue = next
    if (next !== source) textState.set(node, { source, shown: next })
    else textState.delete(node)
  })
  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((element) => {
    if (element.closest('.app-language-control, [data-lock-keep]')) return
    const records = attributeState.get(element) || {}
    ;['placeholder', 'aria-label', 'title'].forEach((attribute) => {
      const current = element.getAttribute(attribute)
      if (!current) return
      const record = records[attribute]
      const source = record && record.shown === current ? record.source : current
      const next = translateValue(source, language, true)
      if (next !== current) element.setAttribute(attribute, next)
      if (next !== source) records[attribute] = { source, shown: next }
      else delete records[attribute]
    })
    attributeState.set(element, records)
  })
}

function activeSettingsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && ['Settings', 'Tetapan'].includes(page.querySelector('.page-header h1')?.textContent?.trim())) || null
}

function mountControl(language) {
  const page = activeSettingsPage()
  if (!page || page.querySelector('.app-language-control')) return
  const panel = document.createElement('section')
  panel.className = 'panel app-language-control'
  const copy = document.createElement('div')
  const eyebrow = document.createElement('span')
  eyebrow.className = 'eyebrow'
  eyebrow.textContent = language === 'bm' ? 'BAHASA APLIKASI' : 'APP LANGUAGE'
  const title = document.createElement('h3')
  title.className = 'system-copy-hidden'
  title.textContent = language === 'bm' ? 'Bahasa Brutti AI' : 'Brutti AI language'
  const description = document.createElement('p')
  description.className = 'system-copy-hidden'
  description.textContent = language === 'bm'
    ? 'Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang anda tulis tidak akan diubah.'
    : 'Choose one display language for Brutti AI. Product names and content you write will not be changed.'
  copy.append(eyebrow, title, description)
  const select = document.createElement('select')
  select.setAttribute('aria-label', language === 'bm' ? 'Bahasa aplikasi' : 'App language')
  ;[['bm', 'Bahasa Melayu'], ['en', 'English']].forEach(([value, label]) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = label
    select.append(option)
  })
  select.value = language
  select.addEventListener('change', () => applyLanguage(select.value))
  panel.append(copy, select)
  const slot = page.querySelector('.settings-language-slot')
  if (slot) slot.append(panel)
  else {
    const reference = page.querySelector('.settings-grid') || page.querySelector('.settings-panel')
    if (reference) reference.insertAdjacentElement('beforebegin', panel)
    else page.append(panel)
  }
}

export default function AppLanguageLock() {
  useEffect(() => {
    let language = applyLanguage(readLanguage())
    let queued = 0
    const sync = () => {
      window.cancelAnimationFrame(queued)
      queued = window.requestAnimationFrame(() => {
        mountControl(language)
        translateDocument(language)
        document.documentElement.classList.remove('lang-pending')
      })
    }
    const onLanguageChange = (event) => {
      language = event.detail?.language === 'en' ? 'en' : 'bm'
      sync()
    }
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    window.addEventListener(LANGUAGE_EVENT, onLanguageChange)
    sync()
    return () => {
      observer.disconnect()
      window.removeEventListener(LANGUAGE_EVENT, onLanguageChange)
      window.cancelAnimationFrame(queued)
    }
  }, [])
  return null
}

export { STORAGE_KEY, LANGUAGE_EVENT }
