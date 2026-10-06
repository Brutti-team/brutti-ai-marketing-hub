import fs from 'node:fs'
import { captionBrief } from '../src/lib/bmCaptionGenerator.js'
import {
  GEMINI_MODEL,
  buildGeminiCaptionRequest,
  finalizeGeminiCaptions,
  geminiTemperature,
  styleExamplesForVariation,
} from '../src/lib/bmGeminiCaption.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const code = fs.readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8')
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const studio = fs.readFileSync(new URL('../src/BmCaptionStudio.jsx', import.meta.url), 'utf8')

const ayyash = {
  name: 'AYYASH',
  category: 'Wall Rack',
  price: 'RM87',
  material: 'Solid Upcycled Pine Wood with Sealer & Satin Coating',
  dimensions: '5 ft H × 20 in W',
  colour: '',
}
const eunoiaSize = '3’ lebar x 1.5’ depth x 75cm height'
const eunoia = {
  name: 'Eunoia Kiosk',
  category: 'Kiosk',
  price: 'bermula RM487',
  dimensions: eunoiaSize,
  material: '',
  colour: '',
}
const kaanagan = {
  name: 'KAANAGAN Open Concept Wardrobe with Drawers',
  category: 'Wardrobe',
  price: '',
  material: '',
  dimensions: '',
  colour: '',
}

function assertRequest(request, label) {
  assert(request, `${label} should build a request.`)
  assert(request.model === GEMINI_MODEL, `${label} model should be the free-tier model.`)
  assert(request.model === 'gemini-3.5-flash-lite', `${label} should pin gemini-3.5-flash-lite.`)
  assert(!('apiKey' in request) && !('GEMINI_API_KEY' in request) && !/AIza[0-9A-Za-z_-]{20,}/.test(JSON.stringify(request)), `${label} must not carry an API key.`)
  assert(request.systemInstruction.includes('Brutti Soul Master'), `${label} system prompt should name Brutti Soul Master.`)
  assert(/never use the whole word "nak"/i.test(request.systemInstruction), `${label} system prompt should ban nak.`)
  assert(request.systemInstruction.includes('mesej kami bah'), `${label} system prompt should ban the stiff close.`)
  assert(/4 or 5 short lines/i.test(request.systemInstruction), `${label} system prompt should require 4 or 5 lines.`)
  assert(/no hashtag/i.test(request.systemInstruction), `${label} system prompt should ban hashtags.`)
  assert(/never append the category/i.test(request.systemInstruction), `${label} system prompt should keep the product name only.`)
  assert(/line 4 explains the design/i.test(request.systemInstruction), `${label} system prompt should put design on line 4.`)
  assert(/do not write a product details list/i.test(request.systemInstruction), `${label} system prompt should leave the details list to the app.`)
  assert((request.userText.match(/^Contoh \d+$/gm) || []).length === 8, `${label} should seed 8 style examples.`)
  assert(request.generationConfig.temperature === request.temperature, `${label} temperature should match the generation config.`)
  assert(request.generationConfig.maxOutputTokens === 800, `${label} should cap output tokens.`)
  assert(request.generationConfig.thinkingConfig.thinkingBudget === 0, `${label} should disable thinking on the free tier.`)
  assert(request.userText.includes('jangan tulis ini selepas nama'), `${label} should tell the model not to append the category.`)
  assert(!/\bRM\s?\d/i.test(request.userText) && !/bermula/i.test(request.userText), `${label} prompt must not hand the price to the model.`)
}

const ayyashRequest = buildGeminiCaptionRequest({ product: ayyash, goal: 'highlight', variation: 0 })
const eunoiaRequest = buildGeminiCaptionRequest({ product: eunoia, goal: 'highlight', variation: 0 })
const kaanaganRequest = buildGeminiCaptionRequest({
  product: kaanagan,
  goal: 'highlight',
  note: 'kaki besi, top kayu',
  variation: 2,
})

assertRequest(ayyashRequest, 'AYYASH')
assertRequest(eunoiaRequest, 'Eunoia')
assertRequest(kaanaganRequest, 'KAANAGAN')

