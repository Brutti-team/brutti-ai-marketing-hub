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
  assert(request.generationConfig.maxOutputTokens === 2048, `${label} should leave enough tokens for three full captions.`)
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
assert(/short curiosity hook/i.test(ayyashRequest.systemInstruction) && ayyashRequest.systemInstruction.includes('Kek yang sedap patut nampak dari jauh lagi') && ayyashRequest.systemInstruction.includes('Pallet lama tidak semestinya jadi waste'), 'The prompt should teach short hooks from real posts.')
assert(/never start line 1 with POV/i.test(ayyashRequest.systemInstruction) && !ayyashRequest.systemInstruction.includes('POV:') && !ayyashRequest.userText.includes('POV:'), 'The prompt should ban POV and stop teaching it as a hook.')
assert(/dirancang khas/i.test(ayyashRequest.systemInstruction) && /zohor/i.test(ayyashRequest.systemInstruction) && /lima kaki/i.test(ayyashRequest.systemInstruction), 'The prompt should ban invented claims and odd words, and allow sizes in words.')
assert(/exactly once/i.test(ayyashRequest.systemInstruction) && /at most once/i.test(ayyashRequest.systemInstruction), 'The prompt should keep the name and each fact to one mention.')
assert(ayyashRequest.userText.includes('sekali saja') && ayyashRequest.userText.includes('hook pendek'), 'The user prompt should ask for one name and a short hook.')
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
assert(/never use the whole word "bah"/i.test(ayyashRequest.systemInstruction), 'The prompt should ban the word bah.')
assert(/diperbuat daripada/i.test(ayyashRequest.systemInstruction) && /reka bentuk/i.test(ayyashRequest.systemInstruction) && /\bbersama\b/i.test(ayyashRequest.systemInstruction) && /\bselepas\b/i.test(ayyashRequest.systemInstruction), 'The prompt should ban stiff standard Malay.')
assert(/must not share the same line 4/i.test(ayyashRequest.systemInstruction), 'The prompt should require a different line 4 on each platform.')
assert(!/\bbah\b/i.test(kaanaganRequest.userText.split('Contoh gaya')[1] || ''), 'Style examples sent to Gemini should not teach bah.')
const strictRequest = buildGeminiCaptionRequest({ product: ayyash, goal: 'highlight', variation: 0, strict: true })
assert(strictRequest.userText.includes('Cubaan semula') && strictRequest.userText.includes('sekali saja') && /jangan ulang saiz/i.test(strictRequest.userText) && !strictRequest.userText.includes('RM87'), 'A rejected caption should retry once with a stricter reminder and still no price.')
assert(!ayyashRequest.userText.includes('Cubaan semula'), 'The first request should not already be the retry reminder.')
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
assert(ayyashCaption.facebook.startsWith('Tuala') && !/^POV\b/i.test(ayyashCaption.facebook), 'A POV opener should be stripped and the next word capitalized.')
assert(ayyashCaption.facebook.includes('Ayyash') && !/\bAYYASH\b/.test(ayyashCaption.facebook), 'An all-caps product name should be rewritten in title case.')
assert(!ayyashCaption.facebook.includes('RM999') && !ayyashCaption.facebook.includes('9 ft'), 'Invented model details must be dropped.')
assert(ayyashCaption.facebook.includes('Product Details:\n• Size: 5 ft H × 20 in W\n• Materials: Solid Upcycled Pine Wood\n• Finishing: Sealer & Satin Coating\n• Price starts from RM87'), 'Real AYYASH details are appended in code.')
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
assert(eunoiaCaption.facebook.includes(`Product Details:\n• Size: ${eunoiaSize}\n• Price starts from RM487`), 'Eunoia details should keep the stored size and one price lead-in.')
assert(!eunoiaCaption.facebook.includes('• Materials:') && !/bermula/i.test(eunoiaCaption.facebook), 'Blank material and the bermula prefix stay out.')

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
assert(!kaanaganCaption.facebook.includes('Product Details:'), 'A product with blank sheet fields should not gain a details block.')

assert(finalizeGeminiCaptions(`FACEBOOK:\nAYYASH ✨\nNgam ni.\nPiece ni.\n\nINSTAGRAM:\nAYYASH ✨\nNgam.\nPiece.\nLagi.\n\nTIKTOK:\nAYYASH ✨\nNgam.\nPiece.\nLagi. 😍`, { product: ayyash }) === null, 'A short caption should ask for one retry.')
assert(finalizeGeminiCaptions(`FACEBOOK:\nAYYASH ✨\nNgam ni.\nPiece ni.\n\nINSTAGRAM:\nAYYASH ✨\nNgam.\nPiece.\nLagi.\n\nTIKTOK:\nAYYASH ✨\nNgam.\nPiece.\nLagi. 😍`, { product: ayyash, allowSoft: true })?.source === 'gemini', 'A short caption should stay Gemini after the retry.')
assert(finalizeGeminiCaptions(ayyashModel.replace('susun satu sudut', 'mesej kami bah susun satu sudut'), { product: ayyash, allowSoft: true }) === null, 'The banned close should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Ngam ni', 'Ngam ni bah'), { product: ayyash, allowSoft: true }) === null, 'The word bah should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('AYYASH ni custom, ikut ruang kamu.', 'AYYASH ni diperbuat daripada kayu.'), { product: ayyash, allowSoft: true }) === null, 'Stiff standard Malay should fall back.')
const sameLine = ayyashModel
  .replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Sealer satin dia nampak licin.')
  .replace('Bahan dia upcycled pine, saiz 5 ft dan 20 in.', 'Sealer satin dia nampak licin.')
  .replace('Pine wood, 5 ft tinggi, 20 in lebar.', 'Sealer satin dia nampak licin.')
