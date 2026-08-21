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

export const CONTENT_VERSION_LABELS = [
  'Story-led',
  'Audience-led',
  'Human / reflective',
]

const CTA_ROTATION = ['Comment / Reply', 'WhatsApp / DM', 'Save', 'Share', 'Natural CTA']

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
    audience: clean(controls.audience) || 'Homeowners dan pelanggan Brutti di Sabah',
    angle: controls.angle && controls.angle !== 'Auto' ? controls.angle : ANGLE_DEFAULTS[type] || 'Storytelling',
    direction: clean(controls.direction),
    ctaGoal: controls.ctaGoal && controls.ctaGoal !== 'Auto' ? controls.ctaGoal : 'Natural CTA',
    keyMessage: clean(controls.keyMessage),
  }
}

function baseHookPool(form, strategy) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const angle = strategy.angle

  if (angle === 'Problem → Solution') {
    return [
      en ? `Sometimes the real problem is not the space — it is how ${subject} needs to work in it.` : `Kadang masalah sebenar bukan ruang tu kecil — tapi macam mana ${subject} perlu berfungsi dalam ruang tu. 👀`,
      en ? `Before choosing ${subject}, start with the problem it actually needs to solve.` : `Sebelum pilih ${subject}, tengok dulu masalah apa yang dia memang perlu selesaikan.`,
      en ? `A better choice starts by asking what ${subject} needs to make easier.` : `Pilihan yang lebih ngam mula dari satu soalan: ${subject} ni perlu kasi apa jadi lebih senang?`,
    ]
  }

  if (angle === 'Practical Tip') {
    return [
      en ? `One useful point about ${subject} can make the next decision much easier.` : `Ada satu point pasal ${subject} yang boleh kasi keputusan seterusnya jauh lebih senang. 👀`,
      en ? `Keep this simple: start with what you actually need ${subject} to do.` : `Simple ja — mula dari apa yang kamu betul-betul perlukan ${subject} buat.`,
      en ? `Before adding more, check whether ${subject} solves the everyday need first.` : `Sebelum tambah macam-macam, check dulu ${subject} ni selesaikan keperluan harian ka tidak.`,
    ]
  }

  if (angle === 'Human / Behind the Scenes') {
    return [
      en ? `The final result is only one part of the story behind ${subject}.` : `Hasil akhir tu satu bahagian ja — cerita di belakang ${subject} sebenarnya lagi banyak. 👀`,
      en ? `Here is the part of ${subject} people do not always get to see.` : `Kali ni kita kasi nampak sikit bahagian ${subject} yang orang selalu tidak nampak.`,
      en ? `Before the finished result, there are real people and small moments behind ${subject}.` : `Sebelum nampak hasil siap, ada orang dan moment kecil yang bikin cerita ${subject} tu hidup.`,
    ]
  }

  if (angle === 'Customer Journey') {
    return [
      en ? `Every customer starts with a different need, and that is where the story of ${subject} begins.` : `Setiap customer mula dengan keperluan yang lain-lain — dari situ la cerita ${subject} bermula.`,
      en ? `Before the solution, there is always a real customer story.` : `Sebelum sampai solution, mesti ada cerita customer yang sebenar dulu. 👀`,
      en ? `The useful part of ${subject} only makes sense when we start with the customer need.` : `Cerita ${subject} baru betul-betul masuk akal bila kita mula dari apa customer memang perlukan.`,
    ]
  }

  if (angle === 'Offer + Reason to Act') {
    return [
      en ? `An offer only matters when it genuinely fits what you need.` : `Offer tu baru ada makna kalau memang ngam dengan apa yang kamu perlukan.`,
      en ? `Before looking at the promotion, check whether the actual fit makes sense first.` : `Sebelum tengok promo, check dulu benda ni memang sesuai ka dengan keperluan kamu.`,
      en ? `A promotion is useful only when the product itself already makes sense for the need.` : `Promo tu bonus ja — yang penting produk tu memang kena dengan apa yang kamu perlukan dulu.`,
    ]
  }

  return [
    en ? `${subject} has a real story behind it, and that is the best place to start.` : `${subject} ni ada cerita dia sendiri — jadi kita mula dari benda yang betul-betul berlaku.`,
    en ? `Not every Brutti post needs to start with selling. Sometimes the real story is stronger.` : `Bukan semua post Brutti kena mula dengan jual barang. Kadang cerita sebenar tu lagi kuat.`,
    en ? `The strongest part of ${subject} is usually the real reason it matters.` : `Yang paling kuat pasal ${subject} biasanya bukan ayat jualan — tapi sebab sebenar kenapa benda tu penting.`,
  ]
}

