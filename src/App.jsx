import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  campaignIdeas,
  initialContent,
  initialPlans,
  pipelineStages,
  productNames,
  products,
  promptLibrary,
  verifiedSnapshot,
} from './data'
import {
  callMarketingApi,
  clearWorkspaceKey,
  deleteGoogleContent,
  deleteGooglePlan,
  googleConfigured,
  hasWorkspaceKey,
  loadWorkspace,
  saveGoogleContent,
  saveGooglePlan,
  setWorkspaceKey,
} from './lib/googleWorkspace'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'studio', label: 'Content Studio', icon: 'sparkles', count: 4 },
  { id: 'planner', label: 'Campaign Planner', icon: 'calendar' },
  { id: 'brand', label: 'Brand Library', icon: 'brand' },
  { id: 'products', label: 'Product Library', icon: 'box', count: 88 },
  { id: 'assets', label: 'Asset Library', icon: 'image' },
  { id: 'ai-tools', label: 'AI Tools', icon: 'wand' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const stageClass = (value = '') => value.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved ? JSON.parse(saved) : fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

function Icon({ name, size = 18 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const shapes = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"/><path d="m19 13 .8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    brand: <><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="m8 13 2.5 2.5L16 9"/></>,
    box: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8M21 8v8l-9 5-9-5V8"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 15-4.5-4.5L7 20"/></>,
    wand: <><path d="m15 4 5 5L8 21H3v-5L15 4Z"/><path d="m13 6 5 5M6 3v3M4.5 4.5h3M19 16v4M17 18h4"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    edit: <><path d="m14 4 6 6L8 22H2v-6L14 4Z"/><path d="m12 6 6 6"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    alert: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></>,
  }
  return <svg {...props}>{shapes[name] || shapes.file}</svg>
}

function Logo() {
  return (
    <div className="logo-lockup">
      <div className="logo-mark"><span>B</span></div>
      <div><strong>BRUTTI</strong><small>AI Marketing Hub</small></div>
    </div>
  )
}

function Sidebar({ page, setPage, open, setOpen, workspaceActive }) {
  const navigate = (id) => { setPage(id); setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return (
    <>
      <button className={`mobile-scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} aria-label="Close navigation" />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand"><Logo/><button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navigation.map((item) => (
            <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
              <Icon name={item.icon}/><span>{item.label}</span>{item.count ? <em>{item.count}</em> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-card-head"><span className="pulse-dot"/><strong>{workspaceActive ? 'Google workspace active' : 'Local workspace active'}</strong></div>
            <p>{workspaceActive ? 'AI, Sheets and Drive use the secured Apps Script backend.' : 'Connect the internal Google workspace to activate shared operations.'}</p>
          </div>
          <div className="tagline">Proudly Sabahan.<br/>Purposefully Crafted.<br/>Responsibly Made.</div>
        </div>
      </aside>
    </>
  )
}

function Topbar({ setOpen, workspaceActive }) {
  return (
    <header className="topbar">
      <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button><div className="mobile-logo"><Logo/></div></div>
      <div className="topbar-status"><span className={`status-chip ${workspaceActive ? 'connected' : 'local'}`}><span/>{workspaceActive ? 'Google connected' : 'Local mode'}</span><span className="topbar-date">Updated 13 Aug 2026</span><div className="avatar">MC</div></div>
    </header>
  )
}

function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  )
}

function StatusPill({ children }) {
  return <span className={`status-pill ${stageClass(children)}`}>{children}</span>
}

function Dashboard({ content, plans, navigate, openContent, newContent, newPlan }) {
  const stageCounts = pipelineStages.map((stage) => ({ stage, count: content.filter((item) => item.stage === stage).length }))
  return (
    <div className="page dashboard-page">
      <PageHeader eyebrow="MARKETING CONTROL CENTRE" title="Good afternoon, Michelle." description="Plan today’s work, review AI drafts and keep BRUTTI’s marketing moving from one workspace." actions={<button className="button primary" onClick={newContent}><Icon name="sparkles"/>Create with AI</button>} />

      <section className="hero-panel">
        <div className="hero-content">
          <span className="hero-label"><Icon name="sparkles" size={15}/>AI DAILY FOCUS</span>
          <h2>Turn one verified product story into today’s Facebook content.</h2>
          <p>Start with KAANAGAN or AHTAM XL, choose the objective and language, then send the result through human review before scheduling.</p>
          <div className="hero-buttons"><button className="button cream" onClick={newContent}>Start creating <Icon name="arrow"/></button><button className="button ghost-light" onClick={() => navigate('planner')}>Open planner</button></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-grid"/><div className="art-card card-one"><span>01</span><strong>Verified input</strong></div><div className="art-card card-two"><span>02</span><strong>AI draft</strong></div><div className="art-card card-three"><span>03</span><strong>Human review</strong></div><div className="art-orbit"/></div>
      </section>

      <div className="stats-grid">
        {verifiedSnapshot.map((stat) => <article className="stat-card" key={stat.label}><div className={`stat-icon ${stat.icon}`}><Icon name={stat.icon}/></div><div><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></div></article>)}
      </div>

      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="panel-heading"><div><span className="eyebrow">CONTENT WORKFLOW</span><h3>Pipeline at a glance</h3></div><button className="text-button" onClick={() => navigate('studio')}>View library <Icon name="arrow" size={15}/></button></div>
          <div className="pipeline-flow">
            {stageCounts.map((item, index) => <div className="pipeline-step" key={item.stage}><div><strong>{item.count}</strong><span>{item.stage}</span></div>{index < stageCounts.length - 1 ? <Icon name="chevron" size={15}/> : null}</div>)}
          </div>
          <div className="review-queue">
            {content.slice(0, 3).map((item) => <button key={item.id} onClick={() => openContent(item)}><span className="queue-channel">f</span><span><strong>{item.title}</strong><small>{item.product} · {item.updatedAt}</small></span><StatusPill>{item.stage}</StatusPill><Icon name="chevron"/></button>)}
          </div>
        </section>

        <aside className="panel focus-panel">
          <div className="panel-heading"><div><span className="eyebrow">AI RECOMMENDATIONS</span><h3>Next best actions</h3></div></div>
          <div className="recommendation-list">
            <button onClick={() => content[0] && openContent(content[0])}><span className="recommend-number">01</span><div><strong>Review KAANAGAN draft</strong><p>One Facebook caption is waiting for human confirmation.</p></div></button>
            <button onClick={() => navigate('products')}><span className="recommend-number">02</span><div><strong>Complete product sources</strong><p>72 product records still need named previews in this build.</p></div></button>
            <button onClick={newPlan}><span className="recommend-number">03</span><div><strong>Fill one open content day</strong><p>Add a verified product story to next week’s plan.</p></div></button>
          </div>
          <div className="guardrail-note"><Icon name="alert"/><p><strong>Accuracy guardrail</strong>No prices, promotions, delivery dates or performance KPI are generated without a verified source.</p></div>
        </aside>
      </div>

      <section className="panel upcoming-panel">
        <div className="panel-heading"><div><span className="eyebrow">UPCOMING</span><h3>Next week’s content</h3></div><button className="text-button" onClick={() => navigate('planner')}>Manage planner <Icon name="arrow" size={15}/></button></div>
        <div className="upcoming-row">
          {plans.slice(0, 4).map((plan) => <article key={plan.id}><time><b>{new Date(`${plan.date}T00:00:00`).toLocaleDateString('en-MY', { day: '2-digit' })}</b><span>{new Date(`${plan.date}T00:00:00`).toLocaleDateString('en-MY', { month: 'short' })}</span></time><div><strong>{plan.title}</strong><small>{plan.type} · {plan.channel}</small></div><StatusPill>{plan.status}</StatusPill></article>)}
        </div>
      </section>
    </div>
  )
}

function GeneratorForm({ form, setForm, onGenerate, output, saveDraft, generating, workspaceActive }) {
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  return (
    <div className="generator-layout">
      <form className="generator-form" onSubmit={(event) => { event.preventDefault(); onGenerate() }}>
        <div className="form-section-head"><span>01</span><div><strong>Content direction</strong><p>Only use facts you can verify.</p></div></div>
        <label>Content title<input required value={form.title} onChange={update('title')} placeholder="e.g. KAANAGAN product highlight"/></label>
        <div className="two-fields"><label>Platform<select value={form.platform} onChange={update('platform')}><option>Facebook</option><option disabled>Instagram — not connected</option><option disabled>TikTok — not connected</option><option disabled>Threads — not connected</option></select></label><label>Content type<select value={form.type} onChange={update('type')}><option>Brand Awareness</option><option>Product Highlight</option><option>Educational</option><option>Behind the Scenes</option><option>Customer Story</option><option>Promotion</option></select></label></div>
        <label>Product<select value={form.product} onChange={update('product')}><option>General / No Product</option>{productNames.map((name) => <option key={name}>{name}</option>)}</select></label>
        <div className="two-fields"><label>Language<select value={form.language} onChange={update('language')}><option>Bahasa Melayu</option><option>English</option><option>BM + English</option></select></label><label>Tone<select value={form.tone} onChange={update('tone')}><option>Warm & confident</option><option>Practical</option><option>Proud & purposeful</option><option>Helpful</option><option>Casual</option></select></label></div>
        <label>Verified facts / direction<textarea required rows="5" value={form.brief} onChange={update('brief')} placeholder="Add only confirmed product details, campaign direction or source notes."/></label>
        <label className="checkbox-row"><input type="checkbox" checked={form.includeHashtags} onChange={(event) => setForm((current) => ({ ...current, includeHashtags: event.target.checked }))}/><span>Include relevant hashtags</span></label>
        <button className="button primary wide" type="submit" disabled={generating}><Icon name="sparkles"/>{generating ? 'AI is generating…' : workspaceActive ? 'Generate with BRUTTI AI' : 'Generate local preview'}</button>
        <p className="form-disclaimer"><Icon name="alert" size={14}/>{workspaceActive ? 'OpenAI runs through Apps Script using verified facts and still requires human approval.' : 'Local preview only. Connect the internal Google workspace to activate live AI.'}</p>
      </form>

      <div className={`generator-output ${output ? 'has-output' : ''}`}>
        <div className="output-toolbar"><div><span className="eyebrow">AI OUTPUT</span><strong>{output ? form.title : 'Your generated draft will appear here'}</strong></div>{output ? <StatusPill>Human Review Required</StatusPill> : null}</div>
        {output ? <><textarea value={output} readOnly/><div className="output-actions"><button className="button secondary" onClick={() => navigator.clipboard?.writeText(output)}>Copy</button><button className="button secondary" onClick={onGenerate}>Regenerate</button><button className="button primary" onClick={saveDraft}>Save as draft</button></div><div className="ai-checks"><span><Icon name="check"/>One CTA included</span><span><Icon name="check"/>No unsupported KPI</span><span><Icon name="alert"/>Human review needed</span></div></> : <div className="empty-output"><div className="sparkle-ring"><Icon name="sparkles" size={28}/></div><h3>Ready when your facts are.</h3><p>Choose a product, add verified details and generate a review-first preview.</p></div>}
      </div>
    </div>
  )
}

function ContentStudio({ content, deleteContent, generator, setGenerator, output, generate, saveDraft, openContent, generating, workspaceActive }) {
  const [tab, setTab] = useState('generator')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const visible = content.filter((item) => (filter === 'All' || item.stage === filter) && `${item.title} ${item.product}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="page">
      <PageHeader eyebrow="AI CONTENT WORKSPACE" title="Content Studio" description="Generate, edit and move content through a review-first publishing workflow." />
      <div className="tab-bar"><button className={tab === 'generator' ? 'active' : ''} onClick={() => setTab('generator')}><Icon name="sparkles"/>AI Generator</button><button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}><Icon name="file"/>Content Library <em>{content.length}</em></button></div>
      {tab === 'generator' ? <GeneratorForm form={generator} setForm={setGenerator} onGenerate={generate} output={output} saveDraft={saveDraft} generating={generating} workspaceActive={workspaceActive}/> : (
        <section className="panel content-library">
          <div className="library-toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content or product…"/></div><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{[...pipelineStages, 'Rejected'].map((stage) => <option key={stage}>{stage}</option>)}</select></div>
          <div className="content-table-wrap"><table className="content-table"><thead><tr><th>Content</th><th>Type</th><th>AI check</th><th>Stage</th><th>Updated</th><th/></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><span className="content-channel">f</span><div><strong>{item.title}</strong><small>{item.product}</small></div></td><td>{item.type}</td><td><StatusPill>{item.aiReview}</StatusPill></td><td><StatusPill>{item.stage}</StatusPill></td><td>{item.updatedAt}</td><td><div className="row-actions"><button onClick={() => openContent(item)} aria-label={`Edit ${item.title}`}><Icon name="edit"/></button><button onClick={() => deleteContent(item.id)} aria-label={`Delete ${item.title}`}><Icon name="trash"/></button></div></td></tr>)}</tbody></table></div>
          {!visible.length ? <div className="empty-list">No content matches this search.</div> : null}
        </section>
      )}
    </div>
  )
}

