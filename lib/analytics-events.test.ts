import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * Gate estático dos nomes de evento PostHog.
 *
 * Convenção do projeto: todo nome de evento é snake_case. Um espaço no nome
 * não quebra nada em runtime (o PostHog aceita), e é exatamente por isso que
 * a regressão passa despercebida: ela só aparece meses depois, como dois
 * eventos que deveriam ser um no funil. Este teste torna a convenção
 * determinística: qualquer `capture(` cujo primeiro argumento seja um literal
 * com espaço derruba a suíte, com arquivo e linha.
 *
 * Varre o código fonte de verdade em vez de mockar o SDK: o que interessa é
 * o literal escrito no repositório, não o que uma renderização específica
 * dispara.
 */

const ROOT = join(__dirname, '..')
const SCAN_DIRS = ['app', 'components', 'lib', 'hooks']
const EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs)$/
const SELF = join(__dirname, 'analytics-events.test.ts')

/** `capture(` seguido de literal de string; captura o conteúdo do literal. */
const CAPTURE_LITERAL = /\bcapture\(\s*(['"`])((?:(?!\1).)*)\1/g

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (EXTENSIONS.test(entry) && full !== SELF) out.push(full)
  }
  return out
}

function offenders(): string[] {
  const found: string[] = []
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(CAPTURE_LITERAL)) {
        const name = match[2]
        if (/\s/.test(name)) {
          const line = source.slice(0, match.index).split('\n').length
          found.push(`${relative(ROOT, file)}:${line} -> "${name}"`)
        }
      }
    }
  }
  return found
}

describe('nomes de evento PostHog', () => {
  it('varre código de verdade, não uma lista vazia', () => {
    const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
    expect(files.length).toBeGreaterThan(0)
  })

  it('nenhum capture( recebe literal com espaço: snake_case é a convenção', () => {
    expect(offenders()).toEqual([])
  })
})
