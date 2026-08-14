from pathlib import Path
import re

path = Path('src/App.jsx')
text = path.read_text()

def must_replace(old, new, count=1):
    global text
    if old not in text:
        raise SystemExit('Missing expected pattern: ' + old[:160])
    text = text.replace(old, new, count)

def replace_block(start, end, replacement):
    global text
    pattern = re.compile(re.escape(start) + r'.*?(?=' + re.escape(end) + r')', re.S)
    updated, n = pattern.subn(replacement + '\n\n', text, count=1)
    if n != 1:
        raise SystemExit('Could not replace block: ' + start)
    text = updated

must_replace('  productNames,\n', '')
must_replace("import { addDays, dateFromKey, formatDateRange, formatTimestamp, localDateKey, startOfWeek, weekKeys } from './lib/dateUtils'", "import { addDays, dateFromKey, formatDateRange, formatTimestamp, greetingForNow, localDateKey, startOfWeek, weekKeys } from './lib/dateUtils'")

dashboard = '''function Dashboard({ content, plans, navigate, openContent, newContent, newPlan }) {
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
}'''
replace_block('function Dashboard(', 'const bruttiCopyBank', dashboard)

voice_bank = '''const bruttiCopyBank = {
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
}'''
replace_block('const bruttiCopyBank = {', 'function sentenceCase', voice_bank)

support_bank = '''const bruttiSupportLines = {
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
}'''
replace_block('const bruttiSupportLines = {', 'function buildSmartDraft', support_bank)

smart_draft = '''function buildSmartDraft(form, mode = 'balanced', variation = 0) {
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
}'''
replace_block('function buildSmartDraft(', 'function getRuleChecks', smart_draft)

must_replace("  const hypeFree = !hypeTerms.some((term) => text.includes(term)) && (copy.match(/!/g) || []).length <= 2", "  const hypeFree = !hypeTerms.some((term) => text.includes(term)) && (copy.match(/!/g) || []).length <= 2\n  const fillerTerms = ['ngam', 'simple', 'bah']\n  const repetitionControlled = fillerTerms.every((term) => (text.match(new RegExp(`\\\\b${term}\\\\b`, 'g')) || []).length <= 3)")
must_replace("    { label:'Brutti Facebook style aligned', pass:hypeFree },", "    { label:'Brutti Facebook style aligned', pass:hypeFree },\n    { label:'Repetition controlled', pass:repetitionControlled },")

must_replace("  const act = (stage, message) => { const next = { ...draft, stage, aiReview: stage === 'Approved' || stage === 'Published' ? 'Rule Check Passed' : 'Human Review Required', updatedAt: '14 Aug 2026, just now' };", "  const act = (stage, message) => { const next = { ...draft, stage, aiReview: stage === 'Approved' || stage === 'Published' ? 'Rule Check Passed' : 'Human Review Required', updatedAt:formatTimestamp() };")
must_replace("onSave({...draft, updatedAt:'13 Aug 2026, just now'})", "onSave({...draft, updatedAt:formatTimestamp()})")

must_replace('function PlanEditor({ item, onClose, onSave, onDelete }) {', 'function PlanEditor({ item, onClose, onSave, onDelete, productOptions }) {')
must_replace("<label>Product<select value={draft.product} onChange={update('product')}><option>General / No Product</option>{productNames.map((name) => <option key={name}>{name}</option>)}</select></label>", "<label>Product<select value={draft.product} onChange={update('product')}><option>General / No Product</option>{productOptions.map((product) => <option key={product.id || product.name} value={product.name}>{product.name}</option>)}</select></label>")
must_replace("{activePlan ? <PlanEditor item={activePlan} onClose={() => setActivePlan(null)} onSave={savePlan} onDelete={deletePlan}/> : null}", "{activePlan ? <PlanEditor item={activePlan} onClose={() => setActivePlan(null)} onSave={savePlan} onDelete={deletePlan} productOptions={productData}/> : null}")
must_replace("  const resetWorkspace = () => { setContent(initialContent); setPlans(initialPlans); toast('Local demo data restored.') }", "  const resetWorkspace = () => { setContent(initialContent); setPlans(initialPlans); setProductData(products); toast('Local demo data restored.') }")

path.write_text(text)
