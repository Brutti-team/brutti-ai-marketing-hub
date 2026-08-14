import { useEffect } from 'react'

const dailyRecommendations = {
  0: {
    title: 'Commercial project story — dari keperluan premis sampai solution siap',
    idea: 'Ceritakan satu project SME: masalah ruang → requirement → custom solution → hasil akhir.',
    formType: 'Customer Story',
    target: 'SME / Premis',
    objective: 'Trust + enquiry',
    product: 'General / No Product',
    metaTarget: 'SME / Premis',
    metaObjective: 'B2B trust',
    metaProduct: 'Project story',
    reason: 'SME, retail dan F&B ialah segmen keutamaan kedua dalam customer research, dan commercial case study membantu tunjuk cara BRUTTI menyelesaikan keperluan ruang sebenar.',
    direction: 'Bina cerita project secara ringkas: masalah atau keperluan customer, requirement ruang, proses solution, dan hasil akhir. Gunakan hanya fakta project yang memang sudah disahkan; jangan tambah harga, lead time atau claim yang tiada sumber.',
  },
  1: {
    title: 'Storage problem → practical solution',
    idea: 'Barang makin banyak tapi ruang tidak bertambah? Mulakan dengan storage yang sesuai dengan rutin ruang.',
    formType: 'Educational',
    target: 'Homeowner',
    objective: 'Education + awareness',
    product: 'AHTAM XL Shelving Rack',
    metaTarget: 'Homeowner',
    metaObjective: 'Education',
    metaProduct: 'AHTAM XL',
    reason: 'Bedroom dan storage ialah use case B2C yang paling jelas dalam data, manakala pertanyaan tentang ukuran dan custom design juga kerap muncul.',
    direction: 'Terangkan masalah ruang yang penuh atau tidak tersusun dan beri satu tip practical tentang storage. Gunakan AHTAM XL sebagai contoh hanya jika butiran produknya sudah disahkan dalam Product Library.',
  },
  2: {
    title: 'AHTAM XL — product use case',
    idea: 'Spotlight AHTAM XL dari sudut fungsi: bila open shelving lebih sesuai untuk ruang harian?',
    formType: 'Product Highlight',
    target: 'Homeowner',
    objective: 'Product awareness',
    product: 'AHTAM XL Shelving Rack',
    metaTarget: 'Homeowner',
    metaObjective: 'Awareness',
    metaProduct: 'AHTAM XL',
    reason: 'Product + use-case content selari dengan minat storage dan membantu audience faham fungsi produk tanpa perlu hard selling.',
    direction: 'Fokus pada kegunaan open shelving dalam ruang harian. Mulakan dengan customer need, kemudian fungsi produk dan satu CTA. Jangan tambah spesifikasi, harga atau promosi yang tidak disahkan.',
  },
  3: {
    title: 'Behind the scenes — dari ukuran sampai installation',
    idea: 'Apa sebenarnya berlaku sebelum satu custom furniture siap dan sampai ke ruang customer?',
    formType: 'Behind the Scenes',
    target: 'Homeowner + local craft',
    objective: 'Trust + craftsmanship',
    product: 'General / No Product',
    metaTarget: 'Home + Craft',
    metaObjective: 'Trust',
    metaProduct: 'BTS process',
    reason: 'Craftsmanship/bespoke ialah antara signal content paling kuat dalam data sejarah, dan audience juga menunjukkan minat terhadap custom design, ukuran dan installation.',
    direction: 'Ceritakan proses secara ringkas seperti measurement, fabrication, finishing, checking atau installation berdasarkan bahan sebenar yang tersedia. Jangan cipta tempoh siap atau detail teknikal yang belum disahkan.',
  },
  4: {
    title: 'FAQ — sebelum request custom furniture',
    idea: '5 benda yang perlu disediakan sebelum request custom furniture supaya discussion lebih senang.',
    formType: 'Educational',
    target: 'Homeowner / SME',
    objective: 'Lead education',
    product: 'General / No Product',
    metaTarget: 'Home / SME',
    metaObjective: 'Lead education',
    metaProduct: 'FAQ',
    reason: 'Customer data banyak menunjukkan pertanyaan tentang harga/bajet, cara order, custom design/ukuran, lokasi dan delivery/installation.',
    direction: 'Terangkan apa yang customer patut sediakan sebelum enquiry: reference atau design, ukuran ruang, kegunaan, lokasi dan bajet jika ada. Gunakan wording yang membantu, bukan memaksa jualan.',
  },
  5: {
    title: 'Brand story — furniture yang ada cerita',
    idea: 'Ceritakan satu piece dari sudut artisan, identiti Sabah dan tujuan ruang — bukan sekadar produk.',
    formType: 'Brand Awareness',
    target: 'Local craft audience',
    objective: 'Brand affinity',
    product: 'General / No Product',
    metaTarget: 'Local audience',
    metaObjective: 'Brand affinity',
    metaProduct: 'Brand story',
    reason: 'Sabah identity, craftsmanship dan sustainability ialah signal yang kuat dalam customer/content research dan sesuai untuk membina hubungan dengan audience.',
    direction: 'Pilih satu cerita sebenar tentang artisan, proses, asal idea atau identiti lokal. Kekalkan tone santai dan human. Hanya guna sustainability atau material claim jika sumber memang sah.',
  },
  6: {
    title: 'Interactive choice — open rack atau closed cabinet?',
    idea: 'Bagi audience dua pilihan untuk ruang mereka dan minta mereka pilih ikut cara penggunaan sendiri.',
    formType: 'Brand Awareness',
    target: 'Homeowner',
    objective: 'Engagement',
    product: 'General / No Product',
    metaTarget: 'Homeowner',
    metaObjective: 'Engagement',
    metaProduct: 'A/B choice',
    reason: 'Interactive content memberi ruang untuk conversation tanpa terlalu sales-heavy, sambil kekal dekat dengan keperluan storage dan furniture audience.',
    direction: 'Buat content A/B yang mudah: open rack vs closed cabinet atau dua gaya susunan ruang. Tanya audience pilihan mereka dan sebabnya. Jangan masukkan claim performance atau promosi.',
  },
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

function findNavButton(label) {
  return [...document.querySelectorAll('#root .nav-link')]
    .find((button) => button.querySelector('span')?.textContent?.trim() === label)
}

function findActivePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && (page.classList.contains('dashboard-page') ? title === 'Dashboard' : page.querySelector('h1')?.textContent?.trim() === title))
}

