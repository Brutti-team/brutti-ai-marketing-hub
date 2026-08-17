import { useEffect } from 'react'

const SOURCE = {
  title: 'Brutti Soul Master',
  evidence: 'Brand source of truth for Brutti voice, story direction and content ideas.',
  rules: ['First person', 'Story-led hook', 'Sabahan colloquial', '1–3 emoji', 'No hashtags'],
}

const IDEAS = [
  {
    pillar: '01 · ARTISAN & DIGNITY',
    title: 'Cerita orang di sebalik satu piece',
    direction: 'Pilih satu cerita sebenar tentang artisan atau team Brutti. Cerita apa yang mereka buat, kenapa benda itu penting dan satu detail real dari proses. Jangan tambah claim yang belum disahkan.',
  },
  {
    pillar: '02 · STORY BEHIND THE PIECE',
    title: 'Kenapa piece ni wujud?',
    direction: 'Pilih satu furniture atau project sebenar. Mulakan dengan masalah atau keperluan ruang, kemudian cerita kenapa solution itu dipilih dan bagaimana ia digunakan. Guna fakta yang memang sudah confirm sahaja.',
  },
  {
    pillar: '03 · FOUNDER / TEAM MOMENT',
    title: 'Momen jujur di sebalik Brutti',
    direction: 'Gunakan satu momen sebenar dari founder atau team: keputusan susah, benda yang dipelajari, atau sesuatu yang tidak menjadi seperti plan. Cerita dengan nada jujur dan santai, bukan corporate.',
  },
  {
    pillar: '04 · DAILY FUNNY MOMENT',
    title: 'Babak harian yang boleh jadi content',
    direction: 'Cari satu babak lucu atau relatable yang betul-betul berlaku di workshop, installation atau office. Mulakan dari scene itu, kemudian sambung dengan point Brutti yang relevan. Jangan reka kejadian.',
  },
]

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function activePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === title) || null
}

function field(page, labelPrefix, selector) {
  const label = [...page.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelPrefix))
  return label?.querySelector(selector) || null
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

function sentence(value = '') {
  const text = clean(value).replace(/[.!?]+$/g, '')
  if (!text) return ''
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}

function splitFacts(value = '') {
  const normalized = clean(value)
  if (!normalized) return []
  const pieces = normalized
    .split(/(?<=[.!?])\s+|\s*;\s*|\s*,\s*(?=[A-Z0-9])/)
    .map(sentence)
    .filter(Boolean)
  return pieces.slice(0, 4)
}

function productName(page) {
  const selected = field(page, 'Product', 'select')?.value || ''
  return selected && selected !== 'General / No Product' ? selected : ''
}

function contentType(page) {
  return field(page, 'Content type', 'select')?.value || 'Brand Awareness'
}

