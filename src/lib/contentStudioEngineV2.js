import { BRUTTI_SOUL, SOUL_SOURCE_LABEL } from './bruttiSoulSource'

const DIRECTION_RE = /buat caption|susun caption|gaya caption|tone|style caption|mulakan dengan|kemudian sambung|fokus (?:pada|kepada|posting)|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan|jangan reka|jangan tambah|jangan masukkan|jangan hard sell|tidak hard sell|bukan hard sell|jangan menjual|tidak menjual|minimum|maksimum|baris|objective|target audience|cta|content angle/i
const UNSUPPORTED_RE = /\b(RM\s?\d|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|no\.?\s?1|terbaik|sold|reach|views?|followers?|viral)\b/i

const OBJECTIVE_DEFAULTS = {
  'Brand Awareness': 'Awareness',
  'Product Highlight': 'Consideration',
  Educational: 'Education',
  'Behind the Scenes': 'Engagement',
  'Customer Story': 'Trust',
  Promotion: 'Conversion',
}

const ANGLE_DEFAULTS = {
  'Brand Awareness': 'Storytelling',
  'Product Highlight': 'Problem → Solution',
  Educational: 'Practical Tip',
  'Behind the Scenes': 'Human / Behind the Scenes',
  'Customer Story': 'Customer Journey',
  Promotion: 'Offer + Reason to Act',
}

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sentence(value = '') {
  let next = clean(value)
  if (!next) return ''
  const emojiMatch = next.match(/(\p{Extended_Pictographic})+$/u)
  const trailingEmoji = emojiMatch?.[0] || ''
  if (trailingEmoji) next = next.slice(0, -trailingEmoji.length).trim()
  const originalQuestion = /\?$/.test(next)
  next = next.replace(/[.!?]+$/g, '')
  if (!next) return trailingEmoji
  const punctuation = originalQuestion ? '?' : '.'
  return `${next.charAt(0).toUpperCase()}${next.slice(1)}${punctuation}${trailingEmoji ? ` ${trailingEmoji}` : ''}`
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
  const tokens = claim.match(/rm\s?\d+[\d,.]*|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|sold|reach|views?|followers?|viral/gi) || []
  return tokens.every((token) => facts.includes(token.toLowerCase()))
}

function subjectFor(form) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'cerita Brutti ni'
}

function isEnglish(form) {
  return form.language === 'English'
}

function strategyFor(form, controls = {}) {
  const type = form.type || 'Brand Awareness'
  return {
    objective: controls.objective && controls.objective !== 'Auto' ? controls.objective : OBJECTIVE_DEFAULTS[type] || 'Awareness',
    audience: clean(controls.audience) || 'Brutti followers and potential customers in Sabah',
    angle: controls.angle && controls.angle !== 'Auto' ? controls.angle : ANGLE_DEFAULTS[type] || 'Storytelling',
    direction: clean(controls.direction),
    ctaGoal: controls.ctaGoal && controls.ctaGoal !== 'Auto' ? controls.ctaGoal : 'Natural CTA',
    keyMessage: clean(controls.keyMessage),
  }
}