function audienceHookPool(form, strategy) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  return [
    en ? `If ${subject} is on your list, what problem are you actually trying to solve first?` : `Kalau ${subject} memang ada dalam list kamu, masalah apa yang kamu sebenarnya mau selesaikan dulu? 👀`,
    en ? `For anyone comparing options, ${subject} makes more sense when the real need is clear first.` : `Kalau kamu tengah compare pilihan, ${subject} lagi senang dinilai bila keperluan sebenar sudah jelas dulu.`,
    en ? `Before deciding on ${subject}, picture how it needs to work in your own routine.` : `Sebelum decide pasal ${subject}, cuba bayang dulu macam mana benda ni perlu berfungsi dalam rutin kamu sendiri.`,
  ]
}

function reflectiveHookPool(form) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  return [
    en ? `Sometimes the most useful story about ${subject} is the small detail people almost miss.` : `Kadang cerita paling kuat pasal ${subject} datang dari detail kecil yang orang hampir tidak perasan.`,
    en ? `${subject} is easier to understand when we look at the real reason behind it.` : `${subject} ni lagi senang difahami bila kita tengok sebab sebenar di belakang dia.`,
    en ? `The more we look at ${subject}, the more the real context matters than the sales line.` : `Lagi kita tengok ${subject}, lagi nampak yang konteks sebenar tu lebih penting daripada ayat jualan.`,
  ]
}

function hookFor(form, strategy, mode, version, cycle) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  let pool = version === 1 ? audienceHookPool(form, strategy) : version === 2 ? reflectiveHookPool(form) : baseHookPool(form, strategy)

  if (mode === 'engaging') {
    pool = [
      en ? `What would make ${subject} genuinely useful to you — not just nice to look at?` : `Kalau ${subject} ni ada depan kamu sekarang, apa benda yang paling kamu mau dia selesaikan? 👀`,
      en ? `Would ${subject} actually make your daily routine easier?` : `${subject} ni kalau masuk dalam rutin kamu, betul-betul kasi senang ka?`,
      en ? `Here is the question worth asking before anything else about ${subject}.` : `Sebelum cerita panjang pasal ${subject}, ada satu soalan yang lagi penting dulu.`,
    ]
  } else if (mode === 'casual') {
    pool = [
      en ? `Okay, this time we are talking about ${subject}.` : `Nah, kali ni kita cerita pasal ${subject} dulu bah.`,
      en ? `Let us keep this one simple and talk about ${subject}.` : `Yang ni kita kasi simple ja — cerita terus pasal ${subject}.`,
      en ? `No long intro this time. Here is the real point about ${subject}.` : `Tidak payah intro panjang-panjang, kita terus pigi point pasal ${subject}.`,
    ]
  } else if (mode === 'professional') {
    pool = [
      en ? `This post focuses on the verified purpose and context of ${subject}.` : `Kali ini, fokus diberikan kepada fungsi, konteks dan fakta yang telah disahkan untuk ${subject}.`,
      en ? `The value of ${subject} is best understood through its verified function and context.` : `Nilai ${subject} lebih jelas apabila dilihat melalui fungsi dan konteks yang telah disahkan.`,
      en ? `A clear assessment of ${subject} begins with the actual need it is intended to address.` : `Penilaian terhadap ${subject} bermula dengan keperluan sebenar yang ingin diselesaikan.`,
    ]
  } else if (mode === 'hook') {
    pool = [
      en ? `There is more to ${subject} than the first thing you see.` : `${subject} ni bukan setakat apa yang nampak di depan mata. 👀`,
      en ? `The interesting part of ${subject} starts where the obvious part ends.` : `Part menarik pasal ${subject} sebenarnya mula lepas benda yang obvious tu.`,
      en ? `One real detail can completely change how you look at ${subject}.` : `Kadang satu detail ja boleh terus ubah cara kita tengok ${subject}.`,
      en ? `Before you scroll past ${subject}, here is the part worth noticing.` : `Sebelum scroll lepas ${subject}, yang ni satu benda memang patut diperhatikan dulu.`,
    ]
  }

  const index = (stableIndex(`${subject}|${strategy.angle}|${mode}|${version}`, pool.length) + Number(cycle || 0)) % pool.length
  return sentence(pool[index])
}

