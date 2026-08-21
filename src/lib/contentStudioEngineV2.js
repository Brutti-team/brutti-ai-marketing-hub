import { BRUTTI_SOUL, SOUL_SOURCE_LABEL } from './bruttiSoulSource'

const DIRECTION_RE = /buat caption|susun caption|gaya caption|tone|style caption|mulakan dengan|kemudian sambung|fokus (?:pada|kepada|posting)|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan|jangan reka|jangan tambah|jangan masukkan|jangan hard sell|tidak hard sell|bukan hard sell|jangan menjual|tidak menjual|minimum|maksimum|baris|objective|target audience|cta|content angle/i
const UNSUPPORTED_RE = /\b(RM\s?\d|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|no\.?\s?1|terbaik|paling murah|paling tahan|tahan lama|waterproof|premium|sold|reach|views?|followers?|viral)\b/i

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

export const CONTENT_VERSION_LABELS = ['Story-led', 'Audience-led', 'Human / reflective']

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
  const tokens = claim.match(/rm\s?\d+[\d,.]*|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|no\.?\s?1|terbaik|paling murah|paling tahan|tahan lama|waterproof|premium|sold|reach|views?|followers?|viral/gi) || []
  return tokens.every((token) => facts.includes(token.toLowerCase()))
}

function subjectFor(form) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'cerita Brutti ni'
}

function typeFor(form) {
  return form.type || 'Brand Awareness'
}

function isEnglish(form) {
  return form.language === 'English'
}

function strategyFor(form, controls = {}) {
  const type = typeFor(form)
  return {
    objective: controls.objective && controls.objective !== 'Auto' ? controls.objective : OBJECTIVE_DEFAULTS[type] || 'Awareness',
    audience: clean(controls.audience) || 'Homeowners dan pelanggan Brutti di Sabah',
    angle: controls.angle && controls.angle !== 'Auto' ? controls.angle : ANGLE_DEFAULTS[type] || 'Storytelling',
    direction: clean(controls.direction),
    ctaGoal: controls.ctaGoal && controls.ctaGoal !== 'Auto' ? controls.ctaGoal : 'Natural CTA',
    keyMessage: clean(controls.keyMessage),
  }
}

function productHooks(form, version) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const pools = [
    en
      ? [`A useful product starts with one question: what does ${subject} need to make easier?`, `Before choosing ${subject}, start with the real need it has to solve.`, `${subject} makes more sense when we start with how it will actually be used.`]
      : [`Pilihan yang ngam mula dari satu soalan: ${subject} ni perlu kasi apa jadi lebih senang?`, `Sebelum pilih ${subject}, tengok dulu keperluan apa yang dia memang perlu selesaikan.`, `${subject} lagi senang dinilai bila kita mula dari cara dia akan digunakan nanti.`],
    en
      ? [`If ${subject} is on your list, start with the part that matters in your own space.`, `When comparing ${subject}, the useful question is whether it fits the way you actually use the space.`, `Before deciding on ${subject}, picture where it needs to fit into your routine.`]
      : [`Kalau ${subject} memang ada dalam list kamu, mula dari benda yang paling penting dalam ruang kamu sendiri.`, `Kalau tengah compare ${subject}, tengok dulu dia ngam ka dengan cara ruang kamu digunakan hari-hari.`, `Sebelum decide pasal ${subject}, cuba bayang dulu dia perlu masuk macam mana dalam rutin ruang kamu.`],
    en
      ? [`Sometimes one practical detail is enough to understand ${subject} better.`, `${subject} is easier to appreciate when the real use comes before the sales line.`, `The useful story behind ${subject} starts with what it needs to do in real life.`]
      : [`Kadang satu detail praktikal ja sudah cukup kasi kita faham ${subject} dengan lebih jelas.`, `${subject} lagi senang dihargai bila kegunaan sebenar datang dulu sebelum ayat jualan.`, `Cerita yang berguna pasal ${subject} mula dari apa dia memang perlu buat dalam penggunaan sebenar.`],
  ]
  return pools[version]
}