function hookPool(form, strategy, mode) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const angle = strategy.angle
  const base = []

  if (angle === 'Problem → Solution') {
    base.push(
      en ? `Sometimes the real problem is not the space — it is how ${subject} needs to work in it.` : `Kadang masalah sebenar bukan ruang tu kecil — tapi macam mana ${subject} perlu berfungsi dalam ruang tu. 👀`,
      en ? `Before choosing ${subject}, start with the problem it actually needs to solve.` : `Sebelum pilih ${subject}, tengok dulu masalah apa yang dia memang perlu selesaikan.`,
    )
  } else if (angle === 'Practical Tip') {
    base.push(
      en ? `One useful point about ${subject} can make the next decision much easier.` : `Ada satu point pasal ${subject} yang boleh kasi keputusan seterusnya jauh lebih senang. 👀`,
      en ? `Keep this simple: start with what you actually need ${subject} to do.` : `Simple ja — mula dari apa yang kamu betul-betul perlukan ${subject} buat.`,
    )
  } else if (angle === 'Human / Behind the Scenes') {
    base.push(
      en ? `The final result is only one part of the story behind ${subject}.` : `Hasil akhir tu satu bahagian ja — cerita di belakang ${subject} sebenarnya lagi banyak. 👀`,
      en ? `Here is the part of ${subject} people do not always get to see.` : `Kali ni kita kasi nampak sikit bahagian ${subject} yang orang selalu tidak nampak.`,
    )
  } else if (angle === 'Customer Journey') {
    base.push(
      en ? `Every customer starts with a different need, and that is where the story of ${subject} begins.` : `Setiap customer mula dengan keperluan yang lain-lain — dari situ la cerita ${subject} bermula.`,
      en ? `Before the solution, there is always a real customer story.` : `Sebelum sampai solution, mesti ada cerita customer yang sebenar dulu. 👀`,
    )
  } else if (angle === 'Offer + Reason to Act') {
    base.push(
      en ? `An offer only matters when it genuinely fits what you need.` : `Offer tu baru ada makna kalau memang ngam dengan apa yang kamu perlukan.`,
      en ? `Before looking at the promotion, check whether the actual fit makes sense first.` : `Sebelum tengok promo, check dulu benda ni memang sesuai ka dengan keperluan kamu.`,
    )
  } else {
    base.push(
      en ? `${subject} has a real story behind it, and that is the best place to start.` : `${subject} ni ada cerita dia sendiri — jadi kita mula dari benda yang betul-betul berlaku.`,
      en ? `Not every Brutti post needs to start with selling. Sometimes the real story is stronger.` : `Bukan semua post Brutti kena mula dengan jual barang. Kadang cerita sebenar tu lagi kuat.`,
    )
  }

  if (mode === 'engaging') return [en ? `What makes ${subject} worth talking about in the first place?` : `Apa yang bikin ${subject} ni berbaloi untuk kita cerita? 👀`, ...base]
  if (mode === 'casual') return [en ? `Okay, this time we are talking about ${subject}.` : `Nah, kali ni kita cerita pasal ${subject} dulu bah.`, ...base]
  if (mode === 'professional') return [en ? `This post focuses on the verified purpose and context of ${subject}.` : `Kali ini, fokus diberikan kepada fungsi, konteks dan fakta yang telah disahkan untuk ${subject}.`, ...base]
  if (mode === 'hook') return [en ? `There is more to ${subject} than the first thing you see.` : `${subject} ni bukan setakat apa yang nampak di depan mata. 👀`, ...base]
  return base
}

function bridgeLines(form, strategy) {
  const en = isEnglish(form)
  const subject = subjectFor(form)
  const lines = []

  if (strategy.keyMessage) {
    lines.push(en ? `The key thing to remember is this: ${strategy.keyMessage}` : `Kalau ada satu benda mau ingat, yang ni la: ${strategy.keyMessage}`)
  }

  if (strategy.direction) {
    const direction = strategy.direction.toLowerCase()
    if (/human|team|orang|people|story|cerita/.test(direction)) {
      lines.push(en ? `Keep the story close to the people and real moments behind ${subject}.` : `Cerita ni kita kasi dekat dengan orang dan moment sebenar di belakang ${subject}.`)
    } else if (/fungsi|function|practical|praktikal|guna/.test(direction)) {
      lines.push(en ? `The useful part is how ${subject} actually works in real use.` : `Yang paling penting, macam mana ${subject} betul-betul berguna bila dipakai nanti.`)
    } else if (/awareness|brand/.test(direction)) {
      lines.push(en ? `The point is to help people understand Brutti better, not force a sale.` : `Tujuan dia supaya orang lebih kenal cara Brutti fikir, bukan terus hard sell.`)
    }
  }

  if (!lines.length) {
    if (strategy.objective === 'Engagement') lines.push(en ? 'The story should give people something natural to react or reply to.' : 'Cerita dia kena ada ruang untuk orang react atau balas secara natural.')
    else if (strategy.objective === 'Education') lines.push(en ? 'Keep the useful lesson clear enough for people to save and use later.' : 'Point yang berguna tu kasi jelas supaya orang senang save dan refer balik.')
    else if (strategy.objective === 'Trust') lines.push(en ? 'Trust comes from specific real details, not bigger claims.' : 'Trust datang dari detail sebenar, bukan dari claim yang dibesar-besarkan.')
    else if (strategy.objective === 'Conversion') lines.push(en ? 'Make the next step clear without turning the caption into a hard sell.' : 'Next step kasi jelas, tapi jangan sampai caption terus rasa hard sell.')
    else lines.push(en ? `Help ${strategy.audience} understand why ${subject} matters without overexplaining it.` : `Biar ${strategy.audience} senang faham kenapa ${subject} ni penting, tanpa explain berlebihan.`)
  }

  return lines.map(sentence)
}

