import { describe, it, expect, vi, beforeEach } from 'vitest'

// GNO-115 · GATE CISO T1 — o campo WhatsApp é dado pessoal NOVO neste
// endpoint. Estes testes seguram o contrato que a review vai auditar:
// consentimento obrigatório, pelo menos um canal, normalização antes de
// persistir, allowlist de role e nenhuma PII em log.

const addToWaitlist = vi.fn()

vi.mock('@/lib/firestore', () => ({
  addToWaitlist: (...args: unknown[]) => addToWaitlist(...args),
}))

const { POST } = await import('./route')

/** Requisição mínima — só o que o handler consome. */
function req(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof POST>[0]
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
