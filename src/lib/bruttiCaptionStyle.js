// Compact style pack learned from Brutti's own Facebook and Instagram captions
// (META_POST_INSIGHTS, Oct 2020–Nov 2026). Import this, not the raw post dump.
import style from '../data/brutti-caption-style.json' with { type: 'json' }

export const bruttiCaptionStyle = style

export function styleHookOpeners() {
  const fromHooks = style.hooks?.openers || []
  const fromTypes = Object.values(style.byType || {}).flatMap((item) => item.openers || [])
  return [...new Set([...fromHooks, ...fromTypes])]
}

export function styleExamplesForPrompt(limit = 6) {
  const rows = (style.examples || []).filter((item) => item.type !== 'highlight' || (item.text || '').length < 280)
  const picked = []
  for (const type of ['highlight', 'behind', 'customer', 'tips']) {
    const hit = rows.find((item) => item.type === type && !picked.includes(item))
    if (hit) picked.push(hit)
  }
  for (const item of rows) {
    if (picked.length >= limit) break
    if (!picked.includes(item)) picked.push(item)
  }
  return picked.slice(0, limit).map((item) => `${item.date} ${item.platform}: ${item.text}`).join('\n---\n')
}

// Extra system-prompt paragraph for Gemini. Existing safety rules stay in the main prompt.
export function styleSystemAddendum() {
  const dont = (style.dont || []).map((line) => `- ${line}`).join('\n')
  const yes = (style.do || []).slice(0, 6).map((line) => `- ${line}`).join('\n')
  return `Brutti caption style, learned from ${style.meta?.counts?.captions || '7,198'} real Facebook and Instagram posts (${style.meta?.counts?.facebook || 3544} FB, ${style.meta?.counts?.instagram || 3654} IG), 11 Oct 2020 to 18 Nov 2026. Follow this rhythm, but keep the 4 or 5 line shape and the bans already stated above (no hashtags, no bah, no invented facts).
Do:
${yes}
Don't:
${dont}
Soft closes used on real posts: ${(style.cta?.variants || []).join(' | ')}
Real hook openers, for rhythm only: ${styleHookOpeners().join(' | ')}
Short real examples, for rhythm only. Never copy a whole example, and never move that example's facts onto this product:
${styleExamplesForPrompt(5)}`
}