function brandHooks(form, version) {
  const en = isEnglish(form)
  const pools = [
    en
      ? ['A brand becomes easier to understand when we start with what it stands for.', 'Brutti is not only about what we make — the way we think about the work matters too.', 'The Brutti story makes more sense when we start with where we come from and what we value.']
      : ['Satu brand lagi senang difahami bila kita mula dari apa yang dia betul-betul pegang.', 'Brutti bukan setakat apa yang kami bikin — cara kami fikir pasal kerja tu pun penting.', 'Cerita Brutti lagi senang masuk bila kita mula dari mana kami datang dan apa yang kami pegang.'],
    en
      ? ['If you are only getting to know Brutti, this is one of the simplest places to start.', 'What should people understand first when they hear the name Brutti?', 'Before the products, there is a point of view behind the Brutti name.']
      : ['Kalau kamu baru mau kenal Brutti, yang ni antara tempat paling senang untuk mula.', 'Bila orang dengar nama Brutti, apa benda pertama yang kami mau orang faham?', 'Sebelum cerita pasal produk, ada cara fikir yang datang dulu di belakang nama Brutti.'],
    en
      ? ['Some brand stories are strongest when they stay close to their roots.', 'The part of Brutti that matters most is not a slogan on its own, but what sits behind it.', 'A local identity means more when it shows up in the way the work is done.']
      : ['Kadang cerita brand paling kuat bila dia tetap dekat dengan akar sendiri.', 'Yang penting pasal Brutti bukan slogan semata-mata, tapi apa yang ada di belakang dia.', 'Identiti tempatan lagi ada makna bila dia nampak dalam cara kerja dibuat.'],
  ]
  return pools[version]
}

function behindScenesHooks(form, version) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const pools = [
    en
      ? [`The finished post is only one part of ${subject} — the moments behind it tell the rest.`, `Here is a side of ${subject} that is less about work and more about the people doing it.`, `${subject} has its own story outside the usual work routine.`]
      : [`Hasil akhir tu satu bahagian ja dari ${subject} — moment di belakang dia yang kasi cerita tu hidup.`, `Kali ni kita tengok sisi ${subject} yang bukan pasal kerja semata-mata, tapi pasal orang di belakang dia.`, `${subject} ada cerita dia sendiri di luar rutin kerja biasa.`],
    en
      ? [`If you enjoy seeing the people behind Brutti, ${subject} is one of those stories.`, `What does the Brutti team look like when the usual work routine pauses for a while?`, `Sometimes the best team stories happen away from the normal workday.`]
      : [`Kalau kamu suka tengok sisi orang di belakang Brutti, ${subject} memang salah satu cerita dia.`, `Macam mana pula team Brutti bila rutin kerja berhenti sekejap?`, `Kadang cerita team yang paling best memang datang masa keluar sekejap dari rutin kerja.`],
    en
      ? [`Small team moments can say a lot about ${subject} without needing a big speech.`, `${subject} is easier to remember through the people and small moments inside it.`, `Not every meaningful team moment needs to look polished to be worth keeping.`]
      : [`Moment kecil dengan team kadang lagi banyak cerita pasal ${subject} daripada ayat panjang-panjang.`, `${subject} lagi senang diingat bila kita tengok orang dan moment kecil yang ada dalam dia.`, `Bukan semua moment team kena nampak perfect baru berbaloi untuk disimpan dalam cerita.`],
  ]
  return pools[version]
}

function educationalHooks(form, version) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const pools = [
    en ? [`One practical point about ${subject} can make the next step easier.`, `Keep ${subject} simple: start with the part you can actually use.`, `A useful tip works best when it connects to a real situation.`] : [`Satu point praktikal pasal ${subject} boleh kasi langkah seterusnya lebih senang.`, `${subject} kita kasi simple ja — mula dari benda yang memang boleh digunakan.`, `Tip yang berguna lagi senang masuk bila dia dekat dengan situasi sebenar.`],
    en ? [`If you are dealing with ${subject}, this is the part worth checking first.`, `Before doing more with ${subject}, check the simple part first.`, `For anyone planning around ${subject}, one clear point can save a lot of guessing.`] : [`Kalau kamu tengah urus ${subject}, yang ni part elok check dulu.`, `Sebelum buat macam-macam pasal ${subject}, check benda simple dulu.`, `Kalau tengah plan pasal ${subject}, satu point yang jelas boleh kurangkan banyak teka-teki.`],
    en ? [`The most useful lessons usually come from ordinary situations.`, `${subject} does not need complicated advice to be useful.`, `Sometimes the simple way of looking at ${subject} is the one worth keeping.`] : [`Benda yang paling berguna selalunya datang dari situasi biasa-biasa ja.`, `${subject} tidak perlu advice yang complicated baru boleh membantu.`, `Kadang cara paling simple tengok ${subject} tu la yang berbaloi simpan.`],
  ]
  return pools[version]
}

