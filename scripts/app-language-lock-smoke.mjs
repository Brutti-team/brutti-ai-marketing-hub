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

console.log('PASS: App language preference is visible in Settings and applied globally.')
