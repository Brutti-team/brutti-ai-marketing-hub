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
    lines.push('Bila barang makin banyak, ruang pun cepat rasa penuh dan berselerak.')
  }

  if (storage || practical) {
    lines.push('Satu tip simple: asingkan barang ikut kekerapan guna supaya yang selalu dipakai senang dicapai.')
  }

  if (storage) {
    lines.push('Ruang yang jarang digunakan, termasuk bahagian bawah katil, boleh dimanfaatkan sebagai storage tambahan.')
  }

  const drawer = drawerPhrase(direction)
  const selectedProductMentioned = product && lower.includes(product.toLowerCase())
  if (selectedProductMentioned && drawer) {
    lines.push(`${product} dengan ${drawer} boleh bantu manfaatkan ruang bawah katil untuk simpan barang dengan lebih teratur.`)
  }

  if (!lines.length) {
    lines.push('Yang penting, idea content tu diterjemahkan kepada situasi sebenar yang audience boleh terus faham.')
    lines.push('Biar ayat rasa natural, sementara fakta yang sudah disahkan kekal sebagai rujukan utama.')
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
    lines.push('When belongings start piling up, a room can quickly feel crowded and cluttered.')
  }

  if (storage || practical) {
    lines.push('One simple tip is to organise items by how often you use them, so everyday essentials stay easy to reach.')
  }

  if (storage) {
    lines.push('Underused areas, including the space beneath a bed, can become useful extra storage.')
  }

  const drawer = drawerPhrase(direction)
  const selectedProductMentioned = product && lower.includes(product.toLowerCase())
  if (selectedProductMentioned && drawer) {
    lines.push(`${product} with ${drawer} can help make better use of under-bed space for more organised storage.`)
  }

  if (!lines.length) {
    lines.push('The direction should become a real audience-facing idea rather than appearing as an instruction in the caption.')
    lines.push('Keep the wording natural while using the verified facts as the source of truth.')
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
  const sanitized = sanitizeCaption(outputField.value, directionField.value, product, language)

  if (sanitized !== outputField.value) setReactTextareaValue(outputField, sanitized)
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