assert(ayyashRequest.temperature === 0.8 && geminiTemperature(0) === 0.8, 'The first caption should use the lower temperature.')
assert(kaanaganRequest.temperature === 1.15, 'A variation should raise the temperature.')
assert(/all capitals/i.test(ayyashRequest.systemInstruction) && /do not start with the product name/i.test(ayyashRequest.systemInstruction), 'The prompt should require title case and a scene opening.')
assert(ayyashRequest.userText.includes('Nama produk, tulis begini dan jangan tambah perkataan selepasnya: Ayyash'), 'AYYASH prompt should ask for title case.')
assert(ayyashRequest.userText.includes('Jangan tulis nama ini dalam huruf besar semua: AYYASH'), 'The prompt should forbid the all-caps sheet name.')
assert(ayyashRequest.userText.includes('Kategori, jangan tulis ini selepas nama: Wall Rack'), 'AYYASH prompt should mark the category as off-limits.')
assert(!ayyashRequest.userText.includes('AYYASH Wall Rack'), 'AYYASH prompt should not show the name with the category appended.')
assert(/upcycled pine/i.test(ayyashRequest.userText), 'AYYASH prompt should pass the upcycled pine material as a design fact.')
assert(ayyashRequest.userText.includes('5 ft') && /20\s*in/i.test(ayyashRequest.userText), 'AYYASH prompt should pass 5 ft x 20 in as a design fact.')
assert(/sealer\s*&\s*satin coating/i.test(ayyashRequest.userText), 'AYYASH finishing should be passed as a design fact.')
assert(!ayyashRequest.userText.includes('RM87'), 'AYYASH price stays out of the prompt.')
assert(eunoiaRequest.userText.includes('Eunoia Kiosk'), 'Eunoia prompt should use the full product name.')
assert(eunoiaRequest.userText.includes('Kategori, jangan tulis ini selepas nama: Kiosk'), 'Eunoia prompt should mark Kiosk as the category.')
assert(eunoiaRequest.userText.includes(eunoiaSize), 'Eunoia size should be passed as a design fact.')
assert(!eunoiaRequest.userText.includes('RM487'), 'Eunoia price stays out of the prompt.')
assert(kaanaganRequest.userText.includes('kaki besi, top kayu'), 'The design note should be a line-4 fact.')
assert(kaanaganRequest.userText.includes('Open Concept'), 'A design word already in the name should be a line-4 fact.')
assert(kaanaganRequest.userText.includes('Variasi 3'), 'Variation 2 should ask for a third, different caption.')
assert(ayyashRequest.userText.includes('2-in-1 Pallet Bench') && !ayyashRequest.userText.includes('Tondurongon'), 'Variation 0 should use the first example window.')
assert(kaanaganRequest.userText.includes('Tondurongon') && !kaanaganRequest.userText.includes('2-in-1 Pallet Bench'), 'A later variation should rotate the example window.')
assert(styleExamplesForVariation(0)[0].id !== styleExamplesForVariation(2)[0].id, 'Rotated windows should start on different examples.')

const ayyashModel = `FACEBOOK:
POV: tuala belum ada tempat. ✨
Ngam ni untuk susun satu sudut dulu.
AYYASH ni custom, ikut ruang kamu.
Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in. 😍

Product details:
- Size: 9 ft
- Price starts from RM999

INSTAGRAM:
Satu sudut dulu, AYYASH. ✨
Ngam ni untuk barang kecil yang selalu cari tempat.
Piece ni custom.
Bahan dia upcycled pine, saiz 5 ft dan 20 in. 😉

TIKTOK:
AYYASH di satu sudut. ✨
Ngam untuk susun barang kamu.
Piece ni custom, ikut ruang.
Pine wood, 5 ft tinggi, 20 in lebar. 😍`
const ayyashCaption = finalizeGeminiCaptions(ayyashModel, { product: ayyash, goal: 'highlight', variation: 0 })
assert(ayyashCaption?.source === 'gemini', 'A valid model caption should be accepted.')
assert(ayyashCaption.facebook.includes('Ayyash') && !/\bAYYASH\b/.test(ayyashCaption.facebook), 'An all-caps product name should be rewritten in title case.')
assert(!ayyashCaption.facebook.includes('RM999') && !ayyashCaption.facebook.includes('9 ft'), 'Invented model details must be dropped.')
assert(ayyashCaption.facebook.includes('Product details:\n\n- Size: 5 ft H × 20 in W\n- Materials: Solid Upcycled Pine Wood\n- Finishing: Sealer & Satin Coating\n- Price starts from RM87'), 'Real AYYASH details are appended in code.')
assert(captionBrief({ product: ayyash }).details.used.includes('price'), 'Used facts should still come from the sheet.')

