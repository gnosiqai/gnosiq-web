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

describe('GNO-123 · teto de tamanho do token', () => {
  /*
    O achado R2 da auditoria CISO T3 do PR #105: sem teto, o token atravessava
    inteiro para a Cloudflare (500.000 bytes medidos a partir de um POST). Um
    token real não passa de ~2 KB.
  */
  it('acima de 2048 caracteres reprova SEM chamada de rede', async () => {
    const verdict = await verifyTurnstileToken('a'.repeat(2049))

    expect(verdict).toEqual({ ok: false, reason: 'rejected' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('token gigante não é encaminhado: a banda gasta é ZERO', async () => {
    await verifyTurnstileToken('a'.repeat(500_000))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('exatamente 2048 ainda vai para o siteverify — o teto não corta token real', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    expect(await verifyTurnstileToken('a'.repeat(2048))).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
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

  /*
    GNO-123, achado R1 da auditoria CISO T3 do PR #105. A chave dummy
    "always passes" em Production faz o siteverify aprovar TUDO: a camada
    anti-bot vira enfeite e nada denuncia. Aqui ela é defeito de CONFIGURAÇÃO,
    e cai no mesmo fail-closed do secret ausente.
  */
  it('chave de TESTE em produção é erro de configuração, não aprovação', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')

    await expect(verifyTurnstileToken('token-valido')).rejects.toBeInstanceOf(
      TurnstileConfigError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('a trava vale para todas as dummies conhecidas, secret e sitekey', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')

    for (const dummy of [
      '1x0000000000000000000000000000000AA',
      '2x0000000000000000000000000000000AA',
      '3x0000000000000000000000000000000AA',
      '1x00000000000000000000AA',
    ]) {
      vi.stubEnv('TURNSTILE_SECRET_KEY', dummy)
      await expect(verifyTurnstileToken('token-valido')).rejects.toBeInstanceOf(
        TurnstileConfigError,
      )
    }

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('o erro nomeia a variável e o defeito, NUNCA o valor da chave', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')

    await expect(verifyTurnstileToken('token-valido')).rejects.toThrow(
      /TURNSTILE_SECRET_KEY/,
    )
    await expect(verifyTurnstileToken('token-valido')).rejects.not.toThrow(
      /1x0000000000000000000000000000000AA/,
    )
  })

  it('a trava é INDEPENDENTE do input: token ausente em produção também é 503', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')

    // Se a checagem viesse depois do token, um bot sem token receberia a
    // resposta genérica e o defeito de configuração ficaria invisível.
    await expect(verifyTurnstileToken(undefined)).rejects.toBeInstanceOf(
      TurnstileConfigError,
    )
  })

  it('Preview e Development seguem usando a dummy sem reclamar', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    for (const env of ['preview', 'development']) {
      vi.stubEnv('VERCEL_ENV', env)
      expect(await verifyTurnstileToken('token-valido')).toEqual({ ok: true })
    }
  })

  it('chave REAL em produção passa direto — a trava só olha as dummies', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '0xSECRETdeVerdadeQueNaoEDummy')
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    expect(await verifyTurnstileToken('token-valido')).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('aborta a espera em vez de pendurar a request', async () => {
    fetchMock.mockResolvedValue(siteverify({ success: true }))

    await verifyTurnstileToken('token-valido')

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })
})