function customerHooks(form, version) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const pools = [
    en ? [`Every customer story starts with a real need, and that is where ${subject} begins.`, `Before the outcome, there is always a reason the customer needed ${subject}.`, `${subject} makes more sense when the customer need comes first.`] : [`Setiap cerita customer mula dari keperluan sebenar — dari situ la ${subject} bermula.`, `Sebelum cerita hasil, ada sebab sebenar kenapa customer perlukan ${subject}.`, `${subject} lagi senang difahami bila keperluan customer datang dulu.`],
    en ? [`If you have faced a similar need, this customer story may feel familiar.`, `The useful part of this story is the situation the customer started with.`, `Before comparing outcomes, look at the need that shaped this story.`] : [`Kalau kamu pernah hadap keperluan yang sama, cerita customer ni mungkin rasa familiar.`, `Part paling berguna dari cerita ni ialah situasi customer masa mula-mula.`, `Sebelum compare hasil, tengok dulu keperluan yang membentuk cerita ni.`],
    en ? [`A real customer detail usually says more than a broad testimonial line.`, `The human part of ${subject} is the reason behind the choice.`, `Customer stories are strongest when the real situation stays visible.`] : [`Satu detail customer yang sebenar selalunya lagi kuat daripada ayat testimonial umum.`, `Bahagian human pasal ${subject} datang dari sebab di belakang pilihan tu.`, `Cerita customer lagi kuat bila situasi sebenar masih nampak.`],
  ]
  return pools[version]
}

function promotionHooks(form, version) {
  const subject = subjectFor(form)
  const en = isEnglish(form)
  const pools = [
    en ? [`A promotion only matters when ${subject} already fits the need.`, `Start with why ${subject} makes sense before talking about the offer.`, `The offer is easier to evaluate when the product fit is clear first.`] : [`Promo baru ada makna bila ${subject} memang ngam dengan keperluan dulu.`, `Mula dari kenapa ${subject} sesuai dulu sebelum cerita pasal offer.`, `Offer lagi senang dinilai bila kesesuaian produk sudah jelas dulu.`],
    en ? [`If ${subject} is already on your list, this is the part to look at next.`, `Before acting on the offer, check whether ${subject} fits what you actually need.`, `For anyone considering ${subject}, the offer should come after the fit.`] : [`Kalau ${subject} memang sudah ada dalam list kamu, yang ni part seterusnya untuk tengok.`, `Sebelum ambil offer, check dulu ${subject} memang ngam ka dengan apa yang kamu perlukan.`, `Kalau sedang consider ${subject}, offer tu datang lepas kesesuaian produk dulu.`],
    en ? [`A good offer should not need exaggerated claims to be clear.`, `${subject} still has to make sense even before the promotion is mentioned.`, `The useful part of a promotion is clarity, not pressure.`] : [`Offer yang jelas tidak perlu claim besar-besar untuk nampak menarik.`, `${subject} tetap kena masuk akal walaupun sebelum promo disebut.`, `Part berguna dari promo ialah kejelasan, bukan pressure.`],
  ]
  return pools[version]
}

function hookPoolFor(form, version) {
  const type = typeFor(form)
  if (type === 'Product Highlight') return productHooks(form, version)
  if (type === 'Brand Awareness') return brandHooks(form, version)
  if (type === 'Behind the Scenes') return behindScenesHooks(form, version)
  if (type === 'Educational') return educationalHooks(form, version)
  if (type === 'Customer Story') return customerHooks(form, version)
  if (type === 'Promotion') return promotionHooks(form, version)
  return brandHooks(form, version)
}

