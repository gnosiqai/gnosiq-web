// GNO-102: gera app/favicon.ico a partir do PNG que a rota app/icon.tsx
// renderiza — assim o .ico legado nunca diverge do ícone servido em /icon.
//
// Requer um build prévio (o script lê o corpo prerenderizado da rota):
//   npm run build && npm run favicon:generate
//
// `sonar.sources` não inclui scripts/, então este arquivo fica fora do
// Quality Gate de cobertura.
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'

const SRC = process.argv[2] ?? '.next/server/app/icon.body'
const OUT = process.argv[3] ?? 'app/favicon.ico'
const SIZES = [16, 32, 48]

const src = await readFile(SRC)

const pngs = await Promise.all(
  SIZES.map((s) =>
    sharp(src)
      .resize(s, s, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer()
  )
)

// ICONDIR (6 bytes) + N × ICONDIRENTRY (16 bytes) + payloads.
// PNG embutido no lugar de BMP/DIB: suportado desde o Vista e por todos os
// browsers atuais, e evita escrever o encoder de DIB à mão.
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type = icon
header.writeUInt16LE(SIZES.length, 4)

let offset = 6 + 16 * SIZES.length
const entries = SIZES.map((px, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(px === 256 ? 0 : px, 0) // width (0 significa 256)
  e.writeUInt8(px === 256 ? 0 : px, 1) // height
  e.writeUInt8(0, 2) // cores na paleta (0 = truecolor)
  e.writeUInt8(0, 3) // reservado
  e.writeUInt16LE(1, 4) // color planes
  e.writeUInt16LE(32, 6) // bits por pixel
  e.writeUInt32LE(pngs[i].length, 8)
  e.writeUInt32LE(offset, 12)
  offset += pngs[i].length
  return e
})

await writeFile(OUT, Buffer.concat([header, ...entries, ...pngs]))
console.log(`${OUT}: ${SIZES.join('/')}px, ${offset} bytes`)
