import { useEffect } from 'react'
import soulMasterDoc from './Brutti_Soul_MasterDoc.md?raw'

const soulReady = soulMasterDoc.includes('## 2. THE VOICE') && soulMasterDoc.includes('## 6. HOW WE WRITE A POST')

const hooks = [
  'Nah, yang ni memang ada cerita dia sendiri. 👀',
  'Kadang-kadang satu detail kecil tu la yang paling banyak cerita di belakang dia.',
  'Kalau tinguk betul-betul, benda ni bukan pasal rupa ja.',
]

const engagingHooks = [
  'Yang ni kalau cerita dari hujung memang rugi — kena mula dari awal. 👀',
  'Ada sebab kenapa benda ni kami rasa layak diceritakan.',
  'Nampak simple, tapi cerita di belakang dia memang lain sikit.',
]

const casualHooks = [
  'Nah, kali ni kami cerita santai-santai ja pasal benda ni. 👀',
  'Yang ni memang jenis cerita yang kami suka share terus terang ja.',
  'Kalau kamu tinguk dari luar memang simple, tapi ada cerita dia bah.',
]

const ctas = [
  'Kalau ada benda kamu mau tanya, roger ja team Brutti.',
  'Kalau kamu ada ruang atau idea yang mau dibincang, share ja sama team Brutti.',
  'Kalau mau check detail yang ngam dengan keperluan kamu, mesej ja team.',
]

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function activeStudio() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio') || null
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

function stripHashtags(value) {
  return value
    .replace(/#[\p{L}\p{N}_-]+/gu, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function professionalize(line) {
  return line
    .replace(/\broger ja\b/gi, 'mesej')
    .replace(/\btidak payah\b/gi, 'tidak perlu')
    .replace(/\bmau\b/gi, 'mahu')
    .replace(/\bngam\b/gi, 'sesuai')
    .replace(/\bkasi\b/gi, 'berikan')
    .replace(/\bbah\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function casualize(line) {
  return line
    .replace(/\bmahu\b/gi, 'mau')
    .replace(/\bsesuai\b/gi, 'ngam')
    .replace(/\bberikan\b/gi, 'kasi')
    .replace(/\btidak perlu\b/gi, 'tidak payah')
    .trim()
}

function nextFrom(pool, current) {
  const index = pool.findIndex((item) => clean(item) === clean(current))
  return pool[(index + 1 + pool.length) % pool.length]
}

function rewriteCaption(value, mode, variation = 0) {
  let lines = stripHashtags(value)
  if (!lines.length) return value

  const first = lines[0]
  const last = lines[lines.length - 1]
  const middle = lines.slice(1, -1)

  if (mode === 'engaging') {
    lines[0] = engagingHooks[variation % engagingHooks.length]
    lines[lines.length - 1] = ctas[(variation + 1) % ctas.length]
  } else if (mode === 'casual') {
    lines = lines.map(casualize)
    lines[0] = casualHooks[variation % casualHooks.length]
  } else if (mode === 'professional') {
    lines = lines.map(professionalize)
    lines[0] = professionalize(first)
  } else if (mode === 'shorten') {
    const target = Math.min(7, lines.length)
    if (target >= 2) lines = [first, ...middle.slice(0, Math.max(0, target - 2)), last]
  } else if (mode === 'hook') {
    lines[0] = nextFrom(hooks, first)
  } else if (mode === 'cta') {
    lines[lines.length - 1] = nextFrom(ctas, last)
  } else if (mode === 'version') {
    const hookPool = variation === 1 ? casualHooks : variation === 2 ? engagingHooks : hooks
    const reordered = variation === 1
      ? [...middle.slice(1), ...middle.slice(0, 1)]
      : variation === 2
        ? [...middle].reverse()
        : middle
    lines = [hookPool[variation % hookPool.length], ...reordered, ctas[variation % ctas.length]]
  }

  return lines
    .map(clean)
    .filter(Boolean)
    .slice(0, 13)
    .join('\n')
    .replace(/#[\p{L}\p{N}_-]+/gu, '')
    .trim()
}

function markActive(button, isVersion) {
  const page = activeStudio()
  if (!page) return
  page.querySelectorAll('.rewrite-actions button, .variation-row button').forEach((item) => item.classList.remove('active'))
  button.classList.add('active')
  if (!isVersion) {
    const versionOne = [...page.querySelectorAll('.variation-row button')]
      .find((item) => /version\s*1/i.test(item.textContent || ''))
    versionOne?.classList.remove('active')
  }
}

function hideHashtagControl() {
  const page = activeStudio()
  if (!page) return
  const hashtag = [...page.querySelectorAll('.rewrite-actions button')]
    .find((button) => /hashtag/i.test(button.textContent || ''))
  if (hashtag) hashtag.style.display = 'none'
}

function applyRewrite(button, mode, variation = 0, isVersion = false) {
  const page = activeStudio()
  const output = page?.querySelector('.output-editor-label textarea')
  if (!output || !clean(output.value)) return
  const next = rewriteCaption(output.value, mode, variation)
  setReactValue(output, next)
  markActive(button, isVersion)
  window.setTimeout(() => markActive(button, isVersion), 80)
}

export default function BruttiRewriteControlsFix() {
  useEffect(() => {
    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (!button) return

      if (button.closest('.rewrite-actions')) {
        const label = clean(button.textContent)
        if (/hashtag/i.test(label)) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          hideHashtagControl()
          return
        }

        const mode = /engaging/i.test(label) ? 'engaging'
          : /casual/i.test(label) ? 'casual'
            : /professional/i.test(label) ? 'professional'
              : /shorter/i.test(label) ? 'shorten'
                : /hook/i.test(label) ? 'hook'
                  : /cta/i.test(label) ? 'cta'
                    : null
        if (!mode) return

        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        applyRewrite(button, mode)
        return
      }

      if (button.closest('.variation-row')) {
        const match = clean(button.textContent).match(/(\d+)/)
        const variation = Math.max(0, Number(match?.[1] || 1) - 1)
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        applyRewrite(button, 'version', variation, true)
        return
      }

      if (button.closest('.nav-link') || button.closest('.tab-bar')) {
        window.setTimeout(hideHashtagControl, 60)
      }
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      window.setTimeout(hideHashtagControl, 60)
      window.setTimeout(hideHashtagControl, 180)
    }

    if (soulReady) {
      window.setTimeout(hideHashtagControl, 80)
      window.setTimeout(hideHashtagControl, 400)
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [])

  return null
}
