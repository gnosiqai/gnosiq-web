import { describe, it, expect, vi, beforeEach } from 'vitest'

// GNO-115 · GATE CISO T1 — o campo WhatsApp é dado pessoal NOVO neste
// endpoint. Estes testes seguram o contrato que a review vai auditar:
// consentimento obrigatório, pelo menos um canal, normalização antes de
// persistir, allowlist de role e nenhuma PII em log.

const addToWaitlist = vi.fn()

vi.mock('@/lib/firestore', () => ({
  addToWaitlist: (...args: unknown[]) => addToWaitlist(...args),
}))

const captureServerEvent = vi.fn()
vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: (...args: unknown[]) => captureServerEvent(...args),
}))

const { POST } = await import('./route')

/** Requisição mínima — só o que o handler consome. */
function req(body: unknown, referer?: string) {
  return {
    json: async () => body,
    headers: { get: (name: string) => (name === 'referer' ? (referer ?? null) : null) },
  } as unknown as Parameters<typeof POST>[0]
}

const VALID = {
  whatsapp: '(11) 91234-5678',
  email: '',
  icp_segment: 'founder',
  consent: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  addToWaitlist.mockResolvedValue({ alreadyExists: false })
})

describe('consentimento LGPD', () => {
  it('recusa sem consentimento', async () => {
    const res = await POST(req({ ...VALID, consent: false }))
    expect(res.status).toBe(400)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('recusa quando consentimento vem ausente', async () => {
    const res = await POST(req({ whatsapp: '(11) 91234-5678' }))
    expect(res.status).toBe(400)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('recusa consentimento "truthy" que não seja true — nada de "on" de checkbox', async () => {
    const res = await POST(req({ ...VALID, consent: 'on' }))
    expect(res.status).toBe(400)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })
})

describe('pelo menos um canal', () => {
  it('recusa quando WhatsApp e e-mail estão vazios', async () => {
    const res = await POST(req({ whatsapp: '', email: '', consent: true }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/pelo menos um/i)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('aceita só WhatsApp', async () => {
    const res = await POST(req({ whatsapp: '(11) 91234-5678', consent: true }))
    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ whatsapp: '+5511912345678', email: null }),
    )
  })

  it('aceita só e-mail', async () => {
    const res = await POST(req({ email: 'Voce@Exemplo.com', consent: true }))
    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ whatsapp: null, email: 'voce@exemplo.com' }),
    )
  })

  it('aceita os dois', async () => {
    const res = await POST(
      req({ whatsapp: '11912345678', email: 'voce@exemplo.com', consent: true }),
    )
    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ whatsapp: '+5511912345678', email: 'voce@exemplo.com' }),
    )
  })
})

describe('validação de formato', () => {
  it('recusa WhatsApp inválido sem tocar o Firestore', async () => {
    const res = await POST(req({ whatsapp: '+5511', consent: true }))
    expect(res.status).toBe(400)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('recusa e-mail inválido sem tocar o Firestore', async () => {
    const res = await POST(req({ email: 'nao-e-email', consent: true }))
    expect(res.status).toBe(400)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('recusa campo acima do limite de tamanho', async () => {
    const res = await POST(req({ email: `${'a'.repeat(300)}@x.com`, consent: true }))
    expect(res.status).toBe(400)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('normaliza o telefone ANTES de persistir — dedupe depende do formato único', async () => {
    await POST(req({ whatsapp: '  (11) 91234-5678  ', consent: true }))
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ whatsapp: '+5511912345678' }),
    )
  })
})

describe('role — allowlist, não texto livre', () => {
  it('aceita valor da allowlist', async () => {
    await POST(req({ ...VALID, icp_segment: 'estudante' }))
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ icpSegment: 'estudante' }),
    )
  })

  it('descarta valor fora da allowlist em vez de persistir texto arbitrário', async () => {
    await POST(req({ ...VALID, icp_segment: '<script>alert(1)</script>' }))
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ icpSegment: null }),
    )
  })
})

