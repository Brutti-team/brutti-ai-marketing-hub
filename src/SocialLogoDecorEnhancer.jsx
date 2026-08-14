import { useEffect } from 'react'

const platformSets = {
  'Google Sheets': ['Facebook', 'Instagram', 'TikTok', 'Threads'],
  'Google Drive': ['Facebook', 'Instagram', 'TikTok', 'Threads'],
  Notion: ['Facebook', 'Instagram', 'TikTok'],
  'Free AI Assist Mode': ['Facebook', 'Instagram', 'TikTok', 'Threads'],
  'Meta / Facebook': ['Facebook', 'Instagram'],
}

const labels = {
  Facebook: { short: 'f', text: 'Facebook' },
  Instagram: { short: 'ig', text: 'Instagram' },
  TikTok: { short: 'tt', text: 'TikTok' },
  Threads: { short: '@', text: 'Threads' },
}

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

function buildChip(platform) {
  const item = labels[platform] || { short: platform.slice(0, 2), text: platform }
  return `<span class="brutti-social-chip is-${slug(platform)}"><span class="brutti-social-mark">${item.short}</span><span>${item.text}</span></span>`
}

function decorateSettingsConnections() {
  document.querySelectorAll('.settings-panel .connections-list article').forEach((article) => {
    const title = article.querySelector('strong')?.textContent?.trim()
    const platforms = title ? platformSets[title] : null
    const infoBlock = article.querySelector(':scope > div:nth-of-type(2)')

    if (!platforms || !infoBlock) return

    let rail = infoBlock.querySelector('.brutti-social-rail')
    if (!rail) {
      rail = document.createElement('div')
      rail.className = 'brutti-social-rail'
      rail.innerHTML = `<small class="brutti-social-caption">Related channels</small><div class="brutti-social-row">${platforms.map(buildChip).join('')}</div>`
      infoBlock.appendChild(rail)
    }
  })
}

function decorateAssetPanels() {
  document.querySelectorAll('.core7-drive-required, .asset-panel').forEach((panel) => {
    if (panel.querySelector('.brutti-asset-channel-strip')) return

    const strip = document.createElement('div')
    strip.className = 'brutti-asset-channel-strip'
    strip.innerHTML = `
      <div>
        <small class="brutti-social-caption">Planned social usage</small>
        <p>Approved visuals can later be prepared for these social channels from one workspace.</p>
      </div>
      <div class="brutti-social-row">${['Facebook', 'Instagram', 'TikTok', 'Threads'].map(buildChip).join('')}</div>
    `

    if (panel.classList.contains('core7-drive-required')) {
      const heading = panel.querySelector('h3')
      heading?.insertAdjacentElement('afterend', strip)
      return
    }

    const toolbar = panel.querySelector('.library-toolbar')
    toolbar?.insertAdjacentElement('afterend', strip)
  })
}

export default function SocialLogoDecorEnhancer() {
  useEffect(() => {
    let cancelled = false

    const refresh = () => {
      if (cancelled) return
      decorateSettingsConnections()
      decorateAssetPanels()
    }

    refresh()
    const timer = window.setInterval(refresh, 1200)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return null
}