const eunoiaModel = `FACEBOOK:
POV: kaunter jualan masih kosong. ✨
Eunoia Kiosk ni ngam untuk jualan, barang nampak dari jauh.
Piece ni custom, ikut ruang kamu.
Tinggi dia 75cm, ikut saiz yang ada. 😍

INSTAGRAM:
Eunoia Kiosk untuk jualan. ✨
Ngam ni untuk barang nampak dari jauh.
Piece ni custom.
Saiz dia 75cm tinggi. 😉

TIKTOK:
Eunoia Kiosk di luar. ✨
Ngam untuk jualan kamu.
Piece ni custom, ikut ruang.
75cm, itu saiz dia. 😍`
const eunoiaCaption = finalizeGeminiCaptions(eunoiaModel, { product: eunoia, goal: 'highlight', variation: 0 })
assert(eunoiaCaption.facebook.includes(`Product details:\n\n- Size: ${eunoiaSize}\n- Price starts from RM487`), 'Eunoia details should keep the stored size and one price lead-in.')
assert(!eunoiaCaption.facebook.includes('- Materials:') && !/bermula/i.test(eunoiaCaption.facebook), 'Blank material and the bermula prefix stay out.')

const kaanaganModel = `FACEBOOK:
POV: baju banyak, tapi belum ada tempat. ✨
KAANAGAN Open Concept Wardrobe with Drawers ni untuk bilik ni.
Piece ni custom, ikut bilik kamu.
Design ni Open Concept, kaki besi, top kayu. 😍

INSTAGRAM:
Pagi ni baju ada tempat, KAANAGAN Open Concept Wardrobe with Drawers. ✨
Ngam untuk bilik yang mau nampak kemas.
Piece ni custom.
Piece ni Open Concept, kaki besi, top kayu. 😉

TIKTOK:
KAANAGAN Open Concept Wardrobe with Drawers di bilik. ✨
Ngam untuk susun baju kamu.
Piece ni custom, ikut ruang.
kaki besi, top kayu, itu design dia. 😍`
const kaanaganCaption = finalizeGeminiCaptions(kaanaganModel, { product: kaanagan, note: 'kaki besi, top kayu', variation: 2 })
assert(kaanaganCaption?.variation === 2 && kaanaganCaption.facebook.includes('kaki besi, top kayu'), 'The design note should survive on the accepted caption.')
assert(!kaanaganCaption.facebook.includes('Product details:'), 'A product with blank sheet fields should not gain a details block.')

assert(finalizeGeminiCaptions(`FACEBOOK:\nAYYASH ✨\nNgam ni.\nPiece ni.\n\nINSTAGRAM:\nAYYASH ✨\nNgam.\nPiece.\nLagi.\n\nTIKTOK:\nAYYASH ✨\nNgam.\nPiece.\nLagi. 😍`, { product: ayyash }) === null, 'A short caption should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('susun satu sudut', 'mesej kami bah susun satu sudut'), { product: ayyash }) === null, 'The banned close should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('AYYASH ni custom', 'AYYASH Wall Rack ni custom'), { product: ayyash }) === null, 'An appended category should fall back.')
const copied = `FACEBOOK:
AYYASH ✨
Tempat singgah sekejap untuk duduk, rehat dan sambung kerja balik.
Simple space tapi terus ubah mood satu sudut.
Nampak simple, dan kemas. 😍

INSTAGRAM:
AYYASH di office. ✨
Tempat singgah sekejap untuk duduk, rehat dan sambung kerja balik.
Simple space tapi terus ubah mood satu sudut.
Nampak simple. 😉

TIKTOK:
AYYASH sekali. ✨
Tempat singgah sekejap untuk duduk, rehat dan sambung kerja balik.
Simple space tapi terus ubah mood satu sudut.
Nampak kemas. 😍`
assert(finalizeGeminiCaptions(copied, { product: ayyash }) === null, 'A caption that copies a past post should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Harga dia RM999, nampak simple.'), { product: ayyash }) === null, 'An invented price in the body should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('5 ft dan 20 in', '9 ft dan oak'), { product: ayyash }) === null, 'An invented size or material should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('POV: tuala belum ada tempat. ✨', 'Ayyash ✨'), { product: ayyash }) === null, 'A caption that opens with only the product name should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Solid Upcycled Pine Wood, Sealer & Satin Coating, 5 ft H × 20 in W'), { product: ayyash }) === null, 'A comma-separated fact dump should fall back.')
assert(finalizeGeminiCaptions(ayyashModel, { product: ayyash })?.facebook.includes('upcycled pine'), 'A sheet material written as a sentence should be kept.')

