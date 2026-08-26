// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { loadInter } from '@/lib/og/fonts'
import OgImage, {
  alt as ogAlt,
  size as ogSize,
  contentType as ogContentType,
} from './opengraph-image'
import TwitterImage, {
  alt as twAlt,
  size as twSize,
  contentType as twContentType,
} from './twitter-image'
import Icon, { size as iconSize, contentType as iconContentType } from './icon'
import AppleIcon, {
  size as appleSize,
  contentType as appleContentType,
} from './apple-icon'

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** Lê as dimensões do chunk IHDR de um PNG (bytes 16..24). */
function pngDimensions(buf: Buffer) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

async function renderToPng(route: () => Promise<Response>) {
  const res = await route()
  const buf = Buffer.from(await res.arrayBuffer())
  return { res, buf }
}

describe(' fontes do renderizador (Satori)', () => {
  it('carrega as TTFs do disco — woff2 não é aceito pelo Satori', async () => {
    const { extraBold, regular } = await loadInter()

 // Assinatura TrueType: 0x00010000. Se algum dia alguém trocar por woff2
 // (0x774F4632), o Satori quebra em runtime — este teste pega antes.
    expect(extraBold.readUInt32BE(0)).toBe(0x00010000)
    expect(regular.readUInt32BE(0)).toBe(0x00010000)
    expect(extraBold.length).toBeGreaterThan(1000)
    expect(regular.length).toBeGreaterThan(1000)
  })

  it('memoiza o carregamento entre chamadas', async () => {
    const first = await loadInter()
    const second = await loadInter()

    expect(second.extraBold).toBe(first.extraBold)
    expect(second.regular).toBe(first.regular)
  })
})

describe(' OG image', () => {
  it('expõe os metadados que o Next injeta no <head>', () => {
    expect(ogSize).toEqual({ width: 1200, height: 630 })
    expect(ogContentType).toBe('image/png')
    expect(ogAlt).toBe('GnosIQ - The Cognitive Capital API')
  })

  it('renderiza um PNG 1200×630 de verdade', async () => {
    const { res, buf } = await renderToPng(OgImage)

    expect(res.headers.get('content-type')).toBe('image/png')
    expect(buf.subarray(0, 8)).toEqual(PNG_MAGIC)
    expect(pngDimensions(buf)).toEqual({ width: 1200, height: 630 })
  })
})

describe(' twitter image', () => {
  it('reusa exatamente a mesma imagem do OG', () => {
    expect(TwitterImage).toBe(OgImage)
    expect(twSize).toEqual(ogSize)
    expect(twContentType).toBe(ogContentType)
    expect(twAlt).toBe(ogAlt)
  })
})

describe(' ícones', () => {
  it('icon renderiza PNG 512×512', async () => {
    expect(iconSize).toEqual({ width: 512, height: 512 })
    expect(iconContentType).toBe('image/png')

    const { buf } = await renderToPng(Icon)

    expect(buf.subarray(0, 8)).toEqual(PNG_MAGIC)
    expect(pngDimensions(buf)).toEqual({ width: 512, height: 512 })
  })

  it('apple-icon renderiza PNG 180×180', async () => {
    expect(appleSize).toEqual({ width: 180, height: 180 })
    expect(appleContentType).toBe('image/png')

    const { buf } = await renderToPng(AppleIcon)

    expect(buf.subarray(0, 8)).toEqual(PNG_MAGIC)
    expect(pngDimensions(buf)).toEqual({ width: 180, height: 180 })
  })
})