function findLabelControl(root, labelText, selector) {
  const label = [...root.querySelectorAll('label')]
    .find((item) => (item.textContent || '').trim().startsWith(labelText))
  return label?.querySelector(selector) || null
}

function waitFor(find, attempts = 40) {
  return new Promise((resolve) => {
    let count = 0
    const tick = () => {
      const value = find()
      if (value || count >= attempts) {
        resolve(value || null)
        return
      }
      count += 1
      window.setTimeout(tick, 50)
    }
    tick()
  })
}

function todayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value
}

function setLabelText(label, value) {
  if (!label) return
  const textNodes = [...label.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE)
  if (!textNodes.length) {
    label.appendChild(document.createTextNode(value))
    return
  }
  textNodes.forEach((node, index) => {
    const nextValue = index === 0 ? value : ''
    if (node.textContent !== nextValue) node.textContent = nextValue
  })
}

function setFirstTextNode(button, value) {
  if (!button) return
  const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
  if (textNode && textNode.textContent !== value) textNode.textContent = value
}

async function loadRecommendationIntoStudio(recommendation) {
  findNavButton('Content Studio')?.click()
  const page = await waitFor(() => findActivePage('Content Studio'))
  if (!page) return

  const freeAssist = [...page.querySelectorAll('.tab-bar button')]
    .find((button) => /free assist/i.test(button.textContent || ''))
  freeAssist?.click()
  await waitFor(() => page.querySelector('.generator-form'))

  const titleInput = findLabelControl(page, 'Content title', 'input')
  const typeSelect = findLabelControl(page, 'Content type', 'select')
  const productSelect = findLabelControl(page, 'Product', 'select')
  const briefInput = findLabelControl(page, 'Verified facts / direction', 'textarea')

  setReactValue(titleInput, recommendation.title)
  setReactValue(typeSelect, recommendation.formType)

  const productExists = [...(productSelect?.options || [])]
    .some((option) => option.value === recommendation.product)
  setReactValue(productSelect, productExists ? recommendation.product : 'General / No Product')
  setReactValue(briefInput, recommendation.direction)

  window.scrollTo({ top: 0, behavior: 'smooth' })
  titleInput?.focus()
}

