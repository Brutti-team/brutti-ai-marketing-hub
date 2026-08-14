import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  campaignIdeas,
  initialContent,
  initialPlans,
  pipelineStages,
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
  syncNotionProducts,
  saveGoogleContent,
  saveGooglePlan,
  setWorkspaceKey,
} from './lib/googleWorkspace'
import { addDays, dateFromKey, formatDateRange, formatTimestamp, greetingForNow, localDateKey, startOfWeek, weekKeys } from './lib/dateUtils'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'studio', label: 'Content Studio', icon: 'sparkles' },
  { id: 'planner', label: 'Campaign Planner', icon: 'calendar' },
  { id: 'brand', label: 'Brand Library', icon: 'brand' },
  { id: 'products', label: 'Product Library', icon: 'box' },
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

function Sidebar({ page, setPage, open, setOpen, workspaceActive, counts }) {
  const navigate = (id) => { setPage(id); setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return (
    <>
      <button className={`mobile-scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} aria-label="Close navigation" />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand"><Logo/><button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navigation.map((item) => {
            const count = item.id === 'studio' ? counts.content : item.id === 'products' ? counts.products : null
            return <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
              <Icon name={item.icon}/><span>{item.label}</span>{count !== null ? <em>{count}</em> : null}
            </button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-card-head"><span className="pulse-dot"/><strong>{workspaceActive ? 'Google workspace active' : 'Local workspace active'}</strong></div>
            <p>{workspaceActive ? 'Free Assist templates, Sheets and Drive are ready.' : 'Connect the internal Google workspace to activate shared operations.'}</p>
          </div>
          <div className="tagline">Proudly Sabahan.<br/>Purposefully Crafted.<br/>Responsibly Made.</div>
        </div>
      </aside>
    </>
  )
}

function Topbar({ setOpen, workspaceActive }) {
  const todayLabel = new Date().toLocaleDateString('en-MY', { day:'2-digit', month:'short', year:'numeric' })
  return (
    <header className="topbar">
      <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button><div className="mobile-logo"><Logo/></div></div>
      <div className="topbar-status"><span className={`status-chip ${workspaceActive ? 'connected' : 'local'}`}><span/>{workspaceActive ? 'Google connected' : 'Local mode'}</span><span className="topbar-date">{todayLabel}</span><div className="avatar">MC</div></div>
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
  const today = localDateKey()
  const todayPlans = plans.filter((plan) => plan.date === today)
  const upcoming = [...plans].filter((plan) => plan.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4)
  const reviewItem = content.find((item) => item.stage === 'Review')
  const nextPlan = todayPlans[0] || upcoming[0]
  const greeting = greetingForNow()
  const focusTitle = nextPlan
    ? `${nextPlan.title} is ${nextPlan.date === today ? 'on today’s plan' : 'the next planned content'}.`
    : 'Today is open — build one useful Facebook story from verified facts.'
  const focusCopy = nextPlan
    ? `${nextPlan.type} · ${nextPlan.product || 'General / No Product'} · ${nextPlan.status}. Open the planner or start a matching draft when the source details are ready.`
    : 'Choose a verified product, customer need or BRUTTI story, then generate a draft and send it through human review.'
  return (
    <div className="page dashboard-page">
      <PageHeader eyebrow="MARKETING CONTROL CENTRE" title={`${greeting}, Michelle.`} description="Plan today’s work, review assisted drafts and keep BRUTTI’s marketing moving from one workspace." actions={<button className="button primary" onClick={newContent}><Icon name="sparkles"/>Create with Assist</button>} />

      <section className="hero-panel">
        <div className="hero-content">
          <span className="hero-label"><Icon name="sparkles" size={15}/>DAILY FOCUS · {new Date().toLocaleDateString('en-MY', { weekday:'long' })}</span>
          <h2>{focusTitle}</h2>
          <p>{focusCopy}</p>
          <div className="hero-buttons"><button className="button cream" onClick={newContent}>Start creating <Icon name="arrow"/></button><button className="button ghost-light" onClick={() => navigate('planner')}>Open planner</button></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-grid"/><div className="art-card card-one"><span>01</span><strong>Verified input</strong></div><div className="art-card card-two"><span>02</span><strong>Assist draft</strong></div><div className="art-card card-three"><span>03</span><strong>Human review</strong></div><div className="art-orbit"/></div>
      </section>

      <div className="stats-grid">
        {verifiedSnapshot.map((stat) => <article className="stat-card" key={stat.label}><div className={`stat-icon ${stat.icon}`}><Icon name={stat.icon}/></div><div><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></div></article>)}
      </div>

      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="panel-heading"><div><span className="eyebrow">CONTENT WORKFLOW</span><h3>Pipeline at a glance</h3></div><button className="text-button" onClick={() => navigate('studio')}>View library <Icon name="arrow" size={15}/></button></div>
          <div className="pipeline-flow">{stageCounts.map((item, index) => <div className="pipeline-step" key={item.stage}><div><strong>{item.count}</strong><span>{item.stage}</span></div>{index < stageCounts.length - 1 ? <Icon name="chevron" size={15}/> : null}</div>)}</div>
          <div className="review-queue">{content.slice(0, 3).map((item) => <button key={item.id} onClick={() => openContent(item)}><span className="queue-channel">f</span><span><strong>{item.title}</strong><small>{item.product} · {item.updatedAt}</small></span><StatusPill>{item.stage}</StatusPill><Icon name="chevron"/></button>)}</div>
        </section>

        <aside className="panel focus-panel">
          <div className="panel-heading"><div><span className="eyebrow">TODAY & NEXT</span><h3>Next best actions</h3></div></div>
          <div className="recommendation-list">
            <button onClick={() => reviewItem ? openContent(reviewItem) : navigate('studio')}><span className="recommend-number">01</span><div><strong>{reviewItem ? `Review ${reviewItem.title}` : 'Create a verified draft'}</strong><p>{reviewItem ? 'One content item is waiting for human confirmation.' : 'There is no content waiting in Review right now.'}</p></div></button>
            <button onClick={() => navigate('planner')}><span className="recommend-number">02</span><div><strong>{todayPlans.length ? `${todayPlans.length} item${todayPlans.length > 1 ? 's' : ''} planned today` : 'Today is open'}</strong><p>{todayPlans.length ? 'Check today’s order and status in Campaign Planner.' : 'Add a suitable content slot for today when you have a verified direction.'}</p></div></button>
            <button onClick={newPlan}><span className="recommend-number">03</span><div><strong>Keep the next seven days ready</strong><p>Add or adjust the next content slot without leaving this workspace.</p></div></button>
          </div>
          <div className="guardrail-note"><Icon name="alert"/><p><strong>Accuracy guardrail</strong>No prices, promotions, delivery dates or performance KPI are generated without a verified source.</p></div>
        </aside>
      </div>

      <section className="panel upcoming-panel">
        <div className="panel-heading"><div><span className="eyebrow">UPCOMING</span><h3>Next planned content</h3></div><button className="text-button" onClick={() => navigate('planner')}>Manage planner <Icon name="arrow" size={15}/></button></div>
        <div className="upcoming-row">{upcoming.length ? upcoming.map((plan) => <article key={plan.id}><time><b>{dateFromKey(plan.date).toLocaleDateString('en-MY', { day:'2-digit' })}</b><span>{dateFromKey(plan.date).toLocaleDateString('en-MY', { month:'short' })}</span></time><div><strong>{plan.title}</strong><small>{plan.type} · {plan.channel}</small></div><StatusPill>{plan.status}</StatusPill></article>) : <p className="settings-copy">No upcoming plans yet. Add one from Campaign Planner.</p>}</div>
      </section>
    </div>
  )
}

const bruttiCopyBank = {
  bm: {
    'Brand Awareness': [
      'Nah, setiap ruang ada cerita dia sendiri bah.',
      'Kadang-kadang benda yang simple pun boleh bikin ruang rasa lebih teratur.',
      'Di BRUTTI, kami selalu mula dengan cara ruang tu betul-betul digunakan.',
      'Kalau ruang tu ada fungsi yang jelas, senang juga mau cari direction yang sesuai.',
      'Bagi kami, furniture bukan setakat kasi penuh ruang — dia kena ada tujuan.',
      'Ada ruang yang perlukan statement, ada juga yang cuma perlukan sesuatu yang practical.',
    ],
    'Product Highlight': [
      'Kalau sedang cari furniture untuk kegunaan harian, boleh tinguk yang ni dulu.',
      'Kali ni kami mau kasi spotlight sikit sama satu lagi hasil BRUTTI.',
      'Ada produk yang terus tarik mata, ada juga yang menang sebab fungsi dia.',
      'Yang ni sesuai masuk dalam radar kalau kamu suka benda yang kemas dan practical.',
      'Satu lagi pilihan untuk kamu yang sedang susun ruang ikut keperluan sebenar.',
      'Sebelum pilih, paling penting tengok dulu fungsi yang kamu perlukan dari ruang tu.',
    ],
    Educational: [
      'Kamu pernah fikir ka apa yang selalu bikin satu ruang nampak cepat semak?',
      'Tip kali ni simple ja, tapi boleh membantu masa kamu plan ruang.',
      'Sebelum pilih furniture, cuba tengok dulu rutin yang berlaku dalam ruang tu.',
      'Kalau mau ruang lebih senang digunakan, mula dengan fungsi dulu.',
      'Benda kecil dalam perancangan ruang kadang-kadang bagi beza yang besar.',
      'Tidak semestinya kena ubah semua — kadang satu keputusan yang tepat sudah cukup membantu.',
    ],
    'Behind the Scenes': [
      'Nah, kali ni masuk belakang tabir sikit bersama team BRUTTI.',
      'Sebelum nampak hasil siap, memang ada beberapa proses yang kena jalan satu-satu.',
      'Dari direction awal sampai finishing, setiap step ada kerja dia sendiri.',
      'Yang nampak simple bila siap tu selalunya ada banyak detail di belakang dia.',
      'Kali ni kami share sikit proses yang biasanya kamu tidak nampak di depan.',
      'Bikin sampai jadi memang perlukan tangan, masa dan perhatian pada detail.',
    ],
    'Customer Story': [
      'Setiap customer datang dengan ruang dan keperluan yang lain-lain.',
      'Bila customer sudah cerita apa yang dia perlukan, barula direction tu mula nampak.',
      'Yang paling menarik bila idea asal customer pelan-pelan jadi sesuatu yang boleh digunakan.',
      'Tidak semua ruang perlukan jawapan yang sama — sebab tu cerita customer penting.',
      'Kadang satu request yang simple boleh jadi permulaan kepada design yang sangat personal.',
      'Kami suka bila hasil akhir tu bukan saja nampak cantik, tapi betul-betul menjawab kegunaan customer.',
    ],
    Promotion: [
      'Kalau yang ni memang sudah masuk dalam list kamu, boleh semak detail yang team bagi dulu.',
      'Ada offer yang menarik perhatian, tapi pastikan dulu semua syarat dia jelas sebelum confirm.',
      'Kalau sedang tunggu masa yang sesuai, ini boleh jadi salah satu benda untuk kamu pertimbangkan.',
      'Sebelum decide, tengok dulu sama ada offer ni memang sesuai dengan keperluan kamu.',
      'Promo memang siok, tapi info yang tepat lagi penting sebelum buat keputusan.',
      'Kalau ada detail yang kurang jelas, tanya team dulu supaya senang mau decide.',
    ],
  },
  en: {
    'Brand Awareness': [
      'Every space has its own purpose and its own story.',
      'A practical space often starts with a few thoughtful choices.',
      'At BRUTTI, we start by understanding how the space will actually be used.',
      'Furniture works best when it supports the purpose of the space.',
      'A well-considered piece should do more than simply fill an empty area.',
      'Some spaces need a statement; others simply need something that works well every day.',
    ],
    'Product Highlight': [
      'If you are planning a practical space, this piece may be worth a closer look.',
      'Here is another BRUTTI piece we are putting in the spotlight.',
      'Some products stand out visually, while others earn their place through function.',
      'Keep this option in mind if you value a clean and practical setup.',
      'This is one more option to consider when planning around your actual needs.',
      'Before choosing a piece, start with what the space genuinely needs to do.',
    ],
    Educational: [
      'A useful space usually begins with a clear understanding of how it is used.',
      'Here is a simple planning tip that can make everyday use easier.',
      'Before choosing furniture, look at the routines that happen in the space.',
      'If you want a space to work better, start with function before appearance.',
      'Small planning decisions can make a meaningful difference to everyday use.',
      'You do not always need to change everything; one thoughtful choice can already help.',
    ],
    'Behind the Scenes': [
      'Here is a closer look at what happens behind the finished BRUTTI piece.',
      'Before the final result, the team works through several stages one by one.',
      'From the first direction to finishing, every stage has a purpose.',
      'What looks simple when finished can involve plenty of careful work behind the scenes.',
      'This time, we are sharing a part of the process customers do not always see.',
      'Turning an idea into a finished piece takes time, hands-on work and attention to detail.',
    ],
    'Customer Story': [
      'Every customer brings a different space and a different need.',
      'Once the customer explains what the space needs to do, the direction becomes clearer.',
      'It is always meaningful to see a customer’s first idea turn into something they can use.',
      'Different spaces need different answers, which is why the customer story matters.',
      'A simple request can sometimes become the starting point for a very personal design.',
      'The best result is not only visually considered; it should also support how the customer uses the space.',
    ],
    Promotion: [
      'If this has already been on your list, check the verified offer details first.',
      'An offer can be useful, but the terms should always be clear before you confirm.',
      'If you have been waiting for the right time, this may be worth considering.',
      'Before deciding, check whether the offer genuinely matches what you need.',
      'A promotion is useful only when the verified details make sense for you.',
      'If anything is unclear, check with the team before making a decision.',
    ],
  },
}

const bruttiCtas = {
  bm: [
    'Kalau mau tahu detail yang sudah disahkan, roger ja team BRUTTI.',
    'Ada soalan pasal yang ni? Mesej ja kami, nanti team bantu check.',
    'Kamu rasa yang ni sesuai dengan ruang kamu? Kasi tau kami di komen.',
    'Kalau mau bincang pilihan yang sesuai, boleh terus hubungi team BRUTTI.',
    'Simpan dulu post ni kalau kamu masih dalam fasa survey.',
    'Mau semak detail sebelum decide? Tanya ja team kami dulu.',
  ],
  en: [
    'Contact BRUTTI for verified product information before deciding.',
    'Message the BRUTTI team if you would like to check the available details.',
    'Would this work in your space? Share your thoughts with us.',
    'Speak with BRUTTI if you want to discuss an option suited to your needs.',
    'Save this post if you are still comparing ideas for your space.',
    'Check the verified details with our team before making your decision.',
  ],
}

const rewriteModeOpeners = {
  engaging: {
    bm: ['Kamu pernah nampak benda macam ni ka?', 'Kalau satu benda boleh kasi ruang lebih senang digunakan, kamu pilih ka?', 'Cuba tengok yang ni dulu — mungkin ada fungsi yang kamu sedang cari.'],
    en: ['Have you seen something like this before?', 'What would make this space easier for you to use every day?', 'Take a closer look — this may have a function you have been looking for.'],
  },
  casual: {
    bm: ['Nah, kali ni kami mau share benda yang simple tapi berguna.', 'Yang ni santai ja — satu idea untuk kamu yang sedang susun ruang.', 'Kali ni kita tinguk satu benda yang practical dulu.'],
    en: ['Here is something simple and useful we wanted to share.', 'Keeping this one simple — an idea for anyone planning a practical space.', 'This time, we are looking at one practical option.'],
  },
  professional: {
    bm: ['Kalau kamu sedang menilai pilihan yang practical dan kemas, yang ni boleh dipertimbangkan.', 'Untuk perancangan ruang yang lebih teratur, fungsi dan keperluan sebenar perlu jalan sekali.', 'Pilihan yang baik bermula dengan fungsi yang jelas dan maklumat yang sudah disahkan.'],
    en: ['If you are considering a practical and tidy option, this may be worth reviewing.', 'A well-planned space starts with a clear function and verified information.', 'A considered choice begins with understanding the real requirement of the space.'],
  },
}

function stableIndex(value, length) {
  if (!length) return 0
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  return Math.abs(hash) % length
}

function sentenceCase(value) {
  const cleaned = value.trim().replace(/\s+([,.!?])/g, '$1')
  if (!cleaned) return ''
  const cased = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return /[.!?]$/.test(cased) ? cased : `${cased}.`
}

function polishDirectionText(value, language) {
  const original = value.trim().replace(/\s+/g, ' ')
  if (!original) return ''
  if (language === 'English') return sentenceCase(original)

  let polished = original
    .replace(/\bdiluar\b/gi, 'di luar')
    .replace(/\bdidalam\b/gi, 'di dalam')
    .replace(/\bkemana-mana\b/gi, 'ke mana-mana')
    .replace(/\bkena lagi\b/gi, 'lagi-lagi kalau')
    .replace(/\bbarang2\b/gi, 'barang-barang')

  const portable = /(?:senang|mudah) dibawa ke mana-mana/i.test(polished)
  const foldable = /foldable|boleh dilipat/i.test(polished)
  const storage = /(?:senang|mudah).{0,16}(?:mau|mahu)?\s*disimpan|senang.{0,10}simpan|penyimpanan/i.test(polished)
  const event = /event|acara/i.test(polished)
  const outdoor = /di luar/i.test(polished)
  const kiosk = /\bkiosk\b/i.test(polished)
  if (portable && foldable) {
    const subject = kiosk ? 'Kiosk ni' : 'Produk ni'
    const eventUse = event ? `, lagi-lagi kalau ada event${outdoor ? ' di luar' : ''}` : ''
    const storageLine = storage || foldable ? 'Foldable pula tu, jadi senang ja mau simpan.' : ''
    return `${subject} memang senang dibawa ke mana-mana${eventUse}. ${storageLine}`.trim()
  }

  polished = polished
    .replace(/\s+(lagi-lagi kalau)\s+/i, ', $1 ')
    .replace(/\s+sebab\s+/i, '. Sebab ')
  return polished.split(/(?<=[.!?])\s+/).map(sentenceCase).join(' ')
}

function splitVerifiedFacts(value, language) {
  const polished = polishDirectionText(value, language)
  return polished
    .replace(/[.!?]+$/g, '')
    .split(/\s*(?:,|;|&|\bdan\b|\band\b)\s*/i)
    .map((fact) => fact.trim())
    .filter(Boolean)
}

function expandFactLine(fact, language) {
  if (language === 'en') return sentenceCase(fact)
  const lower = fact.toLowerCase()
  if (/foldable|boleh dilipat/.test(lower)) return 'Foldable pula tu, jadi senang ja mau lipat dan simpan.'
  if (/senang dibawa|mudah dibawa/.test(lower)) return 'Mau bawa dari satu tempat ke tempat lain pun senang.'
  if (/banyak (?:jenis |pilihan )?warna|pelbagai warna/.test(lower)) return 'Pilihan warna pun banyak, boleh pilih mana yang paling ngam dengan style kamu.'
  return sentenceCase(fact)
}

const bruttiSupportLines = {
  bm: {
    'Brand Awareness': ['Kami share supaya kamurang boleh kenal cara BRUTTI fikir pasal ruang dengan lebih dekat.', 'Bagi kami, direction yang baik mesti datang dari keperluan sebenar.', 'Tidak perlu terlalu complicated kalau fungsi dia sudah jelas.', 'Setiap ruang boleh ada jawapan yang berbeza.', 'Yang penting bukan ikut trend semata-mata, tapi sesuai dengan orang yang guna ruang tu.', 'Kalau fungsi dan susunan sudah kena, barula keseluruhan ruang rasa lebih masuk akal.'],
    'Product Highlight': ['Kalau kamu suka benda yang practical, yang ni boleh masuk dalam list untuk dibandingkan.', 'Tengok fungsi dia dulu, kemudian baru nilai sama ada sesuai dengan ruang kamu.', 'Pilihan yang sesuai bergantung pada ruang, kegunaan dan detail yang sudah disahkan.', 'Benda yang berguna setiap hari selalunya menang pada fungsi.', 'Tidak semestinya satu pilihan sesuai untuk semua ruang.', 'Kalau detail dia match dengan apa yang kamu perlukan, barula senang mau proceed.'],
    Educational: ['Simple ja, tapi benda macam ni memang berguna masa planning.', 'Boleh simpan tip ni untuk rujukan bila kamu susun ruang nanti.', 'Cuba apply ikut keadaan ruang sendiri, bukan ikut satu formula saja.', 'Fungsi harian biasanya bagi clue paling jelas untuk pilih susunan yang sesuai.', 'Sebelum beli atau buat keputusan, ukur dan semak keperluan dulu.', 'Planning awal boleh kurangkan banyak trial and error kemudian.'],
    'Behind the Scenes': ['Satu-satu team kasi jalan sampai semua detail cukup untuk next step.', 'Setiap proses ada checking dia sendiri sebelum hasil tu bergerak ke peringkat seterusnya.', 'Ada bahagian yang cepat, ada juga yang memang perlukan masa dan ketelitian.', 'Banyak keputusan kecil berlaku sebelum sesuatu piece nampak siap.', 'Proses ni juga yang bantu team pastikan hasil ikut direction asal.', 'Kami share belakang tabir supaya kamu nampak cerita di sebalik hasil akhir.'],
    'Customer Story': ['Setiap customer memang ada cara guna ruang yang berbeza.', 'Dari cerita customer tu barula team boleh susun direction dengan lebih tepat.', 'Keperluan sebenar customer tetap jadi rujukan utama sepanjang proses.', 'Kadang-kadang solution yang paling sesuai datang dari detail kecil yang customer share.', 'Sebab tu kami suka faham rutin dan fungsi ruang dulu.', 'Bila hasil akhir boleh digunakan dengan selesa, itu yang paling penting.'],
    Promotion: ['Kalau sesuai dengan apa yang kamu cari, boleh simpan dalam list dulu.', 'Semak detail yang team bagi sebelum confirm ya.', 'Tidak payah malu mau tanya kalau ada benda yang kurang jelas.', 'Pastikan harga, tempoh dan syarat offer memang yang terkini sebelum proceed.', 'Offer yang sesuai tetap bergantung pada apa yang kamu perlukan.', 'Boleh bandingkan dulu sebelum buat keputusan terakhir.'],
  },
  en: {
    'Brand Awareness': ['We are sharing this so you can get to know how BRUTTI thinks about purposeful spaces.', 'A useful direction should always begin with a real need.', 'It does not need to be complicated when the function is clear.', 'Different spaces can require very different answers.', 'The goal is not simply to follow a trend, but to support the people using the space.', 'When function and arrangement work together, the whole space becomes easier to understand.'],
    'Product Highlight': ['If practical pieces are your thing, keep this one on the comparison list.', 'Start with its function, then decide whether it suits your space.', 'The right choice depends on the space, its use and the verified details.', 'Pieces used every day often earn their place through function.', 'One option will not necessarily suit every space.', 'If the verified details match what you need, the next decision becomes easier.'],
    Educational: ['It is a simple point, but it can be useful during planning.', 'Save this tip for the next time you organise a space.', 'Adapt the idea to your own space rather than following one fixed formula.', 'Daily routines usually give the clearest clue about the right setup.', 'Measure and confirm the real need before making a purchase or design decision.', 'A little planning early on can reduce trial and error later.'],
    'Behind the Scenes': ['The team works through each detail before moving to the next stage.', 'Every stage has its own checks before the piece moves forward.', 'Some steps are quick, while others need time and close attention.', 'Many small decisions happen before a piece looks finished.', 'The process helps the team stay aligned with the original direction.', 'We share the process so you can see the story behind the final result.'],
    'Customer Story': ['Every customer uses their space differently.', 'The customer’s story helps the team shape a more relevant direction.', 'The real customer need remains the reference point throughout the process.', 'Sometimes the most suitable solution comes from one small detail the customer shares.', 'That is why understanding routines and function comes first.', 'When the final result supports everyday use comfortably, that is what matters.'],
    Promotion: ['Keep it on your list if it matches what you are looking for.', 'Check the verified details before confirming.', 'Ask the team if anything is unclear.', 'Make sure the latest price, period and offer terms are confirmed before proceeding.', 'The value of an offer still depends on what you genuinely need.', 'Compare the options before making your final decision.'],
  },
}

const bruttiGeneralLines = {
  bm: ['Kami kasi susun info supaya senang kamurang baca satu-satu.', 'Yang penting, fakta kena jelas dan maksud asal jangan lari.', 'Kalau ada detail yang belum confirm, lebih baik check dulu dengan team.', 'Tidak semua post perlu bunyi sama — ikut cerita dan tujuan content tu.', 'Kami cuba kasi ayat rasa natural, bukan terlalu menjual.', 'Biar santai, tapi info penting masih senang nampak.'],
  en: ['We keep the information structured so it is easy to follow.', 'The facts should stay clear without changing the original meaning.', 'If a detail is not confirmed, check with the team before using it.', 'Not every post needs the same rhythm; the story and objective should lead the wording.', 'The copy should feel natural rather than overly promotional.', 'Keep the tone easy to read while making the important details visible.'],
}

function buildSmartDraft(form, mode = 'balanced', variation = 0) {
  const product = form.product === 'General / No Product' ? '' : form.product
  const languageKey = form.language === 'English' ? 'en' : 'bm'
  const seedText = `${form.title}|${form.product}|${form.type}|${form.brief}|${mode}`
  const seed = stableIndex(seedText, 997)
  const variationOffset = Math.abs(variation) * 17
  const selectOpener = (language) => {
    const standard = bruttiCopyBank[language][form.type] || bruttiCopyBank[language]['Brand Awareness']
    if (rewriteModeOpeners[mode]) {
      const pool = rewriteModeOpeners[mode][language]
      return pool[(seed + variationOffset) % pool.length]
    }
    const shift = mode === 'hook' ? 5 : 0
    return standard[(seed + variationOffset + shift) % standard.length]
  }
  const selectCta = (language) => {
    const pool = bruttiCtas[language]
    const shift = mode === 'cta' ? 3 : 0
    return pool[(seed + variationOffset + shift) % pool.length]
  }
  const productLines = {
    bm: product ? [`Untuk kali ni, kami kasi spotlight sikit sama ${product}.`, `Nama dia ${product}, dan kali ni kita fokus pada fungsi yang sudah disahkan.`, `${product} masuk dalam pilihan kali ni berdasarkan detail yang team sudah confirm.`] : [],
    en: product ? [`This time, the focus is ${product}.`, `${product} is the product we are looking at in this post.`, `For this post, we are focusing on the verified details for ${product}.`] : [],
  }
  const buildLanguage = (language, targetMin = 9, maxLines = 13) => {
    const pieces = [selectOpener(language)]
    const productPool = productLines[language]
    if (productPool.length && mode !== 'shorten' && form.type === 'Product Highlight') pieces.push(productPool[(seed + variationOffset) % productPool.length])
    const facts = splitVerifiedFacts(form.brief, language === 'en' ? 'English' : form.language).map((fact) => expandFactLine(fact, language))
    pieces.push(...facts)
    const support = bruttiSupportLines[language][form.type] || bruttiSupportLines[language]['Brand Awareness']
    const general = bruttiGeneralLines[language]
    const supportPool = [...support, ...general]
    let cursor = (seed + variationOffset) % supportPool.length
    let attempts = 0
    while (pieces.filter(Boolean).length < Math.max(1, targetMin - 1) && attempts < supportPool.length * 2) {
      const line = supportPool[cursor % supportPool.length]
      if (!pieces.includes(line)) pieces.push(line)
      cursor += 5
      attempts += 1
    }
    const body = pieces.filter(Boolean).slice(0, Math.max(1, maxLines - 1))
    return [...body, selectCta(language)].slice(0, maxLines).join('\n')
  }
  const bilingualMode = form.language === 'BM + English'
  const singleTarget = mode === 'shorten' ? 7 : 9
  const bm = buildLanguage('bm', bilingualMode ? 6 : singleTarget, bilingualMode ? 6 : 13)
  const en = buildLanguage('en', bilingualMode ? 6 : singleTarget, bilingualMode ? 6 : 13)
  const bilingual = `${bm}\n\n${en}`
  const draft = languageKey === 'en' ? en : form.language === 'BM + English' ? bilingual : bm
  const addHashtags = form.includeHashtags || mode === 'hashtags'
  const hashtagSets = [
    '#BRUTTI #ProudlySabahan #BikinSampaiJadi',
    '#BRUTTI #PurposefullyCrafted #FurnitureSabah',
    '#BRUTTI #ProudlySabahan #CustomFurnitureSabah',
    '#BRUTTI #BikinSampaiJadi #SabahBrand',
    '#BRUTTI #PurposefulSpaces #ProudlySabahan',
    '#BRUTTI #FurnitureSabah #MadeInSabah',
  ]
  const hashtags = hashtagSets[(seed + variationOffset + (mode === 'hashtags' ? 2 : 0)) % hashtagSets.length]
  return `${draft}${addHashtags ? `\n\n${hashtags}` : ''}`
}

function getRuleChecks(copy, verifiedFacts) {
  const text = copy.toLowerCase()
  const facts = verifiedFacts.toLowerCase()
  const claimTerms = ['rm', '%', 'discount', 'diskaun', 'free delivery', 'penghantaran percuma', 'reach', 'views', 'followers', 'sold', 'stok terhad', 'limited stock', 'no. 1', 'terbaik']
  const unsupported = claimTerms.some((term) => text.includes(term) && !facts.includes(term))
  const contentLines = copy.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
  const hashtags = copy.match(/#[\p{L}\p{N}_]+/gu) || []
  const hypeTerms = ['game changer', 'revolusi', 'sempurna untuk semua', 'pasti puas hati', 'luar biasa']
  const hypeFree = !hypeTerms.some((term) => text.includes(term)) && (copy.match(/!/g) || []).length <= 2
  const fillerTerms = ['ngam', 'simple', 'bah']
  const repetitionControlled = fillerTerms.every((term) => (text.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length <= 3)
  return [
    { label:'Verified facts supplied', pass:Boolean(verifiedFacts.trim()) },
    { label:'Brutti Facebook style aligned', pass:hypeFree },
    { label:'Repetition controlled', pass:repetitionControlled },
    { label:'Caption length (7–13 lines)', pass:contentLines.length >= 7 && contentLines.length <= 13 },
    { label:'Natural Brutti CTA', pass:/hubungi|contact|mesej|message|bincang|speak with|whatsapp|roger|kasi tau|komen|share|simpan/i.test(copy) },
    { label:'Hashtags controlled (maximum 5)', pass:hashtags.length <= 5 },
    { label:'No unsupported price, promotion or KPI', pass:!unsupported },
    { label:'Human approval still required', pass:false, review:true },
  ]
}

function GeneratorForm({ form, setForm, onGenerate, output, onOutputChange, saveDraft, workspaceActive, toast, productOptions }) {
  const [rewriteMode, setRewriteMode] = useState('balanced')
  const [variation, setVariation] = useState(0)
  const [originalBrief, setOriginalBrief] = useState('')
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const checks = getRuleChecks(output, form.brief)
  const rewrite = (mode, nextVariation = variation) => {
    setRewriteMode(mode)
    setVariation(nextVariation)
    onOutputChange(buildSmartDraft(form, mode, nextVariation))
    const labels = { balanced:'New Brutti variation', engaging:'More engaging', casual:'More casual', professional:'More professional', shorten:'Shorter caption', hook:'New opening hook', cta:'New CTA', hashtags:'Updated hashtags' }
    toast(`${labels[mode]} applied without an external AI platform.`)
  }
  const polishBrief = () => {
    if (!form.brief.trim()) { toast('Write your product facts or rough direction first.'); return }
    const polished = polishDirectionText(form.brief, form.language)
    if (polished === form.brief.trim()) { toast('The wording is already tidy. You can continue generating the caption.'); return }
    setOriginalBrief(form.brief)
    setForm((current) => ({ ...current, brief:polished }))
    toast('Wording polished in Brutti style. Check that the meaning is still accurate before generating.')
  }
  return (
    <div className="generator-layout">
      <form className="generator-form" onSubmit={(event) => { event.preventDefault(); onGenerate() }}>
        <div className="form-section-head"><span>01</span><div><strong>Content direction</strong><p>Only use facts you can verify.</p></div></div>
        <p className="form-disclaimer"><Icon name="check" size={14}/>Default voice: Brutti Sabahan Casual — santai, natural dengan 7–13 baris isi. Perkataan seperti ni, ja, nda, bah, kasi dan mau akan dikekalkan bila sesuai.</p>
        <label>Content title<input required value={form.title} onChange={update('title')} placeholder="e.g. KAANAGAN product highlight"/></label>
        <div className="two-fields"><label>Platform<select value={form.platform} onChange={update('platform')}><option>Facebook</option><option disabled>Instagram — not connected</option><option disabled>TikTok — not connected</option><option disabled>Threads — not connected</option></select></label><label>Content type<select value={form.type} onChange={update('type')}><option>Brand Awareness</option><option>Product Highlight</option><option>Educational</option><option>Behind the Scenes</option><option>Customer Story</option><option>Promotion</option></select></label></div>
        <label>Product<select value={form.product} onChange={update('product')}><option>General / No Product</option>{productOptions.map((product) => <option key={product.id || product.name} value={product.name}>{product.name}</option>)}</select></label>
        <div className="two-fields"><label>Language<select value={form.language} onChange={update('language')}><option>Bahasa Melayu</option><option>English</option><option>BM + English</option></select></label><label>Tone<select value={form.tone} onChange={update('tone')}><option>Brutti Sabahan Casual</option><option>Warm & confident</option><option>Practical & friendly</option><option>Proud & purposeful</option><option>Helpful</option><option>Professional but friendly</option></select></label></div>
        <label>Verified facts / direction<textarea required rows="5" value={form.brief} onChange={update('brief')} placeholder="Write your rough sentence or add confirmed product details and campaign direction."/></label>
        {form.assetName ? <div className="selected-asset"><Icon name="image"/><span><strong>Selected visual</strong><small>{form.assetName}</small></span><button type="button" onClick={() => setForm((current) => ({...current, driveFileId:'', assetName:'', driveLink:''}))}>Remove</button></div> : null}<div className="brief-polish-row"><button type="button" onClick={polishBrief}><Icon name="sparkles" size={14}/>Asah ayat ikut gaya Brutti</button>{originalBrief ? <button type="button" className="undo" onClick={() => { setForm((current) => ({...current, brief:originalBrief})); setOriginalBrief(''); toast('Original wording restored.') }}>Undo</button> : null}<span>Susunan ayat dikemas, gaya Sabah dan maksud asal dikekalkan.</span></div>
        <label className="checkbox-row"><input type="checkbox" checked={form.includeHashtags} onChange={(event) => setForm((current) => ({ ...current, includeHashtags: event.target.checked }))}/><span>Include relevant hashtags</span></label>
        <button className="button primary wide" type="submit"><Icon name="sparkles"/>Generate free structured draft</button>
        <p className="form-disclaimer"><Icon name="alert" size={14}/>No paid AI API is used. The draft is assembled from BRUTTI templates and the verified facts you enter.</p>
        <div className="assist-steps"><span><b>1</b>Generate caption</span><span><b>2</b>Use Smart Rewrite</span><span><b>3</b>Rule check and save</span></div>
      </form>

      <div className={`generator-output ${output ? 'has-output' : ''}`}>
        <div className="output-toolbar"><div><span className="eyebrow">FREE ASSIST OUTPUT</span><strong>{output ? form.title : 'Your structured draft will appear here'}</strong></div>{output ? <StatusPill>Human Review Required</StatusPill> : <StatusPill>Free Mode Ready</StatusPill>}</div>
        {output ? <><label className="output-editor-label">Editable Facebook caption · 7–13 content lines<textarea value={output} onChange={(event) => onOutputChange(event.target.value)} rows="18"/></label><section className="smart-rewrite-panel"><div className="smart-rewrite-head"><div><span className="eyebrow">FREE SMART REWRITE</span><strong>Asah caption ikut suara Brutti</strong></div><span>Brutti Sabahan Casual · No API</span></div><div className="rewrite-actions"><button className={rewriteMode === 'engaging' ? 'active' : ''} onClick={() => rewrite('engaging')}>More engaging</button><button className={rewriteMode === 'casual' ? 'active' : ''} onClick={() => rewrite('casual')}>More casual</button><button className={rewriteMode === 'professional' ? 'active' : ''} onClick={() => rewrite('professional')}>More professional</button><button className={rewriteMode === 'shorten' ? 'active' : ''} onClick={() => rewrite('shorten')}>Shorter lines</button><button className={rewriteMode === 'hook' ? 'active' : ''} onClick={() => rewrite('hook')}>New hook</button><button className={rewriteMode === 'cta' ? 'active' : ''} onClick={() => rewrite('cta')}>New CTA</button><button className={rewriteMode === 'hashtags' ? 'active' : ''} onClick={() => rewrite('hashtags')}>Refresh hashtags</button></div><div className="variation-row"><span>Brutti Sabahan variations</span>{[0,1,2].map((index) => <button className={rewriteMode === 'balanced' && variation === index ? 'active' : ''} key={index} onClick={() => rewrite('balanced', index)}>Version {index + 1}</button>)}</div></section><div className="output-actions assist-actions"><button className="button secondary" onClick={() => navigator.clipboard?.writeText(output)}>Copy caption</button><button className="button primary" onClick={saveDraft}>Save as draft</button></div><div className="ai-checks">{checks.map((check) => <span className={check.pass ? 'pass' : check.review ? 'review' : 'flag'} key={check.label}><Icon name={check.pass ? 'check' : 'alert'}/>{check.label}</span>)}</div><p className="save-location">{workspaceActive ? 'Saving writes this draft to the BRUTTI Google Sheet.' : 'Saving keeps this draft in the current browser until Google is connected.'}</p></> : <div className="empty-output"><div className="sparkle-ring"><Icon name="sparkles" size={28}/></div><h3>Free Smart Rewrite is ready.</h3><p>Add verified facts to generate a 7–13-line BRUTTI Facebook caption, then refine its hook, tone, CTA and hashtags without leaving this website.</p></div>}
      </div>
    </div>
  )
}

function ContentStudio({ content, deleteContent, generator, setGenerator, output, setOutput, generate, saveDraft, openContent, workspaceActive, toast, productOptions }) {
  const [tab, setTab] = useState('generator')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const visible = content.filter((item) => (filter === 'All' || item.stage === filter) && `${item.title} ${item.product}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="page">
      <PageHeader eyebrow="FREE CONTENT ASSIST" title="Content Studio" description="Buat dan asah caption Facebook dalam gaya Brutti Sabahan yang santai, kemudian hantar untuk human review." />
      <div className="tab-bar"><button className={tab === 'generator' ? 'active' : ''} onClick={() => setTab('generator')}><Icon name="sparkles"/>Free Assist</button><button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}><Icon name="file"/>Content Library <em>{content.length}</em></button></div>
      {tab === 'generator' ? <GeneratorForm form={generator} setForm={setGenerator} onGenerate={generate} output={output} onOutputChange={setOutput} saveDraft={saveDraft} workspaceActive={workspaceActive} toast={toast} productOptions={productOptions}/> : (
        <section className="panel content-library">
          <div className="library-toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content or product…"/></div><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{[...pipelineStages, 'Rejected'].map((stage) => <option key={stage}>{stage}</option>)}</select></div>
          <div className="content-table-wrap"><table className="content-table"><thead><tr><th>Content</th><th>Type</th><th>Rule check</th><th>Stage</th><th>Updated</th><th/></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><span className="content-channel">f</span><div><strong>{item.title}</strong><small>{item.product}</small></div></td><td>{item.type}</td><td><StatusPill>{item.aiReview}</StatusPill></td><td><StatusPill>{item.stage}</StatusPill></td><td>{item.updatedAt}</td><td><div className="row-actions"><button onClick={() => openContent(item)} aria-label={`Edit ${item.title}`}><Icon name="edit"/></button><button onClick={() => deleteContent(item.id)} aria-label={`Delete ${item.title}`}><Icon name="trash"/></button></div></td></tr>)}</tbody></table></div>
          {!visible.length ? <div className="empty-list">No content matches this search.</div> : null}
        </section>
      )}
    </div>
  )
}