function keyMessageLine(form, strategy, version) {
  if (!strategy.keyMessage) return ''
  const en = isEnglish(form)
  if (version === 1) return sentence(en ? `For the people considering it, the key point is simple: ${strategy.keyMessage}` : `Untuk yang sedang consider benda ni, point paling penting dia simple: ${strategy.keyMessage}`)
  if (version === 2) return sentence(en ? `When we strip away the marketing language, this is what matters: ${strategy.keyMessage}` : `Kalau buang ayat marketing semua, yang tinggal dan memang penting ialah: ${strategy.keyMessage}`)
  return sentence(en ? `The key thing to remember is this: ${strategy.keyMessage}` : `Kalau ada satu benda mau ingat, yang ni la: ${strategy.keyMessage}`)
}

function directionBridge(form, strategy, version) {
  const en = isEnglish(form)
  const subject = subjectFor(form)
  const direction = strategy.direction.toLowerCase()
  if (!direction) return ''

  if (/human|team|orang|people|story|cerita/.test(direction)) {
    if (version === 2) return sentence(en ? `That is why the people and real moments behind ${subject} matter as much as the finished result.` : `Sebab tu orang dan moment sebenar di belakang ${subject} sama penting dengan hasil akhir dia.`)
    return sentence(en ? `Keep the story close to the people and real moments behind ${subject}.` : `Cerita ni kita kasi dekat dengan orang dan moment sebenar di belakang ${subject}.`)
  }

  if (/fungsi|function|practical|praktikal|guna/.test(direction)) {
    if (version === 1) return sentence(en ? `For the audience, the useful question is how ${subject} actually fits into daily use.` : `Untuk orang yang baca, soalan paling berguna ialah macam mana ${subject} ni betul-betul masuk dalam penggunaan harian.`)
    return sentence(en ? `The useful part is how ${subject} actually works in real use.` : `Yang paling penting, macam mana ${subject} betul-betul berguna bila dipakai nanti.`)
  }

  if (/awareness|brand/.test(direction)) {
    return sentence(en ? `The point is to help people understand Brutti better, not force a sale.` : `Tujuan dia supaya orang lebih kenal cara Brutti fikir, bukan terus hard sell.`)
  }

  return ''
}

