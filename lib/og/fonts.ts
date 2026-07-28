import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// GNO-92: carregamento das TTFs para o Satori (ImageResponse).
// Satori exige TTF/OTF — woff2 não é suportado. Os arquivos vivem em
// assets/fonts/ e são incluídos no bundle serverless via
// `outputFileTracingIncludes` (next.config.ts).
//
// NOTA: não usar `fetch(new URL('...', import.meta.url))` (padrão da doc do
// Next) — no prerender estático o webpack emite um path relativo
// (/_next/static/media/...) que `fetch` não consegue parsear.

const FONT_DIR = join(process.cwd(), 'assets', 'fonts')

let cache: Promise<{ extraBold: Buffer; regular: Buffer }> | null = null

export function loadInter() {
  cache ??= Promise.all([
    readFile(join(FONT_DIR, 'Inter-ExtraBold.ttf')),
    readFile(join(FONT_DIR, 'Inter-Regular.ttf')),
  ]).then(([extraBold, regular]) => ({ extraBold, regular }))

  return cache
}
