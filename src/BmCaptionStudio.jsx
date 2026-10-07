import { useState } from 'react'
import { CAPTION_GOALS, generateBmCaptions, isBlankField, productDetails } from './lib/bmCaptionGenerator'
import { buildGeminiCaptionRequest, finalizeGeminiCaptions } from './lib/bmGeminiCaption'
import { callMarketingApi } from './lib/googleWorkspace'
import './bm-caption-studio.css'

const NO_PRODUCT = ''
const EMPTY_FACT = "not filled, won't be included"

const GOAL_LABELS = {
  highlight: 'Product highlight',
  promo: 'Promotion',
  customer: 'Project or customer feedback',
  behind: 'Behind the scenes',
  tips: 'Tip',
}

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function optionValue(product) {
  return String(product.id || product.name)
}

function copyText(text, toast) {
  const done = () => toast('Caption copied.')
  const failed = () => toast('Could not copy. Select the text and copy it manually.')
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => {
      if (fallbackCopy(text)) done()
      else failed()
    })
    return
  }
  if (fallbackCopy(text)) done()
  else failed()
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
  const finishing = productDetails(product).finishing
  const rows = [
    ['Price', product.price],
    ['Material', product.material],
    ['Dimensions', product.dimensions],
    ['Colour', product.colour || product.color],
    ['Finishing', finishing],
  ]
  return (
    <ul className="bm-caption-facts">
      {rows.map(([label, value]) => {
        const filled = !isBlankField(value)
        return (
          <li key={label}>
            <strong>{label}</strong>
            <span>{filled ? clean(value) : EMPTY_FACT}</span>
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
        <button type="button" className="button secondary small" onClick={onCopy} disabled={!text}>Copy {platform}</button>
      </div>
      {hint ? <p className="bm-caption-hint">{hint}</p> : null}
      <textarea
        data-user-content="true"
        readOnly={!text}
        rows={16}
        value={text}
        onChange={onChange}
        aria-label={`Caption ${platform}`}
        placeholder="The caption will appear here."
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
      toast('Choose a product or write a topic first.')
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
      if (request) {
        const data = await callMarketingApi('generate_bm_caption', { request })
        output = data && data.text ? finalizeGeminiCaptions(data.text, input) : null
        if (data && data.text && !output) {
          const retry = buildGeminiCaptionRequest({ ...input, strict: true })
          const retryData = retry ? await callMarketingApi('generate_bm_caption', { request: retry }) : null
          output = retryData && retryData.text ? finalizeGeminiCaptions(retryData.text, { ...input, allowSoft: true }) : null
        }
      }
    } catch {
      output = null
    }
    if (!output) output = { ...generateBmCaptions(input), source: 'template' }
    setVariation(output.variation)
    setResult(output)
    setBusy(false)
    if (output.source !== 'template') toast(nextVariation === 0 ? 'Caption generated.' : 'Another variation is ready.')
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
              <strong>Free caption generator</strong>
              <p>Bahasa Malaysia, one point, and only facts that are actually filled in.</p>
            </div>
          </div>

          <label>
            Product
            <select value={productId} onChange={(event) => { setProductId(event.target.value); clearResult() }}>
              <option value={NO_PRODUCT}>No product — use a topic</option>
              {productOptions.filter((item) => item?.name).map((item) => (
                <option key={optionValue(item)} value={optionValue(item)}>{item.name}</option>
              ))}
            </select>
          </label>
          <FactPreview product={product} />

          {!product ? (
            <label>
              Topic (if no product)
              <input
                value={topic}
                onChange={(event) => { setTopic(event.target.value); clearResult() }}
                placeholder="Example: tips for arranging a shop space"
              />
            </label>
          ) : null}

          <label>
            Post goal
            <select value={goal} onChange={(event) => { setGoal(event.target.value); clearResult() }}>
              {CAPTION_GOALS.map((item) => <option key={item.id} value={item.id}>{GOAL_LABELS[item.id] || item.id}</option>)}
            </select>
          </label>

          <label>
            Design note (optional)
            <textarea
              rows="4"
              value={note}
              onChange={(event) => { setNote(event.target.value); clearResult() }}
              placeholder="example: steel legs, wood top, open concept"
            />
          </label>

          <label className="checkbox-row bm-caption-check">
            <input type="checkbox" checked={showTikTok} onChange={(event) => setShowTikTok(event.target.checked)} />
            <span>Show a short TikTok caption (optional)</span>
          </label>

          <div className="bm-caption-actions">
            <button className="button primary" type="submit" disabled={busy}>{busy ? 'Generating…' : 'Generate caption'}</button>
            <button className="button secondary" type="button" disabled={busy} onClick={() => run(result ? variation + 1 : 1)}>Generate another variation</button>
          </div>
          <p className="bm-caption-disclaimer">The generator tries free Gemini first. If Gemini is unavailable, the in-browser template is used. Check the caption before posting. Empty fields are not filled with new numbers or claims.</p>
        </form>

        <section className="bm-caption-results" aria-live="polite">
          <div className="bm-caption-results-head">
            <span className="eyebrow">BAHASA MALAYSIA RESULT</span>
            <strong>{result ? `Variation ${result.variation + 1}` : 'Not generated yet'}</strong>
            {result?.source === 'template' ? <p className="bm-caption-fallback">Using template (Gemini unavailable)</p> : null}
          </div>
          {result ? (
            <>
              <CaptionCard platform="Facebook" text={result.facebook} onChange={updateDraft('facebook')} onCopy={() => copyText(result.facebook, toast)} />
              <CaptionCard platform="Instagram" text={result.instagram} onChange={updateDraft('instagram')} onCopy={() => copyText(result.instagram, toast)} hint="4 to 5 caption lines. Product details below when present. No hashtags." />
              {showTikTok ? (
                <CaptionCard platform="TikTok" text={result.tiktok} onChange={updateDraft('tiktok')} onCopy={() => copyText(result.tiktok, toast)} hint="4 to 5 caption lines. Product details below when present. No hashtags or analytics." />
              ) : null}
            </>
          ) : (
            <div className="bm-caption-empty">
              <h3>Ready to generate.</h3>
              <p>Choose a product from the Product Library, or write a topic. Then pick a post goal and press Generate caption. Facebook and Instagram are generated together.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
