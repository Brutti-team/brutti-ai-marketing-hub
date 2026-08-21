import { BRUTTI_SOUL, SOUL_SOURCE_LABEL } from './bruttiSoulSource'

const DIRECTION_RE = /buat caption|susun caption|gaya caption|tone|mulakan dengan|kemudian sambung|fokus (pada|kepada)|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan|jangan reka|jangan hard sell|tidak hard sell|bukan hard sell|jangan menjual|tidak menjual|non-selling|new hook|new cta|minimum|maksimum|baris/i

const UNSUPPORTED_RE = /\b(RM\s?\d|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|no\.?\s?1|terbaik|sold|reach|views?|followers?)\b/i

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sentence(value = '') {
  const next = clean(value).replace(/[.!?]+$/g, '')
  if (!next) return ''
  return `${next.charAt(0).toUpperCase()}${next.slice(1)}.`
}

function stableIndex(value = '', length = 1) {
  if (!length) return 0
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function splitFacts(value = '') {
  return String(value || '')
    .split(/\n+|\s*;\s*|(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean)
    .filter((line) => !DIRECTION_RE.test(line))
    .map(sentence)
    .filter(Boolean)
    .slice(0, 8)
}

function verifiedClaimAllowed(line, verifiedText) {
  if (!UNSUPPORTED_RE.test(line)) return true
  const claim = clean(line).toLowerCase()
  const facts = clean(verifiedText).toLowerCase()
  const tokens = claim.match(/rm\s?\d+[\d,.]*|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|sold|reach|views?|followers?/gi) || []
  return tokens.every((token) => facts.includes(token.toLowerCase()))
}

function subjectFor(form) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'cerita Brutti ni'
}

function languageKey(form) {
  return form.language === 'English' ? 'en' : 'bm'
}

function buildOpening(form, mode, variation) {
  const subject = subjectFor(form)
  const type = form.type || 'Brand Awareness'
  const key = `${form.title}|${form.brief}|${form.product}|${type}|${mode}|${variation}`
  const choices = languageKey(form) === 'en'
    ? [
        `${subject} has a real story behind it, so that is where we start.`,
        `For this ${type.toLowerCase()} post, the focus stays on what is actually verified about ${subject}.`,
        `Before adding anything extra, here is the real story we can confirm about ${subject}.`,
      ]
    : [
        `${subject} ni ada cerita dia sendiri, jadi kita mula dari benda yang memang sudah confirm.`,
        `Untuk ${type.toLowerCase()} kali ni, fokus kita terus pada cerita sebenar pasal ${subject}.`,
        `Sebelum tambah macam-macam, kita cerita dulu apa yang memang sudah confirm pasal ${subject}.`,
      ]

  let line = choices[(stableIndex(key, choices.length) + Number(variation || 0)) % choices.length]
  if (mode === 'engaging') line = languageKey(form) === 'en' ? `What is the real story behind ${subject}?` : `Apa sebenarnya cerita di belakang ${subject} ni? 👀`
  if (mode === 'casual') line = languageKey(form) === 'en' ? `Okay, this time we are talking about ${subject}.` : `Nah, kali ni kita cerita pasal ${subject} dulu bah.`
  if (mode === 'professional') line = languageKey(form) === 'en' ? `This post focuses on the verified story and purpose of ${subject}.` : `Kali ini, fokus diberikan kepada cerita dan tujuan ${subject} berdasarkan fakta yang telah disahkan.`
  if (mode === 'hook') line = languageKey(form) === 'en' ? `There is more to ${subject} than the first thing you see.` : `${subject} ni bukan setakat apa yang nampak di depan mata. 👀`
  return sentence(line)
}

function supportLines(form, mode) {
  const en = languageKey(form) === 'en'
  const type = form.type || 'Brand Awareness'
  const lines = []

  if (type === 'Product Highlight') {
    lines.push(en ? 'We keep the focus on function, context and the details the team has actually confirmed.' : 'Kita fokus pada fungsi, konteks dan detail yang team memang sudah confirm.')
  } else if (type === 'Behind the Scenes') {
    lines.push(en ? 'The point is to show the real process, not make the work look more perfect than it is.' : 'Yang penting, tunjuk proses sebenar — bukan kasi nampak semua benda perfect.')
  } else if (type === 'Customer Story') {
    lines.push(en ? 'The customer need stays at the centre of the story.' : 'Keperluan sebenar customer tetap jadi pusat cerita ni.')
  } else if (type === 'Educational') {
    lines.push(en ? 'Keep the useful point simple enough to apply in a real space.' : 'Point yang berguna tu kita kasi simple supaya senang dipakai dalam situasi sebenar.')
  } else if (type === 'Promotion') {
    lines.push(en ? 'Any price, offer period or promotion detail must stay exactly within the verified information.' : 'Kalau ada harga, tempoh atau promo, semua detail mesti ikut info yang sudah confirm.')
  } else {
    lines.push(en ? 'The story should feel human and useful, not like a generic marketing template.' : 'Cerita dia mesti rasa human dan berguna, bukan macam template marketing biasa.')
  }

  if (mode === 'professional') {
    lines.push(en ? 'The wording stays clear, measured and consistent with Brutti’s approved brand direction.' : 'Susunan ayat dikekalkan jelas, kemas dan selaras dengan direction Brutti yang diluluskan.')
  } else {
    lines.push(en ? 'If a detail is not confirmed, it stays out of the caption.' : 'Kalau ada detail yang belum confirm, kita tidak kasi masuk dalam caption.')
  }

  return lines.map(sentence)
}

function closingFor(form, mode, variation) {
  const en = languageKey(form) === 'en'
  const type = form.type || 'Brand Awareness'
  if (mode === 'cta') return sentence(en ? 'If you want to check the details, message the Brutti team and we can go through them together.' : 'Kalau mau check detail dia, mesej ja team Brutti — kita tinguk sama-sama.')
  if (type === 'Educational') return sentence(en ? 'Save this as a reference if it is useful for your next planning session.' : 'Kalau berguna, simpan ja dulu untuk rujukan masa planning nanti.')
  if (type === 'Behind the Scenes') return sentence(en ? 'That is one small part of the real work behind Brutti.' : 'Yang ni salah satu cerita kecil di belakang kerja sebenar team Brutti.')
  if (type === 'Customer Story') return sentence(en ? 'Different spaces need different answers, and that is why the real story matters.' : 'Lain ruang, lain jawapan dia — sebab tu cerita sebenar customer memang penting.')
  const options = en
    ? ['If you want to know more, message the Brutti team and we can check the verified details together.', 'The next step is simple: keep the story useful, accurate and easy to understand.']
    : ['Kalau mau tahu lebih lanjut, mesej ja team Brutti dan kita check detail yang sudah confirm sama-sama.', 'Yang penting, cerita dia kekal berguna, tepat dan senang orang faham.']
  return sentence(options[Number(variation || 0) % options.length])
}

function enforceShape(lines, verifiedText, mode) {
  const unique = []
  let emojiCount = 0
  for (const raw of lines) {
    let line = clean(raw)
    if (!line || unique.includes(line)) continue
    if (!verifiedClaimAllowed(line, verifiedText)) continue
    line = line.replace(/\p{Extended_Pictographic}/gu, (emoji) => {
      emojiCount += 1
      return emojiCount <= 3 ? emoji : ''
    }).trim()
    if (line) unique.push(line)
  }

  const minLines = mode === 'shorten' ? 7 : 8
  const maxLines = mode === 'shorten' ? 8 : 13
  const fillers = languageKey({ language: '' }) === 'en' ? [] : []
  while (unique.length < minLines) {
    const additions = [
      'Fakta yang belum confirm memang kita tinggalkan dulu.',
      'Biar ayat santai, tapi maksud asal jangan lari.',
      'Cerita sebenar lebih penting daripada bunyi terlalu menjual.',
      'Yang kita mau orang nampak ialah cerita dan kegunaan yang betul-betul ada.',
    ]
    const next = additions.find((line) => !unique.includes(line))
    if (!next) break
    unique.splice(Math.max(1, unique.length - 1), 0, next)
  }
  void fillers
  return unique.slice(0, maxLines)
}

export function buildFastSavePrompt(form, mode = 'balanced', variation = 0) {
  return [
    'You are the Brutti Free Assist writing engine.',
    `Source of truth: ${SOUL_SOURCE_LABEL}.`,
    'Use Brutti Soul Master for voice, storytelling principles and red lines; do not invent facts from it for the specific post unless those facts are explicitly relevant and verified.',
    `Platform: ${form.platform || 'Facebook'}`,
    `Content type: ${form.type || 'Brand Awareness'}`,
    `Subject/product: ${subjectFor(form)}`,
    `Language: ${form.language || 'Bahasa Melayu'}`,
    `Tone: ${form.tone || 'Brutti Sabahan Casual'}`,
    `Rewrite mode: ${mode}; variation: ${variation}`,
    `Verified facts/direction: ${clean(form.brief)}`,
    'Output only the caption body. Use 7–13 content lines, natural Brutti Sabahan rhythm when BM is selected, minimal emoji, no excessive repetition, and one natural CTA when relevant.',
    'Never invent price, promotion, stock, delivery, dimensions, KPI, performance claim, award, customer result or product feature.',
    'Human approval is required before publishing.',
    `Soul guardrails: ${clean(BRUTTI_SOUL.redLines).slice(0, 1200)}`,
  ].join('\n')
}

export function buildFastSaveDraft(form, mode = 'balanced', variation = 0) {
  const facts = splitFacts(form.brief)
  const opening = buildOpening(form, mode, variation)
  const support = supportLines(form, mode)
  const closer = closingFor(form, mode, variation)

  const lines = [opening, ...facts, ...support, closer]
  const shaped = enforceShape(lines, form.brief, mode)

  if (form.language === 'English') {
    return shaped.map((line) => line
      .replace('Fakta yang belum confirm memang kita tinggalkan dulu.', 'Any detail that is not confirmed stays out for now.')
      .replace('Biar ayat santai, tapi maksud asal jangan lari.', 'The wording can stay natural without changing the original meaning.')
      .replace('Cerita sebenar lebih penting daripada bunyi terlalu menjual.', 'The real story matters more than sounding overly promotional.')
      .replace('Yang kita mau orang nampak ialah cerita dan kegunaan yang betul-betul ada.', 'The goal is to make the real story and useful details easy to see.'))
      .join('\n')
  }

  return shaped.join('\n')
}

export function fastSaveEngineMeta(form, mode = 'balanced', variation = 0) {
  return {
    engine: 'Fast Save Assist Engine',
    source: SOUL_SOURCE_LABEL,
    prompt: buildFastSavePrompt(form, mode, variation),
    verifiedFactCount: splitFacts(form.brief).length,
    legacyTemplateBankUsed: false,
  }
}
