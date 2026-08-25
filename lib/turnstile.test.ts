import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  verifyTurnstileToken,
  TurnstileConfigError,
  TurnstileUnavailableError,
} from './turnstile'

/**
 * GNO-120 — contrato do verificador contra o siteverify da Cloudflare.
 *
 * A rede é mockada em TODOS os casos: nenhum teste desta suite fala com a
 * Cloudflare de verdade, e nenhuma secret real existe aqui. A chave usada é a
 * dummy oficial "always passes", injetada por vitest.config.ts.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const fetchMock = vi.fn()

/** Resposta do siteverify no formato que a Cloudflare devolve. */
const siteverify = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('token ausente ou malformado', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['string vazia', ''],
    ['só espaço', '   '],
    ['número', 42],
    ['objeto forjado', { success: true }],
  ])('reprova %s sem gastar chamada de rede', async (_label, token) => {
    const verdict = await verifyTurnstileToken(token)

    expect(verdict).toEqual({ ok: false, reason: 'missing-token' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('veredito da Cloudflare', () => {
  it('aprova quando success é true', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    expect(await verifyTurnstileToken('token-valido')).toEqual({ ok: true })
  })

  it('reprova quando success é false', async () => {
    fetchMock.mockResolvedValue(
      siteverify({ success: false, 'error-codes': ['invalid-input-response'] }),
    )

    expect(await verifyTurnstileToken('token-forjado')).toEqual({
      ok: false,
      reason: 'rejected',
    })
  })

  it('reprova "success" que não seja o booleano true — nada de truthy', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: 'true' }))

    expect(await verifyTurnstileToken('token')).toEqual({ ok: false, reason: 'rejected' })
  })

  it('manda secret e token para o endpoint oficial, e nada além disso', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    await verifyTurnstileToken('token-valido')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(SITEVERIFY_URL)
    expect(init.method).toBe('POST')
    // PRIVACIDADE: `remoteip` é opcional e fica de fora de propósito. Este
    // teste trava a decisão — o IP do visitante não vai para a Cloudflare.
    expect(JSON.parse(init.body)).toEqual({
      secret: '1x0000000000000000000000000000000AA',
      response: 'token-valido',
    })
  })

  it('não vaza os error-codes para quem chamou — só para o log interno', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock.mockResolvedValue(
      siteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
    )

    const verdict = await verifyTurnstileToken('token-gasto')

    expect(verdict).not.toHaveProperty('error-codes')
    expect(warn).toHaveBeenCalledWith('[turnstile] token reprovado:', 'timeout-or-duplicate')
  })
})

describe('fail-closed', () => {
  it('secret ausente é erro de configuração, não reprovação silenciosa', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    await expect(verifyTurnstileToken('token-valido')).rejects.toBeInstanceOf(
      TurnstileConfigError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rede fora do ar não vira aprovação', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(verifyTurnstileToken('token-valido')).rejects.toBeInstanceOf(
      TurnstileUnavailableError,
    )
  })

  it('5xx do siteverify não vira aprovação', async () => {
    fetchMock.mockResolvedValue(siteverify({}, 503))

    await expect(verifyTurnstileToken('token-valido')).rejects.toBeInstanceOf(
      TurnstileUnavailableError,
    )
  })

  it('corpo que não é JSON não vira aprovação', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Unexpected token < in JSON')
      },
    })

    await expect(verifyTurnstileToken('token-valido')).rejects.toBeInstanceOf(
      TurnstileUnavailableError,
    )
  })

  it('aborta a espera em vez de pendurar a request', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    await verifyTurnstileToken('token-valido')

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })
})