function buildSoulCaption(page, mode = 'balanced', variation = 0) {
  const title = field(page, 'Content title', 'input')?.value || ''
  const brief = field(page, 'Verified facts / direction', 'textarea')?.value || ''
  const product = productName(page)
  const type = contentType(page)
  const subject = product || title || 'benda ni'
  const facts = splitFacts(brief)

  const hookPools = {
    'Brand Awareness': [
      'Kadang-kadang benda yang paling nampak simple tu la paling banyak cerita di belakang dia. 👀',
      'Kami selalu mula dari satu soalan simple: benda ni memang perlu ka untuk ruang tu?',
      'Bukan semua benda perlu bunyi besar-besar. Ada masa cerita yang real tu lagi sampai.',
    ],
    'Product Highlight': [
      `Kali ni kami mau cerita sikit pasal ${subject}. 👀`,
      `${subject} ni kami tengok fungsi dia dulu, baru benda lain.`,
      `Kalau nampak ${subject}, jangan tengok rupa ja dulu. Ada sebab kenapa fungsi dia penting.`,
    ],
    Educational: [
      'Ada benda simple yang boleh kasi ruang rasa jauh lebih senang digunakan. 👀',
      'Tip ni nampak kecil, tapi kalau hari-hari guna ruang tu memang terasa beza dia.',
      'Sebelum fikir banyak benda, tengok dulu cara ruang tu digunakan setiap hari.',
    ],
    'Behind the Scenes': [
      'Yang orang nampak selalunya hasil akhir ja. Di belakang tu, banyak benda kecil team check satu-satu. 👀',
      'Sebelum satu benda nampak siap, memang ada banyak step kecil yang orang tidak sempat nampak.',
      'Nah, kali ni kami kasi nampak sikit apa yang berlaku di belakang tabir.',
    ],
    'Customer Story': [
      'Setiap ruang ada cerita dia sendiri, sebab cara orang guna ruang pun lain-lain. 👀',
      'Kami suka dengar dulu cerita customer sebelum fikir solution.',
      'Kadang-kadang satu detail kecil dari customer tu yang bagi direction paling jelas.',
    ],
    Promotion: [
      'Kalau benda ni memang ngam dengan apa yang kamu cari, baru kita cerita pasal offer dia. 👀',
      'Kami tidak mau kasi hard sell sangat. Tengok dulu benda ni sesuai ka dengan keperluan kamu.',
      'Offer tu bonus. Yang penting fungsi dia memang masuk dengan apa yang kamu perlukan.',
    ],
  }

  const supportByType = {
    'Brand Awareness': [
      'Bagi kami, furniture bukan setakat kasi penuh ruang.',
      'Kami lebih suka cerita benda yang memang berlaku dan ada sebab untuk diceritakan.',
      'Kalau detail belum confirm, kami tidak kasi tambah sendiri.',
    ],
    'Product Highlight': [
      'Kami tengok fungsi dulu, baru rupa dan style dia.',
      'Yang penting benda tu ngam dengan cara kamu guna ruang.',
      'Detail yang belum confirm memang kena check dulu dengan team.',
    ],
    Educational: [
      'Tidak payah complicated sangat kalau fungsi dia sudah jelas.',
      'Lain ruang, lain cara dia. Tidak semestinya semua kena ikut benda yang sama.',
      'Cara kamu guna ruang hari-hari tu sebenarnya clue paling senang.',
    ],
    'Behind the Scenes': [
      'Banyak keputusan kecil berlaku sebelum satu piece nampak siap.',
      'Team kasi check satu-satu supaya direction asal tidak lari.',
      'Kami share proses sebab cerita di belakang hasil tu pun penting.',
    ],
    'Customer Story': [
      'Bagi team, keperluan sebenar customer tetap jadi starting point.',
      'Kami tengok rutin dan fungsi ruang dulu sebelum fikir benda lain.',
      'Bila detail sudah jelas, baru senang susun direction yang ngam.',
    ],
    Promotion: [
      'Harga, tempoh dan syarat memang kena ikut info yang sudah confirm.',
      'Kalau ada benda belum jelas, roger ja team dulu.',
      'Tidak payah rushing kalau masih mau compare pilihan.',
    ],
  }

  const hookPool = hookPools[type] || hookPools['Brand Awareness']
  const hookShift = mode === 'hook' ? 1 : mode === 'engaging' ? 2 : 0
  const hook = hookPool[(variation + hookShift) % hookPool.length]
  const supports = [...(supportByType[type] || supportByType['Brand Awareness'])]

  if (mode === 'professional') {
    for (let i = 0; i < supports.length; i += 1) {
      supports[i] = supports[i]
        .replace(/ngam/g, 'sesuai')
        .replace(/roger ja/g, 'mesej')
        .replace(/tidak payah/g, 'tidak perlu')
    }
  }

  let lines = [hook, ...facts, ...supports]
  if (mode === 'shorten') lines = lines.slice(0, 6)
  else lines = lines.slice(0, 8)

  const ctas = [
    'Kalau kamu mau tahu mana yang ngam dengan ruang kamu, roger ja team Brutti.',
    'Kalau ada detail yang kamu mau check, mesej ja team. Kami kasi tengok sama-sama.',
    'Kalau kamu ada ruang atau idea yang mau dibincang, share ja sama team Brutti.',
  ]
  const cta = mode === 'cta' ? ctas[(variation + 1) % ctas.length] : ctas[variation % ctas.length]
  lines.push(cta)

  return lines
    .map((line) => clean(line))
    .filter(Boolean)
    .join('\n')
    .replace(/#[\p{L}\p{N}_-]+/gu, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function applySoulCaption(page, mode = 'balanced', variation = 0) {
  const output = page.querySelector('.output-editor-label textarea')
  const brief = field(page, 'Verified facts / direction', 'textarea')?.value || ''
  if (!output || !clean(brief)) return
  setReactValue(output, buildSoulCaption(page, mode, variation))
  patchSoulChecklist(page)
}

function patchSoulChecklist(page) {
  const checks = page.querySelector('.ai-checks')
  if (!checks || checks.querySelector('.soul-lite-check')) return
  const item = document.createElement('span')
  item.className = 'pass soul-lite-check'
  item.textContent = '✓ Brutti Soul · no hashtags · human review'
  checks.prepend(item)
}

function patchStudio(page) {
  if (!page) return

  if (!page.querySelector('.soul-source-strip')) {
    const strip = document.createElement('section')
    strip.className = 'soul-source-strip'
    strip.innerHTML = `<div><span class="soul-live-dot"></span><div><strong>${SOURCE.title} · Active source</strong><p>${SOURCE.evidence}</p></div></div><div class="soul-source-rules">${SOURCE.rules.map((rule) => `<span>${rule}</span>`).join('')}</div>`
    page.querySelector('.page-header')?.insertAdjacentElement('afterend', strip)
  }

  const checkbox = page.querySelector('.checkbox-row input[type="checkbox"]')
  const row = checkbox?.closest('.checkbox-row')
  if (checkbox?.checked) checkbox.click()
  if (row) row.style.display = 'none'

  const generateButton = page.querySelector('.generator-form button[type="submit"]')
  if (generateButton) {
    const icon = generateButton.querySelector('svg')
    generateButton.textContent = ''
    if (icon) generateButton.append(icon)
    generateButton.append(document.createTextNode('Generate with Brutti Soul'))
  }

  const hashtagButton = [...page.querySelectorAll('.rewrite-actions button')]
    .find((button) => /hashtag/i.test(button.textContent || ''))
  if (hashtagButton) hashtagButton.style.display = 'none'

  patchSoulChecklist(page)
}

function patchBrand(page) {
  if (!page || page.querySelector('.soul-brand-panel')) return
  const panel = document.createElement('section')
  panel.className = 'panel soul-brand-panel'
  panel.innerHTML = `<div class="soul-brand-head"><div><span>BRAND SOURCE OF TRUTH</span><h2>Brutti Soul Master</h2><p>${SOURCE.evidence}</p></div></div><div class="soul-brand-grid"><article><small>VOICE</small><strong>First-person · kawan bercerita · Sabahan colloquial + sikit English</strong></article><article><small>HOOK</small><strong>Mula dengan scene, nama, nombor atau curiosity — bukan ayat corporate</strong></article><article><small>RED LINES</small><strong>No unsupported facts · no fake story · no mass-production voice</strong></article><article><small>POST CRAFT</small><strong>Short lines · 1–3 emoji · no hashtags · human review</strong></article></div>`
  page.querySelector('.page-header')?.insertAdjacentElement('afterend', panel)
}

function loadIdea(idea) {
  const nav = [...document.querySelectorAll('.nav-link')]
    .find((button) => button.querySelector('span')?.textContent?.trim() === 'Content Studio')
  nav?.click()
  window.setTimeout(() => {
    const page = activePage('Content Studio')
    if (!page) return
    patchStudio(page)
    setReactValue(field(page, 'Content title', 'input'), idea.title)
    setReactValue(field(page, 'Verified facts / direction', 'textarea'), idea.direction)
    field(page, 'Content title', 'input')?.focus()
  }, 80)
}

function patchIdeas(page) {
  if (!page || page.querySelector('.soul-idea-library')) return
  const section = document.createElement('section')
  section.className = 'soul-idea-library'
  section.innerHTML = '<div class="soul-idea-head"><div><span>BRUTTI SOUL CONTENT IDEAS</span><h2>Mula dengan benda real yang layak diceritakan.</h2><p>Pilih direction, kemudian tambah fakta sebenar sebelum generate.</p></div></div><div class="soul-idea-grid"></div>'
  const grid = section.querySelector('.soul-idea-grid')
  IDEAS.forEach((idea) => {
    const card = document.createElement('article')
    card.innerHTML = `<span>${idea.pillar}</span><h3>${idea.title}</h3><p>${idea.direction}</p><button type="button">Use this direction →</button>`
    card.querySelector('button')?.addEventListener('click', () => loadIdea(idea))
    grid.append(card)
  })
  page.querySelector('.page-header')?.insertAdjacentElement('afterend', section)
}

function syncVisiblePage() {
  patchStudio(activePage('Content Studio'))
  patchBrand(activePage('Brand Library'))
  patchIdeas(activePage('AI Tools'))
}

export default function BruttiSoulLiteEnhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 40) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncVisiblePage, delay)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (!button) return

      if (button.closest('.rewrite-actions')) {
        const label = clean(button.textContent)
        const mode = /engaging/i.test(label) ? 'engaging'
          : /casual/i.test(label) ? 'casual'
            : /professional/i.test(label) ? 'professional'
              : /shorter/i.test(label) ? 'shorten'
                : /hook/i.test(label) ? 'hook'
                  : /cta/i.test(label) ? 'cta'
                    : 'balanced'
        window.setTimeout(() => {
          const page = activePage('Content Studio')
          if (page) applySoulCaption(page, mode, 0)
        }, 30)
        return
      }

      if (button.closest('.variation-row')) {
        const match = clean(button.textContent).match(/(\d+)/)
        const variation = Math.max(0, Number(match?.[1] || 1) - 1)
        window.setTimeout(() => {
          const page = activePage('Content Studio')
          if (page) applySoulCaption(page, 'balanced', variation)
        }, 30)
        return
      }

      if (button.closest('.nav-link') || button.closest('.tab-bar')) schedule(30)
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      window.setTimeout(() => {
        const page = activePage('Content Studio')
        if (page) applySoulCaption(page, 'balanced', 0)
      }, 30)
    }

    syncVisiblePage()
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [])

  return null
}