async function addRecommendationToPlanner(recommendation) {
  findNavButton('Campaign Planner')?.click()
  const page = await waitFor(() => findActivePage('Campaign Planner'))
  if (!page) return

  const addButton = [...page.querySelectorAll('button')]
    .find((button) => /add content/i.test(button.textContent || ''))
  addButton?.click()

  const modal = await waitFor(() => document.querySelector('#root .plan-modal'))
  if (!modal) return

  const titleInput = findLabelControl(modal, 'Plan title', 'input')
  const dateInput = findLabelControl(modal, 'Date', 'input')
  const statusSelect = findLabelControl(modal, 'Status', 'select')
  const typeSelect = findLabelControl(modal, 'Content type', 'select')
  const channelSelect = findLabelControl(modal, 'Channel', 'select')
  const productSelect = findLabelControl(modal, 'Product', 'select')

  setReactValue(titleInput, recommendation.title)
  setReactValue(dateInput, todayKey())
  setReactValue(statusSelect, 'Draft')
  setReactValue(typeSelect, recommendation.formType)
  setReactValue(channelSelect, 'Facebook')

  const productExists = [...(productSelect?.options || [])]
    .some((option) => option.value === recommendation.product)
  setReactValue(productSelect, productExists ? recommendation.product : 'General / No Product')

  window.setTimeout(() => modal.requestSubmit(), 80)
}

function bindAction(button, key, handler) {
  if (!button || button.dataset[key] === '1') return
  button.dataset[key] = '1'
  button.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    handler()
  }, true)
}

export default function DailyContentRecommendationEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = findActivePage('Dashboard')
      if (!page) return

      const hero = page.querySelector('.hero-panel')
      if (!hero) return

      const recommendation = dailyRecommendations[new Date().getDay()]
      const weekday = new Date().toLocaleDateString('en-MY', { weekday: 'long' })
      const label = hero.querySelector('.hero-label')
      setLabelText(label, `TODAY'S RECOMMENDATION · ${weekday}`)

      setText(hero.querySelector('.hero-content h2'), recommendation.idea)
      setText(hero.querySelector('.hero-content p'), `Why this content? ${recommendation.reason}`)

      const buttons = [...hero.querySelectorAll('.hero-buttons button')]
      const useButton = buttons[0]
      const plannerButton = buttons[1]
      setFirstTextNode(useButton, 'Use This Idea ')
      setText(plannerButton, 'Add to Planner')
      bindAction(useButton, 'dailyUseIdea', () => loadRecommendationIntoStudio(recommendation))
      bindAction(plannerButton, 'dailyAddPlanner', () => addRecommendationToPlanner(recommendation))

      const cards = [...hero.querySelectorAll('.art-card')]
      if (cards[0]) {
        setText(cards[0].querySelector('span'), 'TARGET')
        setText(cards[0].querySelector('strong'), recommendation.metaTarget)
      }
      if (cards[1]) {
        setText(cards[1].querySelector('span'), 'OBJECTIVE')
        setText(cards[1].querySelector('strong'), recommendation.metaObjective)
      }
      if (cards[2]) {
        setText(cards[2].querySelector('span'), 'SUGGESTED')
        setText(cards[2].querySelector('strong'), recommendation.metaProduct)
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return null
}
