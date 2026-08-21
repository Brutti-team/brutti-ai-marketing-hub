import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const LANGUAGE_KEY = 'brutti-app-language-v1'

const PAGE_DESCRIPTIONS = {
  Dashboard: {
    bm: 'Rancang kerja hari ini, semak draft dan gerakkan pemasaran BRUTTI dari satu workspace.',
    en: 'Plan today’s work, review assisted drafts and keep BRUTTI’s marketing moving from one workspace.',
  },
  'Content Studio': {
    bm: 'Buat dan asah caption Facebook ikut gaya Brutti, kemudian hantar untuk semakan manusia.',
    en: 'Create and refine Facebook captions in Brutti style, then send them for human review.',
  },
  'Campaign Planner': {
    bm: 'Planner mingguan dinamik untuk operasi content BRUTTI setiap hari.',
    en: 'Dynamic weekly planner for daily BRUTTI marketing operations.',
  },
  'Brand Library': {
    bm: 'Rujukan utama untuk identiti, suara dan guardrail content BRUTTI.',
    en: 'A single reference for BRUTTI’s identity, voice and content guardrails.',
  },
  'Product Library': {
    bm: 'Gunakan maklumat produk BRUTTI yang sudah disahkan daripada sumber dalaman.',
    en: 'Use verified BRUTTI product details from approved internal sources.',
  },
  'Asset Library': {
    bm: 'Cari, susun dan pilih visual yang diluluskan tanpa mengganggu aliran Content Studio.',
    en: 'Find, organise and select approved visuals without changing the Content Studio workflow.',
  },
  'AI Tools': {
    bm: 'Prompt starter yang reusable dan ikut brand untuk kerja penulisan, video, servis dan kreatif.',
    en: 'Reusable, brand-aware prompt starters for writing, video, service and creative work.',
  },
  Analytics: {
    bm: 'Analytics operasi berdasarkan data workspace yang disahkan. KPI Meta kekal kosong sehingga sumber sah disambungkan.',
    en: 'Operational analytics based on verified workspace data. Meta KPI remain blank until a verified source is connected.',
  },
  Settings: {
    bm: 'Urus bahasa app dan sambungan dalaman tanpa mendedahkan API key dalam GitHub atau browser.',
    en: 'Manage app language and internal connections without exposing API keys in GitHub or the browser.',
  },
}

function readLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'bm'
  } catch {
    return 'bm'
  }
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value
}

function applySafeInterfaceCopy(language) {
  const bm = language === 'bm'
  const pageTitle = document.querySelector('#root .page .page-header h1')?.textContent?.trim()
  const description = document.querySelector('#root .page .page-header p')
  if (description && pageTitle) {
    const copy = PAGE_DESCRIPTIONS[pageTitle]
    if (copy) setText(description, copy[language])
  }

  document.querySelectorAll('.settings-panel .connections-list article').forEach((article) => {
    setText(article.querySelector('button'), bm ? 'Semak' : 'Check')
  })

  document.querySelectorAll('.setting-row').forEach((row) => {
    const title = row.querySelector('strong')?.textContent?.trim()
    const descriptionNode = row.querySelector('p')
    if (!descriptionNode || !title) return
    const copy = {
      'Human approval required': {
        bm: 'Content mesti diluluskan sebelum dijadualkan atau diterbitkan.',
        en: 'Content must be approved before scheduling or publishing.',
      },
      'Block unsupported facts': {
        bm: 'Flag harga, promosi, tarikh penghantaran dan KPI yang tiada sumber.',
        en: 'Flag prices, promotions, delivery dates and KPI without sources.',
      },
      'Facebook-only operations': {
        bm: 'Platform lain kekal dimatikan sehingga data dan sambungan tersedia.',
        en: 'Other platforms remain disabled until data and connections exist.',
      },
    }[title]
    if (copy) setText(descriptionNode, copy[language])
  })

  const assetHelper = document.querySelector('.asset-upgrade-helper p')
  if (assetHelper) {
    const status = document.querySelector('.asset-upgrade-statusline')?.textContent || ''
    const driveCount = Number(status.match(/(\d+)\s+Drive\b/)?.[1] || 0)
    const value = bm
      ? (driveCount > 0
          ? 'Asset Drive boleh terus digunakan dalam Content Studio. Upload baru kekal sebagai local staging sehingga dimasukkan ke Drive.'
          : 'Library sedang menggunakan reference/local staging. Sambungkan Google Drive untuk guna visual terus dalam Content Studio.')
      : (driveCount > 0
          ? 'Drive assets can be used directly in Content Studio. New uploads remain in local staging until moved to Drive.'
          : 'The library is using references/local staging. Connect Google Drive to use visuals directly in Content Studio.')
    setText(assetHelper, value)
  }
}

function LanguageControl({ language, onChange }) {
  return (
    <section className="panel app-language-panel" aria-label="App language settings">
      <div>
        <span className="eyebrow">APP LANGUAGE</span>
        <h3>{language === 'bm' ? 'Bahasa paparan' : 'Display language'}</h3>
        <p>{language === 'bm'
          ? 'Pilih satu bahasa utama untuk copy bantuan dalam app. Nama modul standard seperti Dashboard, Content Studio dan Analytics dikekalkan supaya fungsi dalaman tidak terganggu.'
          : 'Choose one primary language for helper copy. Standard module names such as Dashboard, Content Studio and Analytics stay unchanged so internal behaviour remains stable.'}</p>
      </div>
      <div className="app-language-options" role="group" aria-label="Choose app language">
        <button type="button" className={language === 'bm' ? 'active' : ''} aria-pressed={language === 'bm'} onClick={() => onChange('bm')}>Bahasa Melayu</button>
        <button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => onChange('en')}>English</button>
      </div>
      <small>{language === 'bm' ? 'Bahasa caption dalam Content Studio masih dikawal secara berasingan.' : 'Caption language in Content Studio remains a separate setting.'}</small>
    </section>
  )
}

export default function AppLanguageEnhancer() {
  const [language, setLanguage] = useState(readLanguage)
  const [target, setTarget] = useState(null)

  useEffect(() => {
    document.documentElement.lang = language === 'bm' ? 'ms' : 'en'
    document.documentElement.dataset.appLanguage = language
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language)
    } catch {
      // Preference remains active for the current session when storage is unavailable.
    }
    applySafeInterfaceCopy(language)
  }, [language])

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined
    let timer = 0
    const sync = () => {
      const nextTarget = root.querySelector('.settings-grid')
      setTarget((current) => current === nextTarget ? current : nextTarget)
      applySafeInterfaceCopy(language)
    }
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 50)
    }
    sync()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [language])

  if (!target) return null
  return createPortal(<LanguageControl language={language} onChange={setLanguage} />, target)
}
