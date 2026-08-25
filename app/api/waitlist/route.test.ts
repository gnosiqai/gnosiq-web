import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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

/**
 * GNO-122 — o sender agora mora em lib/email.ts, e é ele que a rota chama.
 * As classes de erro são reais (não mockadas): é o `instanceof` delas que
 * decide se a falha foi de configuração ou de entrega.
 */
const sendWaitlistConfirmationPT = vi.fn()
vi.mock('@/lib/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/email')>()
  return {
    ...actual,
    sendWaitlistConfirmationPT: (...args: unknown[]) => sendWaitlistConfirmationPT(...args),
  }
})

const { POST } = await import('./route')

/**
 * GNO-120 — o siteverify da Cloudflare é mockado em TODA esta suite. Nenhum
 * teste fala com a rede, e a secret usada é a dummy oficial "always passes"
 * injetada por vitest.config.ts.
 */
const fetchMock = vi.fn()

/** Aprovação do siteverify — o padrão desta suite. */
const turnstileApproves = () =>
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) })

/** Reprovação do siteverify, com o error-code que a Cloudflare devolveria. */
const turnstileRejects = () =>
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
  })

/**
 * Requisição mínima — só o que o handler consome.
 *
 * O token do Turnstile entra por padrão porque a esmagadora maioria destes
 * testes é sobre VALIDAÇÃO, não sobre o gate anti-bot: sem o padrão, todos
 * eles morreriam no gate e passariam a testar a camada errada. Quem exercita
 * o gate sobrescreve `turnstile_token` explicitamente.
 */
