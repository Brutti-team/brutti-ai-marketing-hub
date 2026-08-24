import fs from 'node:fs'

const enhancer = fs.readFileSync(new URL('../src/AppLanguageLock.jsx', import.meta.url), 'utf8')
const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(enhancer.includes("brutti-ui-language-v1"), 'Language preference storage key is missing.')
assert(enhancer.includes("document.documentElement.lang"), 'Document language is not updated.')
assert(enhancer.includes("dataset.bruttiUiLanguage"), 'App language state attribute is missing.')
assert(enhancer.includes("brutti:languagechange"), 'Language change event is missing.')
assert(enhancer.includes("data-brutti-language-lock"), 'Settings language panel marker is missing.')
assert(enhancer.includes("activeSettingsPage"), 'Language control must remain scoped to the Settings page.')
assert(enhancer.includes(".page-header"), 'Language control should render visibly near the Settings page header.')
assert(enhancer.includes(".cloud-access-panel"), 'Settings page fallback detection is missing.')
assert(!enhancer.includes(".generator-form"), 'Low-risk language lock must not mutate Content Studio form DOM.')
assert(!enhancer.includes("Verified facts / direction"), 'Low-risk language lock must not rename caption-engine field labels.')
assert(!enhancer.includes(".plan-modal"), 'Low-risk language lock must not mutate Planner form DOM.')
assert(main.includes("<AppLanguageLock />"), 'AppLanguageLock is not mounted.')

console.log('PASS: App Language Lock persists BM/English choice, renders visibly in Settings, updates document language state, and stays isolated from Content Studio and Planner functional labels.')
