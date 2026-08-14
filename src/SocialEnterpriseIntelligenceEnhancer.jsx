import { useEffect } from 'react'

const benchmarkPatterns = [
  {
    title: 'Second life of material',
    label: 'CIRCULAR STORY',
    copy: 'Turn a verified material or waste story into useful product content: source → process → function → outcome. Never claim recycled or upcycled material unless BRUTTI has a verified source.',
  },
  {
    title: 'Maker & artisan story',
    label: 'HUMAN STORY',
    copy: 'Show the real person, skill, process or local craft behind a BRUTTI project. Keep the maker visible without inventing background, training or employment claims.',
  },
  {
    title: 'Skills → opportunity',
    label: 'SOCIAL IMPACT',
    copy: 'Connect training, skills and opportunity only when internal BRUTTI records support the story. Use qualitative storytelling first when verified impact numbers are not available.',
  },
  {
    title: 'Purpose-led Sabah identity',
    label: 'BRAND PURPOSE',
    copy: 'Combine useful furniture content with authentic Sabah identity, craftsmanship and purpose. Local identity should support the story, not become forced slang or decoration.',
  },
]

const impactFields = [
  ['Artisans / youth trained', 'Verified internal count required'],
  ['Training or skills hours', 'Verified internal record required'],
  ['Material recovered / upcycled', 'Verified material record required'],
  ['Community partnerships', 'Verified partner record required'],
  ['Impact-linked projects', 'Verified project record required'],
]

const storyStarters = [
  {
    title: 'Artisan Story',
    type: 'Customer Story',
    direction: 'Build a BRUTTI artisan or maker story using verified facts only. Cover: who is involved, the skill or process shown, what is being made, why the work matters, and one natural CTA. Do not invent training, employment, income or personal-background claims.',
  },
  {
    title: 'Second Life of Material',
    type: 'Educational',
    direction: 'Create a material journey story using only verified BRUTTI information: starting material → reason it can be reused or repurposed → workshop process → finished function → customer value. Do not use recycled, reclaimed, sustainable or upcycled claims unless the source confirms them.',
  },
  {
    title: 'Sabah Craft Story',
    type: 'Brand Awareness',
    direction: 'Create a human, locally grounded BRUTTI story about Sabah craftsmanship, design thinking or workshop culture. Keep the Sabah identity natural and specific to verified people, place, process or project details. Avoid generic heritage claims.',
  },
  {
    title: 'Skills & Community Impact',
    type: 'Brand Awareness',
    direction: 'Create a social-impact story from verified BRUTTI records. Explain the activity, who participates, what skill or opportunity is created, and the practical outcome. If there are no verified numbers, keep the story qualitative and do not estimate impact.',
  },
  {
    title: 'Customer Problem → Crafted Solution',
    type: 'Customer Story',
    direction: 'Tell one real customer or project story: space problem → requirement → BRUTTI design or fabrication approach → finished solution → useful result. Use only confirmed product, project and customer details; do not invent dimensions, price, timeline or performance claims.',
  },
]

function activePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && (page.classList.contains('dashboard-page') ? title === 'Dashboard' : page.querySelector('h1')?.textContent?.trim() === title)) || null
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

function findControl(page, labelText, selector) {
  const label = [...page.querySelectorAll('label')]
    .find((item) => (item.textContent || '').trim().startsWith(labelText))
  return label?.querySelector(selector) || null
}

function useStoryStarter(starter) {
  const page = activePage('Content Studio')
  if (!page) return

  const freeAssist = [...page.querySelectorAll('.tab-bar button')]
    .find((button) => /free assist/i.test(button.textContent || ''))
  freeAssist?.click()

  window.setTimeout(() => {
    const studio = activePage('Content Studio') || page
    const titleInput = findControl(studio, 'Content title', 'input')
    const typeSelect = findControl(studio, 'Content type', 'select')
    const factsInput = findControl(studio, 'Verified facts / direction', 'textarea')

    setReactValue(titleInput, starter.title)
    const validType = [...(typeSelect?.options || [])].some((option) => option.value === starter.type)
    if (validType) setReactValue(typeSelect, starter.type)
    setReactValue(factsInput, starter.direction)
    titleInput?.focus()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 60)
}

function createAnalyticsPanel(page) {
  if (page.querySelector('.social-enterprise-intelligence')) return

  const panel = document.createElement('section')
  panel.className = 'panel social-enterprise-intelligence'
  panel.innerHTML = `
    <div class="sei-heading">
      <div>
        <span class="eyebrow">SOCIAL ENTERPRISE INTELLIGENCE</span>
        <h3>Use market benchmark patterns without copying another brand.</h3>
        <p>Research is converted into planning rules for BRUTTI: human stories, circular-product storytelling, skills and community impact, and purpose-led Sabah identity. Benchmark inspiration is never treated as a BRUTTI fact.</p>
      </div>
      <span class="sei-status">Benchmark layer</span>
    </div>
    <div class="sei-pattern-grid">
      ${benchmarkPatterns.map((item) => `
        <article>
          <span>${item.label}</span>
          <strong>${item.title}</strong>
          <p>${item.copy}</p>
        </article>
      `).join('')}
    </div>
    <div class="sei-impact-readiness">
      <div class="sei-impact-head">
        <div>
          <span class="eyebrow">SOCIAL IMPACT DATA READINESS</span>
          <h4>Track impact only when BRUTTI has a verified internal source.</h4>
        </div>
        <span>Data fields prepared</span>
      </div>
      <div class="sei-impact-list">
        ${impactFields.map(([name, status]) => `<div><strong>${name}</strong><span>${status}</span></div>`).join('')}
      </div>
      <p class="sei-data-rule"><strong>Data rule:</strong> Do not estimate social-impact numbers from competitor benchmarks, marketing copy or assumptions.</p>
    </div>
  `

  const sourcePanel = page.querySelector('.source-table-panel')
  if (sourcePanel) sourcePanel.insertAdjacentElement('beforebegin', panel)
  else page.appendChild(panel)
}

function createStudioPanel(page) {
  if (page.querySelector('.social-impact-story-builder')) return

  const panel = document.createElement('section')
  panel.className = 'panel social-impact-story-builder'
  panel.innerHTML = `
    <div class="sei-heading">
      <div>
        <span class="eyebrow">SOCIAL IMPACT STORY BUILDER</span>
        <h3>Turn BRUTTI purpose into content — with verified facts only.</h3>
        <p>Select a story angle to load a safe direction into Free AI Assist. Add the real project, maker, material or community facts before generating the final caption.</p>
      </div>
      <span class="sei-status">Human review required</span>
    </div>
    <div class="sei-starter-grid">
      ${storyStarters.map((item, index) => `
        <button type="button" data-impact-starter="${index}">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <strong>${item.title}</strong>
          <small>Load verified-facts direction</small>
        </button>
      `).join('')}
    </div>
    <p class="sei-data-rule"><strong>Benchmark rule:</strong> Learn the marketing pattern, not another company’s claims, wording or impact numbers.</p>
  `

  panel.querySelectorAll('[data-impact-starter]').forEach((button) => {
    button.addEventListener('click', () => {
      const starter = storyStarters[Number(button.dataset.impactStarter)]
      if (starter) useStoryStarter(starter)
    })
  })

  page.appendChild(panel)
}

export default function SocialEnterpriseIntelligenceEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const analytics = activePage('Analytics')
      if (analytics) createAnalyticsPanel(analytics)

      const studio = activePage('Content Studio')
      if (studio) createStudioPanel(studio)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
