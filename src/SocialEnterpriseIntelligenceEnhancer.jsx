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

function activePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && (page.classList.contains('dashboard-page') ? title === 'Dashboard' : page.querySelector('h1')?.textContent?.trim() === title)) || null
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

export default function SocialEnterpriseIntelligenceEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      // Remove any older cached Story Builder panel from Content Studio so Free Assist
      // opens directly on the caption form and output.
      root.querySelectorAll('.social-impact-story-builder').forEach((panel) => panel.remove())

      const analytics = activePage('Analytics')
      if (analytics) createAnalyticsPanel(analytics)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
