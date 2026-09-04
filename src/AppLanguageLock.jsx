import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-ui-language-v1'
const LANGUAGE_EVENT = 'brutti:languagechange'
const SUPPORTED = new Set(['bm', 'en'])

const BM = {
  'Content direction': 'Arah kandungan',
  'Only use facts you can verify.': 'Gunakan fakta yang boleh disahkan sahaja.',
  'Content title': 'Tajuk kandungan',
  'Content type': 'Jenis kandungan',
  'Product': 'Produk',
  'Verified facts / direction': 'Fakta disahkan / arah kandungan',
  'Generate free structured draft': 'Jana draf berstruktur',
  'Free Assist': 'Bantuan Percuma',
  'Content Library': 'Pustaka Kandungan',
  'Add content': 'Tambah kandungan',
  'Add asset': 'Tambah aset',
  'Save': 'Simpan',
  'Delete': 'Padam',
  'Cancel': 'Batal',
  'Close': 'Tutup',
  'Edit': 'Sunting',
  'Preview': 'Pratonton',
  'Refresh': 'Muat semula',
  'Search assets…': 'Cari aset…',
  'Search saved ideas…': 'Cari idea disimpan…',
  'Search name, product, project or tags…': 'Cari nama, produk, projek atau tag…',
  'All categories': 'Semua kategori',
  'All sources': 'Semua sumber',
  'Show hidden': 'Tunjuk yang disembunyikan',
  'Use': 'Guna',
  'Use in Content Studio': 'Guna dalam Content Studio',
  'Folders': 'Folder',
  'Mark read': 'Tanda dibaca',
  'Mark all read': 'Tanda semua dibaca',
  'Action Center': 'Pusat Tindakan',
  'Open Planner': 'Buka Perancang',
  'Open Review': 'Buka Semakan',
  'Check Settings': 'Semak Tetapan',
  'Today': 'Hari ini',
  'Previous': 'Sebelum',
  'Next': 'Seterusnya',
  'Save Idea': 'Simpan Idea',
  'Idea / title': 'Idea / tajuk',
  'Notes / facts': 'Nota / fakta',
  'Future content': 'Kandungan masa depan',
  'Free Mode Ready': 'Mod Percuma Sedia',
  'Human Review Required': 'Semakan manusia diperlukan',
  'Google connected': 'Google bersambung',
  'Google workspace active': 'Ruang kerja Google aktif',
  'Local workspace active': 'Ruang kerja tempatan aktif',
  'Light': 'Cerah',
  'Dark': 'Gelap',
  'Connection status': 'Status sambungan',
  'Google Sheet sync': 'Sync Google Sheet',
  'Daily post performance reference': 'Rujukan prestasi post harian',
  'Highest Views': 'Views tertinggi',
  'Highest Likes': 'Likes tertinggi',
  'Highest Comments': 'Comments tertinggi',
  'Highest Engagement': 'Engagement tertinggi',
  'Daily content reference': 'Rujukan kandungan harian',
  'Which post performed best?': 'Post mana paling berprestasi?',
  'No verified post data yet': 'Belum ada data post yang disahkan',
  'Open saved ideas': 'Buka folder idea',
  'Hide saved ideas': 'Sembunyikan folder idea',
  'No assets match this search.': 'Tiada aset sepadan dengan carian ini.',
  'General / No Product': 'Umum / Tiada Produk',
  'Brand Awareness': 'Kesedaran Jenama',
  'Product Highlight': 'Sorotan Produk',
  'Educational': 'Pendidikan',
  'Behind the Scenes': 'Di Sebalik Tabir',
  'Customer Story': 'Cerita Pelanggan',
  'Promotion': 'Promosi',
  'Rancang kerja hari ini, semak draft dan gerakkan pemasaran Brutti dari satu workspace.': 'Plan today’s work, review assisted drafts and keep Brutti’s marketing moving from one workspace.',
  'Buat dan asah caption Facebook ikut gaya Brutti, kemudian hantar untuk semakan manusia.': 'Create and refine Facebook captions in Brutti style, then send them for human review.',
  'Planner mingguan untuk operasi content Brutti setiap hari.': 'A weekly planner for Brutti’s daily content operations.',
  'Rujukan utama untuk identiti, suara dan guardrail content Brutti.': 'A single reference for Brutti’s identity, voice and content guardrails.',
  'Gunakan maklumat produk Brutti yang sudah disahkan daripada sumber dalaman.': 'Use verified Brutti product details from approved internal sources.',
  'Cari, susun dan pilih visual yang diluluskan tanpa mengubah aliran Content Studio.': 'Find, organise and select approved visuals without changing the Content Studio workflow.',
  'Prompt starter yang reusable dan ikut brand untuk kerja penulisan, video, servis dan kreatif.': 'Reusable, brand-aware prompt starters for writing, video, service and creative work.',
  'Analytics operasi berdasarkan data workspace yang disahkan. KPI Meta kekal kosong sehingga sumber sah disambungkan.': 'Operational analytics based on verified workspace data. Meta KPI remain blank until a verified source is connected.',
  'Urus bahasa paparan dan sambungan dalaman tanpa mendedahkan API key dalam GitHub atau browser.': 'Manage display language and internal connections without exposing API keys in GitHub or the browser.',
  'Content mesti diluluskan sebelum dijadualkan atau diterbitkan.': 'Content must be approved before scheduling or publishing.',
  'Flag harga, promosi, tarikh penghantaran dan KPI yang tiada sumber.': 'Flag prices, promotions, delivery dates and KPI without sources.',
  'Platform lain kekal dimatikan sehingga data dan sambungan tersedia.': 'Other platforms remain disabled until data and connections exist.',
  'Semak': 'Check',
  'Status sambungan': 'Connection status',
  'Sambungan': 'Connections',
  'Peraturan aliran kerja': 'Workflow rules',
  'Sumber data': 'Data sources',
  'Ruang kerja': 'Workspace',
  'Pusat kawalan pemasaran': 'Marketing control centre',
  'Tambah kandungan': 'Add content',
  'Tambah aset': 'Add asset',
  'Simpan perubahan': 'Save changes',
  'Diterbitkan': 'Published',
  'Dijadualkan': 'Scheduled',
  'Draf': 'Draft',
  'Semakan': 'Review',
  'Diluluskan': 'Approved',
  'Tolak': 'Reject',
  'Gunakan idea ini': 'Use this idea',
  'Tambah ke perancang': 'Add to planner',
  'Muat semula': 'Refresh',
  'Tiada reminder urgent sekarang': 'No urgent reminders right now',
  'Tanda dibaca': 'Mark read',
  'Tanda semua dibaca': 'Mark all read',
}