function CampaignPlanner({ plans, openPlan, newPlan, deletePlan }) {
  const week = ['2026-08-17','2026-08-18','2026-08-19','2026-08-20','2026-08-21','2026-08-22','2026-08-23']
  return (
    <div className="page">
      <PageHeader eyebrow="CONTENT CALENDAR" title="Campaign Planner" description="Add, edit, delete and organise weekly content before it reaches publishing." actions={<button className="button primary" onClick={newPlan}><Icon name="plus"/>Add content</button>} />
      <div className="planner-summary"><div><span>Week of</span><strong>17–23 August 2026</strong></div><div className="planner-legend"><span><i className="idea"/>Idea</span><span><i className="review"/>Review</span><span><i className="scheduled"/>Scheduled</span></div></div>
      <section className="week-calendar">
        {week.map((date) => {
          const items = plans.filter((plan) => plan.date === date)
          const day = new Date(`${date}T00:00:00`)
          return <div className="calendar-day" key={date}><div className="calendar-day-head"><span>{day.toLocaleDateString('en-MY',{weekday:'short'})}</span><strong>{day.getDate()}</strong></div><div className="calendar-items">{items.map((plan) => <button className={`calendar-item ${stageClass(plan.status)}`} key={plan.id} onClick={() => openPlan(plan)}><small>{plan.type}</small><strong>{plan.title}</strong><span>{plan.channel} · {plan.status}</span></button>)}<button className="add-day" onClick={() => newPlan(date)}><Icon name="plus" size={14}/>Add</button></div></div>
        })}
      </section>
      <div className="planner-bottom-grid">
        <section className="panel campaign-section"><div className="panel-heading"><div><span className="eyebrow">AI CAMPAIGN IDEAS</span><h3>Ready for planning</h3></div></div><div className="campaign-list">{campaignIdeas.map((idea) => <article key={idea.title}><span className="campaign-index">{String(campaignIdeas.indexOf(idea)+1).padStart(2,'0')}</span><div><strong>{idea.title}</strong><p>{idea.objective}</p><small>{idea.pillar}</small></div><button className="button secondary small" onClick={() => newPlan(undefined, idea)}>Plan idea</button></article>)}</div></section>
        <section className="panel plan-list-section"><div className="panel-heading"><div><span className="eyebrow">ALL PLANS</span><h3>{plans.length} scheduled items</h3></div></div><div className="compact-plan-list">{plans.map((plan) => <div key={plan.id}><button onClick={() => openPlan(plan)}><time>{new Date(`${plan.date}T00:00:00`).toLocaleDateString('en-MY',{day:'2-digit',month:'short'})}</time><span><strong>{plan.title}</strong><small>{plan.type}</small></span><StatusPill>{plan.status}</StatusPill></button><button className="delete-plan" onClick={() => deletePlan(plan.id)} aria-label={`Delete ${plan.title}`}><Icon name="trash" size={15}/></button></div>)}</div></section>
      </div>
    </div>
  )
}