assert(code.includes("generate_bm_caption: () => generateBmCaption_(payload)"), 'Apps Script should route the caption action through the existing POST handler.')
assert(code.includes("scriptProperties_().getProperty('GEMINI_API_KEY')"), 'The Gemini key should be read from Script Properties.')
assert(code.includes("'x-goog-api-key': apiKey"), 'The key should travel in a header, not the query string.')
assert(code.includes(`var GEMINI_CAPTION_MODEL_ = '${GEMINI_MODEL}'`) && code.includes('model !== GEMINI_CAPTION_MODEL_'), 'Apps Script should whitelist the same free-tier model.')
assert(!/generateContent\?/.test(code), 'The Gemini URL should not carry a query string.')
assert(!/AIza[0-9A-Za-z_-]{20,}/.test(code), 'Apps Script must not contain a hard-coded key.')
assert(!/console\.(log|error|info)\(\s*apiKey/.test(code) && !/Logger\.log\(\s*apiKey/.test(code), 'Apps Script must not log the Gemini key.')
assert(/code === 429/.test(code) && code.includes('Gemini quota reached.'), 'Quota responses should fail softly.')
assert(code.includes('The caption request must not include an API key.'), 'A client-supplied key should be rejected.')
assert(code.includes('function testBmCaption()'), 'Apps Script should expose an editor test for captions.')
assert(code.includes("name: 'SUMANDAK'") && code.includes("name: 'TANAKVAGU'") && code.includes('RM717') && code.includes('RM837') && code.includes('Natural Wood'), 'The editor test should hard-code Sumandak and Tanakvagu.')
assert(code.includes('source: GEMINI') && code.includes('source: TEMPLATE'), 'The editor test should say whether Gemini or the template produced the caption.')
assert(!/Logger\.log\([^)\n]*apiKey/.test(code), 'The editor test must not log the Gemini key.')
assert(/header\.code !== 401/.test(code) && code.includes("Authorization: 'Bearer ' + apiKey"), 'An AQ. key that rejects the header should retry once with Bearer only.')
assert(code.includes('part.thought'), 'Thought parts should be skipped when reading the caption.')
assert(/AQ\\.\[[0-9A-Za-z\\-_]/.test(code), 'Redaction should hide AQ. keys.')
assert(/Do not start with the product name/i.test(code) && /ALL CAPITALS/.test(code) && /comma-separated/.test(code), 'The editor prompt should require a scene opening, title case, and a sentence on line 4.')
assert(code.includes('validation: missing FACEBOOK, INSTAGRAM, or TIKTOK labels'), 'A caption without platform labels should record that validation failure.')
assert(code.includes('line 4 dumps the sheet fields') && code.includes('opens with only the product name'), 'Template fallback should name the validation check.')
assert(!code.includes('testBmCaptionLibrary_'), 'The editor samples should not depend on the Product Library sheet.')

assert(readme.includes('GEMINI_API_KEY') && /billing disabled/i.test(readme) && /do not enable billing/i.test(readme), 'README should say where the key goes and that billing stays off.')
assert(studio.includes('Guna template (Gemini tidak tersedia)') && studio.includes('generate_bm_caption') && studio.includes('Jana kapsyen') && studio.includes('Jana variasi lain'), 'The studio should try Gemini, then show the template note, and keep the generate buttons.')

function outline(request) {
  const name = request.userText.match(/selepasnya: (.+)/)?.[1] || ''
  const examples = request.userText.match(/^Contoh \d+$/gm) || []
  return {
    model: request.model,
    temperature: request.temperature,
    maxOutputTokens: request.generationConfig.maxOutputTokens,
    thinkingBudget: request.generationConfig.thinkingConfig.thinkingBudget,
    apiKey: null,
    system: 'Brutti Soul Master + Sabahan Malay rules + 4-5 lines + name only + line 4 design + no invented facts + FACEBOOK/INSTAGRAM/TIKTOK labels',
    user: request.userText.split('\n').filter((line) => line.startsWith('Variasi') || line.startsWith('Nama produk') || line.startsWith('Kategori') || line.startsWith('Matlamat') || line.startsWith('- ') || line.startsWith('Semua fakta') || line.startsWith('Baris 4') || line.startsWith('Contoh ')),
    exampleCount: examples.length,
    product: name,
  }
}

console.log(JSON.stringify({
  ayyash: outline(ayyashRequest),
  eunoia: outline(eunoiaRequest),
  kaanagan: outline(kaanaganRequest),
}, null, 2))
console.log('PASS: Gemini caption request is built without a key, and invalid model text falls back before the details list is trusted.')