function CampaignPlanner({ plans, openPlan, newPlan, deletePlan }) {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()))
  const week = weekKeys(anchor)
  const today = localDateKey()
  const weekPlans = plans.filter((plan) => week.includes(plan.date))
  const moveWeek = (days) => setAnchor((current) => addDays(current, days))
  return (
    <div className="page">
      <PageHeader eyebrow="CONTENT CALENDAR" title="Campaign Planner" description="Dynamic weekly planner for daily BRUTTI marketing operations." actions={<button className="button primary" onClick={() => newPlan(today)}><Icon name="plus"/>Add content</button>} />
      <div className="planner-summary dynamic-planner-summary"><div><span>Week</span><strong>{formatDateRange(week)}</strong><small>{weekPlans.length} planned item{weekPlans.length === 1 ? '' : 's'}</small></div><div className="planner-nav"><button className="button secondary small" onClick={() => moveWeek(-7)}>← Previous</button><button className="button secondary small" onClick={() => setAnchor(startOfWeek(new Date()))}>Today</button><button className="button secondary small" onClick={() => moveWeek(7)}>Next →</button></div></div>
      <section className="week-calendar">{week.map((date) => { const items = plans.filter((plan) => plan.date === date); const day = dateFromKey(date); return <div className={`calendar-day ${date === today ? 'is-today' : ''}`} key={date}><div className="calendar-day-head"><span>{day.toLocaleDateString('en-MY',{weekday:'short'})}{date === today ? ' · Today' : ''}</span><strong>{day.getDate()}</strong></div><div className="calendar-items">{items.map((plan) => <button className={`calendar-item ${stageClass(plan.status)}`} key={plan.id} onClick={() => openPlan(plan)}><small>{plan.type}</small><strong>{plan.title}</strong><span>{plan.channel} · {plan.status}</span></button>)}<button className="add-day" onClick={() => newPlan(date)}><Icon name="plus" size={14}/>Add</button></div></div>})}</section>
      <div className="planner-bottom-grid"><section className="panel campaign-section"><div className="panel-heading"><div><span className="eyebrow">SMART CAMPAIGN IDEAS</span><h3>Ready for planning</h3></div></div><div className="campaign-list">{campaignIdeas.map((idea,index) => <article key={idea.title}><span className="campaign-index">{String(index+1).padStart(2,'0')}</span><div><strong>{idea.title}</strong><p>{idea.objective}</p><small>{idea.pillar}</small></div><button className="button secondary small" onClick={() => newPlan(today, idea)}>Plan idea</button></article>)}</div></section><section className="panel plan-list-section"><div className="panel-heading"><div><span className="eyebrow">ALL PLANS</span><h3>{plans.length} total items</h3></div></div><div className="compact-plan-list">{[...plans].sort((a,b) => a.date.localeCompare(b.date)).map((plan) => <div key={plan.id}><button onClick={() => openPlan(plan)}><time>{dateFromKey(plan.date).toLocaleDateString('en-MY',{day:'2-digit',month:'short'})}</time><span><strong>{plan.title}</strong><small>{plan.type}</small></span><StatusPill>{plan.status}</StatusPill></button><button className="delete-plan" onClick={() => deletePlan(plan.id)} aria-label={`Delete ${plan.title}`}><Icon name="trash" size={15}/></button></div>)}</div></section></div>
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
        <section className="panel brand-card"><span className="card-number">02</span><span className="eyebrow">VOICE & TONE</span><h3>Sabahan santai, natural dan human.</h3><p>Kekalkan perkataan seperti ni, ja, nda, bah, kasi, mau, tinguk dan ngam bila sesuai. Campur English secara natural, jangan paksa slang atau ulang perkataan yang sama terlalu banyak.</p><blockquote>“Nah, kamu tinguk dulu yang ni bah.”</blockquote></section>
      </div>
      <section className="panel palette-panel"><div className="panel-heading"><div><span className="eyebrow">VISUAL LANGUAGE</span><h3>Core colour palette</h3></div></div><div className="colour-grid">{colours.map(([name,hex]) => <div key={hex}><div className="colour-swatch" style={{background:hex}}/><strong>{name}</strong><span>{hex}</span></div>)}</div></section>
      <div className="brand-grid guideline-grid">
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">WRITING PRINCIPLES</span><h3>Always do</h3></div></div><ul className="check-list"><li><Icon name="check"/>Lead with a real customer need or useful idea.</li><li><Icon name="check"/>Use only verified product facts and approved sources.</li><li><Icon name="check"/>Include one clear, relevant CTA.</li><li><Icon name="check"/>Match language, tone and length to the platform.</li></ul></section>
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">AI GUARDRAILS</span><h3>Never invent</h3></div></div><ul className="avoid-list"><li><Icon name="close"/>Prices, discounts or promotional dates</li><li><Icon name="close"/>Availability, delivery dates or warranty details</li><li><Icon name="close"/>Materials, dimensions or sustainability claims</li><li><Icon name="close"/>Reach, engagement or sales performance KPI</li></ul></section>
      </div>
    </div>
  )
}