function BrandLibrary() {
  const colours = [
    ['Forest Green','#12372A'],['Warm Ivory','#F7F3EA'],['Terracotta','#C96F4A'],['Charcoal','#202522'],['Muted Sage','#A8B5A2'],['Craft Tan','#BE906C'],
  ]
  return (
    <div className="page">
      <PageHeader eyebrow="BRAND SYSTEM" title="Brand Library" description="A single reference for BRUTTI’s identity, voice and AI content guardrails." />
      <section className="brand-hero"><div><span className="eyebrow light">BRUTTI BRAND PROMISE</span><h2>Proudly Sabahan.<br/><em>Purposefully Crafted.</em><br/>Responsibly Made.</h2></div><div className="brand-monogram">B</div></section>
      <div className="brand-grid">
        <section className="panel brand-card"><span className="card-number">01</span><span className="eyebrow">PERSONALITY</span><h3>Warm, confident and purposeful.</h3><p>BRUTTI communicates with pride in local craft, practical clarity and respect for the customer’s space.</p><div className="keyword-row"><span>Warm</span><span>Practical</span><span>Proud</span><span>Honest</span><span>Creative</span></div></section>
        <section className="panel brand-card"><span className="card-number">02</span><span className="eyebrow">VOICE & TONE</span><h3>Human first, never overproduced.</h3><p>Use clear, customer-focused language. Keep local character natural and avoid forcing slang, hype or repetitive wording.</p><blockquote>“Crafted for the way your space needs to work.”</blockquote></section>
      </div>
      <section className="panel palette-panel"><div className="panel-heading"><div><span className="eyebrow">VISUAL LANGUAGE</span><h3>Core colour palette</h3></div></div><div className="colour-grid">{colours.map(([name,hex]) => <div key={hex}><div className="colour-swatch" style={{background:hex}}/><strong>{name}</strong><span>{hex}</span></div>)}</div></section>
      <div className="brand-grid guideline-grid">
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">WRITING PRINCIPLES</span><h3>Always do</h3></div></div><ul className="check-list"><li><Icon name="check"/>Lead with a real customer need or useful idea.</li><li><Icon name="check"/>Use only verified product facts and approved sources.</li><li><Icon name="check"/>Include one clear, relevant CTA.</li><li><Icon name="check"/>Match language, tone and length to the platform.</li></ul></section>
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">AI GUARDRAILS</span><h3>Never invent</h3></div></div><ul className="avoid-list"><li><Icon name="close"/>Prices, discounts or promotional dates</li><li><Icon name="close"/>Availability, delivery dates or warranty details</li><li><Icon name="close"/>Materials, dimensions or sustainability claims</li><li><Icon name="close"/>Reach, engagement or sales performance KPI</li></ul></section>
      </div>
    </div>
  )
}

