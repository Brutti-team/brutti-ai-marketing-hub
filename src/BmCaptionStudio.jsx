import { useState } from 'react'
import { CAPTION_GOALS, generateBmCaptions, isBlankField, productDetails } from './lib/bmCaptionGenerator'
import { buildGeminiCaptionRequest, finalizeGeminiCaptions } from './lib/bmGeminiCaption'
import { callMarketingApi } from './lib/googleWorkspace'
import './bm-caption-studio.css'

const NO_PRODUCT = ''

// Content Studio form chrome. Hidden for now (Michelle, 25 Nov 2026). Code kept.
const SHOW_STUDIO_STEP_HEADER = false
const SHOW_STUDIO_TIKTOK_CHECKBOX = false
const SHOW_STUDIO_GEMINI_NOTE = false
const SHOW_STUDIO_EMPTY_RESULT = false
const SHOW_STUDIO_TOPIC_FIELD = false
const SHOW_STUDIO_TIP_GOAL = false
// Product field is a free-text box with the Product Library as suggestions (Michelle, 26 Nov). Set true for the old dropdown.
const SHOW_STUDIO_PRODUCT_DROPDOWN = false
// Hidden (Michelle, 26 Nov): the 'Generate another variation' button and the 'Choose a product first.' hint. Set true to bring them back.
const SHOW_STUDIO_VARIATION_BUTTON = false
const SHOW_STUDIO_PRODUCT_HINT = false
// Product details checklist under Note (Michelle, 26 Nov). Rows are editable; nothing is prefilled except the labels.
const SHOW_STUDIO_PRODUCT_DETAILS = true
const DEFAULT_DETAIL_ROWS = ['Dimensions', 'Materials & Finishing', 'Price']
const EMPTY_FACT = "not filled, won't be included"

const GOAL_LABELS = {
  highlight: 'Product highlight',
  promo: 'Promotion',
  customer: 'Project or customer feedback',
  behind: 'Behind the scenes',
  tips: 'Tip',
}

