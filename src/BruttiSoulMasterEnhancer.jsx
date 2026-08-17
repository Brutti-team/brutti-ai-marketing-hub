import { useEffect } from 'react'
import soulMasterMarkdown from './Brutti_Soul_MasterDoc.md?raw'

const soulSource = {
  title: 'BRUTTI Soul Master',
  evidence: '3,436 real Brutti posts · Oct 2020–Jun 2026 · verified by Lukman',
  soul: 'Bisnes sebenar, orang sebenar, bahasa sendiri — craft Sabah yang jujur, berjiwa dan angkat maruah artisan.',
  pillars: [
    'Kisah artisan & gaji/maruah',
    'Cerita di sebalik satu piece',
    'Momen jujur / vulnerable founder',
    'Babak lucu harian',
  ],
}

const soulIdeas = [
  {
    pillar: '01 · Artisan & maruah',
    title: 'Siapa orang di belakang piece hari ni?',
    type: 'Customer Story',
    direction: 'Masukkan nama artisan sebenar, latar ringkas dia, apa yang dia buat hari ini, dan satu detail jujur tentang usaha atau perkembangan dia. Elakkan label umum seperti staff kami.',
  },
  {
    pillar: '02 · Story behind the piece',
    title: 'Kenapa piece ni wujud?',
    type: 'Product Highlight',
    direction: 'Masukkan nama piece sebenar, siapa yang request, masalah atau keperluan ruang, detail proses yang memang disahkan, dan momen serah jika ada.',
  },
  {
    pillar: '03 · Founder vulnerable',
    title: 'Apa benda yang kami belajar cara susah minggu ni?',
    type: 'Brand Awareness',
    direction: 'Masukkan satu kejadian sebenar: silap, delay, benda yang bikin sebak, menyesal, syukur atau pengajaran. Cerita apa jadi dan apa yang kami buat selepas tu.',
  },
  {
    pillar: '04 · Babak lucu harian',
    title: 'Apa benda paling random jadi di Brutti hari ni?',
    type: 'Behind the Scenes',
    direction: 'Masukkan satu babak lucu sebenar di kilang atau office. Kalau Faznur terlibat, tulis apa yang dia buat atau cakap secara real. Humor biar datang dari kejadian, bukan lawak yang direka.',
  },
  {
    pillar: 'Origin',
    title: 'Dari last option untuk survive sampai hari ni',
    type: 'Brand Awareness',
    direction: 'Gunakan fakta Soul Master tentang Brutti bermula 11 Oktober 2020 masa PKP, dari hobi woodworking dan metalworking selepas car wash terpaksa tutup. Tambah satu reflection semasa yang benar sebelum post.',
  },
  {
    pillar: 'Transparency',
    title: 'Benda yang brand lain mungkin sorok, kami cerita',
    type: 'Educational',
    direction: 'Pilih satu perkara sebenar yang boleh dikongsi secara telus: cabaran, kesilapan, kos, proses atau keputusan. Gunakan angka hanya kalau memang sudah disahkan.',
  },
  {
    pillar: 'Craft & purpose',
    title: 'Bukan sekadar kasi penuh ruang',
    type: 'Product Highlight',
    direction: 'Pilih satu piece sebenar dan terangkan kenapa fungsi atau cerita dia penting kepada client. Jangan jadikan post sebagai senarai feature semata-mata.',
  },
  {
    pillar: 'Brutti Builders',
    title: 'Furniture berkembang jadi ruang yang lengkap',
    type: 'Brand Awareness',
    direction: 'Gunakan fakta Soul Master bahawa Brutti kini berkembang ke interior design + build melalui Brutti Builders. Tambah satu project, proses atau perkembangan semasa yang sudah disahkan.',
  },
]

const metaInstructionPattern = /\b(?:masukkan|tambahkan|pilih|gunakan|ceritakan|terangkan|jelaskan|tulis|buat|fokus|jangan|elakkan|add|insert|choose|use|tell|explain|write|focus|do not|avoid)\b/i
const sabahPattern = /\b(?:bah|la|ni|tu|kan|sia|bikin|ngam|antam|teda|tinguk|kasi|sapotan|mau|nda|kamurang)\b/i
const firstPersonPattern = /\b(?:kami|sia|aku|saya|we|our|i)\b/i

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function stableIndex(value, length) {
  if (!length) return 0
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  return Math.abs(hash) % length
}