describe('honeypot (GATE CISO, item 6 — parte "a")', () => {
  it('preenchido: ZERO escrita no Firestore', async () => {
    const res = await POST(req({ ...VALID, website: 'http://spam.example' }))
    expect(res.status).toBe(200)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('preenchido: resposta BYTE A BYTE idêntica à de sucesso real', async () => {
    addToWaitlist.mockResolvedValue({ alreadyExists: false })
    const real = await POST(req(VALID))
    const corpoReal = await real.json()

    vi.clearAllMocks()
    const bot = await POST(req({ ...VALID, website: 'http://spam.example' }))
    const corpoBot = await bot.json()

    expect(bot.status).toBe(real.status)
    expect(JSON.stringify(corpoBot)).toBe(JSON.stringify(corpoReal))
  })

  it('preenchido: dispara antes da validação — nem feedback de erro o bot recebe', async () => {
    // Payload que falharia em TODAS as validações. Ainda assim: 200 e silêncio.
    const res = await POST(
      req({ whatsapp: 'lixo', email: 'lixo', consent: false, website: 'x' }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveProperty('success', true)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('telemetria: evento disparado sem NENHUM dado do payload do bot', async () => {
    await POST(
      req(
        {
          whatsapp: '(11) 91234-5678',
          email: 'bot@spam.example',
          consent: true,
          website: 'http://spam.example',
        },
        'https://gnosiq.ai/?utm_source=linkedin&utm_campaign=inpi',
      ),
    )

    expect(captureServerEvent).toHaveBeenCalledWith(
      'waitlist_honeypot_tripped',
      expect.any(String),
      { lp_version: 'v2', utm_source: 'linkedin', utm_campaign: 'inpi' },
    )

    const payload = JSON.stringify(captureServerEvent.mock.calls[0])
    expect(payload).not.toContain('91234')
    expect(payload).not.toContain('bot@spam.example')
    expect(payload).not.toContain('spam.example')
  })

  it('sem Referer: evento sai só com lp_version, sem quebrar', async () => {
    await POST(req({ ...VALID, website: 'x' }))
    expect(captureServerEvent).toHaveBeenCalledWith('waitlist_honeypot_tripped', expect.any(String), {
      lp_version: 'v2',
    })
  })

  it('Referer malformado não derruba a resposta', async () => {
    const res = await POST(req({ ...VALID, website: 'x' }, 'nao-e-url'))
    expect(res.status).toBe(200)
  })

  it('vazio ou ausente: fluxo normal intacto', async () => {
    addToWaitlist.mockResolvedValue({ alreadyExists: false })

    await POST(req({ ...VALID, website: '' }))
    expect(addToWaitlist).toHaveBeenCalledTimes(1)

    await POST(req(VALID))
    expect(addToWaitlist).toHaveBeenCalledTimes(2)
    expect(captureServerEvent).not.toHaveBeenCalled()
  })

  it('só espaços em branco não é considerado preenchido', async () => {
    addToWaitlist.mockResolvedValue({ alreadyExists: false })
    await POST(req({ ...VALID, website: '   ' }))
    expect(addToWaitlist).toHaveBeenCalled()
  })
})

describe('sem oráculo de enumeração (GATE CISO, itens 4 e 7)', () => {
  it('inscrição nova e reinscrição produzem resposta BYTE A BYTE idêntica', async () => {
    addToWaitlist.mockResolvedValue({ alreadyExists: false })
    const novo = await POST(req({ ...VALID, email: 'alguem@exemplo.com' }))
    const corpoNovo = await novo.json()

    addToWaitlist.mockResolvedValue({ alreadyExists: true })
    const repetido = await POST(req({ ...VALID, email: 'alguem@exemplo.com' }))
    const corpoRepetido = await repetido.json()

    expect(repetido.status).toBe(novo.status)
    expect(JSON.stringify(corpoRepetido)).toBe(JSON.stringify(corpoNovo))
  })

  it('a resposta não expõe alreadyExists em campo nenhum', async () => {
    addToWaitlist.mockResolvedValue({ alreadyExists: true })
    const body = await (await POST(req(VALID))).json()

    expect(body).not.toHaveProperty('alreadyExists')
    expect(JSON.stringify(body)).not.toMatch(/alreadyExists|já est/i)
  })

  it('o efeito colateral ainda distingue os casos — só a resposta não', async () => {
    // O e-mail de confirmação continua saindo só para inscrição nova; o que
    // mudou é que isso não é observável por quem chama a rota.
    addToWaitlist.mockResolvedValue({ alreadyExists: true })
    const res = await POST(req({ ...VALID, email: 'alguem@exemplo.com' }))
    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledTimes(1)
  })
})

describe('robustez e vazamento', () => {
  it('corpo não-JSON vira 400, não 500', async () => {
    const res = await POST({
      json: async () => {
        throw new Error('invalid json')
      },
    } as unknown as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('falha do Firestore devolve erro genérico, sem detalhe interno', async () => {
    addToWaitlist.mockRejectedValue(new Error('PERMISSION_DENIED projeto-secreto'))
    const res = await POST(req(VALID))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).not.toContain('PERMISSION_DENIED')
    expect(body.error).not.toContain('projeto-secreto')
  })

  it('nenhum log carrega o telefone ou o e-mail do inscrito', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    addToWaitlist.mockRejectedValue(new Error('boom'))

    await POST(req({ whatsapp: '(11) 91234-5678', email: 'vaza@exemplo.com', consent: true }))

    const logged = [...errorSpy.mock.calls, ...warnSpy.mock.calls].flat().join(' ')
    expect(logged).not.toContain('91234')
    expect(logged).not.toContain('vaza@exemplo.com')

    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })
})