const visibleGoals = CAPTION_GOALS.filter((item) => item.id !== 'tips' || SHOW_STUDIO_TIP_GOAL)

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
  const [productText, setProductText] = useState('')
  const [topic, setTopic] = useState('')
  const [goal, setGoal] = useState('highlight')
  const [note, setNote] = useState('')
  const [detailRows, setDetailRows] = useState(() => DEFAULT_DETAIL_ROWS.map((label) => ({ label, value: '', done: false })))
  const [showTikTok, setShowTikTok] = useState(false)
  const [variation, setVariation] = useState(0)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const typedName = clean(productText)
  const typedMatch = productOptions.find((item) => item?.name && clean(item.name).toLowerCase() === typedName.toLowerCase()) || null
  const product = SHOW_STUDIO_PRODUCT_DROPDOWN
    ? productOptions.find((item) => optionValue(item) === productId) || null
    : typedMatch
  // A typed name that is not in the library is used as the product name (no library facts are invented for it).
  const customName = SHOW_STUDIO_PRODUCT_DROPDOWN || typedMatch ? '' : typedName
  const needsProduct = !SHOW_STUDIO_TOPIC_FIELD
  const canGenerate = needsProduct ? Boolean(product || customName) : Boolean(product || customName || topic.trim())

  const clearResult = () => setResult(null)
  const setRow = (index, patch) => { setDetailRows((rows) => rows.map((row, at) => (at === index ? { ...row, ...patch } : row))); clearResult() }
  // Checked rows with a value are added to the note sent to the generator: "Product details: Dimensions: ..., Price: ...".
  const detailText = SHOW_STUDIO_PRODUCT_DETAILS
    ? detailRows.filter((row) => row.done && clean(row.value)).map((row) => `${clean(row.label) || 'Detail'}: ${clean(row.value)}`).join(', ')
    : ''
  const noteForCaption = detailText ? [clean(note), `Product details: ${detailText}`].filter(Boolean).join('. ') : note

  const run = async (nextVariation) => {
    if (busy) return
    if (needsProduct && !product && !customName) {
      toast('Choose a product first.')
      return
    }
    if (!product && !customName && !topic.trim()) {
      toast('Choose a product or write a topic first.')
      return
    }
    const input = {
      product,
      topic: product ? '' : topic,
      goal,
      note: noteForCaption,
      variation: nextVariation,
    }
    if (!product && customName) input.topic = customName // typed product not in the library
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
          {SHOW_STUDIO_STEP_HEADER ? (
          <div className="form-section-head">
            <span>01</span>
            <div>
              <strong>Free caption generator</strong>
              <p>Bahasa Malaysia, one point, and only facts that are actually filled in.</p>
            </div>
          </div>
          ) : null}

          {SHOW_STUDIO_PRODUCT_DROPDOWN ? (
          <label>
            Product
            <select value={productId} onChange={(event) => { setProductId(event.target.value); clearResult() }}>
              <option value={NO_PRODUCT}>{SHOW_STUDIO_TOPIC_FIELD ? 'No product — use a topic' : 'Choose a product'}</option>
              {productOptions.filter((item) => item?.name).map((item) => (
                <option key={optionValue(item)} value={optionValue(item)}>{item.name}</option>
              ))}
            </select>
          </label>
          ) : (
          <label>
            Product
            <input
              type="text"
              list="bm-product-suggestions"
              value={productText}
              autoComplete="off"
              onChange={(event) => { setProductText(event.target.value); clearResult() }}
              placeholder="Type a product name or pick one"
            />
            <datalist id="bm-product-suggestions">
              {productOptions.filter((item) => item?.name).map((item) => <option key={optionValue(item)} value={item.name} />)}
            </datalist>
          </label>
          )}
          <FactPreview product={product} />

          {SHOW_STUDIO_TOPIC_FIELD && !product ? (
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
            Type of post
            <select value={goal} onChange={(event) => { setGoal(event.target.value); clearResult() }}>
              {visibleGoals.map((item) => <option key={item.id} value={item.id}>{GOAL_LABELS[item.id] || item.id}</option>)}
            </select>
          </label>

          <label>
            Note
            <textarea
              rows="4"
              value={note}
              onChange={(event) => { setNote(event.target.value); clearResult() }}
              placeholder="example: steel legs, wood top, open concept"
            />
          </label>

          {SHOW_STUDIO_PRODUCT_DETAILS ? (
          <div className="bm-details">
            <span className="bm-details-title">Product details</span>
            {detailRows.map((row, index) => (
              <div className={`bm-details-row ${row.done ? 'is-done' : ''}`} key={index}>
                <input type="checkbox" checked={row.done} onChange={(event) => setRow(index, { done: event.target.checked })} aria-label="Include" />
                <input type="text" className="bm-details-label" value={row.label} onChange={(event) => setRow(index, { label: event.target.value })} aria-label="Detail name" />
                <input type="text" className="bm-details-value" value={row.value} placeholder="Fill in" onChange={(event) => setRow(index, { value: event.target.value, done: event.target.value.trim() ? true : row.done })} aria-label="Detail value" />
                <button type="button" className="bm-details-remove" aria-label="Remove item" title="Remove item" onClick={() => { setDetailRows((rows) => rows.filter((_, at) => at !== index)); clearResult() }}>×</button>
              </div>
            ))}
            <button type="button" className="button secondary small bm-details-add" onClick={() => { setDetailRows((rows) => [...rows, { label: '', value: '', done: false }]); clearResult() }}>+ Add item</button>
          </div>
          ) : null}

          {SHOW_STUDIO_TIKTOK_CHECKBOX ? (
          <label className="checkbox-row bm-caption-check">
            <input type="checkbox" checked={showTikTok} onChange={(event) => setShowTikTok(event.target.checked)} />
            <span>Show a short TikTok caption (optional)</span>
          </label>
          ) : null}

          <div className={`bm-caption-actions ${SHOW_STUDIO_VARIATION_BUTTON ? '' : 'is-single'}`}>
            <button className="button primary" type="submit" disabled={busy || !canGenerate}>{busy ? 'Generating…' : 'Generate caption'}</button>
            {SHOW_STUDIO_VARIATION_BUTTON ? <button className="button secondary" type="button" disabled={busy || !canGenerate} onClick={() => run(result ? variation + 1 : 1)}>Generate another variation</button> : null}
          </div>
          {SHOW_STUDIO_PRODUCT_HINT && needsProduct && !product && !customName ? <p className="bm-caption-disclaimer">Choose a product first.</p> : null}
          {SHOW_STUDIO_GEMINI_NOTE ? <p className="bm-caption-disclaimer">The generator tries free Gemini first. If Gemini is unavailable, the in-browser template is used. Check the caption before posting. Empty fields are not filled with new numbers or claims.</p> : null}
        </form>

        {result || SHOW_STUDIO_EMPTY_RESULT ? (
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
        ) : null}
      </div>
    </div>
  )
}
