import { describe, it, expect, vi, beforeEach } from 'vitest'

// Contrato do placar público de vagas.

const countWaitlist = vi.fn()
const countFounderTier = vi.fn()
vi.mock('@/lib/firestore', () => ({
  countWaitlist: () => countWaitlist(),
  countFounderTier: () => countFounderTier(),
}))

/*
  `unstable_cache` exige o contexto de request do Next; fora dele lança
  `Invariant: incrementalCache missing`. O mock deixa a função passar direto e
  registra COMO ela foi configurada — que é o que este arquivo consegue travar.
  O comportamento do cache em si é do Next e foi medido com sonda, não aqui.
*/
const cacheSpy = vi.hoisted(() => ({
  keys: undefined as readonly string[] | undefined,
  revalidate: undefined as number | undefined,
}))
vi.mock('next/cache', () => ({
  unstable_cache: (
    fn: () => Promise<number>,
    keys: readonly string[],
    opts: { revalidate?: number },
  ) => {
    cacheSpy.keys = keys
    cacheSpy.revalidate = opts?.revalidate
    return fn
  },
}))

const route = await import('./route')
const { GET, runtime, revalidate } = route

beforeEach(() => vi.clearAllMocks())

it('roda em nodejs — @google-cloud/firestore não existe no edge', () => {
  expect(runtime).toBe('nodejs')
})

/*
  A amortização é de LEITURA, não de borda: uma aggregation do Firestore serve
  todas as requests da janela de 10s. As duas asserções andam juntas porque
  uma sem a outra não segura nada.

  `revalidate` ausente é requisito, não descuido: declará-lo faz o Next tentar
  pré-renderizar a rota no build, o que exige a coleção acessível naquele
  momento. Quando não está, a rota cai para dinâmica e a amortização evapora —
  foi o que aconteceu em produção. Sem `revalidate` não há pré-render, e o
  cache de dados amortiza em runtime, que é onde a leitura de fato acontece.
*/
it('a leitura é amortizada em janela de 10s, e a rota não é pré-renderizada', () => {
  expect(cacheSpy.revalidate).toBe(10)
  expect(cacheSpy.keys).toEqual(['waitlist-count'])

  expect(revalidate).toBeUndefined()
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
