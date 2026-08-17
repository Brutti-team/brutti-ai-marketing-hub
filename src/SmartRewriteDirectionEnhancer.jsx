import { useEffect } from 'react'

const stopWords = new Set([
  'yang', 'dan', 'atau', 'untuk', 'dengan', 'dalam', 'pada', 'satu', 'sebagai', 'hanya', 'jika', 'sudah', 'telah',
  'the', 'and', 'or', 'for', 'with', 'into', 'from', 'that', 'this', 'only', 'when', 'already', 'about',
])

const metaInstructionPattern = /\b(?:terangkan|jelaskan|ceritakan|berikan|beri satu|gunakan .{0,80}sebagai contoh|masukkan|sebutkan|sebut|tulis|buat caption|fokuskan|fokus pada|jangan|hanya jika|butiran produk.{0,40}disahkan|product library|verified facts?|direction|arahan|explain|describe|give one|use .{0,80}as (?:an? )?example|include|mention|write|focus on|do not|don't|only if|product details?.{0,40}verified)\b/i

const imperativePattern = /^(?:terangkan|jelaskan|ceritakan|berikan|beri|gunakan|masukkan|sebut|tulis|buat|fokus|jangan|explain|describe|give|use|include|mention|write|focus|do not|don't)\b/i

const clean = (value = '') => value.replace(/\s+/g, ' ').trim()

function words(value = '') {
  return clean(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
}

function overlapScore(left, right) {
  const a = new Set(words(left))
  const b = new Set(words(right))
  if (!a.size || !b.size) return 0
  let common = 0
  a.forEach((word) => { if (b.has(word)) common += 1 })
  return common / Math.min(a.size, b.size)
}

function directionSentences(value = '') {
  return clean(value)
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean)
}

function isCopiedInstruction(line, instructions) {
  const value = clean(line)
  if (!value || value.startsWith('#')) return false
  if (metaInstructionPattern.test(value)) return true

  const closest = instructions.reduce((best, instruction) => Math.max(best, overlapScore(value, instruction)), 0)
  return imperativePattern.test(value) && closest >= 0.48
}

function findField(form, labelPrefix, selector) {
  const label = Array.from(form?.querySelectorAll('label') || []).find((item) => clean(item.textContent).startsWith(labelPrefix))
  return label?.querySelector(selector) || null
}

function drawerPhrase(direction) {
  const match = direction.match(/\b(?:\d+|dua|two)\s+(?:drawer|laci)(?:\s+(?:extra|tambahan))?\b/i)
  return match ? clean(match[0]) : ''
}

function bmNaturalLines(direction, product) {
  const lower = direction.toLowerCase()
  const lines = []
  const spaceProblem = /(ruang|bilik|rumah).{0,45}(penuh|sempit|berselerak|tidak tersusun|tak tersusun)|(?:penuh|berselerak|tidak tersusun|tak tersusun).{0,35}(ruang|bilik|rumah)/i.test(direction)
  const storage = /storage|storan|penyimpanan|simpan|drawer|laci/i.test(direction)
  const practical = /tip|tips|praktikal|practical|solusi|solution/i.test(direction)

  if (spaceProblem) {
    lines.push('Barang makin banyak, ruang pun rasa makin sempit kan? 👀')
  }

  if (storage || practical) {
    lines.push('Tip simple ja: barang yang selalu guna kasi dekat, yang jarang guna simpan elok-elok.')
  }

  if (storage) {
    lines.push('Ruang bawah katil pun jangan kasi kosong begitu ja, boleh jadi extra storage.')
  }

  const drawer = drawerPhrase(direction)
  const selectedProductMentioned = product && lower.includes(product.toLowerCase())
  if (selectedProductMentioned && drawer) {
    lines.push(`Kalau tengok ${product}, ${drawer} tu memang handy untuk kasi barang lebih kemas tanpa makan ruang lain.`)
  }

  if (!lines.length) {
    lines.push('Senang ja, ambil point yang penting dan cerita macam kita bercakap sama customer.')
    lines.push('Fakta yang sudah confirm kita pegang, tapi ayat biar santai dan senang orang baca.')
  }

  return lines
}

function enNaturalLines(direction, product) {
  const lower = direction.toLowerCase()
  const lines = []
  const spaceProblem = /(space|room|bedroom).{0,45}(full|crowded|cluttered|messy|unorganised|unorganized)|(?:crowded|cluttered|messy|unorganised|unorganized).{0,35}(space|room|bedroom)/i.test(direction)
  const storage = /storage|store|drawer|organis|organiz/i.test(direction)
  const practical = /tip|practical|solution/i.test(direction)

  if (spaceProblem) {
    lines.push('Stuff piling up and the room starting to feel sempit? 👀')
  }

  if (storage || practical) {
    lines.push('Simple tip: keep the things you use often nearby, and store the rest properly.')
  }

  if (storage) {
    lines.push('Even the space under the bed can become handy extra storage instead of sitting empty.')
  }

  const drawer = drawerPhrase(direction)
  const selectedProductMentioned = product && lower.includes(product.toLowerCase())
  if (selectedProductMentioned && drawer) {
    lines.push(`${product} with ${drawer} can make under-bed storage a lot easier to keep tidy.`)
  }

  if (!lines.length) {
    lines.push('Keep the point clear, but say it the way the team would actually talk to a customer.')
    lines.push('Verified facts stay the same; the wording can still feel relaxed and easy to read.')
  }

  return lines
}

function naturalReplacementPool(direction, product, language) {
  if (language === 'English') return enNaturalLines(direction, product)
  if (language === 'BM + English') return [...bmNaturalLines(direction, product), ...enNaturalLines(direction, product)]
  return bmNaturalLines(direction, product)
}

function sanitizeCaption(output, direction, product, language) {
  const instructions = directionSentences(direction).filter((sentence) => metaInstructionPattern.test(sentence) || imperativePattern.test(sentence))
  if (!instructions.length) return output

  const replacements = naturalReplacementPool(direction, product, language)
  let replacementIndex = 0
  let changed = false

  const nextLines = output.split('\n').map((line) => {
    if (!isCopiedInstruction(line, instructions)) return line
    changed = true
    const replacement = replacements[replacementIndex % replacements.length]
    replacementIndex += 1
    return replacement
  })

  return changed ? nextLines.join('\n') : output
}

const exactCasualLines = new Map([
  ['Kami share supaya kamurang boleh kenal cara Brutti fikir pasal ruang dengan lebih dekat.', 'Kami share ja benda yang memang boleh bagi idea untuk ruang kamu.'],
  ['Bagi kami, direction yang baik mesti datang dari keperluan sebenar.', 'Bagi team, senang ja — tengok dulu apa yang ruang tu betul-betul perlukan.'],
  ['Tidak perlu terlalu complicated kalau fungsi dia sudah jelas.', 'Kalau fungsi dia sudah jelas, tidak payah complicated sangat.'],
  ['Setiap ruang boleh ada jawapan yang berbeza.', 'Lain ruang, lain cara dia. Tidak semestinya semua kena ikut benda yang sama.'],
  ['Yang penting bukan ikut trend semata-mata, tapi sesuai dengan orang yang guna ruang tu.', 'Trend tu boleh tengok, tapi yang penting ngam dengan cara kamu guna ruang tu.'],
  ['Kalau fungsi dan susunan sudah kena, barula keseluruhan ruang rasa lebih masuk akal.', 'Kalau fungsi dengan susunan sudah ngam, terus rasa lebih senang guna ruang tu.'],
  ['Kalau kamu suka benda yang practical, yang ni boleh masuk dalam list untuk dibandingkan.', 'Kalau kamu suka benda practical, yang ni boleh masuk list dulu.'],
  ['Tengok fungsi dia dulu, kemudian baru nilai sama ada sesuai dengan ruang kamu.', 'Tengok fungsi dulu. Kalau ngam dengan ruang kamu, baru fikir next step.'],
  ['Pilihan yang sesuai bergantung pada ruang, kegunaan dan detail yang sudah disahkan.', 'Yang ngam tu ikut ruang, cara guna dan detail yang sudah confirm.'],
  ['Benda yang berguna setiap hari selalunya menang pada fungsi.', 'Kalau hari-hari boleh guna dengan senang, itu sudah kira win.'],
  ['Tidak semestinya satu pilihan sesuai untuk semua ruang.', 'Bukan semua benda ngam untuk semua ruang, itu normal.'],
  ['Kalau detail dia match dengan apa yang kamu perlukan, barula senang mau proceed.', 'Kalau detail dia ngam dengan apa yang kamu cari, senang la mau proceed.'],
  ['Simple ja, tapi benda macam ni memang berguna masa planning.', 'Simple ja, tapi benda macam ni memang membantu masa kamu plan ruang.'],
  ['Boleh simpan tip ni untuk rujukan bila kamu susun ruang nanti.', 'Boleh save tip ni dulu, nanti senang refer balik masa susun ruang.'],
  ['Cuba apply ikut keadaan ruang sendiri, bukan ikut satu formula saja.', 'Cuba ikut keadaan ruang sendiri. Tidak payah paksa ikut satu formula.'],
  ['Fungsi harian biasanya bagi clue paling jelas untuk pilih susunan yang sesuai.', 'Cara kamu guna ruang hari-hari tu sebenarnya clue paling senang.'],
  ['Sebelum beli atau buat keputusan, ukur dan semak keperluan dulu.', 'Sebelum confirm apa-apa, ukur dulu ruang dan check apa yang betul-betul perlu.'],
  ['Planning awal boleh kurangkan banyak trial and error kemudian.', 'Plan awal sikit, kurang la trial and error kemudian.'],
  ['Kami kasi susun info supaya senang kamurang baca satu-satu.', 'Team kasi susun point satu-satu supaya senang kamu baca.'],
  ['Yang penting, fakta kena jelas dan maksud asal jangan lari.', 'Yang penting fakta jangan lari, ayat tu kita kasi santai ja.'],
  ['Kalau ada detail yang belum confirm, lebih baik check dulu dengan team.', 'Kalau ada detail belum confirm, roger ja team dulu.'],
  ['Tidak semua post perlu bunyi sama — ikut cerita dan tujuan content tu.', 'Tidak semua post perlu bunyi sama. Ikut cerita dia baru best.'],
  ['Kami cuba kasi ayat rasa natural, bukan terlalu menjual.', 'Tidak payah hard sell sangat, cerita kasi natural ja.'],
  ['Biar santai, tapi info penting masih senang nampak.', 'Santai-santai pun info penting masih boleh sampai.'],
  ['Kalau mau tahu detail yang sudah disahkan, roger ja team Brutti.', 'Kalau mau tahu detail, roger ja team. Kami checkkan untuk kamu 👀'],
  ['Kalau mau bincang pilihan yang sesuai, boleh terus hubungi team Brutti.', 'Kalau mau cari mana yang ngam untuk ruang kamu, mesej ja team.'],
])

const formalPhraseReplacements = [
  [/\bmemanfaatkan\b/gi, 'guna'],
  [/\bdimanfaatkan\b/gi, 'diguna'],
  [/\bmanfaatkan\b/gi, 'guna'],
  [/\bpenyimpanan\b/gi, 'storage'],
  [/\bkeperluan sebenar\b/gi, 'apa yang memang kamu perlukan'],
  [/\bsesuai dengan ruang kamu\b/gi, 'ngam dengan ruang kamu'],
  [/\bmembuat keputusan\b/gi, 'confirm'],
  [/\bbuat keputusan\b/gi, 'confirm'],
  [/\bsemak\b/gi, 'check'],
  [/\bbutiran\b/gi, 'detail'],
  [/\bmenggunakan\b/gi, 'guna'],
  [/\bmerupakan\b/gi, 'memang'],
  [/\bmemberikan\b/gi, 'bagi'],
  [/\bdapat membantu\b/gi, 'boleh bantu'],
  [/\bmembantu\b/gi, 'bantu'],
  [/\blebih teratur\b/gi, 'lebih kemas'],
  [/\bberdasarkan detail yang team sudah confirm\b/gi, 'dengan detail yang team sudah confirm'],
]

function polishBmLine(line, index, professionalMode) {
  const trimmed = clean(line)
  if (!trimmed || trimmed.startsWith('#')) return line
  if (/^(?:Product Details?|Detail Produk|📍|🗓️|🕗|◼️|◾️|▪️|•)/i.test(trimmed)) return line

  const exact = exactCasualLines.get(trimmed)
  if (exact) return professionalMode ? exact.replace(/\broger ja team\b/i, 'mesej team').replace(/\bngam\b/gi, 'sesuai') : exact

  let next = line
  formalPhraseReplacements.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement)
  })

  next = next
    .replace(/^Untuk kali ni, kami kasi spotlight sikit sama (.+)\.$/i, 'Kali ni kita tengok $1 pula 👀')
    .replace(/^Nama dia (.+), dan kali ni kita fokus pada fungsi yang sudah disahkan\.$/i, '$1 ni kita tengok fungsi dia dulu.')
    .replace(/^(.+) masuk dalam pilihan kali ni dengan detail yang team sudah confirm\.$/i, '$1 ni ada beberapa detail yang team sudah confirm, jadi senang kita tengok fungsi dia.')
    .replace(/^Di Brutti, kami selalu mula dengan cara ruang tu betul-betul digunakan\.$/i, 'Di Brutti, team selalu tengok dulu kamu guna ruang tu macam mana.')
    .replace(/^Kadang-kadang benda yang simple pun boleh bikin ruang rasa lebih teratur\.$/i, 'Kadang-kadang benda simple ja pun boleh kasi ruang nampak jauh lebih kemas.')

  if (!professionalMode) {
    next = next
      .replace(/\bmahu\b/gi, 'mau')
      .replace(/\bsahaja\b/gi, 'ja')
      .replace(/\btidak perlu\b/gi, 'tidak payah')
      .replace(/\blebih mudah\b/gi, 'lebih senang')
  }

  if (index === 0 && !professionalMode && !/[!?👀🤭😅✨]$/u.test(clean(next)) && /\b(?:ruang|bilik|barang|storage|produk|kamu)\b/i.test(next)) {
    next = `${clean(next)} 👀`
  }

  return next
}

