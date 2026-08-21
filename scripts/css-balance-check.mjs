import fs from 'node:fs'
import path from 'node:path'

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.isFile() && entry.name.endsWith('.css') ? [full] : []
  })
}

function stripNoise(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
}

function checkFile(file) {
  const source = stripNoise(fs.readFileSync(file, 'utf8'))
  let depth = 0
  let line = 1
  const stack = []
  for (const char of source) {
    if (char === '\n') line += 1
    if (char === '{') {
      depth += 1
      stack.push(line)
    } else if (char === '}') {
      depth -= 1
      if (depth < 0) return { file, message: `extra closing brace near line ${line}` }
      stack.pop()
    }
  }
  if (depth > 0) return { file, message: `missing ${depth} closing brace(s); last opening near line ${stack.at(-1)}` }
  return null
}

const cssFiles = walk(path.resolve('src'))
const problems = cssFiles.map(checkFile).filter(Boolean)

if (problems.length) {
  problems.forEach((problem) => console.error(`${path.relative(process.cwd(), problem.file)}: ${problem.message}`))
  process.exitCode = 1
} else {
  console.log(`CSS balance check passed for ${cssFiles.length} files.`)
}
