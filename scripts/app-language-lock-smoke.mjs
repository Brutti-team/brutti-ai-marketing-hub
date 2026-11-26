import fs from 'node:fs'

const enhancer = fs.readFileSync(new URL('../src/AppLanguageLock.jsx', import.meta.url), 'utf8')
const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(enhancer.includes('brutti-ui-language-v1'), 'Language preference storage key is missing.')
assert(enhancer.includes('document.documentElement.lang'), 'Document language is not updated.')
assert(enhancer.includes('dataset.bruttiUiLanguage'), 'App language state attribute is missing.')
assert(enhancer.includes('brutti:languagechange'), 'Language change event is missing.')
assert(enhancer.includes('app-language-control'), 'Settings language control is missing.')
assert(enhancer.includes('Bahasa Melayu'), 'Bahasa Melayu option is missing.')
assert(enhancer.includes('English'), 'English option is missing.')
assert(enhancer.includes('translateDocument'), 'Global interface translation is missing.')
assert(main.includes('<AppLanguageLock />'), 'AppLanguageLock is not mounted.')

const { EXTRA_PAIRS, TEMPLATES, ATTRIBUTE_TEMPLATES, MONTH_PAIRS } = await import('../src/lib/uiTranslations.js')
const slots = (text) => (text.match(/\{\d\}/g) || []).sort().join(',')
EXTRA_PAIRS.forEach(([english, malay]) => {
  assert(english && malay, `Empty translation pair: ${english}`)
  assert(slots(english) === slots(malay), `Placeholder mismatch: ${english}`)
})
;[...TEMPLATES, ...ATTRIBUTE_TEMPLATES].forEach(([english, malay, ...aliases]) => {
  assert(slots(english) === slots(malay), `Template placeholder mismatch: ${english}`)
  aliases.forEach((alias) => assert(slots(alias) === slots(malay), `Template alias placeholder mismatch: ${alias}`))
})
assert(MONTH_PAIRS.length === 24, 'Month names are incomplete.')
assert(EXTRA_PAIRS.some(([english, malay]) => english === 'No reminder' && malay === 'Tiada peringatan'), 'No reminder translation is missing.')
assert(enhancer.includes('textState'), 'Original text is not remembered, so switching back to English could not restore it.')

console.log('PASS: App language preference is visible in Settings and applied globally.')