function req(body: unknown, referer?: string) {
  const withToken =
    body && typeof body === 'object' && !('turnstile_token' in body)
      ? { ...body, turnstile_token: 'token-de-teste' }
      : body

  return {
    json: async () => withToken,
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
  vi.stubGlobal('fetch', fetchMock)
  turnstileApproves()
  addToWaitlist.mockResolvedValue({ alreadyExists: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
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

describe('GNO-120 · Turnstile (GATE CISO, item 6 — parte "b")', () => {
  it('token ausente: ZERO escrita no Firestore', async () => {
    const res = await POST(req({ ...VALID, turnstile_token: undefined }))

    expect(res.status).toBe(200)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('token reprovado pela Cloudflare: ZERO escrita no Firestore', async () => {
    turnstileRejects()

    const res = await POST(req({ ...VALID, turnstile_token: 'token-forjado' }))

    expect(res.status).toBe(200)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('token reprovado: ZERO e-mail enviado', async () => {
    turnstileRejects()

    await POST(req({ ...VALID, email: 'lead@exemplo.com', turnstile_token: 'forjado' }))

    expect(sendWaitlistConfirmationPT).not.toHaveBeenCalled()
  })

  it('reprovação é BYTE A BYTE idêntica à resposta de sucesso real', async () => {
    const real = await POST(req(VALID))
    const corpoReal = await real.json()

    vi.clearAllMocks()
    turnstileRejects()
    const bot = await POST(req({ ...VALID, turnstile_token: 'token-forjado' }))
    const corpoBot = await bot.json()

    expect(bot.status).toBe(real.status)
    expect(JSON.stringify(corpoBot)).toBe(JSON.stringify(corpoReal))
  })

  it('reprovação é indistinguível do honeypot — nenhuma defesa se denuncia', async () => {
    const honeypot = await POST(req({ ...VALID, website: 'http://spam.example' }))
    const corpoHoneypot = await honeypot.json()

    turnstileRejects()
    const turnstile = await POST(req({ ...VALID, turnstile_token: 'forjado' }))
    const corpoTurnstile = await turnstile.json()

    expect(turnstile.status).toBe(honeypot.status)
    expect(JSON.stringify(corpoTurnstile)).toBe(JSON.stringify(corpoHoneypot))
  })

  it('a verificação acontece ANTES da validação do payload', async () => {
    turnstileRejects()

    // Payload que falharia em todas as validações: ainda assim 200 e silêncio,
    // porque o gate decidiu antes de qualquer validação olhar o conteúdo.
    const res = await POST(
      req({ whatsapp: 'lixo', consent: false, turnstile_token: 'forjado' }),
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toHaveProperty('success', true)
    expect(addToWaitlist).not.toHaveBeenCalled()
  })

  it('honeypot decide antes do Turnstile — bot entregue não gasta chamada de rede', async () => {
    await POST(req({ ...VALID, website: 'http://spam.example' }))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(captureServerEvent).toHaveBeenCalledWith(
      'waitlist_honeypot_tripped',
      expect.any(String),
      expect.any(Object),
    )
  })

  it('telemetria da reprovação não carrega NENHUM dado do payload', async () => {
    turnstileRejects()

    await POST(
      req(
        {
          whatsapp: '(11) 91234-5678',
          email: 'bot@spam.example',
          consent: true,
          turnstile_token: 'forjado',
        },
        'https://gnosiq.ai/?utm_source=linkedin&utm_campaign=inpi',
      ),
    )

    expect(captureServerEvent).toHaveBeenCalledWith(
      'waitlist_turnstile_rejected',
      expect.any(String),
      { lp_version: 'v2', reason: 'rejected', utm_source: 'linkedin', utm_campaign: 'inpi' },
    )

    const payload = JSON.stringify(captureServerEvent.mock.calls[0])
    expect(payload).not.toContain('91234')
    expect(payload).not.toContain('bot@spam.example')
    expect(payload).not.toContain('forjado')
  })

  it('token ausente e token reprovado são medidos separado', async () => {
    await POST(req({ ...VALID, turnstile_token: '' }))

    expect(captureServerEvent).toHaveBeenCalledWith(
      'waitlist_turnstile_rejected',
      expect.any(String),
      expect.objectContaining({ reason: 'missing-token' }),
    )
  })

  it('token aprovado: fluxo normal intacto', async () => {
    const res = await POST(req(VALID))

    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledTimes(1)
    expect(captureServerEvent).not.toHaveBeenCalled()
  })

  it('o token NUNCA chega ao Firestore — não é dado do lead', async () => {
    await POST(req({ ...VALID, turnstile_token: 'token-de-teste' }))

    const persisted = JSON.stringify(addToWaitlist.mock.calls[0])
    expect(persisted).not.toContain('token-de-teste')
    expect(addToWaitlist).toHaveBeenCalledWith(
      expect.not.objectContaining({ turnstile_token: expect.anything() }),
    )
  })
})

describe('GNO-120 · fail-closed do Turnstile', () => {
  it('secret ausente: 503 explícito e ZERO escrita — nunca sucesso silencioso', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    const res = await POST(req(VALID))

    expect(res.status).toBe(503)
    expect(addToWaitlist).not.toHaveBeenCalled()
    expect(errorSpy.mock.calls.flat().join(' ')).toMatch(/TURNSTILE_SECRET_KEY/)

    errorSpy.mockRestore()
  })

  it('siteverify fora do ar: 503 e ZERO escrita — a inscrição NÃO passa', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    const res = await POST(req(VALID))

    expect(res.status).toBe(503)
    expect(addToWaitlist).not.toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('o 503 do fail-closed devolve o erro genérico, sem detalhe do provedor', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })

    const body = await (await POST(req(VALID))).json()

    expect(body.error).not.toMatch(/turnstile|cloudflare|siteverify/i)
    expect(body.error).toMatch(/temporariamente indispon/i)

    vi.restoreAllMocks()
  })

  it('nenhum log do fail-closed carrega a secret ou dado do inscrito', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    await POST(req({ whatsapp: '(11) 91234-5678', email: 'vaza@exemplo.com', consent: true }))

    const logged = [...errorSpy.mock.calls, ...warnSpy.mock.calls].flat().join(' ')
    expect(logged).not.toContain('91234')
    expect(logged).not.toContain('vaza@exemplo.com')
    expect(logged).not.toContain('1x0000000000000000000000000000000AA')

    vi.restoreAllMocks()
  })
})

describe('GNO-122 · o caminho de e-mail não falha em silêncio', () => {
  const emailLead = { ...VALID, email: 'lead@exemplo.com' }

  it('inscrição nova com e-mail dispara a confirmação', async () => {
    await POST(req(emailLead))

    expect(sendWaitlistConfirmationPT).toHaveBeenCalledWith({
      email: 'lead@exemplo.com',
      name: '',
    })
  })

  it('reinscrição não dispara e-mail de novo', async () => {
    addToWaitlist.mockResolvedValue({ alreadyExists: true })

    await POST(req(emailLead))

    expect(sendWaitlistConfirmationPT).not.toHaveBeenCalled()
  })

  it('recusa do provedor VIRA EVENTO — a classe de falha silenciosa morre aqui', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailDeliveryError } = await import('@/lib/email')
    sendWaitlistConfirmationPT.mockRejectedValue(new EmailDeliveryError('Unauthorized'))

    await POST(req(emailLead))

    expect(captureServerEvent).toHaveBeenCalledWith(
      'waitlist_email_failed',
      expect.any(String),
      expect.objectContaining({ kind: 'delivery', reason: 'Unauthorized' }),
    )
    vi.restoreAllMocks()
  })

  it('env ausente é medida como defeito de CONFIGURAÇÃO, não de entrega', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailConfigError } = await import('@/lib/email')
    sendWaitlistConfirmationPT.mockRejectedValue(new EmailConfigError('RESEND_API_KEY'))

    await POST(req(emailLead))

    expect(captureServerEvent).toHaveBeenCalledWith(
      'waitlist_email_failed',
      expect.any(String),
      expect.objectContaining({ kind: 'config' }),
    )
    vi.restoreAllMocks()
  })

  it('a falha sai em log ESTRUTURADO, filtrável no Vercel', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailDeliveryError } = await import('@/lib/email')
    sendWaitlistConfirmationPT.mockRejectedValue(new EmailDeliveryError('rate limited'))

    await POST(req(emailLead))

    const linha = errorSpy.mock.calls.flat().find((c) => String(c).includes('waitlist_email_failed'))
    expect(JSON.parse(String(linha))).toMatchObject({
      level: 'error',
      event: 'waitlist_email_failed',
      provider: 'resend',
      kind: 'delivery',
    })
    vi.restoreAllMocks()
  })

  it('o e-mail do inscrito NÃO vaza no log nem no evento, mesmo quando o provedor o ecoa', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailDeliveryError } = await import('@/lib/email')
    // Recusa realista do Resend: o provedor devolve o campo que rejeitou.
    sendWaitlistConfirmationPT.mockRejectedValue(
      new EmailDeliveryError('Invalid `to` field: lead@exemplo.com is not a valid address'),
    )

    await POST(req(emailLead))

    const tudo = JSON.stringify([...errorSpy.mock.calls, ...captureServerEvent.mock.calls])
    expect(tudo).not.toContain('lead@exemplo.com')
    expect(tudo).toContain('[e-mail]')
    vi.restoreAllMocks()
  })

  it('mensagem hostil do provedor não trava a rota (typescript:S8786)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailDeliveryError } = await import('@/lib/email')

    /*
      Caso adversarial da redação. A mensagem de erro do provedor é entrada
      influenciada pelo usuário, então a regex que a redige é superfície de
      ataque: com backtracking não-linear, uma string longa custa tempo
      QUADRÁTICO no caminho de falha.

      A forma abaixo é a pior possível, e o detalhe importa: a string tem
      muitos caracteres e NENHUM match completável (um `@` no fim, sem cauda
      depois dele). Encher a string de `@` seria mais fraco, não mais forte -
      aí existe match, o motor acha um cedo e vai embora rápido. O custo mora
      no caminho SEM match, onde ele precisa provar que nenhuma divisão serve.

      Medido: regex anterior 2062ms, regex atual 37ms, na mesma string. O teto
      de 1s é folgado o bastante para não piscar em runner lento e apertado o
      bastante para reprovar a regressão.
    */
    const hostil = `${'a'.repeat(60_000)}@`
    sendWaitlistConfirmationPT.mockRejectedValue(new EmailDeliveryError(hostil))

    const inicio = performance.now()
    const res = await POST(req(emailLead))
    const decorrido = performance.now() - inicio

    expect(res.status).toBe(200)
    expect(decorrido).toBeLessThan(1_000)
    vi.restoreAllMocks()
  })

  it('endereço longo é redigido INTEIRO — nada de meia redação', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailDeliveryError } = await import('@/lib/email')
    // Local-part no limite que a própria rota aceita (MAX_FIELD_LENGTH).
    const longo = `${'x'.repeat(254)}@exemplo.com`
    sendWaitlistConfirmationPT.mockRejectedValue(
      new EmailDeliveryError(`Invalid \`to\` field: ${longo} rejeitado`),
    )

    await POST(req(emailLead))

    const tudo = JSON.stringify([...errorSpy.mock.calls, ...captureServerEvent.mock.calls])
    expect(tudo).not.toContain('xxx')
    expect(tudo).not.toContain('@exemplo.com')
    expect(tudo).toContain('[e-mail]')
    vi.restoreAllMocks()
  })

  it('falha de e-mail NÃO derruba a inscrição — o lead já está gravado', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { EmailDeliveryError } = await import('@/lib/email')
    sendWaitlistConfirmationPT.mockRejectedValue(new EmailDeliveryError('Unauthorized'))

    const res = await POST(req(emailLead))

    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })
})