function rewriteHookPool(form, mode) {
  const subject = subjectFor(form)
  const type = typeFor(form)
  const en = isEnglish(form)

  if (mode === 'engaging') {
    if (type === 'Brand Awareness') return en ? ['What is the first thing you should know about Brutti?', 'What makes a local brand feel genuinely local?', 'If you only remembered one thing about Brutti, what should it be?'] : ['Kalau baru kenal Brutti, apa benda pertama yang patut kamu tahu? 👀', 'Apa yang bikin satu brand lokal betul-betul rasa lokal?', 'Kalau cuma satu benda mau ingat pasal Brutti, apa yang paling patut tinggal?']
    if (type === 'Behind the Scenes') return en ? [`Which part of ${subject} would you want to see more of?`, `What makes a team moment worth remembering?`, `Which small moment usually tells you the most about a team?`] : [`Kalau pasal ${subject}, part mana kamu paling suka tengok? 👀`, 'Kalau cerita team, moment macam mana yang paling senang melekat dalam ingatan?', 'Kadang moment kecil ja yang paling banyak cerita — kamu setuju ka?']
    return en ? [`What would make ${subject} genuinely useful to you?`, `Would ${subject} fit the way you actually use your space?`, `What is the first thing you would check about ${subject}?`] : [`Kalau ${subject} ada depan kamu sekarang, benda apa paling awal kamu mau check? 👀`, `${subject} ni kalau masuk ruang kamu, ngam ka dengan cara kamu guna ruang tu?`, `Apa benda yang paling penting untuk kamu sebelum pilih ${subject}?`]
  }

  if (mode === 'casual') {
    if (type === 'Brand Awareness') return en ? ['Okay, this time let us talk about Brutti itself.', 'No product talk first — this one is about Brutti.', 'Simple one this time: who is Brutti, actually?'] : ['Nah, kali ni kita cerita pasal Brutti sendiri dulu bah.', 'Kali ni bukan cerita produk dulu — kita cerita pasal Brutti.', 'Yang ni simple ja: Brutti ni sebenarnya siapa?']
    if (type === 'Behind the Scenes') return en ? [`Okay, here is the more relaxed side of ${subject}.`, `This one is less work talk, more team moment.`, `No formal story this time — just ${subject} as it happened.`] : [`Nah, yang ni sisi lebih santai dari ${subject}.`, 'Kali ni kurang cerita kerja, lebih kepada moment team ja.', `${subject} ni kita cerita macam dia berlaku ja — tidak payah formal sangat.`]
    return en ? [`Okay, this time we are talking about ${subject}.`, `Let us keep this one simple and talk about ${subject}.`, `No long intro — straight to ${subject}.`] : [`Nah, kali ni kita cerita pasal ${subject} dulu bah.`, `Yang ni kita kasi simple ja — terus cerita pasal ${subject}.`, `Tidak payah intro panjang-panjang, terus pigi ${subject}.`]
  }

  if (mode === 'professional') {
    if (type === 'Brand Awareness') return en ? ['This post introduces the verified identity and direction behind Brutti.', 'Brutti is best understood through its verified identity, values and local roots.', 'A clear brand story begins with the principles that guide the work.'] : ['Posting ini memperkenalkan identiti dan arah Brutti yang telah disahkan.', 'Brutti lebih mudah difahami melalui identiti, nilai dan akar tempatan yang telah disahkan.', 'Cerita brand yang jelas bermula dengan prinsip yang membimbing cara kerja.']
    if (type === 'Behind the Scenes') return en ? [`This post highlights the verified people and moments behind ${subject}.`, `${subject} is presented through the real team context behind the activity.`, `The focus here is the verified team experience behind ${subject}.`] : [`Posting ini menampilkan orang dan moment sebenar di belakang ${subject}.`, `${subject} dikongsikan melalui konteks sebenar team di sebalik aktiviti tersebut.`, `Fokus kali ini ialah pengalaman team yang telah disahkan di belakang ${subject}.`]
    return en ? [`This post focuses on the verified purpose and context of ${subject}.`, `The value of ${subject} is best understood through its verified function and context.`, `A clear assessment of ${subject} begins with the actual need it addresses.`] : [`Kali ini, fokus diberikan kepada fungsi dan konteks ${subject} berdasarkan maklumat yang telah disahkan.`, `Nilai ${subject} lebih jelas apabila dilihat melalui fungsi dan konteks sebenar.`, `Penilaian terhadap ${subject} bermula dengan keperluan sebenar yang ingin diselesaikan.`]
  }

  if (mode === 'hook') {
    if (type === 'Brand Awareness') return en ? ['Brutti is easier to understand when we start with where it comes from.', 'There is more behind the Brutti name than a product list.', 'A local brand story starts long before the sales line.', 'Before the furniture, there is a reason Brutti chooses to work this way.'] : ['Brutti lagi senang difahami bila kita mula dari mana cerita ni datang. 👀', 'Di belakang nama Brutti, ada lebih banyak daripada senarai produk.', 'Cerita brand lokal bermula jauh sebelum ayat jualan.', 'Sebelum cerita furniture, ada sebab kenapa Brutti pilih untuk bekerja dengan cara ni.']
    if (type === 'Behind the Scenes') return en ? [`There is a side of ${subject} the usual workday does not show.`, `The best part of ${subject} may be the small moments in between.`, `Before the work starts again, here is one team story worth keeping.`, `${subject} is not only about the schedule — it is about the people inside it.`] : [`Ada sisi ${subject} yang rutin kerja biasa tidak tunjuk. 👀`, `Part paling best dari ${subject} mungkin datang dari moment kecil di tengah-tengah tu.`, 'Sebelum masuk balik rutin kerja, yang ni satu cerita team memang berbaloi simpan.', `${subject} bukan pasal jadual saja — orang di dalam dia yang bikin cerita tu ada rasa.`]
    return en ? [`There is more to ${subject} than the first thing you see.`, `The interesting part of ${subject} starts where the obvious part ends.`, `One real detail can change how you look at ${subject}.`, `Before you scroll past ${subject}, here is the part worth noticing.`] : [`${subject} ni bukan setakat apa yang nampak di depan mata. 👀`, `Part menarik pasal ${subject} mula lepas benda yang obvious tu.`, `Kadang satu detail ja boleh terus ubah cara kita tengok ${subject}.`, `Sebelum scroll lepas ${subject}, yang ni satu benda patut diperhatikan dulu.`]
  }

  return []
}