function supportLine(form, strategy) {
  const en = isEnglish(form)
  const type = form.type || 'Brand Awareness'
  if (type === 'Product Highlight') return sentence(en ? 'Start with function and verified product context before style or selling points.' : 'Mula dari fungsi dan detail produk yang sudah confirm dulu, baru cerita benda lain.')
  if (type === 'Behind the Scenes') return sentence(en ? 'Show the real process and people instead of making everything look polished and perfect.' : 'Tunjuk proses dan orang sebenar — tidak payah kasi nampak semua benda perfect.')
  if (type === 'Customer Story') return sentence(en ? 'Keep the real customer need at the centre of the story.' : 'Keperluan sebenar customer tetap jadi pusat cerita ni.')
  if (type === 'Educational') return sentence(en ? 'Make the useful point specific enough to apply in a real situation.' : 'Tip tu mesti cukup specific supaya orang boleh apply dalam situasi sebenar.')
  if (type === 'Promotion') return sentence(en ? 'Any price, period or offer detail must stay exactly within the verified information.' : 'Kalau ada harga, tempoh atau promo, semua kena ikut info yang sudah confirm.')
  return sentence(en ? 'Use a real Brutti point of view instead of generic marketing language.' : 'Guna sudut pandang Brutti yang sebenar, bukan ayat marketing generic.')
}

function ctaFor(form, strategy, mode, variation) {
  const en = isEnglish(form)
  const goal = mode === 'cta' ? 'Comment / Reply' : strategy.ctaGoal
  const pools = {
    'Comment / Reply': en
      ? ['What would you want to know about this?', 'Which part would matter most to you?']
      : ['Kalau kamu, part mana yang paling kamu mau tahu?', 'Kalau kena dengan situasi kamu, apa benda pertama yang kamu mau check?'],
    'WhatsApp / DM': en
      ? ['Message the Brutti team if you want us to check the verified details with you.']
      : ['Kalau mau check detail dia, mesej ja team Brutti — kita tinguk sama-sama.'],
    Save: en
      ? ['Save this first if it will be useful when you plan later.']
      : ['Kalau berguna, save ja dulu. Nanti senang refer balik masa perlu.'],
    Share: en
      ? ['Share this with someone who is planning something similar.']
      : ['Kalau ada kawan yang sedang plan benda sama, share ja sama dia.'],
    'Natural CTA': en
      ? ['If you want to know more, message the Brutti team and we can check the verified details together.', 'Keep this in mind if it matches what you are planning.']
      : ['Kalau mau tahu lebih lanjut, mesej ja team Brutti dan kita check detail yang sudah confirm sama-sama.', 'Kalau benda ni ngam dengan apa yang kamu sedang plan, boleh simpan dalam list dulu.'],
  }
  const pool = pools[goal] || pools['Natural CTA']
  return sentence(pool[Number(variation || 0) % pool.length])
}

function toneLine(line, form, mode) {
  if (isEnglish(form) || mode === 'professional' || form.tone === 'Professional but friendly') return line
  let next = line
  if (form.tone === 'Warm & confident') next = next.replace(/kita/g, 'kami')
  if (form.tone === 'Practical & friendly') next = next.replace(/betul-betul/g, 'memang')
  if (form.tone === 'Proud & purposeful') next = next.replace(/cerita Brutti/g, 'cara Brutti bikin benda dengan tujuan')
  if (form.tone === 'Helpful') next = next.replace(/yang paling penting/gi, 'yang boleh membantu')
  if (mode === 'casual' || form.tone === 'Brutti Sabahan Casual') {
    next = next.replace(/mahu/gi, 'mau').replace(/sahaja/gi, 'ja').replace(/tidak perlu/gi, 'tidak payah')
  }
  return next
}

