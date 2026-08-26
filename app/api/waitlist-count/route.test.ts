import { describe, it, expect, vi, beforeEach } from 'vitest'

// Contrato do placar público de vagas.

const countWaitlist = vi.fn()
const countFounderTier = vi.fn()
vi.mock('@/lib/firestore', () => ({
  countWaitlist: () => countWaitlist(),
  countFounderTier: () => countFounderTier(),
}))

const { GET, runtime } = await import('./route')

beforeEach(() => vi.clearAllMocks())

it('roda em nodejs — @google-cloud/firestore não existe no edge', () => {
  expect(runtime).toBe('nodejs')
})

describe('sucesso', () => {
  it('devolve as vagas restantes a partir de count(waitlist)', async () => {
    countWaitlist.mockResolvedValue(17)
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      available: true, signups: 17, slotsRemaining: 83, total: 100,
    })
  })

  it('não devolve negativo se a lista passar de 100', async () => {
    countWaitlist.mockResolvedValue(137)
    expect((await (await GET()).json()).slotsRemaining).toBe(0)
  })

  it('lista vazia é 100 vagas, não erro', async () => {
    countWaitlist.mockResolvedValue(0)
    expect((await (await GET()).json()).slotsRemaining).toBe(100)
  })

  it('a exibição NÃO deriva da flag persistida — só do total de inscritos', async () => {
    countWaitlist.mockResolvedValue(17)
    countFounderTier.mockResolvedValue(16)

    expect((await (await GET()).json()).slotsRemaining).toBe(83)
    expect(countFounderTier).not.toHaveBeenCalled()
  })
})

describe('cache', () => {
  it('obriga o navegador a revalidar — um F5 nunca mostra número velho', async () => {
    countWaitlist.mockResolvedValue(1)
    const cc = (await GET()).headers.get('Cache-Control')

    expect(cc).toContain('max-age=0')
    expect(cc).not.toMatch(/stale-while-revalidate/)
  })

  it('deixa a borda cachear por poucos segundos, não por minutos', async () => {
    countWaitlist.mockResolvedValue(1)
    const cc = (await GET()).headers.get('Cache-Control')

    const sMaxAge = Number(/s-maxage=(\d+)/.exec(cc ?? '')?.[1])
    expect(sMaxAge).toBeGreaterThan(0)
    expect(sMaxAge).toBeLessThanOrEqual(15)
  })
})

describe('falha', () => {
  it('devolve 503 SEM número — placar inventado é promessa quebrada', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    countWaitlist.mockRejectedValue(new Error('PERMISSION_DENIED projeto-x'))

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body).toEqual({ available: false })
    expect(JSON.stringify(body)).not.toContain('PERMISSION_DENIED')
    spy.mockRestore()
  })
})