assert(finalizeGeminiCaptions(sameLine, { product: ayyash }) === null && finalizeGeminiCaptions(sameLine, { product: ayyash, allowSoft: true })?.source === 'gemini', 'Identical line 4 should retry once, then stay Gemini.')
assert(finalizeGeminiCaptions(ayyashModel.replace('AYYASH ni custom', 'AYYASH Wall Rack ni custom'), { product: ayyash }) === null && finalizeGeminiCaptions(ayyashModel.replace('AYYASH ni custom', 'AYYASH Wall Rack ni custom'), { product: ayyash, allowSoft: true })?.source === 'gemini', 'An appended category should retry once, then stay Gemini.')
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
assert(finalizeGeminiCaptions(copied, { product: ayyash, allowSoft: true }) === null, 'A caption that copies a past post should fall back.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Harga dia RM999, nampak simple.'), { product: ayyash, allowSoft: true }) === null, 'An invented price in the body should fall back.')
const inventedSize = ayyashModel.replace('5 ft dan 20 in', '9 ft dan oak')
assert(finalizeGeminiCaptions(inventedSize, { product: ayyash }) === null && finalizeGeminiCaptions(inventedSize, { product: ayyash, allowSoft: true })?.source === 'gemini', 'An invented size should retry once, then stay Gemini.')
assert(finalizeGeminiCaptions(ayyashModel.replace('POV: tuala belum ada tempat. ✨', 'Ayyash ✨'), { product: ayyash }) === null && finalizeGeminiCaptions(ayyashModel.replace('POV: tuala belum ada tempat. ✨', 'Ayyash ✨'), { product: ayyash, allowSoft: true })?.source === 'gemini', 'A bare product-name opening should retry once, then stay Gemini.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Solid Upcycled Pine Wood, Sealer & Satin Coating, 5 ft H × 20 in W'), { product: ayyash }) === null && finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Solid Upcycled Pine Wood, Sealer & Satin Coating, 5 ft H × 20 in W'), { product: ayyash, allowSoft: true })?.source === 'gemini', 'A comma-separated fact dump should retry once, then stay Gemini.')
assert(finalizeGeminiCaptions(ayyashModel, { product: ayyash })?.facebook.includes('upcycled pine'), 'A sheet material written as a sentence should be kept.')
const mahuCaption = finalizeGeminiCaptions(ayyashModel.replaceAll('Ngam ni', 'Mahu ni'), { product: ayyash })
assert(mahuCaption && !/\bmahu\b/i.test(mahuCaption.facebook) && /\bmau\b/i.test(mahuCaption.facebook), 'Mahu should be rewritten to mau.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Ngam ni', 'Ngam kepala-otak'), { product: ayyash, allowSoft: true }) === null, 'An odd phrase such as kepala-otak should fall back.')
const tanakvagu = {
  name: 'TANAKVAGU',
  category: 'Single Bed',
  price: 'RM717',
  material: 'Solid Upcycled Pine Wood with Sealer & Satin Coating',
  dimensions: 'Standard Single (6\'3" W x 3\' D)',
  colour: 'Natural Wood',
}
const tanakModel = `FACEBOOK:
POV: malam ni nampak kemas. ✨
Ada piece yang baru siap.
Kayu pine upcycled solid dia nampak cantik sangat di bilik.
Saiz standard single ni muat ngam untuk ruang yang tidak begitu luas. 😍

INSTAGRAM:
Nampak simple dari jauh. 🌿
Ada piece lain yang kemas.
Kayu dia upcycled pine.
Warna natural wood dia nampak hangat. 😉

TIKTOK:
Nampak sekali terus ngam. ✨
Piece ni untuk rehat.
Sealer satin dia nampak licin.
Saiz standard single, muat untuk seorang. 😍`
const tanakCaption = finalizeGeminiCaptions(tanakModel, { product: tanakvagu })
assert(tanakCaption?.facebook.includes('Tanakvagu') && tanakCaption.facebook.includes('standard single'), 'A real size said in everyday words should be kept, and a missing name should be inserted.')
assert((tanakCaption.facebook.match(/\bTanakvagu\b/g) || []).length === 1, 'The product name should appear once after a missing name is inserted.')
assert(!/\bbah\b/i.test(tanakCaption.facebook), 'The repaired caption should not add bah.')
assert(finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Ayyash, bahan dia upcycled pine, saiz dia 5 ft dan 20 in.'), { product: ayyash }) === null && finalizeGeminiCaptions(ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Ayyash, bahan dia upcycled pine, saiz dia 5 ft dan 20 in.'), { product: ayyash, allowSoft: true })?.source === 'gemini', 'A repeated product name should retry once, then stay Gemini.')
assert(finalizeGeminiCaptions(tanakModel.replace('Ada piece yang baru siap.', 'Saiz dia standard single.'), { product: tanakvagu }) === null && finalizeGeminiCaptions(tanakModel.replace('Ada piece yang baru siap.', 'Saiz dia standard single.'), { product: tanakvagu, allowSoft: true })?.source === 'gemini', 'A repeated size fact should retry once, then stay Gemini.')
assert(finalizeGeminiCaptions(ayyashModel.replace('POV: tuala belum ada tempat. ✨', 'Pagi-pagi berdiri di dinding rumah sambil pegang kunci, tidak tahu mau letak mana lagi barang kecil. ✨'), { product: ayyash }) === null && finalizeGeminiCaptions(ayyashModel.replace('POV: tuala belum ada tempat. ✨', 'Pagi-pagi berdiri di dinding rumah sambil pegang kunci, tidak tahu mau letak mana lagi barang kecil. ✨'), { product: ayyash, allowSoft: true })?.source === 'gemini', 'A long flat opener should retry once, then stay Gemini.')
const wordSize = ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Tinggi lima kaki dengan lebar dua puluh inci ngam-ngam muat dinding rumah kamu.')
assert(finalizeGeminiCaptions(wordSize, { product: ayyash })?.facebook.includes('lima kaki'), 'A size written in words, such as lima kaki and dua puluh inci, should be accepted.')
const designMiss = ayyashModel.replace('Bahan dia upcycled pine dengan sealer satin, saiz dia 5 ft dan 20 in.', 'Nampak biasa ja, tapi ada kerja.')
assert(finalizeGeminiCaptions(designMiss, { product: ayyash }) === null && finalizeGeminiCaptions(designMiss, { product: ayyash, allowSoft: true })?.source === 'gemini', 'A missed design line should retry once, then stay Gemini.')

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
assert(code.includes('short curiosity hook') && code.includes('Kek yang sedap patut nampak dari jauh lagi') && !code.includes('POV:') && code.includes('Jangan mula dengan POV') && code.includes('dirancang khas') && code.includes('zohor') && code.includes('lima kaki') && code.includes('function testBmHardReject_'), 'The editor prompt should ban POV, invented claims, and odd words, and keep a hard-failure check.')
assert(studio.includes('allowSoft: true'), 'A soft Gemini miss should retry once and then keep the Gemini caption.')
assert(code.includes('validation: missing FACEBOOK, INSTAGRAM, or TIKTOK labels'), 'A caption without platform labels should record that validation failure.')
assert(code.includes('line 4 dumps the sheet fields') && code.includes('opens with only the product name'), 'Template fallback should name the validation check.')
assert(!code.includes('testBmCaptionLibrary_'), 'The editor samples should not depend on the Product Library sheet.')
assert(code.includes('Never use the whole word bah') && code.includes('Cubaan semula') && code.includes('after one stricter retry'), 'The editor test should ban bah and retry once before the template.')
assert(code.includes('function testBmSeparatePlatforms_') && code.includes('\\n\\n$1'), 'The editor log should put a blank line before each platform label.')
assert(code.includes('line 4 is the same on more than one platform'), 'The editor test should reject an identical line 4.')
assert(code.includes('maxOutputTokens: 2048'), 'The editor call should allow enough tokens for the full caption.')
assert(code.includes("body + '\\n\\nProduct Details:\\n'") && code.includes("'• Size: '") && code.includes("'• Materials: '") && code.includes("'• Finishing: '") && code.includes("'• Price starts from '") && code.includes('only\\b'), 'The editor test should append Product Details as bullets and drop a trailing only.')
assert(code.includes('kepala-otak'), 'The editor prompt should ban odd phrases such as kepala-otak.')
assert(!code.includes('bilik tetamu') && !code.includes('ikut ruang'), 'The editor template should not invent a room or a custom fit.')
assert(studio.includes('strict: true'), 'A failed Gemini caption should retry once before the template.')

assert(readme.includes('GEMINI_API_KEY') && /billing disabled/i.test(readme) && /do not enable billing/i.test(readme), 'README should say where the key goes and that billing stays off.')
assert(studio.includes('Using template (Gemini unavailable)') && studio.includes('generate_bm_caption') && studio.includes('Generate caption') && studio.includes('Generate another variation') && studio.includes('Topic (if no product)') && studio.includes("topic: product ? '' : topic") && studio.includes('productDetails'), 'The studio should try Gemini, then show the template note, hide the topic when a product is selected, and keep the generate buttons.')

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