function ProductLibrary({ onUseProduct, productData, workspaceActive, notionActive, onSyncNotion, syncing }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(productData.map((product) => product.category).filter(Boolean))).sort()]
  const visible = productData.filter((product) => (category === 'All' || product.category === category) && `${product.name} ${product.category} ${product.price || ''}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="page">
      <PageHeader eyebrow="VERIFIED PRODUCT SOURCE" title="Product Library" description="Use verified product details from BRUTTI sources. Notion sync can load the full product table through the secured backend." actions={<div className="page-actions"><span className="source-count">{productData.length} loaded</span>{workspaceActive && notionActive ? <button className="button secondary small" disabled={syncing} onClick={onSyncNotion}>{syncing ? 'Syncing…' : 'Sync Notion products'}</button> : null}</div>} />
      <div className="library-toolbar product-toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, category or price…"/></div><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></div>
      <div className="product-grid">{visible.map((product,index) => <article className="product-card" key={product.id || product.name}><div className={`product-visual visual-${index%5}`}><div className="furniture-shape"><span/><span/><span/></div><span className="photo-status">{product.photoConfirmed ? 'Photo confirmed' : product.sourceStatus || 'Verified source'}</span></div><div className="product-card-body"><div><span>{product.id} · {product.category || 'Uncategorised'}</span><h3>{product.name}</h3></div><p>{product.price ? <><strong>{product.price}</strong><br/></> : null}{product.material || product.dimensions ? `${product.material || ''}${product.material && product.dimensions ? ' · ' : ''}${product.dimensions || ''}` : 'Verified name. Add specifications from the source before making product claims.'}</p><button className="text-button" onClick={() => onUseProduct(product)}>Create product content <Icon name="arrow" size={15}/></button></div></article>)}</div>
      {!visible.length ? <div className="empty-list">No products match this search.</div> : null}
      <div className="source-notice"><Icon name={productData.length >= 88 ? 'check' : 'alert'}/><div><strong>{productData.length >= 88 ? 'Product source loaded' : 'Product sync readiness'}</strong><p>{productData.length >= 88 ? 'The full verified product set is available in this workspace.' : 'The website is using its verified fallback set. Configure Notion in Apps Script, then sync the source table here.'}</p></div></div>
    </div>
  )
}

function AssetLibrary({ toast, workspaceActive, driveActive, onUseAsset }) {
  const fallbackAssets = ['KAANAGAN front view','KAANAGAN side view','AHTAM XL front view','AHTAM M front view','GANTUNG product view','PUSMA display view','POPO console view','SULOB shoe rack view','TOMODON organizer view','BRUTTI workshop reference'].map((name,index) => ({id:`fallback-${index}`,name,url:'',mimeType:'reference'}))
  const [driveAssets, setDriveAssets] = useState([])
  const [query, setQuery] = useState('')
  useEffect(() => { if (!workspaceActive || !driveActive) return; callMarketingApi('list_drive_assets').then((result) => setDriveAssets(result.files || [])).catch((error) => toast(error.message)) }, [workspaceActive, driveActive, toast])
  const assets = driveAssets.length ? driveAssets : fallbackAssets
  const visible = assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="page">
      <PageHeader eyebrow="CREATIVE SOURCE FILES" title="Asset Library" description="Choose an approved Drive visual and send it directly into Content Studio." actions={<button className="button secondary" onClick={() => toast('Upload new assets through the controlled Google Drive folder.')}><Icon name="plus"/>Add asset</button>} />
      <div className="asset-summary"><article><strong>{assets.length}</strong><span>{driveAssets.length ? 'Drive assets loaded' : 'Confirmed references'}</span></article><article><strong>{driveAssets.length}</strong><span>Direct Drive files connected</span></article><article><strong>{driveActive ? 'Ready' : 'Pending'}</strong><span>Secure Drive connection</span></article></div>
      <section className="panel asset-panel"><div className="library-toolbar"><div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets…"/></div><span className={`status-chip ${driveActive ? 'connected' : 'pending'}`}><span/>{driveActive ? 'Drive connected' : 'Drive sync pending'}</span></div><div className="asset-grid">{visible.map((asset,index) => <article key={asset.id || asset.name}><div className={`asset-preview asset-${index%4}`}><Icon name="image" size={28}/><span>{String(index+1).padStart(2,'0')}</span></div><div><strong>{asset.name}</strong><p>{driveAssets.length ? asset.mimeType || 'Google Drive asset' : 'Reference record · product asset'}</p><div><StatusPill>{driveAssets.length ? 'Connected' : 'Verified name'}</StatusPill>{driveAssets.length ? <button className="asset-use-button" onClick={() => onUseAsset(asset)} aria-label={`Use ${asset.name} in content`}><Icon name="arrow"/></button> : <button onClick={() => toast('Connect Google Drive to attach this visual.')}><Icon name="chevron"/></button>}</div></div></article>)}</div></section>
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

function Analytics({ content, plans, productData, integrations }) {
  const sources = [['Follower export','Facebook','12,001 records','Imported snapshot'],['Reaction export','Facebook','728 records','Imported snapshot'],['Media archive','Facebook','7,062 files','Reference count'],['Product source','Notion / Google',`${productData.length} loaded`,productData.length >= 88 ? 'Full product set' : 'Partial sync']]
  const stages = ['Draft','AI Generated','Review','Approved','Scheduled','Published']
  const maxCount = Math.max(1, ...stages.map((stage) => content.filter((item) => item.stage === stage).length))
  const scheduledPlans = plans.filter((plan) => plan.status === 'Scheduled').length
  const published = content.filter((item) => item.stage === 'Published').length
  const withAssets = content.filter((item) => item.driveFileId).length
  return (
    <div className="page">
      <PageHeader eyebrow="VERIFIED ACTIVITY DATA" title="Analytics" description="Operational marketing analytics update from the workspace. Meta performance KPI stay excluded until a verified Insights source exists." actions={<span className={`status-chip ${integrations.meta ? 'connected' : 'pending'}`}><span/>{integrations.meta ? 'Meta publishing connected' : 'Meta KPI excluded'}</span>} />
      <div className="analytics-notice"><Icon name="alert"/><div><strong>No fabricated performance KPI</strong><p>Reach, views, engagement rate, followers gained, enquiries and sales attribution stay blank until verified monthly or post-level exports are mapped.</p></div></div>
      <div className="stats-grid analytics-stats"><article className="stat-card"><div className="stat-icon file"><Icon name="file"/></div><div><span>Content records</span><strong>{content.length}</strong><small>{content.filter((item)=>item.stage==='Review').length} awaiting review</small></div></article><article className="stat-card"><div className="stat-icon calendar"><Icon name="calendar"/></div><div><span>Scheduled plans</span><strong>{scheduledPlans}</strong><small>{plans.length} total planner items</small></div></article><article className="stat-card"><div className="stat-icon image"><Icon name="image"/></div><div><span>Drafts with visual</span><strong>{withAssets}</strong><small>Drive assets attached to content</small></div></article><article className="stat-card"><div className="stat-icon check"><Icon name="check"/></div><div><span>Published records</span><strong>{published}</strong><small>Workspace publishing history</small></div></article></div>
      <div className="analytics-grid"><section className="panel activity-chart"><div className="panel-heading"><div><span className="eyebrow">CONTENT ACTIVITY</span><h3>Live workflow distribution</h3></div><span className="verified-label"><Icon name="check"/>Workspace records</span></div><div className="bar-chart">{stages.map((stage) => { const count = content.filter((item) => item.stage === stage).length; return <div key={stage}><span>{stage}</span><i><b style={{width:`${Math.round((count/maxCount)*100)}%`}}/></i><strong>{count}</strong></div> })}</div></section><section className="panel insight-card"><span className="eyebrow">RULE-BASED OBSERVATION</span><h3>{content.some((item)=>item.stage==='Review') ? 'Clear the review queue before adding too many new drafts.' : 'The review queue is clear.'}</h3><p>{integrations.notion ? 'Notion planner sync is configured for shared planning records.' : 'Notion backend sync is not configured yet; Google remains the current operational source.'}</p><div className="insight-source"><Icon name="file"/><span><strong>Next data upgrade</strong><small>Verified post URL + reach + views + engagements</small></span></div></section></div>
      <section className="panel source-table-panel"><div className="panel-heading"><div><span className="eyebrow">DATA SOURCES</span><h3>Available source snapshot</h3></div></div><div className="source-table"><div className="source-row header"><span>Source</span><span>Platform</span><span>Volume</span><span>Status</span></div>{sources.map((row) => <div className="source-row" key={row[0]}>{row.map((cell,index) => <span key={`${row[0]}-${index}`}>{index===3 ? <StatusPill>{cell}</StatusPill> : cell}</span>)}</div>)}</div></section>
    </div>
  )
}

function Settings({ toast, resetWorkspace, workspaceActive, integrations, onRefreshIntegrations, onConnect, onDisconnect }) {
  const [accessKey, setAccessKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const connections = [
    { name:'Google Sheets', detail:'Content Library, Daily Planner and Integration Log', status:integrations.sheets ? 'Connected' : 'Not connected', icon:'file' },
    { name:'Google Drive', detail:'BRUTTI AI MARKETING SYSTEM and approved assets', status:integrations.drive ? 'Connected' : 'Not connected', icon:'image' },
    { name:'Notion', detail:'Product Database and BRUTTI DAILY CONTENT PLANNER sync through Apps Script', status:integrations.notion ? 'Connected' : 'Not connected', icon:'file' },
    { name:'Free AI Assist Mode', detail:'No-cost templates, ChatGPT prompt copy/paste and rule-based checks', status:'Ready', icon:'sparkles' },
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
        {workspaceActive ? <div className="cloud-session"><div><strong>BRUTTI Google operations</strong><p>Shared content, planner records, Drive assets and Free Assist tools are available.</p></div><div><button className="button secondary" onClick={onRefreshIntegrations}>Refresh status</button><button className="button danger-subtle" onClick={onDisconnect}>Disconnect</button></div></div> : googleConfigured ? <form className="cloud-login-form" onSubmit={connect}><label>Internal workspace key<input type="password" required value={accessKey} onChange={(event) => setAccessKey(event.target.value)} autoComplete="off" placeholder="Enter key for this session"/></label><button className="button primary" disabled={connecting}>{connecting ? 'Connecting…' : 'Connect Google workspace'}</button></form> : <p className="settings-copy">Deploy the included Apps Script and add its public deployment URL as VITE_APPS_SCRIPT_URL. No paid AI credential is required; Meta credentials remain optional in Apps Script Properties.</p>}
      </section>
      <section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">INTEGRATIONS</span><h3>Connection status</h3></div><span className={`status-chip ${workspaceActive ? 'connected' : 'local'}`}><span/>{workspaceActive ? 'Google mode' : 'Local fallback'}</span></div><div className="connections-list">{connections.map((connection) => <article key={connection.name}><div className="connection-icon"><Icon name={connection.icon}/></div><div><strong>{connection.name}</strong><p>{connection.detail}</p></div><StatusPill>{connection.status}</StatusPill><button className="button secondary small" onClick={() => toast(connection.status === 'Connected' || connection.status === 'Ready' ? `${connection.name} is ready.` : `${connection.name} still needs configuration in Apps Script Properties.`)}>Check</button></article>)}</div></section>
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
  const act = (stage, message) => { const next = { ...draft, stage, aiReview: stage === 'Approved' || stage === 'Published' ? 'Rule Check Passed' : 'Human Review Required', updatedAt:formatTimestamp() }; setDraft(next); onSave(next); toast(message) }
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal content-modal" role="dialog" aria-modal="true" aria-label="Edit content">
        <div className="modal-head"><div><span className="eyebrow">CONTENT REVIEW</span><h2>{draft.title}</h2></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></div>
        <div className="content-meta"><StatusPill>{draft.stage}</StatusPill><span>{draft.platform}</span><span>{draft.product}</span>{draft.assetName ? <span>Visual: {draft.assetName}</span> : null}</div>
        <label>Title<input value={draft.title} onChange={update('title')}/></label>
        <div className="two-fields"><label>Content type<select value={draft.type} onChange={update('type')}><option>Brand Awareness</option><option>Product Highlight</option><option>Educational</option><option>Behind the Scenes</option></select></label><label>Workflow stage<select value={draft.stage} onChange={update('stage')}>{[...pipelineStages,'Rejected'].map((stage) => <option key={stage}>{stage}</option>)}</select></label></div>
        <label>Content<textarea rows="12" value={draft.copy} onChange={update('copy')}/></label>
        <div className="modal-guardrail"><Icon name="alert"/><span>Check price, availability, delivery dates, dimensions and claims before approval.</span></div>
        <div className="modal-action-groups"><div><button className="button danger-subtle" onClick={() => act('Rejected','Content rejected and returned for revision.')}>Reject</button><button className="button secondary" onClick={() => { onSave({...draft, updatedAt:formatTimestamp()}); toast('Edits saved.') }}>Save edits</button></div><div><button className="button secondary" onClick={() => act('Approved','Content approved for scheduling.')}>Approve</button><button className="button primary" onClick={() => draft.stage === 'Approved' ? workspaceActive ? onPublish(draft) : toast('Meta publishing needs the Google Apps Script backend and Meta credentials.') : toast('Approve this content before publishing.')}>{draft.driveFileId ? 'Publish photo + caption' : 'Publish to Facebook'}</button></div></div>
      </div>
    </div>
  )
}

function PlanEditor({ item, onClose, onSave, onDelete, productOptions }) {
  const [draft, setDraft] = useState(item)
  const update = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }))
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal plan-modal" onSubmit={(event) => { event.preventDefault(); onSave(draft) }}>
        <div className="modal-head"><div><span className="eyebrow">CAMPAIGN PLANNER</span><h2>{draft.id ? 'Edit content plan' : 'Add content plan'}</h2></div><button type="button" className="icon-button" onClick={onClose}><Icon name="close"/></button></div>
        <label>Plan title<input required value={draft.title} onChange={update('title')} placeholder="e.g. AHTAM XL product highlight"/></label>
        <div className="two-fields"><label>Date<input required type="date" value={draft.date} onChange={update('date')}/></label><label>Status<select value={draft.status} onChange={update('status')}><option>Idea</option><option>Draft</option><option>Review</option><option>Approved</option><option>Scheduled</option><option>Published</option></select></label></div>
        <div className="two-fields"><label>Content type<select value={draft.type} onChange={update('type')}><option>Brand Awareness</option><option>Product Highlight</option><option>Educational</option><option>Behind the Scenes</option><option>Customer Story</option></select></label><label>Channel<select value={draft.channel} onChange={update('channel')}><option>Facebook</option></select></label></div>
        <label>Product<select value={draft.product} onChange={update('product')}><option>General / No Product</option>{productOptions.map((product) => <option key={product.id || product.name} value={product.name}>{product.name}</option>)}</select></label>
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
  const [generator, setGenerator] = useState({ title:'', platform:'Facebook', type:'Brand Awareness', product:'General / No Product', language:'Bahasa Melayu', tone:'Brutti Sabahan Casual', brief:'', includeHashtags:true, driveFileId:'', assetName:'', driveLink:'' })
  const [productData, setProductData] = useState(products)
  const [syncingProducts, setSyncingProducts] = useState(false)
  const [output, setOutput] = useState('')
  const [workspaceActive, setWorkspaceActive] = useState(false)
  const [integrations, setIntegrations] = useState({ appsScript:false, sheets:false, drive:false, notion:false, meta:false })

  const toast = useCallback((message) => {
    setToastMessage(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(''), 3200)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const refreshIntegrations = useCallback(async () => {
    if (!hasWorkspaceKey()) {
      setIntegrations({ appsScript:false, sheets:false, drive:false, notion:false, meta:false })
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
        setProductData(workspace.products?.length ? workspace.products : products)
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
      setProductData(workspace.products?.length ? workspace.products : products)
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
    setIntegrations({ appsScript:false, sheets:false, drive:false, notion:false, meta:false })
    setContent(initialContent)
    setPlans(initialPlans)
    setProductData(products)
    toast('Google workspace disconnected. Local preview mode restored.')
  }

  const generate = () => {
    if (!generator.title.trim() || !generator.brief.trim()) { toast('Add a title and verified facts first.'); return }
    setOutput(buildSmartDraft(generator))
    toast('Brutti-style caption generated. Use Smart Rewrite to refine it inside this website.')
  }

  const saveGeneratedDraft = async () => {
    if (!output) return
    const checks = getRuleChecks(output, generator.brief)
    const passed = checks.filter((check) => !check.review).every((check) => check.pass)
    let item = { id:workspaceActive ? crypto.randomUUID() : Date.now(), title:generator.title, platform:generator.platform, type:generator.type, product:generator.product, language:generator.language, tone:generator.tone, aiReview:passed ? 'Rule Check Passed' : 'Human Review Required', stage:'Draft', updatedAt:formatTimestamp(), copy:output, driveFileId:generator.driveFileId || '', assetName:generator.assetName || '', driveLink:generator.driveLink || '' }
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
  const openNewPlan = (date = localDateKey(), idea) => setActivePlan({ id:null, title:idea?.title || '', date:date || localDateKey(), channel:'Facebook', type:idea?.pillar?.includes('Educational') ? 'Educational' : 'Brand Awareness', status:'Idea', product:'General / No Product' })
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
      const published = {...item, stage:'Published', aiReview:'Rule Check Passed', publishLink:result.publishLink || '', updatedAt:formatTimestamp()}
      setContent((items) => items.map((current) => current.id === item.id ? published : current))
      setActiveContent(null)
      toast(`Published to Facebook successfully: ${result.postId}`)
    } catch (error) { toast(error.message) }
  }
  const useProduct = (product) => { const details = [product.price, product.material, product.dimensions, product.colour].filter(Boolean).join('; '); setGenerator((form) => ({...form, product:product.name, title:`${product.name} – Product Highlight`, type:'Product Highlight', brief:details || form.brief})); setPage('studio'); setOutput(''); window.scrollTo({top:0}) }
  const useAsset = (asset) => { setGenerator((form) => ({...form, driveFileId:asset.id || '', assetName:asset.name || '', driveLink:asset.url || ''})); setPage('studio'); setOutput(''); window.scrollTo({top:0}); toast(`${asset.name} attached to the next content draft.`) }
  const syncProducts = async () => { setSyncingProducts(true); try { const result = await syncNotionProducts(); setProductData(result.products?.length ? result.products : productData); toast(`${result.products?.length || 0} verified products synced from Notion.`) } catch (error) { toast(error.message) } finally { setSyncingProducts(false) } }
  const usePrompt = (item) => { setGenerator((form) => ({...form, title:item.title, type:item.type.includes('Facebook') ? 'Brand Awareness' : form.type, brief:item.description})); setPage('studio'); setOutput(''); window.scrollTo({top:0}); toast(`${item.title} prompt loaded into Content Studio.`) }
  const resetWorkspace = () => { setContent(initialContent); setPlans(initialPlans); setProductData(products); toast('Local demo data restored.') }

  const pages = useMemo(() => ({
    dashboard: <Dashboard content={content} plans={plans} navigate={setPage} openContent={setActiveContent} newContent={newContent} newPlan={() => openNewPlan()} />,
    studio: <ContentStudio content={content} deleteContent={deleteContent} generator={generator} setGenerator={setGenerator} output={output} setOutput={setOutput} generate={generate} saveDraft={saveGeneratedDraft} openContent={setActiveContent} workspaceActive={workspaceActive} toast={toast} productOptions={productData} />,
    planner: <CampaignPlanner plans={plans} openPlan={setActivePlan} newPlan={openNewPlan} deletePlan={deletePlan} />,
    brand: <BrandLibrary />,
    products: <ProductLibrary onUseProduct={useProduct} productData={productData} workspaceActive={workspaceActive} notionActive={integrations.notion} onSyncNotion={syncProducts} syncing={syncingProducts} />,
    assets: <AssetLibrary toast={toast} workspaceActive={workspaceActive} driveActive={integrations.drive} onUseAsset={useAsset} />,
    'ai-tools': <AITools onUsePrompt={usePrompt} />,
    analytics: <Analytics content={content} plans={plans} productData={productData} integrations={integrations} />,
    settings: <Settings toast={toast} resetWorkspace={resetWorkspace} workspaceActive={workspaceActive} integrations={integrations} onRefreshIntegrations={refreshIntegrations} onConnect={connectWorkspace} onDisconnect={disconnectWorkspace} />,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [page, content, plans, generator, output, workspaceActive, integrations, productData, syncingProducts])

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} workspaceActive={workspaceActive} counts={{content:content.length,products:productData.length}}/>
      <div className="app-main"><Topbar setOpen={setSidebarOpen} workspaceActive={workspaceActive}/><main>{pages[page]}</main><footer><span>BRUTTI AI Marketing Hub</span><span>{workspaceActive ? 'Google workspace · Free Assist · Human-approved publishing' : 'Free Assist local mode · Connect Google to save shared records'}</span></footer></div>
      {activeContent ? <ContentEditor item={activeContent} onClose={() => setActiveContent(null)} onSave={saveContent} onPublish={publishContent} toast={toast} workspaceActive={workspaceActive}/> : null}
      {activePlan ? <PlanEditor item={activePlan} onClose={() => setActivePlan(null)} onSave={savePlan} onDelete={deletePlan} productOptions={productData}/> : null}
      <div className={`toast ${toastMessage ? 'show' : ''}`}><span className="pulse-dot"/>{toastMessage}</div>
    </div>
  )
}

export default App
