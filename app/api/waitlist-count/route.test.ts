import { describe, it, expect, vi, beforeEach } from 'vitest'

// GNO-115 (item 8 do delta) — o contrato do placar de fundadores.

const countFounderTier = vi.fn()
vi.mock('@/lib/firestore', () => ({
  countFounderTier: () => countFounderTier(),
}))

const { GET, runtime } = await import('./route')

beforeEach(() => vi.clearAllMocks())

it('roda em nodejs — @google-cloud/firestore não existe no edge', () => {
  expect(runtime).toBe('nodejs')
})

describe('sucesso', () => {
  it('devolve as vagas restantes a partir de count(founder_tier == true)', async () => {
    countFounderTier.mockResolvedValue(13)
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      available: true, founders: 13, slotsRemaining: 87, total: 100,
    })
  })

  it('não devolve negativo se a materialização passar de 100', async () => {
    countFounderTier.mockResolvedValue(137)
    expect((await (await GET()).json()).slotsRemaining).toBe(0)
  })

  it('lista vazia é 100 vagas, não erro', async () => {
    countFounderTier.mockResolvedValue(0)
    expect((await (await GET()).json()).slotsRemaining).toBe(100)
  })

  it('é cacheável — o placar muda em lotes, não a cada request', async () => {
    countFounderTier.mockResolvedValue(1)
    expect((await GET()).headers.get('Cache-Control')).toMatch(/s-maxage=\d+/)
  })
})

describe('falha', () => {
  it('devolve 503 SEM número — placar inventado é promessa quebrada', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    countFounderTier.mockRejectedValue(new Error('PERMISSION_DENIED projeto-x'))

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body).toEqual({ available: false })
    expect(JSON.stringify(body)).not.toContain('PERMISSION_DENIED')
    spy.mockRestore()
  })
})