const EN = Object.fromEntries(Object.entries(BM).map(([english, malay]) => [malay, english]))

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

function replaceText(value, dictionary) {
  const leading = value.match(/^\s*/)?.[0] || ''
  const trailing = value.match(/\s*$/)?.[0] || ''
  const core = value.trim()
  return Object.prototype.hasOwnProperty.call(dictionary, core) ? leading + dictionary[core] + trailing : value
}

function translateDocument(language) {
  const dictionary = language === 'bm' ? BM : EN
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    const parent = node.parentElement
    if (!parent || parent.closest('script, style, textarea, [contenteditable="true"], .app-language-control')) return
    const next = replaceText(node.nodeValue || '', dictionary)
    if (next !== node.nodeValue) node.nodeValue = next
  })
  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((element) => {
    if (element.closest('.app-language-control')) return
    ;['placeholder', 'aria-label', 'title'].forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return
      const next = replaceText(value, dictionary)
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
  panel.dataset.bruttiLanguageControl = 'true'
  const copy = document.createElement('div')
  const eyebrow = document.createElement('span')
  eyebrow.className = 'eyebrow'
  eyebrow.textContent = language === 'bm' ? 'BAHASA APLIKASI' : 'APP LANGUAGE'
  const title = document.createElement('h3')
  title.textContent = language === 'bm' ? 'Bahasa Brutti AI' : 'Brutti AI language'
  const description = document.createElement('p')
  description.textContent = language === 'bm'
    ? 'Pilih satu bahasa untuk paparan Brutti AI. Nama produk dan kandungan yang kamu tulis tidak akan diubah.'
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
