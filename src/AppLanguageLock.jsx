import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-ui-language-v1'
const LANGUAGE_EVENT = 'brutti:languagechange'
const SUPPORTED = new Set(['bm', 'en'])

// System interface copy only. Product names and user-entered content are deliberately excluded.
const PAIRS = [
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
  ['Meta live synced once today', 'Meta live diselaraskan sekali hari ini'],
  ['Meta live sync unavailable · using Brutti Soul Master fallback', 'Penyelarasan Meta live tidak tersedia · menggunakan sandaran Brutti Soul Master'],
  ['Confidence: Low', 'Keyakinan: Rendah'],
  ['Confidence: Medium', 'Keyakinan: Sederhana'],
  ['Brutti Soul Master reason', 'Sebab Brutti Soul Master'],
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
  ['Verified source', 'Sumber disahkan'],
  ['Uncategorised', 'Tanpa kategori'],
  ['Verified name. Add specifications from the source before making product claims.', 'Nama disahkan. Tambah spesifikasi daripada sumber sebelum membuat tuntutan produk.'],
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
]

const BM = Object.fromEntries(PAIRS)
const EN = Object.fromEntries(PAIRS.map(([english, malay]) => [malay, english]))
const BM_NORMALIZE = {
  'Fakta disahkan / arah kandungan': 'Fakta disahkan / arah kandungan',
  'Simpan idea yang belum ada tarikh. Ia tidak masuk Calendar sehingga kamu sendiri decide bila mahu guna.': 'Simpan idea tanpa tarikh. Idea tidak masuk dalam kalendar sehingga anda memilih bila mahu menggunakannya.',
  'Verified facts, angle, hook, reference atau apa saja yang kamu tidak mahu lupa.': 'Fakta disahkan, sudut, pembuka, rujukan atau apa sahaja yang anda tidak mahu lupa.',
  'Data Meta terbaru telah diselaraskan; belum ada post ranking untuk hari ini.': 'Data Meta terbaru telah diselaraskan; belum ada siaran bertaraf untuk hari ini.',
  'Belum ada post-level metrics yang boleh dijadikan rujukan harian.': 'Belum ada metrik per siaran yang boleh dijadikan rujukan harian.',
  'Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang kamu tulis tidak akan diubah.': 'Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang anda tulis tidak akan diubah.',
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

function replaceText(value, dictionary, language) {
  const leading = value.match(/^\s*/)?.[0] || ''
  const trailing = value.match(/\s*$/)?.[0] || ''
  const original = value.trim()
  const core = language === 'bm' ? (BM_NORMALIZE[original] || original) : original
  const translated = Object.prototype.hasOwnProperty.call(dictionary, core) ? dictionary[core] : core
  return leading + translated + trailing
}

function translateDocument(language) {
  const dictionary = language === 'bm' ? BM : EN
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    const parent = node.parentElement
    if (!parent || parent.closest('script, style, textarea, [contenteditable="true"], .app-language-control')) return
    const next = replaceText(node.nodeValue || '', dictionary, language)
    if (next !== node.nodeValue) node.nodeValue = next
  })
  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((element) => {
    if (element.closest('.app-language-control')) return
    ;['placeholder', 'aria-label', 'title'].forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return
      const next = replaceText(value, dictionary, language)
      if (next !== value) element.setAttribute(attribute, next)
    })
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
  title.textContent = language === 'bm' ? 'Bahasa Brutti AI' : 'Brutti AI language'
  const description = document.createElement('p')
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
  const reference = page.querySelector('.settings-grid') || page.querySelector('.settings-panel')
  if (reference) reference.insertAdjacentElement('beforebegin', panel)
  else page.append(panel)
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