function hookFor(form, strategy, mode, version, cycle) {
  let pool = hookPoolFor(form, version)
  const rewritePool = rewriteHookPool(form, mode)
  if (rewritePool.length) pool = rewritePool
  const seed = `${subjectFor(form)}|${strategy.angle}|${typeFor(form)}|${mode}|${version}`
  const index = (stableIndex(seed, pool.length) + Number(cycle || 0)) % pool.length
  return sentence(pool[index])
}

function keyMessageLine(form, strategy, version) {
  if (!strategy.keyMessage) return ''
  const type = typeFor(form)
  const en = isEnglish(form)

  if (type === 'Brand Awareness') {
    if (version === 1) return sentence(en ? `If there is one thing to remember about Brutti, it is this: ${strategy.keyMessage}` : `Kalau satu benda ja mau ingat pasal Brutti, yang ni la: ${strategy.keyMessage}`)
    if (version === 2) return sentence(en ? `Behind the brand language, this is the part that matters: ${strategy.keyMessage}` : `Di belakang semua ayat brand, yang ni part paling penting: ${strategy.keyMessage}`)
    return sentence(en ? `The main Brutti point here is simple: ${strategy.keyMessage}` : `Point utama Brutti kali ni simple ja: ${strategy.keyMessage}`)
  }

  if (type === 'Behind the Scenes') {
    if (version === 2) return sentence(en ? `When the formal work story is stripped away, this is what remains: ${strategy.keyMessage}` : `Kalau buang cerita kerja yang formal-formal, yang tinggal ialah: ${strategy.keyMessage}`)
    return sentence(en ? `The main thing worth keeping from this story is: ${strategy.keyMessage}` : `Kalau ada satu benda mau simpan dari cerita ni, yang ni la: ${strategy.keyMessage}`)
  }

  if (version === 1) return sentence(en ? `For anyone considering it, the key point is simple: ${strategy.keyMessage}` : `Kalau sedang consider benda ni, point paling penting dia simple: ${strategy.keyMessage}`)
  if (version === 2) return sentence(en ? `When the marketing language is stripped away, this is what matters: ${strategy.keyMessage}` : `Kalau buang ayat marketing semua, yang tinggal dan memang penting ialah: ${strategy.keyMessage}`)
  return sentence(en ? `The key thing to remember is this: ${strategy.keyMessage}` : `Kalau ada satu benda mau ingat, yang ni la: ${strategy.keyMessage}`)
}

