import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const expectedNormalizedSha256 = '9b7b79aba84ef39d3914e4565750f48fa85f81454a7326876eea5bea62a8ded8'
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