function objectiveBridge(form, strategy, version, mode) {
  const en = isEnglish(form)
  const subject = subjectFor(form)

  if (mode === 'engaging') return sentence(en ? `Give people one clear reason to react, compare or share their own experience with ${subject}.` : `Bagi orang satu sebab yang jelas untuk react, compare atau share pengalaman sendiri pasal ${subject}.`)
  if (mode === 'casual') return sentence(en ? `No need to over-explain it — keep the useful point easy to follow.` : `Tidak payah explain sampai berat sangat — point penting tu kasi senang orang ikut.`)
  if (mode === 'professional') return sentence(en ? `Keep the message concise, evidence-led and aligned with the verified context.` : `Mesej dikekalkan ringkas, berasaskan fakta dan selaras dengan konteks yang telah disahkan.`)

  if (version === 1) return sentence(en ? `The audience should be able to see where ${subject} fits into a real need, not just a product list.` : `Orang yang baca patut boleh nampak ${subject} ni ngam di mana dalam keperluan sebenar, bukan setakat nampak nama produk.`)
  if (version === 2) return sentence(en ? `A real detail gives ${subject} more meaning than a broad brand claim ever could.` : `Satu detail sebenar boleh bagi ${subject} lebih banyak makna daripada claim brand yang terlalu umum.`)

  if (strategy.objective === 'Engagement') return sentence(en ? 'The story should give people something natural to react or reply to.' : 'Cerita dia kena ada ruang untuk orang react atau balas secara natural.')
  if (strategy.objective === 'Education') return sentence(en ? 'Keep the useful lesson clear enough for people to save and use later.' : 'Point yang berguna tu kasi jelas supaya orang senang save dan refer balik.')
  if (strategy.objective === 'Trust') return sentence(en ? 'Trust comes from specific real details, not bigger claims.' : 'Trust datang dari detail sebenar, bukan dari claim yang dibesar-besarkan.')
  if (strategy.objective === 'Conversion') return sentence(en ? 'Make the next step clear without turning the caption into a hard sell.' : 'Next step kasi jelas, tapi jangan sampai caption terus rasa hard sell.')
  return sentence(en ? `Help ${strategy.audience} understand why ${subject} matters without overexplaining it.` : `Biar ${strategy.audience} senang faham kenapa ${subject} ni penting, tanpa explain berlebihan.`)
}

function supportLine(form, strategy, version, mode) {
  const en = isEnglish(form)
  const type = form.type || 'Brand Awareness'

  if (mode === 'engaging') return sentence(en ? 'Keep the strongest real detail close to the question so the interaction feels earned.' : 'Kasi dekat soalan tadi dengan detail sebenar yang paling kuat supaya interaction tu rasa natural.')
  if (mode === 'casual') return sentence(en ? 'Keep it conversational, but do not loosen the facts.' : 'Santai boleh, tapi fakta jangan kasi longgar.')
  if (mode === 'professional') return sentence(en ? 'Avoid unsupported superlatives and keep each point traceable to verified information.' : 'Elakkan claim berlebihan dan pastikan setiap point boleh dirujuk kepada maklumat yang disahkan.')

  if (version === 2) return sentence(en ? 'The human side should come from the real context, not from invented emotion.' : 'Bahagian human tu mesti datang dari konteks sebenar, bukan emosi yang direka.')
  if (version === 1) return sentence(en ? 'Make the relevance to the reader clear before asking them to take the next step.' : 'Kasi jelas dulu kenapa benda ni relevan untuk orang yang baca, baru ajak dia buat next step.')

  if (type === 'Product Highlight') return sentence(en ? 'Start with function and verified product context before style or selling points.' : 'Mula dari fungsi dan detail produk yang sudah confirm dulu, baru cerita benda lain.')
  if (type === 'Behind the Scenes') return sentence(en ? 'Show the real process and people instead of making everything look polished and perfect.' : 'Tunjuk proses dan orang sebenar — tidak payah kasi nampak semua benda perfect.')
  if (type === 'Customer Story') return sentence(en ? 'Keep the real customer need at the centre of the story.' : 'Keperluan sebenar customer tetap jadi pusat cerita ni.')
  if (type === 'Educational') return sentence(en ? 'Make the useful point specific enough to apply in a real situation.' : 'Tip tu mesti cukup specific supaya orang boleh apply dalam situasi sebenar.')
  if (type === 'Promotion') return sentence(en ? 'Any price, period or offer detail must stay exactly within the verified information.' : 'Kalau ada harga, tempoh atau promo, semua kena ikut info yang sudah confirm.')
  if (strategy.objective === 'Engagement') return sentence(en ? 'Keep one human detail strong enough to invite a natural reaction.' : 'Pilih satu detail human yang kuat supaya orang senang react secara natural.')
  if (strategy.objective === 'Trust') return sentence(en ? 'Specific real details should carry the story instead of broad brand claims.' : 'Biar detail sebenar yang bawa cerita, bukan claim brand yang terlalu umum.')
  return sentence(en ? 'Use a real Brutti point of view instead of generic marketing language.' : 'Guna sudut pandang Brutti yang sebenar, bukan ayat marketing generic.')
}