function contentBridge(form, strategy, version, mode) {
  const type = typeFor(form)
  const subject = subjectFor(form)
  const en = isEnglish(form)

  if (type === 'Brand Awareness') {
    if (mode === 'engaging') return sentence(en ? 'A brand story becomes more interesting when people can connect it to something real.' : 'Cerita brand lagi ada rasa bila orang boleh kaitkan dia dengan benda yang betul-betul nyata.')
    if (mode === 'casual') return sentence(en ? 'No need to make the brand story sound complicated — the real point is enough.' : 'Tidak payah kasi cerita brand bunyi complicated sangat — point sebenar tu sudah cukup.')
    if (mode === 'professional') return sentence(en ? 'A clear brand identity is strongest when its values and origin remain consistent.' : 'Identiti brand lebih jelas apabila nilai dan asal-usulnya kekal konsisten.')
    if (version === 1) return sentence(en ? 'For someone new to Brutti, the useful part is understanding what sits behind the name.' : 'Kalau baru kenal Brutti, yang berguna ialah faham apa yang ada di belakang nama tu.')
    if (version === 2) return sentence(en ? 'Local identity feels more meaningful when it is visible in the way the work is approached.' : 'Identiti lokal lagi ada makna bila dia nampak dalam cara kerja dibuat.')
    return sentence(en ? 'The story is not about sounding bigger — it is about making the Brutti point of view clear.' : 'Cerita ni bukan pasal kasi bunyi besar — yang penting cara Brutti fikir tu jelas.')
  }

  if (type === 'Behind the Scenes') {
    if (mode === 'engaging') return sentence(en ? 'Team stories are easier to connect with when the small real moments stay visible.' : 'Cerita team lagi senang orang connect bila moment kecil yang sebenar tu masih nampak.')
    if (mode === 'casual') return sentence(en ? 'The relaxed moments are part of the story too, not only the work itself.' : 'Moment santai pun sebahagian dari cerita — bukan kerja saja yang ada nilai.')
    if (mode === 'professional') return sentence(en ? 'The team context gives the activity meaning beyond the event schedule itself.' : 'Konteks team memberi makna kepada aktiviti, bukan sekadar jadual event semata-mata.')
    if (version === 1) return sentence(en ? 'For people following Brutti, this is the side that shows who is behind the daily work.' : 'Kalau follow Brutti, sisi macam ni la yang kasi nampak siapa orang di belakang kerja harian.')
    if (version === 2) return sentence(en ? 'The small moments matter because they keep the team story human.' : 'Moment kecil tu penting sebab dia kasi cerita team kekal human.')
    return sentence(en ? 'A behind-the-scenes story works best when the real team moment stays at the centre.' : 'Cerita behind the scenes lagi ngam bila moment team sebenar duduk di tengah cerita.')
  }

  if (type === 'Product Highlight') {
    if (mode === 'engaging') return sentence(en ? `The useful comparison is whether ${subject} fits the way the space is actually used.` : `Compare yang paling berguna ialah sama ada ${subject} ngam dengan cara ruang tu betul-betul digunakan.`)
    if (mode === 'casual') return sentence(en ? 'Keep it simple: start with the function that matters to the space.' : 'Senang cerita, mula dari fungsi yang memang penting untuk ruang tu.')
    if (mode === 'professional') return sentence(en ? 'The product is easier to assess when its verified function is connected to a real use case.' : 'Produk lebih mudah dinilai apabila fungsi yang disahkan dikaitkan dengan penggunaan sebenar.')
    if (version === 1) return sentence(en ? `For the person considering it, the useful question is where ${subject} fits into the real need.` : `Kalau sedang consider, soalan paling berguna ialah ${subject} ni ngam di mana dengan keperluan sebenar.`)
    if (version === 2) return sentence(en ? `A practical detail gives ${subject} more meaning than a broad sales claim.` : `Satu detail praktikal bagi ${subject} lebih banyak makna daripada ayat jualan umum.`)
    return sentence(en ? `The important part is how ${subject} works in actual use.` : `Yang penting, macam mana ${subject} betul-betul berguna masa digunakan nanti.`)
  }

  if (type === 'Educational') {
    if (mode === 'engaging') return sentence(en ? 'A useful tip becomes easier to remember when it connects to a real situation.' : 'Tip lagi senang melekat bila dia terus kena dengan situasi sebenar.')
    if (mode === 'professional') return sentence(en ? 'The guidance should remain practical, specific and easy to apply.' : 'Panduan perlu kekal praktikal, jelas dan mudah digunakan.')
    return sentence(en ? 'The useful part is something people can actually apply later.' : 'Part berguna dia ialah benda yang orang memang boleh apply kemudian.')
  }

  if (type === 'Customer Story') {
    if (version === 2) return sentence(en ? 'The human part comes from the customer situation itself, not from exaggerated emotion.' : 'Bahagian human datang dari situasi customer sendiri, bukan emosi yang dibesar-besarkan.')
    return sentence(en ? 'The real customer need is what keeps the story grounded.' : 'Keperluan sebenar customer yang kasi cerita ni tetap grounded.')
  }

  if (type === 'Promotion') {
    return sentence(en ? 'The offer should stay clear and secondary to whether the product actually fits the need.' : 'Offer kasi jelas, tapi kesesuaian produk dengan keperluan tetap datang dulu.')
  }

  return sentence(en ? `Keep ${subject} connected to the real context.` : `${subject} kita kasi dekat dengan konteks sebenar.`)
}

function supportLine(form, version) {
  const type = typeFor(form)
  const subject = subjectFor(form)
  const en = isEnglish(form)

  if (type === 'Brand Awareness') {
    const lines = en ? ['That is where the Brutti identity becomes easier to recognise.', 'The point is to make the brand feel clear, not louder.', 'A consistent point of view is what gives the story its shape.'] : ['Dari situ identiti Brutti lagi senang orang kenal.', 'Yang penting bukan kasi brand bunyi lebih kuat, tapi kasi dia lebih jelas.', 'Cara fikir yang konsisten tu yang kasi cerita Brutti ada bentuk dia sendiri.']
    return sentence(lines[version])
  }

  if (type === 'Behind the Scenes') {
    const lines = en ? ['The people and the shared moment are already enough to carry the story.', 'That is the part that makes a team story feel close and real.', 'Small moments like these are what keep the story from feeling staged.'] : ['Orang dan moment yang dikongsi tu sudah cukup untuk bawa cerita ni.', 'Yang ni la bikin cerita team rasa dekat dan sebenar.', 'Moment kecil macam ni yang kasi cerita tu tidak rasa dibuat-buat.']
    return sentence(lines[version])
  }

  if (type === 'Product Highlight') {
    const lines = en ? [`That makes ${subject} easier to judge based on fit, not hype.`, 'Function and real context give the product story enough weight.', 'The real use is more useful than adding a bigger claim.'] : [`Dari situ ${subject} lagi senang dinilai ikut kesesuaian, bukan hype.`, 'Fungsi dan konteks sebenar sudah cukup kasi cerita produk tu ada isi.', 'Kegunaan sebenar lagi berguna daripada tambah claim besar-besar.']
    return sentence(lines[version])
  }

  if (type === 'Educational') return sentence(en ? 'Simple, practical and easy to refer back to later.' : 'Simple, praktikal dan senang refer balik bila perlu.')
  if (type === 'Customer Story') return sentence(en ? 'That is what makes the customer story worth listening to.' : 'Yang tu la bikin cerita customer ni berbaloi didengar.')
  if (type === 'Promotion') return sentence(en ? 'Clear details make the next decision easier without adding pressure.' : 'Detail yang jelas kasi keputusan seterusnya lebih senang tanpa pressure.')
  return sentence(en ? `${subject} stays strongest when the real context remains visible.` : `${subject} lagi kuat bila konteks sebenar masih nampak.`)
}

