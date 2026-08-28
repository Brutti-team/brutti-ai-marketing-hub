import { useEffect, useState } from 'react'
import ContentDirectionPersistenceEnhancer from './ContentDirectionPersistenceEnhancer.jsx'

const LANGUAGE_KEY = 'brutti-ui-language-v1'
const LANGUAGE_EVENT = 'brutti:languagechange'

const PAGE_DESCRIPTIONS = {
  Dashboard: {
    bm: 'Rancang kerja hari ini, semak draft dan gerakkan pemasaran Brutti dari satu workspace.',
    en: 'Plan today’s work, review assisted drafts and keep Brutti’s marketing moving from one workspace.',
  },
  'Content Studio': {
    bm: 'Buat dan asah caption Facebook ikut gaya Brutti, kemudian hantar untuk semakan manusia.',
    en: 'Create and refine Facebook captions in Brutti style, then send them for human review.',
  },
  'Campaign Planner': {
    bm: 'Planner mingguan untuk operasi content Brutti setiap hari.',
    en: 'A weekly planner for Brutti’s daily content operations.',
  },
  'Brand Library': {
    bm: 'Rujukan utama untuk identiti, suara dan guardrail content Brutti.',
    en: 'A single reference for Brutti’s identity, voice and content guardrails.',
  },
  'Product Library': {
    bm: 'Gunakan maklumat produk Brutti yang sudah disahkan daripada sumber dalaman.',
    en: 'Use verified Brutti product details from approved internal sources.',
  },
  'Asset Library': {
    bm: 'Cari, susun dan pilih visual yang diluluskan tanpa mengubah aliran Content Studio.',
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
    bm: 'Urus bahasa paparan dan sambungan dalaman tanpa mendedahkan API key dalam GitHub atau browser.',
    en: 'Manage display language and internal connections without exposing API keys in GitHub or the browser.',
  },
}

const EXACT_LABEL_REWRITES = new Map([
  ['WORKSPACE', 'Workspace'],
  ['MARKETING CONTROL CENTRE', 'Marketing Control Centre'],
  ['WORKSPACE CONFIGURATION', 'Workspace Configuration'],
  ['INTERNAL ACCESS', 'Internal Access'],
  ['INTEGRATIONS', 'Integrations'],
  ['WORKFLOW RULES', 'Workflow Rules'],
  ['GOOGLE DATA', 'Google Data'],
  ['LOCAL DATA', 'Local Data'],
  ['DATA SOURCES', 'Data Sources'],
])

const CONNECTION_DETAIL_REWRITES = new Map([
  ['BRUTTI AI MARKETING SYSTEM and approved assets', 'Brutti AI Marketing System and approved assets'],
  ['Product Database and BRUTTI DAILY CONTENT PLANNER sync through Apps Script', 'Product Database and Brutti Daily Content Planner sync through Apps Script'],
])

function readLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'bm'
  } catch {
    return 'bm'
  }
}

function setText(node, value) {
  if (node && value && node.textContent !== value) node.textContent = value
}

function polishKnownLabels() {
  document.querySelectorAll('.workspace-label, .eyebrow, .hero-label').forEach((node) => {
    if (node.children.length) {
      const textNodes = [...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE)
      textNodes.forEach((textNode) => {
        const text = textNode.textContent?.trim() || ''
        if (text.startsWith('DAILY FOCUS')) {
          textNode.textContent = textNode.textContent.replace('DAILY FOCUS', 'Daily Focus')
        }
      })
      return
    }
    const text = node.textContent?.trim() || ''
    const replacement = EXACT_LABEL_REWRITES.get(text)
    if (replacement) setText(node, replacement)
  })

  document.querySelectorAll('.connections-list article').forEach((article) => {
    const detail = article.querySelector('p')
    const text = detail?.textContent?.trim() || ''
    const replacement = CONNECTION_DETAIL_REWRITES.get(text)
    if (replacement) setText(detail, replacement)
  })
}

function applyLanguage(language) {
  const bm = language === 'bm'
  document.documentElement.lang = bm ? 'ms' : 'en'
  document.documentElement.dataset.appLanguage = language

  const pageTitle = document.querySelector('#root .page .page-header h1')?.textContent?.trim()
  const description = document.querySelector('#root .page .page-header p')
  const copy = PAGE_DESCRIPTIONS[pageTitle]
  if (description && copy) setText(description, copy[language])

  document.querySelectorAll('.settings-panel .connections-list article').forEach((article) => {
    setText(article.querySelector('button'), bm ? 'Semak' : 'Check')
  })

  document.querySelectorAll('.setting-row').forEach((row) => {
    const title = row.querySelector('strong')?.textContent?.trim()
    const descriptionNode = row.querySelector('p')
    const helper = {
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
    if (helper && descriptionNode) setText(descriptionNode, helper[language])
  })
}

export default function LowRiskSafeUiEnhancer({ page }) {
  const [language, setLanguage] = useState(readLanguage)

  useEffect(() => {
    const onLanguageChange = (event) => {
      const next = event.detail?.language === 'en' ? 'en' : 'bm'
      setLanguage(next)
    }

    window.addEventListener(LANGUAGE_EVENT, onLanguageChange)
    return () => window.removeEventListener(LANGUAGE_EVENT, onLanguageChange)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      polishKnownLabels()
      applyLanguage(language)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [page, language])

  return <ContentDirectionPersistenceEnhancer />
}