function ctaFor(form, strategy, mode, version, cycle) {
  const en = isEnglish(form)
  let goal = strategy.ctaGoal
  if (mode === 'engaging') goal = 'Comment / Reply'
  if (mode === 'cta') goal = CTA_ROTATION[Number(cycle || 0) % CTA_ROTATION.length]
  if (goal === 'Auto') goal = 'Natural CTA'

  const pools = {
    'Comment / Reply': en
      ? ['What would you want to know about this?', 'Which part would matter most to you?', 'Would this solve the problem you are dealing with now?']
      : ['Kalau kamu, part mana yang paling kamu mau tahu?', 'Kalau kena dengan situasi kamu, apa benda pertama yang kamu mau check?', 'Kalau kamu tengah hadap benda sama, ${subject} ni rasa membantu ka tidak?'],
    'WhatsApp / DM': en
      ? ['Message the Brutti team if you want us to check the verified details with you.', 'DM us if you want to compare the verified details before deciding.']
      : ['Kalau mau check detail dia, mesej ja team Brutti — kita tinguk sama-sama.', 'Kalau mau compare detail yang sudah confirm dulu, DM ja team Brutti.'],
    Save: en
      ? ['Save this first if it will be useful when you plan later.', 'Keep this saved if you are still comparing options.']
      : ['Kalau berguna, save ja dulu. Nanti senang refer balik masa perlu.', 'Kalau masih dalam fasa compare, save dulu post ni untuk refer balik.'],
    Share: en
      ? ['Share this with someone who is planning something similar.', 'Send this to someone who is dealing with the same kind of need.']
      : ['Kalau ada kawan yang sedang plan benda sama, share ja sama dia.', 'Kalau ada orang yang tengah hadap keperluan sama, boleh share post ni sama dia.'],
    'Natural CTA': en
      ? ['If you want to know more, message the Brutti team and we can check the verified details together.', 'Keep this in mind if it matches what you are planning.']
      : ['Kalau mau tahu lebih lanjut, mesej ja team Brutti dan kita check detail yang sudah confirm sama-sama.', 'Kalau benda ni ngam dengan apa yang kamu sedang plan, boleh simpan dalam list dulu.'],
  }

  const pool = pools[goal] || pools['Natural CTA']
  const subject = subjectFor(form)
  const raw = pool[(Number(version || 0) + Number(cycle || 0)) % pool.length].replace('${subject}', subject)
  return sentence(raw)
}

