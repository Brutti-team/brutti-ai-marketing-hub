import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const expectedNormalizedSha256 = '001c9d4031c8edba13eb47dc33c07519c7bf47b1b99ce8532acdb6ff7cd6cb9d'
const sourcePath = new URL('../src/Brutti_Soul_MasterDoc.md', import.meta.url)

const raw = await readFile(sourcePath, 'utf8')
const normalized = raw.replace(/\r\n/g, '\n').trimEnd()
const actualNormalizedSha256 = createHash('sha256').update(normalized, 'utf8').digest('hex')

if (actualNormalizedSha256 !== expectedNormalizedSha256) {
  console.error('BRUTTI Soul Master source lock mismatch.')
  console.error('The bundled Soul Master no longer matches the approved MASTER source.')
  console.error('Do not auto-accept this change. Review the Google Drive MASTER first, then intentionally update the lock.')
  console.error(`Expected: ${expectedNormalizedSha256}`)
  console.error(`Actual:   ${actualNormalizedSha256}`)
  process.exit(1)
}

console.log('BRUTTI Soul Master source lock OK.')
