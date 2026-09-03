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
assert(!enhancer.includes('data-brutti-language-lock'), 'Settings language panel must stay hidden.')
assert(!enhancer.includes('activeSettingsPage'), 'Hidden language setting must not inspect or modify the Settings page.')
assert(!enhancer.includes('.generator-form'), 'Language lock must not mutate Content Studio form DOM.')
assert(!enhancer.includes('Verified facts / direction'), 'Language lock must not rename caption-engine field labels.')
assert(!enhancer.includes('.plan-modal'), 'Language lock must not mutate Planner form DOM.')
assert(main.includes('<AppLanguageLock />'), 'AppLanguageLock is not mounted.')

console.log('PASS: App language preference remains applied in the background, its Settings panel stays hidden, and Content Studio and Planner labels remain untouched.')
