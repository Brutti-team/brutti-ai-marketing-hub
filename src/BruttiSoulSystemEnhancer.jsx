import { useEffect } from 'react'
import { BRUTTI_SOUL, SOUL_SOURCE_LABEL, soulSourceReady } from './lib/bruttiSoulSource'

const SOURCE_SECTIONS = [
  ['01', 'Origin'],
  ['02', 'Voice'],
  ['03', 'Values'],
  ['04', 'Red Lines'],
  ['05', 'Product'],
  ['06', 'Content Craft'],
  ['07', 'Story Pillars'],
  ['08', 'Vision'],
  ['09', 'Checklist'],
  ['10', 'Golden Examples'],
]

const STORY_PILLARS = [
  'Kisah artisan & maruah',
  'Story behind the piece',
  'Founder moment / transparency',
  'Babak lucu harian',
]

const PROMPT_COPY = {
  'Facebook Post': 'Mulakan dari fakta yang sudah verify, kemudian guna hook berbentuk babak/nombor/nama, first-person aku/sia/kami, ayat pendek, 1–3 emoji dan tiada hashtag.',
  'Instagram Caption': 'Kekalkan jiwa Brutti: visual sebenar + cerita sebenar, first-person, Sabahan colloquial yang natural, 1–3 emoji dan tiada hashtag.',
  'TikTok Caption': 'Bina hook pendek daripada babak sebenar. Elak trend, claim atau detail yang belum disahkan; suara mesti tetap rasa macam Brutti bercerita.',
  'Threads Post': 'Tukar satu kejadian atau pemerhatian sebenar kepada conversation starter yang natural, first-person dan tidak berbunyi seperti brand korporat.',
  'Reel Script': 'Susun scene sebenar, hook cerita, voice-over pendek dan CTA. Utamakan artisan, process, customer need atau moment founder yang memang berlaku.',
  'TikTok Script': 'Gunakan satu cerita real sebagai tulang belakang video. Jangan reka trend, reaksi customer, process, harga atau performance claim.',
  'Voice-over': 'Tulis macam orang Brutti bercakap: santai, manusia, ayat pendek dan spesifik. Gunakan fakta project atau footage yang sudah confirm sahaja.',
  'Customer Reply': 'Balas dengan jelas dan manusia. Harga, availability, delivery, material atau detail project mesti datang daripada source yang sudah verify.',
  'Complaint Reply': 'Acknowledgement dulu, kemudian fakta sebenar dan tindakan yang boleh disahkan. Selari dengan prinsip Brutti: bila silap, cerita terbuka dan betulkan.',
  'WhatsApp Reply': 'Ringkas, mesra dan natural. Jangan over-formal; jangan isi gap dengan andaian tentang harga, stok, delivery atau spesifikasi.',
  Storytelling: 'Pilih cerita paling Brutti: artisan, story behind the piece, founder moment, transparency, babak harian, product naming atau Brutti Builders/vision.',
  'Hook Generator': 'Hook mesti buka curiosity melalui babak, nombor atau nama — bukan “New Product Alert”, “Promo Hebat” atau clickbait generik.',
  'Product Visual Brief': 'Visual mesti berpijak pada produk, material dan setting yang sudah disahkan. Jangan ubah reka bentuk produk atau cipta feature yang tiada.',
}

const PROMPT_PLACEHOLDER = {
  'Facebook Post': 'Masukkan fakta sebenar: apa berlaku, siapa terlibat, satu detail spesifik, kenapa ia penting, dan CTA jika ada.',
  'Instagram Caption': 'Masukkan fakta sebenar tentang visual, orang, product/project dan moment yang mahu diceritakan.',
  'TikTok Caption': 'Masukkan babak sebenar, apa yang berlaku dan satu detail yang boleh verify.',
  'Threads Post': 'Masukkan satu kejadian, observation atau pendapat Brutti yang benar dan boleh dipertanggungjawabkan.',
  'Reel Script': 'Masukkan scene/footage yang ada, siapa muncul, process sebenar dan message utama.',
  'TikTok Script': 'Masukkan scene sebenar, process atau cerita yang memang berlaku.',
  'Voice-over': 'Masukkan fakta footage/project yang sudah confirm dan message utama.',
  'Customer Reply': 'Masukkan soalan customer + jawapan/fakta yang sudah disahkan.',
  'Complaint Reply': 'Masukkan isu sebenar, apa yang sudah diketahui dan tindakan yang team memang boleh buat.',
  'WhatsApp Reply': 'Masukkan mesej customer + maklumat yang sudah verify.',
  Storytelling: 'Masukkan cerita sebenar: artisan / piece / founder / transparency / babak harian / naming / Builders.',
  'Hook Generator': 'Masukkan topik dan fakta sebenar yang hook perlu buka.',
  'Product Visual Brief': 'Masukkan product, angle, material, setting dan visual reference yang sudah disahkan.',
}

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function activePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && (page.classList.contains('dashboard-page') ? title === 'Dashboard' : page.querySelector('h1')?.textContent?.trim() === title)) || null
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value
}