function ProductLibrary({ onUseProduct }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const visible = products.filter((product) => (category === 'All' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="page">
      <PageHeader eyebrow="VERIFIED PRODUCT SOURCE" title="Product Library" description="Browse verified product names and prepare product-led content without inventing missing details." actions={<span className="source-count">88 source records</span>} />
      <div className="library-toolbar product-toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products…"/></div><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option><option>Storage</option><option>Wardrobe</option><option>Display</option><option>Bespoke</option></select></div>
      <div className="product-grid">{visible.map((product, index) => <article className="product-card" key={product.id}><div className={`product-visual visual-${index%5}`}><div className="furniture-shape"><span/><span/><span/></div><span className="photo-status">{product.photoConfirmed ? 'Photo confirmed' : 'Preview placeholder'}</span></div><div className="product-card-body"><div><span>{product.id} · {product.category}</span><h3>{product.name}</h3></div><p>{product.sourceStatus}. Price and specifications require source confirmation.</p><button className="text-button" onClick={() => onUseProduct(product.name)}>Create product content <Icon name="arrow" size={15}/></button></div></article>)}</div>
      <div className="source-notice"><Icon name="alert"/><div><strong>Source completeness</strong><p>This interface currently embeds 16 named product previews from 88 reported records. Add the remaining verified records through the future Notion/API sync.</p></div></div>
    </div>
  )
}

function AssetLibrary({ toast, workspaceActive, driveActive }) {
  const fallbackAssets = ['KAANAGAN front view','KAANAGAN side view','AHTAM XL front view','AHTAM M front view','GANTUNG product view','PUSMA display view','POPO console view','SULOB shoe rack view','TOMODON organizer view','BRUTTI workshop reference']
  const [driveAssets, setDriveAssets] = useState([])
  useEffect(() => {
    if (!workspaceActive || !driveActive) return
    callMarketingApi('list_drive_assets')
      .then((result) => setDriveAssets(result.files || []))
      .catch((error) => toast(error.message))
  }, [workspaceActive, driveActive, toast])
  const assets = driveAssets.length ? driveAssets.map((asset) => asset.name) : fallbackAssets
  return (
    <div className="page">
      <PageHeader eyebrow="CREATIVE SOURCE FILES" title="Asset Library" description="Read approved product and brand assets from the BRUTTI AI MARKETING SYSTEM folder in Google Drive." actions={<button className="button secondary" onClick={() => toast('Upload new assets through the controlled Google Drive folder.')}><Icon name="plus"/>Add asset</button>} />
      <div className="asset-summary"><article><strong>{assets.length}</strong><span>{driveAssets.length ? 'Drive assets loaded' : 'Confirmed references'}</span></article><article><strong>{driveAssets.length}</strong><span>Direct Drive files connected</span></article><article><strong>{driveActive ? 'Ready' : 'Pending'}</strong><span>Secure Drive connection</span></article></div>
      <section className="panel asset-panel"><div className="library-toolbar"><div className="search-box"><Icon name="search"/><input placeholder="Search assets…"/></div><span className={`status-chip ${driveActive ? 'connected' : 'pending'}`}><span/>{driveActive ? 'Drive connected' : 'Drive sync pending'}</span></div><div className="asset-grid">{assets.map((asset,index) => <article key={asset}><div className={`asset-preview asset-${index%4}`}><Icon name="image" size={28}/><span>{String(index+1).padStart(2,'0')}</span></div><div><strong>{asset}</strong><p>{driveAssets.length ? 'Google Drive asset' : 'Reference record · product asset'}</p><div><StatusPill>{driveAssets.length ? 'Connected' : 'Verified name'}</StatusPill><button onClick={() => toast(driveAssets.length ? 'Drive file is available through the secured backend.' : 'File preview will be available after Drive sync.')}><Icon name="chevron"/></button></div></div></article>)}</div></section>
    </div>
  )
}

function AITools({ onUsePrompt }) {
  return (
    <div className="page">
      <PageHeader eyebrow="PROMPT LIBRARY" title="AI Tools" description="Reusable, brand-aware prompt starters for writing, video, service and creative work." />
      <section className="ai-banner"><div><Icon name="wand" size={26}/><span className="eyebrow light">BRUTTI AI ASSISTANT</span><h2>Start with a task.<br/>Finish with human review.</h2><p>Every output follows BRUTTI’s voice and blocks unsupported facts from being treated as publish-ready.</p></div><div className="assistant-rules"><span><Icon name="check"/>Verified inputs</span><span><Icon name="check"/>Brand voice</span><span><Icon name="check"/>One clear CTA</span><span><Icon name="alert"/>Review required</span></div></section>
      <div className="prompt-sections">{promptLibrary.map((group, groupIndex) => <section key={group.category}><div className="prompt-section-head"><span>{String(groupIndex+1).padStart(2,'0')}</span><div><h3>{group.category}</h3><p>{group.items.length} prompt starters</p></div></div><div className="prompt-grid">{group.items.map((item) => <article key={item.title}><div className="prompt-icon"><Icon name={group.category === 'Video' ? 'image' : group.category === 'Creative' ? 'wand' : group.category === 'Customer Service' ? 'users' : 'file'}/></div><h4>{item.title}</h4><p>{item.description}</p><button className="text-button" onClick={() => onUsePrompt(item)}>Use prompt <Icon name="arrow" size={15}/></button></article>)}</div></section>)}</div>
    </div>
  )
}

function Analytics() {
  const sources = [
    ['Follower export','Facebook','12,001 records','Imported snapshot'],
    ['Reaction export','Facebook','728 records','Imported snapshot'],
    ['Media archive','Facebook','7,062 files','Reference count'],
    ['Post analytics sources','Facebook','7 source files','Needs KPI mapping'],
  ]
  return (
    <div className="page">
      <PageHeader eyebrow="VERIFIED ACTIVITY DATA" title="Analytics" description="Use supplied exports for activity context while live Meta Insights remains disconnected." actions={<span className="status-chip pending"><span/>Meta KPI excluded</span>} />
      <div className="analytics-notice"><Icon name="alert"/><div><strong>No fabricated performance KPI</strong><p>Reach, views, engagement rate, followers gained, enquiries and sales attribution stay blank until verified monthly or post-level exports are mapped.</p></div></div>
      <div className="stats-grid analytics-stats">{verifiedSnapshot.map((stat) => <article className="stat-card" key={stat.label}><div className={`stat-icon ${stat.icon}`}><Icon name={stat.icon}/></div><div><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></div></article>)}</div>
      <div className="analytics-grid">
        <section className="panel activity-chart"><div className="panel-heading"><div><span className="eyebrow">CONTENT ACTIVITY</span><h3>Workflow status distribution</h3></div><span className="verified-label"><Icon name="check"/>Local records</span></div><div className="bar-chart"><div><span>Draft / AI Generated</span><i><b style={{width:'75%'}}/></i><strong>3</strong></div><div><span>Human Review</span><i><b style={{width:'50%'}}/></i><strong>2</strong></div><div><span>Approved</span><i><b style={{width:'25%'}}/></i><strong>1</strong></div><div><span>Scheduled</span><i><b style={{width:'50%'}}/></i><strong>2</strong></div><div><span>Published</span><i><b style={{width:'0%'}}/></i><strong>0</strong></div></div></section>
        <section className="panel insight-card"><span className="eyebrow">AI OBSERVATION</span><h3>Focus on data readiness before performance optimisation.</h3><p>The current exports establish audience and activity volume, but not reliable post-performance comparison. Complete source mapping before asking AI to recommend “best-performing” content.</p><div className="insight-source"><Icon name="file"/><span><strong>Recommended next source</strong><small>Post URL + reach + views + engagements</small></span></div></section>
      </div>
      <section className="panel source-table-panel"><div className="panel-heading"><div><span className="eyebrow">DATA SOURCES</span><h3>Available Facebook snapshot</h3></div></div><div className="source-table"><div className="source-row header"><span>Source</span><span>Platform</span><span>Volume</span><span>Status</span></div>{sources.map((row) => <div className="source-row" key={row[0]}>{row.map((cell,index) => <span key={cell}>{index===3 ? <StatusPill>{cell}</StatusPill> : cell}</span>)}</div>)}</div></section>
    </div>
  )
}

function Settings({ toast, resetWorkspace, workspaceActive, integrations, onRefreshIntegrations, onConnect, onDisconnect }) {
  const [accessKey, setAccessKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const connections = [
    { name:'Google Sheets', detail:'Content Library, Daily Planner and Integration Log', status:integrations.sheets ? 'Connected' : 'Not connected', icon:'file' },
    { name:'Google Drive', detail:'BRUTTI AI MARKETING SYSTEM and approved assets', status:integrations.drive ? 'Connected' : 'Not connected', icon:'image' },
    { name:'OpenAI API', detail:'Content generation, review and planning through Apps Script', status:integrations.openai ? 'Connected' : 'Not connected', icon:'sparkles' },
    { name:'Meta / Facebook', detail:'Approved publishing; insights remain empty until data exists', status:integrations.meta ? 'Connected' : 'Not connected', icon:'chart' },
  ]
  const connect = async (event) => {
    event.preventDefault()
    setConnecting(true)
    try {
      await onConnect(accessKey)
      setAccessKey('')
    } catch (error) {
      toast(error.message)
    } finally {
      setConnecting(false)
    }
  }
  return (
    <div className="page">
      <PageHeader eyebrow="WORKSPACE CONFIGURATION" title="Settings" description="Connect the internal Google backend without exposing API keys in GitHub or the browser." />
      <section className="panel cloud-access-panel">
        <div className="panel-heading"><div><span className="eyebrow">INTERNAL ACCESS</span><h3>{workspaceActive ? 'Google workspace connected' : googleConfigured ? 'Enter the BRUTTI workspace key' : 'Apps Script deployment required'}</h3></div><span className={`status-chip ${workspaceActive ? 'connected' : 'pending'}`}><span/>{workspaceActive ? 'Connected' : 'Setup required'}</span></div>
        {workspaceActive ? <div className="cloud-session"><div><strong>BRUTTI Google operations</strong><p>Shared content, planner records, Drive assets and server-side AI are available.</p></div><div><button className="button secondary" onClick={onRefreshIntegrations}>Refresh status</button><button className="button danger-subtle" onClick={onDisconnect}>Disconnect</button></div></div> : googleConfigured ? <form className="cloud-login-form" onSubmit={connect}><label>Internal workspace key<input type="password" required value={accessKey} onChange={(event) => setAccessKey(event.target.value)} autoComplete="off" placeholder="Enter key for this session"/></label><button className="button primary" disabled={connecting}>{connecting ? 'Connecting…' : 'Connect Google workspace'}</button></form> : <p className="settings-copy">Deploy the included Apps Script and add its public deployment URL as the GitHub variable VITE_APPS_SCRIPT_URL. OpenAI and Meta credentials stay in Apps Script Properties only.</p>}
      </section>
      <section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">INTEGRATIONS</span><h3>Connection status</h3></div><span className={`status-chip ${workspaceActive ? 'connected' : 'local'}`}><span/>{workspaceActive ? 'Google mode' : 'Local fallback'}</span></div><div className="connections-list">{connections.map((connection) => <article key={connection.name}><div className="connection-icon"><Icon name={connection.icon}/></div><div><strong>{connection.name}</strong><p>{connection.detail}</p></div><StatusPill>{connection.status}</StatusPill><button className="button secondary small" onClick={() => toast(connection.status === 'Connected' ? `${connection.name} is ready.` : `${connection.name} still needs configuration in Apps Script Properties.`)}>Check</button></article>)}</div></section>
      <div className="settings-grid">
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">WORKFLOW RULES</span><h3>Review-first controls</h3></div></div><div className="setting-row"><div><strong>Human approval required</strong><p>Content must be approved before scheduling or publishing.</p></div><span className="switch on"><i/></span></div><div className="setting-row"><div><strong>Block unsupported facts</strong><p>Flag prices, promotions, delivery dates and KPI without sources.</p></div><span className="switch on"><i/></span></div><div className="setting-row"><div><strong>Facebook-only operations</strong><p>Other platforms remain disabled until data and connections exist.</p></div><span className="switch on"><i/></span></div></section>
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">{workspaceActive ? 'GOOGLE DATA' : 'LOCAL DATA'}</span><h3>{workspaceActive ? 'Shared internal workspace' : 'Browser workspace'}</h3></div></div><p className="settings-copy">{workspaceActive ? 'Content and planner edits are stored in BRUTTI Google Sheets. Assets remain in the existing Google Drive structure.' : 'Until Apps Script is connected, content and planner edits stay in this browser only.'}</p>{!workspaceActive ? <button className="button danger" onClick={resetWorkspace}><Icon name="trash"/>Reset local demo data</button> : null}<div className="logo-pending"><div className="logo-mark"><span>B</span></div><div><strong>Drive-first assets</strong><p>Official logo and product files remain in their approved BRUTTI Drive folders.</p></div></div></section>
      </div>
    </div>
  )
}

function ContentEditor({ item, onClose, onSave, onPublish, toast, workspaceActive }) {
  const [draft, setDraft] = useState(item)
  const update = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }))
  const act = (stage, message) => { const next = { ...draft, stage, aiReview: stage === 'Approved' || stage === 'Published' ? 'AI Approved' : 'Human Review Required', updatedAt: '13 Aug 2026, just now' }; setDraft(next); onSave(next); toast(message) }
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal content-modal" role="dialog" aria-modal="true" aria-label="Edit content">
        <div className="modal-head"><div><span className="eyebrow">CONTENT REVIEW</span><h2>{draft.title}</h2></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></div>
        <div className="content-meta"><StatusPill>{draft.stage}</StatusPill><span>{draft.platform}</span><span>{draft.product}</span></div>
        <label>Title<input value={draft.title} onChange={update('title')}/></label>
        <div className="two-fields"><label>Content type<select value={draft.type} onChange={update('type')}><option>Brand Awareness</option><option>Product Highlight</option><option>Educational</option><option>Behind the Scenes</option></select></label><label>Workflow stage<select value={draft.stage} onChange={update('stage')}>{[...pipelineStages,'Rejected'].map((stage) => <option key={stage}>{stage}</option>)}</select></label></div>
        <label>Content<textarea rows="12" value={draft.copy} onChange={update('copy')}/></label>
        <div className="modal-guardrail"><Icon name="alert"/><span>Check price, availability, delivery dates, dimensions and claims before approval.</span></div>
        <div className="modal-action-groups"><div><button className="button danger-subtle" onClick={() => act('Rejected','Content rejected and returned for revision.')}>Reject</button><button className="button secondary" onClick={() => { onSave({...draft, updatedAt:'13 Aug 2026, just now'}); toast('Edits saved.') }}>Save edits</button></div><div><button className="button secondary" onClick={() => act('Approved','Content approved for scheduling.')}>Approve</button><button className="button primary" onClick={() => draft.stage === 'Approved' ? workspaceActive ? onPublish(draft) : toast('Meta publishing needs the Google Apps Script backend and Meta credentials.') : toast('Approve this content before publishing.')}>Publish to Facebook</button></div></div>
      </div>
    </div>
  )
}

