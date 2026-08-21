import { useEffect } from 'react'

const DIRECTION_LINE_RE = /\b(fokus posting|tujuan posting|objective posting|content direction|arah content|gaya caption|tone|style caption|buat caption|susun caption|mulakan dengan|kemudian sambung|gunakan gaya|tulis dalam|recap yang|jangan hard sell|tidak hard sell|bukan hard sell|jangan menjual|minimum|maksimum|\d+\s*[–-]\s*\d+\s*baris|new hook|new cta)\b/i

function cleanLine(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sanitizeCaption(value = '') {
  const lines = String(value || '')
    .split('\n')
    .map(cleanLine)
    .filter(Boolean)

  if (lines.length < 7) return value

  const filtered = lines.filter((line) => !DIRECTION_LINE_RE.test(line))
  if (filtered.length < 7 || filtered.length === lines.length) return value
  return filtered.slice(0, 13).join('\n')
}

function setReactValue(element, value) {
  if (!element || element.value === value) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function applyGuard() {
  const page = [...document.querySelectorAll('#root .page')]
    .find((item) => item.offsetParent !== null && item.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio')
  const textarea = page?.querySelector('.output-editor-label textarea')
  if (!textarea?.value?.trim()) return
  const next = sanitizeCaption(textarea.value)
  if (next !== textarea.value) setReactValue(textarea, next)
}

export default function FreeAssistOutputGuard() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 165) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(applyGuard, delay)
    }

    const onSubmit = (event) => {
      if (event.target.matches?.('.generator-form')) schedule(190)
    }
    const onClick = (event) => {
      if (event.target.closest?.('.rewrite-actions, .variation-row')) schedule(190)
    }
    const onChange = (event) => {
      if (event.target.matches?.('.output-editor-label textarea')) schedule(35)
    }

    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('change', onChange, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('change', onChange, true)
    }
  }, [])

  return null
}