function limitCasualMarkers(output) {
  let emojiCount = 0
  let bahCount = 0
  let ngamCount = 0
  return output.split('\n').map((line) => {
    let next = line
    next = next.replace(/[👀🤭😅✨🤣😂]/gu, (emoji) => {
      emojiCount += 1
      return emojiCount <= 2 ? emoji : ''
    })
    next = next.replace(/\bbah\b/gi, (value) => {
      bahCount += 1
      return bahCount <= 2 ? value : ''
    })
    next = next.replace(/\bngam\b/gi, (value) => {
      ngamCount += 1
      return ngamCount <= 3 ? value : 'sesuai'
    })
    return next.replace(/\s{2,}/g, ' ').trimEnd()
  }).join('\n')
}

function polishBruttiFacebookVoice(output, language, professionalMode = false) {
  if (!output || language === 'English') return output
  const polished = output.split('\n').map((line, index) => polishBmLine(line, index, professionalMode)).join('\n')
  return limitCasualMarkers(polished)
}

function setReactTextareaValue(textarea, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
  if (setter) setter.call(textarea, value)
  else textarea.value = value
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

function applyDirectionGuard() {
  const directionField = Array.from(document.querySelectorAll('label')).find((label) => clean(label.textContent).startsWith('Verified facts / direction'))?.querySelector('textarea')
  const outputField = document.querySelector('.output-editor-label textarea')
  if (!directionField || !outputField || !clean(outputField.value)) return

  const form = directionField.closest('form')
  const productField = findField(form, 'Product', 'select')
  const languageField = findField(form, 'Language', 'select')
  const product = productField?.value && productField.value !== 'General / No Product' ? productField.value : ''
  const language = languageField?.value || 'Bahasa Melayu'
  const professionalMode = Array.from(document.querySelectorAll('.smart-rewrite-panel button.active')).some((button) => /More professional/i.test(clean(button.textContent)))
  const sanitized = sanitizeCaption(outputField.value, directionField.value, product, language)
  const polished = polishBruttiFacebookVoice(sanitized, language, professionalMode)

  if (polished !== outputField.value) setReactTextareaValue(outputField, polished)
}

export default function SmartRewriteDirectionEnhancer() {
  useEffect(() => {
    const timers = new Set()
    const schedule = () => {
      ;[0, 40, 120, 260].forEach((delay) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer)
          applyDirectionGuard()
        }, delay)
        timers.add(timer)
      })
    }

    const onClick = (event) => {
      const button = event.target.closest('button')
      if (!button) return
      const text = clean(button.textContent)
      const rewriteAction = Boolean(button.closest('.smart-rewrite-panel'))
      const generateAction = /Generate free structured draft/i.test(text)
      if (rewriteAction || generateAction) schedule()
    }

    const onSubmit = (event) => {
      if (event.target.querySelector('label textarea') && event.target.textContent.includes('Verified facts / direction')) schedule()
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    schedule()

    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
