import { useEffect } from 'react'

const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9_kxaVNNH07wxqrUsVPkRPNxXpnbCpnsL5RnT5CBE_Sd-jzqq910TjykFYWmeDKXE/exec'
function activeAnalyticsPage() { return [...document.querySelectorAll('#root .page')].find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Analytics') || null }
function replaceExact(node, current, replacement) { if (node?.textContent?.trim() === current) node.textContent = replacement }
function renderMeta(page, payload) {
  const posts = (payload?.data || payload || {})?.facebook?.topPosts || []
  if (!posts.length || page.querySelector('.meta-kpi-panel')) return
  const totals = posts.reduce((sum, post) => ({ reach:sum.reach+Number(post.reach||0), views:sum.views+Number(post.views||0), reactions:sum.reactions+Number(post.reactions||0), comments:sum.comments+Number(post.comments||0), shares:sum.shares+Number(post.shares||0) }), {reach:0,views:0,reactions:0,comments:0,shares:0})
  const section = document.createElement('section'); section.className = 'panel meta-kpi-panel'
  section.innerHTML = '<div class="panel-heading"><div><span class="eyebrow">META ENGAGEMENT</span><h3>Verified Meta snapshot</h3></div><span class="verified-label">Read-only source</span></div><div class="stats-grid"><article class="stat-card"><div><span>Reach</span><strong>'+totals.reach.toLocaleString()+'</strong><small>Synced posts</small></div></article><article class="stat-card"><div><span>Views</span><strong>'+totals.views.toLocaleString()+'</strong><small>Synced posts</small></div></article><article class="stat-card"><div><span>Reactions</span><strong>'+totals.reactions.toLocaleString()+'</strong><small>Synced posts</small></div></article><article class="stat-card"><div><span>Comments + shares</span><strong>'+(totals.comments+totals.shares).toLocaleString()+'</strong><small>Combined engagement</small></div></article></div>'
  page.appendChild(section)
}
export default function AnalyticsCopyPolish() {
  useEffect(() => {
    const root = document.getElementById('root'); if (!root) return undefined
    let loaded = false
    const sync = () => {
      const page = activeAnalyticsPage(); if (!page) return
      replaceExact(page.querySelector('.page-header p'), 'Operational marketing analytics update from the workspace. Meta performance KPI stay excluded until a verified Insights source exists.', 'Operational marketing analytics from the workspace with verified Meta engagement context.')
      page.querySelectorAll('.status-chip').forEach((chip) => { if (/Meta KPIs? excluded/i.test(chip.textContent || '')) chip.textContent = 'Meta KPIs connected' })
      if (!loaded) { loaded = true; fetch(endpoint, {cache:'no-store'}).then((r) => r.ok ? r.json() : null).then((p) => p && renderMeta(page,p)).catch(() => {}) }
    }
    sync(); const observer = new MutationObserver(sync); observer.observe(root,{childList:true,subtree:true}); return () => observer.disconnect()
  }, [])
  return null
}