function enforceShape(lines, verifiedText, form, mode) {
  const unique = []
  let emojiCount = 0
  for (const raw of lines) {
    let line = clean(raw)
    if (!line) continue
    line = toneLine(line, form, mode)
    if (!verifiedClaimAllowed(line, verifiedText)) continue
    if (unique.some((existing) => existing.toLowerCase() === line.toLowerCase())) continue
    line = line.replace(/\p{Extended_Pictographic}/gu, (emoji) => {
      emojiCount += 1
      return emojiCount <= 2 ? emoji : ''
    }).trim()
    if (line) unique.push(line)
  }

  const minLines = mode === 'shorten' ? 7 : 8
  const maxLines = mode === 'shorten' ? 8 : 13
  const subject = subjectFor(form)
  const fallback = isEnglish(form)
    ? [
        `Keep ${subject} tied to the real need instead of adding generic claims.`,
        'The wording can stay natural while the facts stay exactly the same.',
        'One clear message is stronger than trying to say everything at once.',
      ]
    : [
        `${subject} kita kasi dekat dengan keperluan sebenar, bukan tambah claim generic.`,
        'Ayat boleh santai, tapi fakta asal mesti kekal sama.',
        'Satu mesej yang jelas lagi kuat daripada cuba cerita semua benda sekali gus.',
      ]
  let cursor = 0
  while (unique.length < minLines && cursor < fallback.length) {
    const next = sentence(fallback[cursor])
    if (!unique.includes(next)) unique.splice(Math.max(1, unique.length - 1), 0, next)
    cursor += 1
  }
  return unique.slice(0, maxLines)
}

export function buildContentStudioContext(form, controls = {}) {
  const strategy = strategyFor(form, controls)
  return {
    source: SOUL_SOURCE_LABEL,
    subject: subjectFor(form),
    platform: form.platform || 'Facebook',
    contentType: form.type || 'Brand Awareness',
    language: form.language || 'Bahasa Melayu',
    tone: form.tone || 'Brutti Sabahan Casual',
    verifiedFacts: splitFacts(form.brief),
    strategy,
    soulVoice: clean(BRUTTI_SOUL.voice).slice(0, 900),
    soulRedLines: clean(BRUTTI_SOUL.redLines).slice(0, 900),
  }
}

export function buildContentStudioDraft(form, controls = {}, mode = 'balanced', variation = 0) {
  const context = buildContentStudioContext(form, controls)
  const hooks = hookPool(form, context.strategy, mode)
  const hook = hooks[(stableIndex(`${context.subject}|${context.strategy.angle}|${mode}`, hooks.length) + Number(variation || 0)) % hooks.length]
  const factOffset = context.verifiedFacts.length ? Number(variation || 0) % context.verifiedFacts.length : 0
  const orderedFacts = context.verifiedFacts.length
    ? [...context.verifiedFacts.slice(factOffset), ...context.verifiedFacts.slice(0, factOffset)]
    : []
  const body = [
    sentence(hook),
    ...orderedFacts,
    ...bridgeLines(form, context.strategy),
    supportLine(form, context.strategy),
    ctaFor(form, context.strategy, mode, variation),
  ]
  return enforceShape(body, form.brief, form, mode).join('\n')
}

export function buildContentStudioDirection(form, controls = {}) {
  const context = buildContentStudioContext(form, controls)
  const s = context.strategy
  const asset = form.assetName ? ` Gunakan visual approved “${form.assetName}”.` : ''
  return `Objective: ${s.objective}. Audience: ${s.audience}. Angle: ${s.angle}. Key message: ${s.keyMessage || context.subject}. CTA: ${s.ctaGoal}.${asset} Gunakan verified facts sebagai fakta utama dan Brutti Soul Master sebagai voice + red-line guardrail. Jangan tambah harga, promosi, stok, delivery, ukuran, KPI atau claim yang tidak disahkan.`
}

export function buildContentStudioHashtags(form, controls = {}) {
  const context = buildContentStudioContext(form, controls)
  const tags = ['#BRUTTI', '#ProudlySabahan']
  const text = clean(`${form.title} ${form.product} ${form.type} ${form.brief} ${context.strategy.angle}`).toLowerCase()
  if (form.product && form.product !== 'General / No Product') tags.push('#FurnitureSabah')
  else if (/behind|team|retreat|activity|aktiviti|workshop/.test(text)) tags.push('#BehindTheScenes')
  else if (/education|tip|practical|praktikal/.test(text)) tags.push('#BruttiTips')
  else tags.push('#SabahBrand')
  if (/custom|bespoke/.test(text)) tags.push('#CustomFurnitureSabah')
  else tags.push('#BikinSampaiJadi')
  return [...new Set(tags)].slice(0, 4).join(' ')
}

export function contentStudioEngineMeta(form, controls = {}, mode = 'balanced', variation = 0) {
  const context = buildContentStudioContext(form, controls)
  return {
    engine: 'Content Studio Engine V2',
    source: SOUL_SOURCE_LABEL,
    mode,
    variation,
    verifiedFactCount: context.verifiedFacts.length,
    strategy: context.strategy,
    legacyTemplateBankUsedForFinalOutput: false,
  }
}