function setReactValue(element, value) {
  if (!element) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function replaceList(list, items) {
  if (!list) return
  list.replaceChildren(...items.map((text) => {
    const li = document.createElement('li')
    const mark = document.createElement('strong')
    mark.textContent = '✓'
    mark.style.cssText = 'display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;border-radius:999px;background:rgba(20,74,58,.10);color:#164a3a;font-size:11px;flex:0 0 auto;'
    const copy = document.createElement('span')
    copy.textContent = text
    li.append(mark, copy)
    return li
  }))
}

function soulPanel() {
  const section = document.createElement('section')
  section.className = 'panel brutti-soul-source-panel'
  section.style.cssText = 'margin-top:18px;padding:20px;border:1px solid rgba(20,74,58,.18);background:linear-gradient(135deg,rgba(238,246,239,.92),rgba(255,255,255,.96));'

  const head = document.createElement('div')
  head.style.cssText = 'display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;'
  head.innerHTML = `<div><span class="eyebrow">SOURCE OF TRUTH</span><h3 style="margin:5px 0 7px">Brutti Soul Master</h3><p style="margin:0;max-width:720px;line-height:1.55;opacity:.76">Semua AI content direction mesti ikut source yang sama. Kalau ada rule dalam website bercanggah dengan Soul Master, Soul Master yang menang.</p></div><span style="padding:7px 10px;border-radius:999px;background:#164a3a;color:white;font-size:11px;font-weight:700;letter-spacing:.04em">SOURCE LOCKED</span>`

  const grid = document.createElement('div')
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;'
  SOURCE_SECTIONS.forEach(([number, label]) => {
    const item = document.createElement('div')
    item.style.cssText = 'padding:10px 11px;border-radius:12px;background:rgba(255,255,255,.72);border:1px solid rgba(20,74,58,.08);'
    item.innerHTML = `<span style="display:block;font-size:10px;letter-spacing:.08em;opacity:.55">${number}</span><strong style="display:block;margin-top:3px;font-size:12px">${label}</strong>`
    grid.append(item)
  })

  const pillars = document.createElement('div')
  pillars.style.cssText = 'display:flex;gap:7px;flex-wrap:wrap;margin-top:14px;'
  STORY_PILLARS.forEach((label) => {
    const chip = document.createElement('span')
    chip.textContent = label
    chip.style.cssText = 'padding:7px 9px;border-radius:999px;background:rgba(20,74,58,.08);font-size:11px;font-weight:650;'
    pillars.append(chip)
  })

  const source = document.createElement('small')
  source.textContent = SOUL_SOURCE_LABEL
  source.style.cssText = 'display:block;margin-top:13px;opacity:.58;'

  section.append(head, grid, pillars, source)
  return section
}

function ensurePanel(page, beforeSelector) {
  if (!page || page.querySelector('.brutti-soul-source-panel')) return
  const panel = soulPanel()
  const before = beforeSelector ? page.querySelector(beforeSelector) : null
  if (before) before.insertAdjacentElement('beforebegin', panel)
  else page.append(panel)
}

function syncBrandLibrary() {
  const page = activePage('Brand Library')
  if (!page || !BRUTTI_SOUL.full) return

  const headerCopy = page.querySelector('.page-header p')
  setText(headerCopy, 'Brutti Soul Master ialah source of truth untuk identity, voice, values, storytelling, AI guardrails dan direction content.')

  const cards = [...page.querySelectorAll('.brand-card')]
  if (cards[0]) {
    setText(cards[0].querySelector('h3'), 'Jujur, berjiwa, Sabahan dan manusia dulu.')
    setText(cards[0].querySelector('p'), 'Brutti dokumen bisnes sebenar dan orang sebenar dalam bahasa sendiri — bukan brand yang cuba bunyi terlalu polished atau jauh dari manusia.')
    const keywords = ['Sabahan', 'Jujur', 'Human', 'Craft', 'Purpose']
    cards[0].querySelectorAll('.keyword-row span').forEach((node, index) => setText(node, keywords[index] || ''))
  }

  if (cards[1]) {
    setText(cards[1].querySelector('h3'), 'Macam Lukman cerita dengan kawan.')
    setText(cards[1].querySelector('p'), 'First-person aku / sia / kami. Sabahan colloquial + sikit English, ayat pendek satu-satu baris, humor self-deprecating bila ngam, 1–3 emoji dan tiada hashtag.')
    setText(cards[1].querySelector('blockquote'), '“Apa yang berlaku hari ni yang jujur & layak diceritakan?”')
  }

  const guidelinePanels = [...page.querySelectorAll('.guideline-grid .panel')]
  replaceList(guidelinePanels[0]?.querySelector('ul'), [
    'Buka dengan babak, nombor atau nama — bukan label produk.',
    'Tulis dalam first-person: aku / sia / kami.',
    'Kalau cerita artisan, guna nama + latar hanya bila memang diketahui.',
    'Tunjuk sebab emosi itu wujud; jangan isi dengan filler generik.',
    'Gunakan 1–3 emoji sahaja dan jangan gunakan hashtag.',
  ])
  replaceList(guidelinePanels[1]?.querySelector('ul'), [
    'Jangan reka harga, promotion, availability, delivery, KPI atau claim.',
    'Jangan reka detail artisan, customer, process atau cerita nama produk.',
    'Jangan label barang import sebagai buatan sendiri.',
    'Jangan hilangkan craftsmanship semata-mata untuk bunyi seperti mass-production brand.',
    'Jangan gunakan nada “pihak Brutti” atau korporat bila post sepatutnya bersuara sebagai Lukman/kami.',
  ])

  ensurePanel(page, '.palette-panel')
}

function syncAITools() {
  const page = activePage('AI Tools')
  if (!page || !BRUTTI_SOUL.full) return

  setText(page.querySelector('.page-header p'), 'Setiap prompt starter mewarisi Brutti Soul Master. Prompt hanya bantu susun kerja; fakta tetap mesti datang daripada source yang sudah verify.')
  setText(page.querySelector('.ai-banner p'), 'Full Soul Master digunakan sebagai source: Origin, Voice, Values, Red Lines, Product, Content Craft, Story Pillars, Vision, Checklist dan Golden Examples.')

  const rules = [...page.querySelectorAll('.assistant-rules span')]
  const ruleLabels = ['Verified facts only', 'Soul Master voice', 'No hashtags', 'Human review required']
  rules.forEach((node, index) => {
    const svg = node.querySelector('svg')
    node.replaceChildren(...(svg ? [svg] : []), document.createTextNode(ruleLabels[index] || clean(node.textContent)))
  })

  page.querySelectorAll('.prompt-grid article').forEach((card) => {
    const title = clean(card.querySelector('h4')?.textContent)
    const description = card.querySelector('p')
    if (PROMPT_COPY[title]) setText(description, PROMPT_COPY[title])
  })

  ensurePanel(page, '.prompt-sections')
}

function syncSettings() {
  const page = activePage('Settings')
  if (!page || page.querySelector('.soul-setting-row')) return
  const workflowPanel = [...page.querySelectorAll('.settings-grid .panel')]
    .find((panel) => /review-first controls/i.test(panel.textContent || ''))
  if (!workflowPanel) return

  const row = document.createElement('div')
  row.className = 'setting-row soul-setting-row'
  row.innerHTML = '<div><strong>Brutti Soul Master source locked</strong><p>Content Studio, Today’s Recommendation, Brand Library dan AI Tools mesti ikut source yang sama.</p></div><span class="switch on"><i></i></span>'
  workflowPanel.append(row)
}

function syncStudioChecks() {
  const page = activePage('Content Studio')
  if (!page) return

  const hashtagCheckbox = page.querySelector('.checkbox-row input[type="checkbox"]')
  const hashtagRow = hashtagCheckbox?.closest('.checkbox-row')
  if (hashtagCheckbox?.checked) hashtagCheckbox.click()
  if (hashtagRow) hashtagRow.style.display = 'none'

  const hashtagButton = [...page.querySelectorAll('.rewrite-actions button')]
    .find((button) => /hashtag/i.test(button.textContent || ''))
  if (hashtagButton) hashtagButton.style.display = 'none'

  const output = page.querySelector('.output-editor-label textarea')
  const check = [...page.querySelectorAll('.ai-checks span')]
    .find((node) => /hashtags controlled/i.test(node.textContent || '') || /no hashtags/i.test(node.textContent || ''))

  if (check) {
    const svg = check.querySelector('svg')
    const hasHashtags = Boolean(output?.value.match(/#[\p{L}\p{N}_-]+/gu))
    check.className = hasHashtags ? 'flag' : 'pass'
    check.replaceChildren(...(svg ? [svg] : []), document.createTextNode(hasHashtags ? 'Remove hashtags before saving' : 'No hashtags'))
  }
}

function syncAll() {
  if (!soulSourceReady) return
  syncBrandLibrary()
  syncAITools()
  syncSettings()
  syncStudioChecks()
}

export default function BruttiSoulSystemEnhancer() {
  useEffect(() => {
    if (!soulSourceReady) return undefined

    let timer = 0
    const schedule = (delay = 45) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncAll, delay)
    }

    const onClick = (event) => {
      const promptButton = event.target.closest?.('.prompt-grid .text-button')
      if (promptButton) {
        const title = clean(promptButton.closest('article')?.querySelector('h4')?.textContent)
        window.setTimeout(() => {
          const page = activePage('Content Studio')
          const brief = page ? [...page.querySelectorAll('label')]
            .find((label) => clean(label.textContent).startsWith('Verified facts / direction'))
            ?.querySelector('textarea') : null
          if (brief) {
            setReactValue(brief, '')
            brief.placeholder = PROMPT_PLACEHOLDER[title] || 'Masukkan fakta sebenar yang sudah verify sebelum generate content.'
            brief.focus()
          }
          syncAll()
        }, 90)
      }
      schedule(65)
    }

    const onInput = (event) => {
      if (event.target.matches?.('.output-editor-label textarea')) schedule(20)
    }

    schedule()
    document.addEventListener('click', onClick, true)
    document.addEventListener('input', onInput, true)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('input', onInput, true)
    }
  }, [])

  return null
}