function sentence(value = '') {
  const next = clean(value).replace(/#+\S*/g, '').trim()
  if (!next) return ''
  const cased = next.charAt(0).toUpperCase() + next.slice(1)
  return /[.!?…]$/.test(cased) ? cased : `${cased}.`
}

function extractVerifiedLines(direction = '') {
  const chunks = String(direction || '')
    .replace(/\r/g, '')
    .split(/\n+|(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean)
    .filter((line) => !/^brutti soul idea/i.test(line))
    .filter((line) => !/^tambahkan fakta/i.test(line))
    .filter((line) => !metaInstructionPattern.test(line))
    .map(sentence)
    .filter(Boolean)
  return chunks.slice(0, 4)
}

function emojiCount(value = '') {
  return (String(value).match(/\p{Extended_Pictographic}/gu) || []).length
}

function select(pool, seed, offset = 0) {
  return pool[(seed + offset) % pool.length]
}

const bmOpeners = {
  'Brand Awareness': [
    'Hari ni kami teringat balik kenapa Brutti ni wujud.',
    'Ada benda dalam bisnes ni yang kami nda mau kasi hilang.',
    'Dari belakang rumah sampai hari ni, satu benda kami masih pegang.',
  ],
  'Product Highlight': [
    'Hari ni satu lagi piece masuk meja cerita kami.',
    'Tadi kami tinguk piece ni, terus teringat satu benda.',
    'Nama dia mungkin simple, tapi cerita dia selalunya bukan setakat nama.',
  ],
  Educational: [
    'Benda ni nampak simple, tapi selalu bikin orang pening bila susun ruang.',
    'Hari ni kami mau share benda yang kami sendiri selalu nampak masa kerja.',
    'Satu benda yang kami belajar: ruang yang cantik belum tentu senang dipakai.',
  ],
  'Behind the Scenes': [
    'Pagi ni di kilang, ada satu babak yang orang luar jarang nampak.',
    'Orang selalu nampak hasil siap. Yang belakang tabir ni lain cerita dia.',
    'Tadi kami berdiri di kilang dan tinguk proses ni jalan satu-satu.',
  ],
  'Customer Story': [
    'Satu ruang, satu cerita.',
    'Hari ni kami teringat satu request customer yang bikin kami fikir.',
    'Kadang satu ayat customer sudah cukup kasi nampak apa ruang tu perlukan.',
  ],
  Promotion: [
    'Yang ni kami cerita terus terang ja.',
    'Kalau pasal offer, kami suka kasi jelas dari awal.',
    'Hari ni ada benda yang kami mau share, tapi fakta dulu baru hype.',
  ],
}

const enOpeners = {
  'Brand Awareness': [
    'Today we were reminded why Brutti exists in the first place.',
    'There is one thing we never want Brutti to lose.',
    'From a backyard start to today, one thing still matters to us.',
  ],
  'Product Highlight': [
    'Today, one piece has a story worth telling.',
    'We looked at this piece today and one thing came to mind.',
    'The name may be simple, but the story behind a piece usually is not.',
  ],
  Educational: [
    'This looks simple, but it is something we see people struggle with often.',
    'Here is one thing we keep noticing while making and installing furniture.',
    'One thing we have learned: a nice-looking space still has to work in real life.',
  ],
  'Behind the Scenes': [
    'This morning at the workshop, there was a moment people do not usually see.',
    'Most people see the finished piece. The part before that is another story.',
    'We stood in the workshop today and watched the process move step by step.',
  ],
  'Customer Story': [
    'One space, one story.',
    'Today we remembered a customer request that made us think.',
    'Sometimes one sentence from a customer tells us what the space really needs.',
  ],
  Promotion: [
    'We will keep this one straightforward.',
    'When there is an offer, we would rather make the real details clear first.',
    'There is something to share today, but facts come before hype.',
  ],
}

const bmSupport = {
  'Brand Awareness': [
    'Kami bukan mau bunyi macam brand yang jauh-jauh dari orang.',
    'Kami cuma dokumentasikan bisnes sebenar, orang sebenar, dalam bahasa kami sendiri.',
    'Artisan di belakang setiap piece tu lagi penting dari ayat marketing yang sedap bunyi.',
    'Kalau silap, kami cerita. Kalau belum confirm, kami nda mau pandai-pandai tambah.',
    'Kami nda kejar jadi paling besar. Kami mau kerja ni kekal ada jiwa.',
  ],
  'Product Highlight': [
    'Kalau kami cerita pasal satu piece, kami suka mula dengan kenapa dia wujud.',
    'Bukan kasi penuh ruang ja — kami mau dia ngam dengan cara orang guna ruang tu.',
    'Setiap piece patut ada sebab, fungsi dan cerita dia sendiri.',
    'Kalau detail belum confirm, kami kasi tinggal dulu daripada tambah cerita.',
    'Cerita sebenar piece ni lagi penting dari hard sell panjang-panjang.',
  ],
  Educational: [
    'Kami nda mau kasi lecture panjang-panjang bah.',
    'Kami share benda yang betul-betul kami nampak masa bikin, ukur dan pasang furniture.',
    'Kalau satu tip boleh bikin rutin harian lebih senang, itu sudah cukup berguna.',
    'Yang penting fungsi dulu, lepas tu baru fikir rupa dia.',
    'Kalau ada benda belum pasti, check dulu. Jangan kasi content mendahului fakta.',
  ],
  'Behind the Scenes': [
    'Di belakang setiap piece ada tangan orang yang bikin dia jadi.',
    'Kami panggil mereka artisan, bukan pekerja kilang.',
    'Kadang benda nda jadi sekali try. Itu memang sebahagian dari kerja tangan.',
    'Kalau ada silap, kami betulkan dulu — bukan kasi sorok.',
    'Proses ni yang bagi setiap piece cerita dia sendiri.',
  ],
  'Customer Story': [
    'Setiap client datang dengan cara guna ruang yang lain-lain.',
    'Kami dengar dulu apa yang dia betul-betul perlu.',
    'Dari situ barula satu piece ada sebab untuk wujud.',
    'Bila cerita customer jelas, senang kami jaga fungsi tanpa bikin benda generic.',
    'Momen paling best selalunya bila hasil tu betul-betul masuk dalam hidup orang.',
  ],
  Promotion: [
    'Apa yang ada, kami cakap ada. Yang belum confirm, kami nda mau tambah.',
    'Kami masih mau post ni bunyi macam manusia, bukan poster jualan berjalan.',
    'Kalau ada angka atau tarikh, mesti datang dari sumber yang sudah confirm.',
    'Simple ja — bagi orang faham apa yang real dulu.',
    'Trust lagi mahal dari satu post yang terlalu hype.',
  ],
}

const enSupport = {
  'Brand Awareness': [
    'We do not want Brutti to sound like a brand speaking from a distance.',
    'We document a real business, real people and the way we actually speak.',
    'The artisan behind a piece matters more than polished marketing language.',
    'If we make a mistake, we talk about it. If something is not confirmed, we do not invent it.',
    'We are not chasing the biggest name. We want the work to keep its soul.',
  ],
  'Product Highlight': [
    'When we talk about a piece, we would rather start with why it exists.',
    'It should not only fill a space; it should fit the way someone actually uses that space.',
    'Every piece should have a reason, a function and a story.',
    'If a detail is not confirmed, we leave it out instead of filling the gap.',
    'The real story behind the piece matters more than a hard-sell paragraph.',
  ],
  Educational: [
    'We are not here to give a long lecture.',
    'We share what we actually see while making, measuring and installing furniture.',
    'If one tip makes everyday use easier, that is already useful.',
    'Function comes first; the look should support it.',
    'If something is uncertain, we check it before the content goes out.',
  ],
  'Behind the Scenes': [
    'Behind every piece, there are people making it happen by hand.',
    'We call them artisans, not factory workers.',
    'Sometimes a piece does not work on the first try. That is part of handmade work.',
    'If something goes wrong, we fix it instead of hiding it.',
    'The process is part of what gives each piece its story.',
  ],
  'Customer Story': [
    'Every customer uses a space differently.',
    'We listen to what they genuinely need before deciding the direction.',
    'That is when a piece starts to have a reason to exist.',
    'A clear customer story helps us avoid making something generic.',
    'The best moment is when the finished piece genuinely becomes part of daily life.',
  ],
  Promotion: [
    'If it is available, we say it is. If it is not confirmed, we do not add it.',
    'We still want this to sound human, not like a walking sales poster.',
    'Any number or date needs to come from a confirmed source.',
    'Keep the real information clear first.',
    'Trust matters more than making one post sound extra exciting.',
  ],
}

const bmCtas = [
  'Kalau kamurang mau kami cerita lebih banyak benda macam ni, kasi tau ja.',
  'Kamu pula, part mana yang paling kamu mau tinguk?',
  'Kalau ada ruang atau piece yang kamu mau kami cerita betul-betul, roger ja team.',
  'Yang penting, cerita dia real dulu. Baru sedap mau share.',
]

const enCtas = [
  'If you want more stories like this, tell us what you want to see next.',
  'Which part of the story would you want us to show more of?',
  'If there is a space or piece you want us to talk about properly, message the team.',
  'The story has to be real first. Then it is worth sharing.',
]

function productHook(product, language, seed) {
  if (!product || product === 'General / No Product') return ''
  if (language === 'English') {
    return select([
      `${product}. Today we are telling the story behind this piece.`,
      `${product} came up in our work today, and there is more to it than the name.`,
      `Today, ${product} is the piece on our mind.`,
    ], seed)
  }
  return select([
    `${product}. Hari ni kami mau cerita sikit pasal piece ni.`,
    `${product} masuk kerja kami hari ni, dan cerita dia bukan setakat nama.`,
    `Hari ni nama ${product} pula naik dalam cerita kami.`,
  ], seed)
}

function professionalise(line) {
  return line
    .replace(/\bnda\b/gi, 'tidak')
    .replace(/\bmau\b/gi, 'mahu')
    .replace(/\bkasi\b/gi, 'bagi')
    .replace(/\bkamurang\b/gi, 'kamu')
    .replace(/\bbah\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function buildSoulCaption(form, mode = 'balanced', variation = 0) {
  const language = form.language === 'English' ? 'English' : 'BM'
  const type = form.type || 'Brand Awareness'
  const seed = stableIndex(`${form.title}|${form.product}|${type}|${form.brief}|${mode}|${variation}`, 997)
  const facts = extractVerifiedLines(form.brief)
  const metaOnly = Boolean(clean(form.brief)) && !facts.length
  const openers = language === 'English' ? enOpeners : bmOpeners
  const support = language === 'English' ? enSupport : bmSupport
  const ctas = language === 'English' ? enCtas : bmCtas
  const targetLines = mode === 'shorten' ? 7 : 9
  const lines = []

  const namedHook = type === 'Product Highlight' ? productHook(form.product, language, seed + variation) : ''
  let opener = namedHook || select(openers[type] || openers['Brand Awareness'], seed, variation)
  if (mode === 'engaging') {
    opener = language === 'English'
      ? select(['What happened today that is actually worth telling?', 'One real moment can say more than ten sales lines.', 'What is the story people usually do not see?'], seed, variation)
      : select(['Apa benda yang jadi hari ni sampai memang layak diceritakan?', 'Satu momen real kadang lagi kuat dari sepuluh ayat sales.', 'Apa cerita yang orang selalu nda nampak di belakang benda ni?'], seed, variation)
  } else if (mode === 'casual') {
    opener = language === 'English'
      ? select(['Okay, this one is a real-life Brutti story.', 'Today was one of those very Brutti days.', 'Here is the simple version of what happened today.'], seed, variation)
      : select(['Okay, yang ni memang cerita Brutti betul-betul bah.', 'Hari ni jenis hari yang bikin kami bilang, nah ini baru Brutti 🤣', 'Kami cerita versi simple ja apa yang jadi hari ni.'], seed, variation)
  } else if (mode === 'professional' && language !== 'English') {
    opener = professionalise(opener)
  } else if (mode === 'hook') {
    opener = language === 'English'
      ? select(['TODAY.', 'ONE NAME.', 'A REAL STORY FROM THE WORKSHOP.'], seed, variation)
      : select(['HARI NI.', 'SATU NAMA.', 'CERITA BETUL DARI KILANG.'], seed, variation)
  }
  lines.push(opener)

  if (facts.length) lines.push(...facts)
  if (metaOnly) {
    lines.push(language === 'English'
      ? 'Before this goes out, we still need one real name, moment or verified detail from today.'
      : 'Sebelum post keluar, kami masih perlukan satu nama, momen atau fakta sebenar dari hari ni.')
  }

  const pool = support[type] || support['Brand Awareness']
  let cursor = (seed + variation * 3) % pool.length
  while (lines.length < targetLines - 1) {
    let next = pool[cursor % pool.length]
    if (mode === 'professional' && language !== 'English') next = professionalise(next)
    if (!lines.includes(next)) lines.push(next)
    cursor += 2
    if (lines.length >= targetLines - 1) break
  }

  let cta = select(ctas, seed, variation + (mode === 'cta' ? 2 : 0))
  if (mode === 'professional' && language !== 'English') cta = professionalise(cta)
  lines.push(cta)

  let caption = lines.filter(Boolean).slice(0, 13).join('\n')
  caption = caption.replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, '$1').replace(/[ \t]+\n/g, '\n').trim()
  if (emojiCount(caption) === 0 && mode !== 'professional') {
    const rows = caption.split('\n')
    const index = Math.min(1, rows.length - 1)
    rows[index] = `${rows[index]} 👀`
    caption = rows.join('\n')
  }
  return caption
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

function setReactChecked(element, value) {
  if (!element) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'checked')?.set
  if (setter) setter.call(element, value)
  else element.checked = value
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function findNavButton(label) {
  return [...document.querySelectorAll('#root .nav-link')]
    .find((button) => button.querySelector('span')?.textContent?.trim() === label)
}

function findActivePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === title)
}

function findLabelControl(root, labelText, selector) {
  const label = [...root.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelText))
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

function formState(page) {
  return {
    title: findLabelControl(page, 'Content title', 'input')?.value || '',
    type: findLabelControl(page, 'Content type', 'select')?.value || 'Brand Awareness',
    product: findLabelControl(page, 'Product', 'select')?.value || 'General / No Product',
    language: findLabelControl(page, 'Language', 'select')?.value || 'Bahasa Melayu',
    brief: findLabelControl(page, 'Verified facts / direction', 'textarea')?.value || '',
  }
}

function setFirstTextNode(button, value) {
  if (!button) return
  const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
  if (textNode) textNode.textContent = value
}

function soulChecks(caption, brief) {
  const lines = String(caption || '').split('\n').map(clean).filter(Boolean)
  const first = lines[0] || ''
  const genericHook = /^(?:new product|product highlight|brand awareness|promo hebat|promotion|educational)/i.test(first)
  const realLines = extractVerifiedLines(brief)
  return [
    ['Story/name/scene hook', Boolean(first) && !genericHook],
    ['Lukman first-person voice', firstPersonPattern.test(caption)],
    ['Sabahan language present', sabahPattern.test(caption) || /English/.test('')],
    ['Short one-line rhythm', lines.length >= 7 && lines.length <= 13 && lines.every((line) => line.length <= 180)],
    ['Emoji controlled (max 3)', emojiCount(caption) <= 3],
    ['No hashtag block', !/#\w/u.test(caption)],
    ['Real detail supplied', realLines.length > 0],
  ]
}

function updateSoulChecklist(page) {
  const output = page.querySelector('.output-editor-label textarea')
  if (!output) return
  let panel = page.querySelector('.soul-checklist')
  if (!panel) {
    panel = document.createElement('section')
    panel.className = 'soul-checklist'
    const checks = page.querySelector('.ai-checks')
    if (checks) checks.insertAdjacentElement('afterend', panel)
    else page.querySelector('.generator-output')?.append(panel)
  }
  const brief = findLabelControl(page, 'Verified facts / direction', 'textarea')?.value || ''
  const checks = soulChecks(output.value, brief)
  const html = `<div class="soul-checklist-head"><strong>Brutti Soul check</strong><span>Master source active</span></div>${checks.map(([label, pass]) => `<span class="${pass ? 'pass' : 'flag'}">${pass ? '✓' : '!'} ${label}</span>`).join('')}`
  if (panel.innerHTML !== html) panel.innerHTML = html
}

async function replaceOutputWithSoul(page, mode = 'balanced', variation = 0) {
  const form = formState(page)
  const output = await waitFor(() => page.querySelector('.output-editor-label textarea'))
  if (!output) return
  const caption = buildSoulCaption(form, mode, variation)
  setReactValue(output, caption)
  updateSoulChecklist(page)
}

async function loadSoulIdea(idea) {
  findNavButton('Content Studio')?.click()
  const page = await waitFor(() => findActivePage('Content Studio'))
  if (!page) return
  const freeAssist = [...page.querySelectorAll('.tab-bar button')]
    .find((button) => /free assist/i.test(button.textContent || ''))
  freeAssist?.click()
  await waitFor(() => page.querySelector('.generator-form'))

  setReactValue(findLabelControl(page, 'Content title', 'input'), idea.title)
  setReactValue(findLabelControl(page, 'Content type', 'select'), idea.type)
  setReactValue(findLabelControl(page, 'Product', 'select'), 'General / No Product')
  setReactValue(findLabelControl(page, 'Verified facts / direction', 'textarea'), `BRUTTI SOUL IDEA — ${idea.pillar}\nTambahkan fakta sebenar sebelum generate.\n${idea.direction}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openMasterModal() {
  document.querySelector('.soul-master-modal-backdrop')?.remove()
  const backdrop = document.createElement('div')
  backdrop.className = 'soul-master-modal-backdrop'
  const modal = document.createElement('div')
  modal.className = 'soul-master-modal'
  const head = document.createElement('div')
  head.className = 'soul-master-modal-head'
  const title = document.createElement('div')
  title.innerHTML = '<span>MASTER SOURCE</span><h2>Brutti Soul Master</h2>'
  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = '×'
  close.addEventListener('click', () => backdrop.remove())
  head.append(title, close)
  const note = document.createElement('p')
  note.textContent = 'Source used by Content Studio and Brutti Soul content ideas. Edit the .md source in the repository when the brand voice changes.'
  const pre = document.createElement('pre')
  pre.textContent = soulMasterMarkdown
  modal.append(head, note, pre)
  backdrop.append(modal)
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) backdrop.remove() })
  document.body.append(backdrop)
}

function addContentStudioSource(page) {
  if (!page.querySelector('.soul-source-strip')) {
    const strip = document.createElement('section')
    strip.className = 'soul-source-strip'
    strip.innerHTML = `<div><span class="soul-live-dot"></span><div><strong>${soulSource.title} · Active source</strong><p>${soulSource.evidence}</p></div></div><div class="soul-source-rules"><span>First person</span><span>Story hook</span><span>Sabah colloquial</span><span>1–3 emoji</span><span>No hashtags</span></div>`
    page.querySelector('.page-header')?.insertAdjacentElement('afterend', strip)
  }

  const checkboxRow = page.querySelector('.checkbox-row')
  const hashtagCheckbox = checkboxRow?.querySelector('input[type="checkbox"]')
  if (hashtagCheckbox?.checked) setReactChecked(hashtagCheckbox, false)
  if (checkboxRow) checkboxRow.style.display = 'none'

  const generateButton = [...page.querySelectorAll('.generator-form button[type="submit"]')]
    .find((button) => /generate/i.test(button.textContent || ''))
  if (generateButton) {
    setFirstTextNode(generateButton, 'Generate with Brutti Soul')
    if (generateButton.dataset.soulBound !== '1') {
      generateButton.dataset.soulBound = '1'
      generateButton.addEventListener('click', () => {
        window.setTimeout(() => replaceOutputWithSoul(page, 'balanced', 0), 80)
      })
    }
  }

  const rewriteButtons = [...page.querySelectorAll('.rewrite-actions button')]
  rewriteButtons.forEach((button) => {
    const label = clean(button.textContent)
    if (/refresh hashtags/i.test(label)) {
      button.style.display = 'none'
      return
    }
    const modeMap = {
      'More engaging': 'engaging',
      'More casual': 'casual',
      'More professional': 'professional',
      'Shorter lines': 'shorten',
      'New hook': 'hook',
      'New CTA': 'cta',
    }
    const mode = modeMap[label]
    if (!mode || button.dataset.soulBound === '1') return
    button.dataset.soulBound = '1'
    button.addEventListener('click', () => window.setTimeout(() => replaceOutputWithSoul(page, mode, 0), 80))
  })

  const versionButtons = [...page.querySelectorAll('.variation-row button')]
  versionButtons.forEach((button, index) => {
    if (button.dataset.soulBound === '1') return
    button.dataset.soulBound = '1'
    button.addEventListener('click', () => window.setTimeout(() => replaceOutputWithSoul(page, 'balanced', index), 80))
  })

  const output = page.querySelector('.output-editor-label textarea')
  if (output && output.dataset.soulCheckBound !== '1') {
    output.dataset.soulCheckBound = '1'
    output.addEventListener('input', () => updateSoulChecklist(page))
    updateSoulChecklist(page)
  }

  const empty = page.querySelector('.empty-output')
  if (empty && !empty.querySelector('.soul-empty-note')) {
    const note = document.createElement('p')
    note.className = 'soul-empty-note'
    note.textContent = 'Source priority: Brutti Soul Master → verified facts → Brutti voice → human review.'
    empty.append(note)
  }
}

function addBrandSource(page) {
  if (page.querySelector('.soul-brand-panel')) return
  const panel = document.createElement('section')
  panel.className = 'panel soul-brand-panel'
  panel.innerHTML = `<div class="soul-brand-head"><div><span>BRAND SOURCE OF TRUTH</span><h2>Brutti Soul Master</h2><p>${soulSource.evidence}</p></div><button type="button" class="button secondary soul-view-source">View Master .md</button></div><div class="soul-brand-grid"><article><small>ONE-SENTENCE SOUL</small><strong>${soulSource.soul}</strong></article><article><small>VOICE</small><strong>Lukman first-person · kawan bercerita · Sabahan colloquial + sikit English</strong></article><article><small>RED LINES</small><strong>No fake handmade claims · no mass-production voice · no unsupported facts</strong></article><article><small>POST CRAFT</small><strong>Scene/name/number hook · short lines · 1–3 emoji · no hashtags</strong></article></div><div class="soul-pillars"><span>Four weekly story pillars</span>${soulSource.pillars.map((pillar, index) => `<b>${index + 1}. ${pillar}</b>`).join('')}</div>`
  panel.querySelector('.soul-view-source')?.addEventListener('click', openMasterModal)
  page.querySelector('.page-header')?.insertAdjacentElement('afterend', panel)
}

function addIdeaLibrary(page) {
  if (page.querySelector('.soul-idea-library')) return
  const section = document.createElement('section')
  section.className = 'soul-idea-library'
  section.innerHTML = `<div class="soul-idea-head"><div><span>BRUTTI SOUL CONTENT IDEAS</span><h2>Jangan mula dengan “apa mau jual?”</h2><p>Mula dengan benda real yang berlaku dan layak diceritakan. Idea di bawah datang terus dari Soul Master; tambah fakta sebenar sebelum generate.</p></div><button type="button" class="button secondary soul-view-source">View source</button></div><div class="soul-idea-grid"></div>`
  section.querySelector('.soul-view-source')?.addEventListener('click', openMasterModal)
  const grid = section.querySelector('.soul-idea-grid')
  soulIdeas.forEach((idea) => {
    const card = document.createElement('article')
    card.innerHTML = `<span>${idea.pillar}</span><h3>${idea.title}</h3><p>${idea.direction}</p><button type="button">Use this direction →</button>`
    card.querySelector('button')?.addEventListener('click', () => loadSoulIdea(idea))
    grid.append(card)
  })
  const banner = page.querySelector('.ai-banner')
  if (banner) banner.insertAdjacentElement('afterend', section)
  else page.querySelector('.page-header')?.insertAdjacentElement('afterend', section)
}

export default function BruttiSoulMasterEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let syncing = false
    const sync = () => {
      if (syncing) return
      syncing = true
      window.requestAnimationFrame(() => {
        const studio = findActivePage('Content Studio')
        if (studio) addContentStudioSource(studio)
        const brand = findActivePage('Brand Library')
        if (brand) addBrandSource(brand)
        const tools = findActivePage('AI Tools')
        if (tools) addIdeaLibrary(tools)
        syncing = false
      })
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