function PlanEditor({ item, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(item)
  const update = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }))
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal plan-modal" onSubmit={(event) => { event.preventDefault(); onSave(draft) }}>
        <div className="modal-head"><div><span className="eyebrow">CAMPAIGN PLANNER</span><h2>{draft.id ? 'Edit content plan' : 'Add content plan'}</h2></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div>
        <label>Plan title<input required value={draft.title} onChange={update('title')} placeholder="e.g. AHTAM XL product highlight"/></label>
        <div className="two-fields"><label>Date<input required type="date" value={draft.date} onChange={update('date')}/></label><label>Status<select value={draft.status} onChange={update('status')}><option>Idea</option><option>Draft</option><option>Review</option><option>Approved</option><option>Scheduled</option><option>Published</option></select></label></div>
        <div className="two-fields"><label>Content type<select value={draft.type} onChange={update('type')}><option>Brand Awareness</option><option>Product Highlight</option><option>Educational</option><option>Behind the Scenes</option><option>Customer Story</option></select></label><label>Channel<select value={draft.channel} onChange={update('channel')}><option>Facebook</option></select></label></div>
        <label>Product<select value={draft.product} onChange={update('product')}><option>General / No Product</option>{productNames.map((name) => <option key={name}>{name}</option>)}</select></label>
        <div className="modal-actions"><div>{draft.id ? <button type="button" className="button danger-subtle" onClick={() => onDelete(draft.id)}>Delete</button> : null}</div><div><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Save plan</button></div></div>
      </form>
    </div>
  )
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [content, setContent] = useStoredState('brutti-content-v2', initialContent)
  const [plans, setPlans] = useStoredState('brutti-plans-v2', initialPlans)
  const [activeContent, setActiveContent] = useState(null)
  const [activePlan, setActivePlan] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimer = useRef(null)
  const [generator, setGenerator] = useState({ title:'', platform:'Facebook', type:'Brand Awareness', product:'General / No Product', language:'Bahasa Melayu', tone:'Warm & confident', brief:'', includeHashtags:true })
  const [output, setOutput] = useState('')
  const [workspaceActive, setWorkspaceActive] = useState(false)
  const [integrations, setIntegrations] = useState({ appsScript:false, sheets:false, openai:false, drive:false, meta:false })
  const [generating, setGenerating] = useState(false)

  const toast = useCallback((message) => {
    setToastMessage(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(''), 3200)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const refreshIntegrations = useCallback(async () => {
    if (!hasWorkspaceKey()) {
      setIntegrations({ appsScript:false, sheets:false, openai:false, drive:false, meta:false })
      return
    }
    try {
      setIntegrations(await callMarketingApi('integration_status'))
    } catch (error) {
      toast(error.message)
    }
  }, [toast])

  useEffect(() => {
    if (!googleConfigured || !hasWorkspaceKey()) return undefined
    let mounted = true
    Promise.all([callMarketingApi('integration_status'), loadWorkspace()])
      .then(([status, workspace]) => {
        if (!mounted) return
        setIntegrations(status)
        setContent(workspace.content || [])
        setPlans(workspace.plans || [])
        setWorkspaceActive(true)
      })
      .catch((error) => { clearWorkspaceKey(); toast(error.message) })
    return () => { mounted = false }
  }, [setContent, setPlans, toast])

  const connectWorkspace = async (accessKey) => {
    setWorkspaceKey(accessKey)
    try {
      const [status, workspace] = await Promise.all([callMarketingApi('integration_status'), loadWorkspace()])
      setIntegrations(status)
      setContent(workspace.content || [])
      setPlans(workspace.plans || [])
      setWorkspaceActive(true)
      toast('BRUTTI Google workspace connected.')
    } catch (error) {
      clearWorkspaceKey()
      throw error
    }
  }

  const disconnectWorkspace = () => {
    clearWorkspaceKey()
    setWorkspaceActive(false)
    setIntegrations({ appsScript:false, sheets:false, openai:false, drive:false, meta:false })
    setContent(initialContent)
    setPlans(initialPlans)
    toast('Google workspace disconnected. Local preview mode restored.')
  }

  const localPreview = () => {
    const productLine = generator.product === 'General / No Product' ? '' : ` untuk ${generator.product}`
    const facts = generator.brief.trim().replace(/\s+/g, ' ')
    const outputs = {
      'Bahasa Melayu': `Ruang yang baik bermula dengan pilihan yang sesuai untuk cara kita menggunakannya.\n\n${facts}${productLine ? ` Inilah arah yang diketengahkan${productLine}.` : ''}\n\nHubungi BRUTTI untuk maklumat yang telah disahkan.`,
      English: `A purposeful space starts with choices that support the way it is used.\n\n${facts}${productLine ? ` This is the direction behind ${generator.product}.` : ''}\n\nContact BRUTTI for verified product information.`,
      'BM + English': `Ruang yang baik bermula dengan pilihan yang praktikal.\n\n${facts}${productLine ? ` This is the idea behind ${generator.product}.` : ''}\n\nHubungi BRUTTI untuk verified product information.`,
    }
    return `${outputs[generator.language]}${generator.includeHashtags ? '\n\n#BRUTTI #ProudlySabahan #PurposefullyCrafted' : ''}`
  }

  const generate = async () => {
    if (!generator.title.trim() || !generator.brief.trim()) { toast('Add a title and verified facts first.'); return }
    if (!workspaceActive) {
      setOutput(localPreview())
      toast('Local preview generated. Connect the Google workspace for live AI.')
      return
    }
    setGenerating(true)
    try {
      const result = await callMarketingApi('generate_content', generator)
      setOutput(result.copy)
      toast('Live AI draft generated. Human approval is still required.')
    } catch (error) {
      toast(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const saveGeneratedDraft = async () => {
    if (!output) return
    let item = { id:workspaceActive ? crypto.randomUUID() : Date.now(), title:generator.title, platform:generator.platform, type:generator.type, product:generator.product, language:generator.language, tone:generator.tone, aiReview:'Human Review Required', stage:'AI Generated', updatedAt:'13 Aug 2026, just now', copy:output }
    try {
      if (workspaceActive) item = await saveGoogleContent(item)
      setContent((items) => [item, ...items])
      toast(workspaceActive ? 'Draft saved to the BRUTTI Google Sheet.' : 'Draft saved in this browser.')
      setOutput('')
    } catch (error) {
      toast(error.message)
    }
  }

  const newContent = () => { setPage('studio'); setOutput(''); window.scrollTo({top:0,behavior:'smooth'}) }
  const openNewPlan = (date = '2026-08-19', idea) => setActivePlan({ id:null, title:idea?.title || '', date:date || '2026-08-19', channel:'Facebook', type:idea?.pillar?.includes('Educational') ? 'Educational' : 'Brand Awareness', status:'Idea', product:'General / No Product' })
  const savePlan = async (plan) => {
    let next = plan.id ? plan : {...plan,id:workspaceActive ? crypto.randomUUID() : Date.now()}
    try {
      if (workspaceActive) next = await saveGooglePlan(next)
      setPlans((items) => plan.id ? items.map((item) => item.id === plan.id ? next : item) : [...items, next])
      setActivePlan(null)
      toast(workspaceActive ? 'Planner saved to BRUTTI DAILY CONTENT PLANNER.' : 'Planner updated locally.')
    } catch (error) { toast(error.message) }
  }
  const deletePlan = async (id) => {
    try {
      if (workspaceActive) await deleteGooglePlan(id)
      setPlans((items) => items.filter((item) => item.id !== id))
      setActivePlan(null)
      toast('Plan deleted.')
    } catch (error) { toast(error.message) }
  }
  const saveContent = async (item) => {
    try {
      const next = workspaceActive ? await saveGoogleContent(item) : item
      setContent((items) => items.map((current) => current.id === item.id ? next : current))
      setActiveContent(next)
    } catch (error) { toast(error.message) }
  }
  const deleteContent = async (id) => {
    try {
      if (workspaceActive) await deleteGoogleContent(id)
      setContent((items) => items.filter((item) => item.id !== id))
      toast('Content deleted.')
    } catch (error) { toast(error.message) }
  }
  const publishContent = async (item) => {
    try {
      await saveGoogleContent({...item, stage:'Approved'})
      const result = await callMarketingApi('publish_meta', { contentId:item.id })
      const published = {...item, stage:'Published', aiReview:'AI Approved', publishLink:result.publishLink || '', updatedAt:'13 Aug 2026, just now'}
      setContent((items) => items.map((current) => current.id === item.id ? published : current))
      setActiveContent(null)
      toast(`Published to Facebook successfully: ${result.postId}`)
    } catch (error) { toast(error.message) }
  }
  const useProduct = (product) => { setGenerator((form) => ({...form, product, title:`${product} – Product Highlight`, type:'Product Highlight'})); setPage('studio'); setOutput(''); window.scrollTo({top:0}) }
  const usePrompt = (item) => { setGenerator((form) => ({...form, title:item.title, type:item.type.includes('Facebook') ? 'Brand Awareness' : form.type, brief:item.description})); setPage('studio'); setOutput(''); window.scrollTo({top:0}); toast(`${item.title} prompt loaded into Content Studio.`) }
  const resetWorkspace = () => { setContent(initialContent); setPlans(initialPlans); toast('Local demo data restored.') }

  const pages = useMemo(() => ({
    dashboard: <Dashboard content={content} plans={plans} navigate={setPage} openContent={setActiveContent} newContent={newContent} newPlan={() => openNewPlan()} />,
    studio: <ContentStudio content={content} deleteContent={deleteContent} generator={generator} setGenerator={setGenerator} output={output} generate={generate} saveDraft={saveGeneratedDraft} openContent={setActiveContent} generating={generating} workspaceActive={workspaceActive} />,
    planner: <CampaignPlanner plans={plans} openPlan={setActivePlan} newPlan={openNewPlan} deletePlan={deletePlan} />,
    brand: <BrandLibrary />,
    products: <ProductLibrary onUseProduct={useProduct} />,
    assets: <AssetLibrary toast={toast} workspaceActive={workspaceActive} driveActive={integrations.drive} />,
    'ai-tools': <AITools onUsePrompt={usePrompt} />,
    analytics: <Analytics />,
    settings: <Settings toast={toast} resetWorkspace={resetWorkspace} workspaceActive={workspaceActive} integrations={integrations} onRefreshIntegrations={refreshIntegrations} onConnect={connectWorkspace} onDisconnect={disconnectWorkspace} />,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [page, content, plans, generator, output, workspaceActive, integrations, generating])

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} workspaceActive={workspaceActive}/>
      <div className="app-main"><Topbar setOpen={setSidebarOpen} workspaceActive={workspaceActive}/><main>{pages[page]}</main><footer><span>BRUTTI AI Marketing Hub</span><span>{workspaceActive ? 'Google internal workspace · Human-approved publishing' : 'Local fallback · Connect Google for live AI'}</span></footer></div>
      {activeContent ? <ContentEditor item={activeContent} onClose={() => setActiveContent(null)} onSave={saveContent} onPublish={publishContent} toast={toast} workspaceActive={workspaceActive}/> : null}
      {activePlan ? <PlanEditor item={activePlan} onClose={() => setActivePlan(null)} onSave={savePlan} onDelete={deletePlan}/> : null}
      <div className={`toast ${toastMessage ? 'show' : ''}`}><span className="pulse-dot"/>{toastMessage}</div>
    </div>
  )
}

export default App
