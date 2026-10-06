import { useState } from 'react'
import { CAPTION_GOALS, generateBmCaptions, isBlankField } from './lib/bmCaptionGenerator'
import { buildGeminiCaptionRequest, finalizeGeminiCaptions } from './lib/bmGeminiCaption'
import { callMarketingApi } from './lib/googleWorkspace'
import './bm-caption-studio.css'

const NO_PRODUCT = ''

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function optionValue(product) {
  return String(product.id || product.name)
}

function copyText(text, toast) {
  const done = () => toast('Kapsyen disalin.')
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => {
      if (fallbackCopy(text)) done()
      else toast('Salin tidak berjaya. Sila pilih teks dan salin secara manual.')
    })
    return
  }
  if (fallbackCopy(text)) done()
  else toast('Salin tidak berjaya. Sila pilih teks dan salin secara manual.')
}

function fallbackCopy(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.append(area)
  area.select()
  let ok = false
  try { ok = document.execCommand('copy') } catch { ok = false }
  area.remove()
  return ok
}

function FactPreview({ product }) {
  if (!product) return null
  const rows = [
    ['Harga', product.price],
    ['Material', product.material],
    ['Dimensi', product.dimensions],
    ['Warna', product.colour || product.color],
  ]
  return (
    <ul className="bm-caption-facts">
      {rows.map(([label, value]) => {
        const filled = !isBlankField(value)
        return (
          <li key={label}>
            <strong>{label}</strong>
            <span>{filled ? clean(value) : 'tidak diisi, tidak akan ditulis'}</span>
          </li>
        )
      })}
    </ul>
  )
}

function CaptionCard({ platform, text, onChange, onCopy, hint }) {
  return (
    <article className="bm-caption-card">
      <div className="bm-caption-card-head">
        <h3>{platform}</h3>
        <button type="button" className="button secondary small" onClick={onCopy} disabled={!text}>Salin {platform}</button>
      </div>
      {hint ? <p className="bm-caption-hint">{hint}</p> : null}
      <textarea
        data-user-content="true"
        readOnly={!text}
        rows={16}
        value={text}
        onChange={onChange}
        aria-label={`Kapsyen ${platform}`}
        placeholder="Kapsyen akan muncul di sini."
      />
    </article>
  )
}

export default function BmCaptionStudio({ productOptions = [], toast }) {
  const [productId, setProductId] = useState(NO_PRODUCT)
  const [topic, setTopic] = useState('')
  const [goal, setGoal] = useState('highlight')
  const [note, setNote] = useState('')
  const [showTikTok, setShowTikTok] = useState(false)
  const [variation, setVariation] = useState(0)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const product = productOptions.find((item) => optionValue(item) === productId) || null

  const clearResult = () => setResult(null)

  const run = async (nextVariation) => {
    if (busy) return
    if (!product && !topic.trim()) {
      toast('Pilih produk atau tulis topik dahulu.')
      return
    }
    const input = {
      product,
      topic: product ? '' : topic,
      goal,
      note,
      variation: nextVariation,
    }
    setBusy(true)
    let output = null
    try {
      const request = buildGeminiCaptionRequest(input)
      const data = request ? await callMarketingApi('generate_bm_caption', { request }) : null
      output = data ? finalizeGeminiCaptions(data.text, input) : null
    } catch {
      output = null
    }
    if (!output) output = { ...generateBmCaptions(input), source: 'template' }
    setVariation(output.variation)
    setResult(output)
    setBusy(false)
    if (output.source !== 'template') toast(nextVariation === 0 ? 'Kapsyen dijana.' : 'Variasi lain sudah dijana.')
  }

  const updateDraft = (field) => (event) => {
    const value = event.target.value
    setResult((current) => (current ? { ...current, [field]: value } : current))
  }

  return (
    <div className="bm-caption-studio">
      <div className={`bm-caption-layout ${result ? 'has-output' : ''}`}>
        <form className="bm-caption-form" onSubmit={(event) => { event.preventDefault(); run(0) }}>
          <div className="form-section-head">
            <span>01</span>
            <div>
              <strong>Penjana kapsyen percuma</strong>
              <p>Bahasa Malaysia, satu poin, dan hanya fakta yang memang ada.</p>
            </div>
          </div>

          <label>
            Produk
            <select value={productId} onChange={(event) => { setProductId(event.target.value); clearResult() }}>
              <option value={NO_PRODUCT}>Tiada produk — guna topik</option>
              {productOptions.filter((item) => item?.name).map((item) => (
                <option key={optionValue(item)} value={optionValue(item)}>{item.name}</option>
              ))}
            </select>
          </label>
          <FactPreview product={product} />

          <label>
            Topik, jika tiada produk
            <input
              value={topic}
              onChange={(event) => { setTopic(event.target.value); clearResult() }}
              placeholder="Contoh: tip susun ruang kedai"
              disabled={Boolean(product)}
            />
          </label>

          <label>
            Matlamat siaran
            <select value={goal} onChange={(event) => { setGoal(event.target.value); clearResult() }}>
              {CAPTION_GOALS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <label>
            Nota design (pilihan)
            <textarea
              rows="4"
              value={note}
              onChange={(event) => { setNote(event.target.value); clearResult() }}
              placeholder="contoh: kaki besi, top kayu, open concept"
            />
          </label>

          <label className="checkbox-row bm-caption-check">
            <input type="checkbox" checked={showTikTok} onChange={(event) => setShowTikTok(event.target.checked)} />
            <span>Tunjuk kapsyen TikTok, pendek dan pilihan</span>
          </label>

          <div className="bm-caption-actions">
            <button className="button primary" type="submit" disabled={busy}>{busy ? 'Sedang menjana…' : 'Jana kapsyen'}</button>
            <button className="button secondary" type="button" disabled={busy} onClick={() => run(result ? variation + 1 : 1)}>Jana variasi lain</button>
          </div>
          <p className="bm-caption-disclaimer">Penjana cuba Gemini percuma dahulu. Jika Gemini tidak tersedia, templat dalam pelayar digunakan. Semak kapsyen sebelum disiarkan. Medan kosong tidak diisi dengan angka atau dakwaan baru.</p>
        </form>

        <section className="bm-caption-results" aria-live="polite">
          <div className="bm-caption-results-head">
            <span className="eyebrow">HASIL BAHASA MALAYSIA</span>
            <strong>{result ? `Variasi ${result.variation + 1}` : 'Belum dijana'}</strong>
            {result?.source === 'template' ? <p className="bm-caption-fallback">Guna template (Gemini tidak tersedia)</p> : null}
          </div>
          {result ? (
            <>
              <CaptionCard platform="Facebook" text={result.facebook} onChange={updateDraft('facebook')} onCopy={() => copyText(result.facebook, toast)} />
              <CaptionCard platform="Instagram" text={result.instagram} onChange={updateDraft('instagram')} onCopy={() => copyText(result.instagram, toast)} hint="4 hingga 5 baris kapsyen. Butiran produk di bawah jika ada. Tiada hashtag." />
              {showTikTok ? (
                <CaptionCard platform="TikTok" text={result.tiktok} onChange={updateDraft('tiktok')} onCopy={() => copyText(result.tiktok, toast)} hint="4 hingga 5 baris kapsyen. Butiran produk di bawah jika ada. Tiada hashtag, tiada analitik." />
              ) : null}
            </>
          ) : (
            <div className="bm-caption-empty">
              <h3>Sedia untuk dijana.</h3>
              <p>Pilih produk dari Pustaka Produk, atau tulis topik. Kemudian pilih matlamat siaran dan tekan Jana kapsyen. Facebook dan Instagram dijana sekali gus.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