function ctaPool(form, goal) {
  const type = typeFor(form)
  const subject = subjectFor(form)
  const en = isEnglish(form)

  if (type === 'Brand Awareness') {
    const pools = {
      'Comment / Reply': en ? ['What part of the Brutti story would you like to know more about?', 'When you hear “Proudly Sabahan”, what does it mean to you?', 'What makes a local brand feel genuine to you?'] : ['Part mana dari cerita Brutti yang kamu mau tahu lagi?', 'Bila dengar “Proudly Sabahan”, apa benda yang terus kamu fikir?', 'Bagi kamu, apa yang bikin satu brand lokal rasa betul-betul genuine?'],
      'WhatsApp / DM': en ? ['If you want to know more about Brutti or a product, message the team anytime.'] : ['Kalau mau tahu lagi pasal Brutti atau produk, mesej ja team bila-bila.'],
      Save: en ? ['Save this if you want to come back to the Brutti story later.'] : ['Kalau mau refer balik cerita Brutti ni nanti, save ja dulu.'],
      Share: en ? ['Share this with someone who likes discovering local Sabah brands.'] : ['Kalau ada kawan yang suka kenal brand lokal Sabah, boleh share sama dia.'],
      'Natural CTA': en ? ['That is one small part of the Brutti story — there is more to tell as the work continues.', 'If this is your first time getting to know Brutti, welcome to the story.'] : ['Yang ni satu bahagian kecil dari cerita Brutti — banyak lagi boleh dikongsi sepanjang jalan.', 'Kalau ni kali pertama kamu kenal Brutti, welcome masuk dalam cerita kami.'],
    }
    return pools[goal] || pools['Natural CTA']
  }

  if (type === 'Behind the Scenes') {
    const pools = {
      'Comment / Reply': en ? [`Which part of ${subject} would you enjoy seeing more of?`, 'Games, food or team moments — which kind of retreat scene do you enjoy most?', 'Do you enjoy seeing more of the people behind a brand?'] : [`Kalau pasal ${subject}, part mana kamu paling suka tengok?`, 'Games, makan-makan atau moment team — yang mana satu kamu paling suka tengok kalau cerita retreat?', 'Kamu suka ka tengok lebih banyak sisi orang di belakang satu brand?'],
      'WhatsApp / DM': en ? ['Want to know more about the Brutti team or what we do? Message us anytime.'] : ['Kalau mau tahu lagi pasal team Brutti atau apa kami buat, mesej ja bila-bila.'],
      Save: en ? ['Save this little team memory and come back to it later.'] : ['Save ja dulu memory team yang ni, nanti boleh tengok balik.'],
      Share: en ? ['Share this with the teammate who would enjoy a retreat like this.'] : ['Kalau ada teammate yang memang suka vibe retreat macam ni, share ja sama dia.'],
      'Natural CTA': en ? ['Back to work after this — but this team memory stays with us.', 'One team memory saved. Now back to building the next Brutti story.'] : ['Lepas ni sambung kerja balik — tapi memory team yang ni kita simpan dulu.', 'Satu memory team sudah simpan. Lepas ni sambung bikin cerita Brutti yang seterusnya.'],
    }
    return pools[goal] || pools['Natural CTA']
  }

  const pools = {
    'Comment / Reply': en ? [`What would you want to know about ${subject}?`, `Which part matters most to you?`, `What is the first thing you would check before deciding?`] : [`Kalau kamu, part mana pasal ${subject} yang paling kamu mau tahu?`, 'Kalau ikut keperluan kamu, part mana paling penting?', 'Apa benda pertama yang kamu akan check sebelum decide?'],
    'WhatsApp / DM': en ? ['Message the Brutti team if you want to check the details together.', 'DM us if you want to compare the available verified details.'] : ['Kalau mau check detail sama-sama, mesej ja team Brutti.', 'Kalau mau compare detail yang ada dulu, DM ja team Brutti.'],
    Save: en ? ['Save this first if it may be useful when you plan later.', 'Keep this saved if you are still comparing options.'] : ['Kalau berguna, save ja dulu. Nanti senang refer balik masa perlu.', 'Kalau masih dalam fasa compare, save dulu post ni untuk refer balik.'],
    Share: en ? ['Share this with someone planning something similar.', 'Send this to someone dealing with the same kind of need.'] : ['Kalau ada kawan yang sedang plan benda sama, share ja sama dia.', 'Kalau ada orang yang tengah cari benda lebih kurang sama, boleh share post ni sama dia.'],
    'Natural CTA': en ? ['If you want to know more, message the Brutti team and we can check the details together.', 'Keep this in mind if it matches what you are planning.'] : ['Kalau mau tahu lebih lanjut, mesej ja team Brutti dan kita check detail sama-sama.', 'Kalau benda ni ngam dengan apa yang kamu sedang plan, boleh simpan dalam list dulu.'],
  }
  return pools[goal] || pools['Natural CTA']
}

