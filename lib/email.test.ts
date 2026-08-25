import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * GNO-122 — contrato do provedor de e-mail.
 *
 * O SDK do Resend é mockado: nenhuma mensagem sai desta suite e nenhuma key
 * real existe aqui. O alvo destes testes não é "o e-mail é bonito", é a
 * CLASSE DE FALHA que originou a issue: erro que não vira erro.
 */

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    constructor(public apiKey: string) {}
    emails = { send: (...args: unknown[]) => send(...args) }
  },
}))

const {
  sendWaitlistConfirmationPT,
  sendWaitlistConfirmation,
  EmailConfigError,
  EmailDeliveryError,
} = await import('./email')

/** Resposta de sucesso do SDK. */
const aceito = () => send.mockResolvedValue({ data: { id: 'msg_123' }, error: null })

/** Recusa do SDK: devolvida em `error`, NÃO lançada. É a pegadinha da API. */
const recusado = (message: string) =>
  send.mockResolvedValue({ data: null, error: { name: 'validation_error', message } })

beforeEach(() => {
  vi.clearAllMocks()
  aceito()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('remetente', () => {
  it('usa EMAIL_FROM com o nome de exibição da marca', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Carlos @ GnosIQ <hello@gnosiq.ai>',
        to: 'lead@exemplo.com',
      }),
    )
  })

  it('respeita o EMAIL_FROM do ambiente, sem endereço fixo em código', async () => {
    vi.stubEnv('EMAIL_FROM', 'outro@gnosiq.ai')

    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })

    expect(send.mock.calls[0][0].from).toBe('Carlos @ GnosIQ <outro@gnosiq.ai>')
  })
})

describe('fail-fast de configuração (absorve o item 7 da GNO-119)', () => {
  it('RESEND_API_KEY ausente: erro explícito, ZERO tentativa de envio', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' }),
    ).rejects.toBeInstanceOf(EmailConfigError)
    expect(send).not.toHaveBeenCalled()
  })

  it('EMAIL_FROM ausente: erro explícito, ZERO fallback para endereço inventado', async () => {
    vi.stubEnv('EMAIL_FROM', '')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' }),
    ).rejects.toBeInstanceOf(EmailConfigError)
    // A versão SendGrid caía em `|| 'noreply@gnosiq.ai'` aqui: um endereço que
    // não existe no domínio. Entrega quebrada disfarçada de código que roda.
    expect(send).not.toHaveBeenCalled()
  })

  it('o erro de configuração nomeia a env que falta', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' }),
    ).rejects.toThrow(/RESEND_API_KEY/)
  })
})

describe('trava do caminho silencioso', () => {
  it('erro devolvido pelo SDK VIRA EXCEÇÃO — não passa por sucesso', async () => {
    recusado('Unauthorized')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' }),
    ).rejects.toBeInstanceOf(EmailDeliveryError)
  })

  it('é exatamente o 401 do incidente que não pode mais passar batido', async () => {
    recusado('Unauthorized')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' }),
    ).rejects.toThrow('Unauthorized')
  })

  it('resposta sem id de mensagem também é falha, não sucesso', async () => {
    send.mockResolvedValue({ data: null, error: null })

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' }),
    ).rejects.toBeInstanceOf(EmailDeliveryError)
  })

  it('sucesso devolve o id da mensagem — prova de que saiu', async () => {
    const id = await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })

    expect(id).toBe('msg_123')
  })
})

describe('copy dos dois templates', () => {
  it('PT: assunto e abertura sem saudação personalizada', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })

    const msg = send.mock.calls[0][0]
    expect(msg.subject).toBe('Você está na lista de espera da GnosIQ')
    expect(msg.text).toContain('Você está na lista de espera da GnosIQ.')
    expect(msg.html).toContain('Você está na lista.')
  })

  it('PT: mantém o disclaimer clínico nos dois formatos', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })

    const msg = send.mock.calls[0][0]
    expect(msg.text).toContain('não substitui avaliação clínica')
    expect(msg.html).toContain('não substitui avaliação clínica')
  })

  it('EN: assunto e abertura sem saudação personalizada', async () => {
    await sendWaitlistConfirmation({ email: 'lead@example.com' })

    const msg = send.mock.calls[0][0]
    expect(msg.subject).toBe("You're on the GnosIQ waitlist 🧠")
    expect(msg.html).toContain("You're on the waitlist.")
    expect(msg.text).toContain("You're officially on the GnosIQ waitlist.")
  })

  it('os dois templates mandam text E html — cliente sem HTML continua lendo', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })
    await sendWaitlistConfirmation({ email: 'lead@example.com' })

    for (const [msg] of send.mock.calls) {
      expect(msg.text.length).toBeGreaterThan(0)
      expect(msg.html.length).toBeGreaterThan(0)
    }
  })
})

/**
 * GNO-123 — a trava do achado R1 da auditoria CISO T3 do PR #106.
 *
 * O que estes testes seguram não é a copy, é a PROPRIEDADE: nada que venha de
 * quem chama atravessa para o corpo da mensagem. Enquanto ela valer, não
 * existe caminho para conteúdo escolhido por terceiro sair pelo nosso domínio
 * autenticado, com escape ou sem escape.
 */
describe('GNO-123 · corpo do e-mail é constante, entrada de usuário não entra', () => {
  it('PT: duas chamadas com destinatários diferentes produzem corpo IDÊNTICO', async () => {
    await sendWaitlistConfirmationPT({ email: 'a@exemplo.com' })
    await sendWaitlistConfirmationPT({ email: 'b@exemplo.com' })

    const [primeira, segunda] = send.mock.calls.map(([msg]) => msg)
    expect(segunda.html).toBe(primeira.html)
    expect(segunda.text).toBe(primeira.text)
    expect(segunda.subject).toBe(primeira.subject)
    // O destinatário é a ÚNICA coisa que varia entre um envio e outro.
    expect(segunda.to).not.toBe(primeira.to)
  })

  it('EN: mesma propriedade', async () => {
    await sendWaitlistConfirmation({ email: 'a@example.com' })
    await sendWaitlistConfirmation({ email: 'b@example.com' })

    const [primeira, segunda] = send.mock.calls.map(([msg]) => msg)
    expect(segunda.html).toBe(primeira.html)
    expect(segunda.text).toBe(primeira.text)
  })

  it('`name` reintroduzido por engano não chega ao HTML de nenhum dos dois', async () => {
    /*
      O `as never` é o ponto do teste, não um atalho: o TypeScript já recusa
      este objeto, e é essa recusa que impede a regressão em código nosso. O
      cast força o caso mesmo assim, para provar que a defesa não depende só
      do compilador - um corpo de JSON não passa por type-check nenhum.
    */
    const payload = '<img/src=x/onerror=1>'

    await sendWaitlistConfirmationPT({ email: 'vitima@exemplo.com', name: payload } as never)
    await sendWaitlistConfirmation({ email: 'vitima@example.com', name: payload } as never)

    for (const [msg] of send.mock.calls) {
      expect(msg.html).not.toContain(payload)
      expect(msg.html).not.toContain('<img')
      expect(msg.text).not.toContain(payload)
    }
  })

  it('o único campo que carrega dado de quem se inscreveu é o `to`', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com' })

    const msg = send.mock.calls[0][0]
    expect(msg.to).toBe('lead@exemplo.com')
    expect(msg.html).not.toContain('lead@exemplo.com')
    expect(msg.text).not.toContain('lead@exemplo.com')
    expect(msg.subject).not.toContain('lead@exemplo.com')
  })
})
