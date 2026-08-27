import { describe, it, expect, vi, beforeEach } from 'vitest'

// Contrato do placar público de vagas.

const countWaitlist = vi.fn()
const countFounderTier = vi.fn()
vi.mock('@/lib/firestore', () => ({
  countWaitlist: () => countWaitlist(),
  countFounderTier: () => countFounderTier(),
}))

const route = await import('./route')
const { GET, runtime, revalidate } = route

beforeEach(() => vi.clearAllMocks())

it('roda em nodejs — @google-cloud/firestore não existe no edge', () => {
  expect(runtime).toBe('nodejs')
})

/*
  `force-dynamic` tem precedência sobre o header: a Vercel
  descartava o `s-maxage=10` e cobrava uma aggregation do Firestore por page
  view. O `s-maxage` testado logo abaixo só vale alguma coisa se a rota for
  cacheável, então as duas asserções andam juntas.
*/
it('é cacheável na borda por 10s — sem force-dynamic anulando o s-maxage', () => {
  expect(revalidate).toBe(10)
  expect((route as { dynamic?: string }).dynamic).toBeUndefined()
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

 /*
    Os dois caminhos numa asserção só, porque o que importa é o CONTRASTE:
    a rota é cacheável na borda, então uma falha transitória do Firestore sem
    diretiva própria fica à mercê da heurística do CDN — e a página anunciaria
    indisponibilidade por até 10s depois de a fonte ter voltado. Sucesso
    cacheia; erro nunca.
 */
  it('sucesso cacheia na borda, erro NUNCA — os dois lados do mesmo contrato', async () => {
    countWaitlist.mockResolvedValue(1)
    const ok = (await GET()).headers.get('Cache-Control')

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    countWaitlist.mockRejectedValue(new Error('indisponível'))
    const fail = (await GET()).headers.get('Cache-Control')
    spy.mockRestore()

    expect(ok).toMatch(/s-maxage=\d+/)
    expect(ok).not.toContain('no-store')

    expect(fail).toContain('no-store')
    expect(fail).not.toMatch(/s-maxage/)
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