function ctaFor(form, strategy, mode, version, cycle) {
  let goal = strategy.ctaGoal
  if (mode === 'engaging') goal = 'Comment / Reply'
  if (mode === 'cta') goal = CTA_ROTATION[Number(cycle || 0) % CTA_ROTATION.length]
  if (goal === 'Auto') goal = 'Natural CTA'
  const pool = ctaPool(form, goal)
  return sentence(pool[(Number(version || 0) + Number(cycle || 0)) % pool.length])
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

  if (form.tone === 'Warm & confident') next = next.replace(/\bkita\b/g, 'kami')
  if (form.tone === 'Practical & friendly') next = next.replace(/betul-betul/g, 'memang')
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

function fallbackLines(form) {
  const type = typeFor(form)
  const subject = subjectFor(form)
  const en = isEnglish(form)
  if (type === 'Brand Awareness') return en ? ['That is one more way to understand what Brutti stands for.', 'The story stays simple because the identity itself should be clear.', 'There is still more of the Brutti story to share.'] : ['Yang ni satu lagi cara senang mau faham apa yang Brutti pegang.', 'Cerita dia kita kasi simple sebab identiti tu sendiri patut jelas.', 'Masih banyak lagi cerita Brutti yang boleh dikongsi lepas ni.']
  if (type === 'Behind the Scenes') return en ? ['The small moments are part of the team story too.', 'That is one memory worth keeping from the day.', 'The people behind the work matter as much as the work itself.'] : ['Moment kecil pun sebahagian dari cerita team.', 'Yang ni satu memory memang berbaloi simpan dari hari tu.', 'Orang di belakang kerja pun sama penting dengan kerja yang orang nampak.']
  if (type === 'Product Highlight') return en ? [`What matters is how ${subject} fits the real use.`, 'A clear function makes the product easier to understand.', 'The best next step is to compare it with what the space actually needs.'] : [`Yang penting, macam mana ${subject} ngam dengan penggunaan sebenar.`, 'Bila fungsi jelas, produk tu lagi senang difahami.', 'Next step paling senang ialah compare dengan apa ruang tu memang perlukan.']
  return en ? [`Keep ${subject} close to the real context.`, 'One clear point is enough to keep the story useful.', 'Simple and specific usually works better than saying too much.'] : [`${subject} kita kasi dekat dengan konteks sebenar.`, 'Satu point yang jelas sudah cukup kasi cerita tu berguna.', 'Simple dan specific selalunya lagi ngam daripada cerita terlalu banyak.']
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
  const fallback = fallbackLines(form)
  let cursor = 0
  while (unique.length < minLines && cursor < fallback.length) {
    const next = sentence(fallback[cursor])
    if (!unique.some((line) => line.toLowerCase() === next.toLowerCase())) unique.splice(Math.max(1, unique.length - 1), 0, next)
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

function buildBody(form, context, mode, version, cycle) {
  const facts = orderFacts(context.verifiedFacts, version)
  const hook = hookFor(form, context.strategy, mode, version, cycle)
  const keyLine = keyMessageLine(form, context.strategy, version)
  const bridge = contentBridge(form, context.strategy, version, mode)
  const support = supportLine(form, version)
  const cta = ctaFor(form, context.strategy, mode, version, cycle)

  if (mode === 'shorten') {
    return [hook, ...facts.slice(0, 3), keyLine || bridge, support, cta]
  }

  if (version === 1) {
    return [hook, bridge, ...facts, keyLine, support, cta]
  }

  if (version === 2) {
    const firstFact = facts[0] || ''
    return [hook, firstFact, bridge, ...facts.slice(1), keyLine, support, cta]
  }

  return [hook, ...facts, keyLine, bridge, support, cta]
}

export function buildContentStudioContext(form, controls = {}) {
  const strategy = strategyFor(form, controls)
  return {
    source: SOUL_SOURCE_LABEL,
    subject: subjectFor(form),
    platform: form.platform || 'Facebook',
    contentType: typeFor(form),
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
  return enforceShape(buildBody(form, context, mode, version, cycle), form.brief, form, mode).join('\n')
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