function toneLine(line, form, mode) {
  if (isEnglish(form)) return line
  let next = line

  if (mode === 'professional' || form.tone === 'Professional but friendly') {
    return next
      .replace(/\bmau\b/gi, 'mahu')
      .replace(/\bja\b/gi, 'sahaja')
      .replace(/\bngam\b/gi, 'sesuai')
      .replace(/\bkasi\b/gi, 'jadikan')
      .replace(/\btinguk\b/gi, 'lihat')
      .replace(/\bbah\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  if (form.tone === 'Warm & confident') next = next.replace(/kita/g, 'kami')
  if (form.tone === 'Practical & friendly') next = next.replace(/betul-betul/g, 'memang')
  if (form.tone === 'Proud & purposeful') next = next.replace(/cerita Brutti/g, 'cara Brutti bikin benda dengan tujuan')
  if (form.tone === 'Helpful') next = next.replace(/yang paling penting/gi, 'yang boleh membantu')

  if (mode === 'casual' || form.tone === 'Brutti Sabahan Casual') {
    next = next
      .replace(/mahu/gi, 'mau')
      .replace(/sahaja/gi, 'ja')
      .replace(/tidak perlu/gi, 'tidak payah')
      .replace(/melihat/gi, 'tinguk')
  }

  return next
}

function enforceShape(lines, verifiedText, form, mode) {
  const unique = []
  let emojiCount = 0
  let bahCount = 0

  for (const raw of lines) {
    let line = clean(raw)
    if (!line) continue
    line = toneLine(line, form, mode)
    if (!verifiedClaimAllowed(line, verifiedText)) continue
    if (unique.some((existing) => existing.toLowerCase() === line.toLowerCase())) continue

    line = line.replace(/\p{Extended_Pictographic}/gu, (emoji) => {
      emojiCount += 1
      return emojiCount <= 2 ? emoji : ''
    })
    line = line.replace(/\bbah\b/gi, (word) => {
      bahCount += 1
      return bahCount <= 1 ? word : ''
    }).replace(/\s{2,}/g, ' ').trim()

    if (line) unique.push(line)
  }

  const minLines = mode === 'shorten' ? 7 : 8
  const maxLines = mode === 'shorten' ? 7 : 13
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

function orderFacts(facts, version) {
  if (!facts.length) return []
  if (version === 1 && facts.length > 1) return [facts[1], facts[0], ...facts.slice(2)]
  if (version === 2 && facts.length > 2) return [facts[facts.length - 1], ...facts.slice(0, facts.length - 1)]
  return [...facts]
}

function compressFacts(facts, limit = 3) {
  return facts.slice(0, limit)
}

function buildBody(form, context, mode, version, cycle) {
  const facts = orderFacts(context.verifiedFacts, version)
  const keyLine = keyMessageLine(form, context.strategy, version)
  const directionLine = directionBridge(form, context.strategy, version)
  const objectiveLine = objectiveBridge(form, context.strategy, version, mode)
  const support = supportLine(form, context.strategy, version, mode)
  const cta = ctaFor(form, context.strategy, mode, version, cycle)
  const hook = hookFor(form, context.strategy, mode, version, cycle)

  if (mode === 'shorten') {
    const shortFacts = compressFacts(facts, 3)
    return [hook, ...shortFacts, keyLine || objectiveLine, support, cta]
  }

  if (version === 1) {
    return [hook, objectiveLine, ...facts, keyLine, directionLine, support, cta]
  }

  if (version === 2) {
    const firstFact = facts[0] || ''
    const rest = facts.slice(1)
    return [hook, firstFact, directionLine || objectiveLine, ...rest, keyLine, support, cta]
  }

  return [hook, ...facts, keyLine, directionLine, objectiveLine, support, cta]
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

export function buildContentStudioDraft(form, controls = {}, mode = 'balanced', variation = 0, cycle = 0) {
  const context = buildContentStudioContext(form, controls)
  const version = Math.min(Math.max(Number(variation) || 0, 0), 2)
  const body = buildBody(form, context, mode, version, cycle)
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

export function contentStudioEngineMeta(form, controls = {}, mode = 'balanced', variation = 0, cycle = 0) {
  const context = buildContentStudioContext(form, controls)
  const version = Math.min(Math.max(Number(variation) || 0, 0), 2)
  return {
    engine: 'Content Studio Engine V2',
    source: SOUL_SOURCE_LABEL,
    mode,
    variation: version,
    versionLabel: CONTENT_VERSION_LABELS[version],
    rewriteCycle: Number(cycle || 0),
    verifiedFactCount: context.verifiedFacts.length,
    strategy: context.strategy,
    legacyTemplateBankUsedForFinalOutput: false,
  }
}
