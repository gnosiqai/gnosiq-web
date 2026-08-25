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
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada Lovelace' })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Carlos @ GnosIQ <hello@gnosiq.ai>',
        to: 'lead@exemplo.com',
      }),
    )
  })

  it('respeita o EMAIL_FROM do ambiente, sem endereço fixo em código', async () => {
    vi.stubEnv('EMAIL_FROM', 'outro@gnosiq.ai')

    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' })

    expect(send.mock.calls[0][0].from).toBe('Carlos @ GnosIQ <outro@gnosiq.ai>')
  })
})

describe('fail-fast de configuração (absorve o item 7 da GNO-119)', () => {
  it('RESEND_API_KEY ausente: erro explícito, ZERO tentativa de envio', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' }),
    ).rejects.toBeInstanceOf(EmailConfigError)
    expect(send).not.toHaveBeenCalled()
  })

  it('EMAIL_FROM ausente: erro explícito, ZERO fallback para endereço inventado', async () => {
    vi.stubEnv('EMAIL_FROM', '')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' }),
    ).rejects.toBeInstanceOf(EmailConfigError)
    // A versão SendGrid caía em `|| 'noreply@gnosiq.ai'` aqui: um endereço que
    // não existe no domínio. Entrega quebrada disfarçada de código que roda.
    expect(send).not.toHaveBeenCalled()
  })

  it('o erro de configuração nomeia a env que falta', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' }),
    ).rejects.toThrow(/RESEND_API_KEY/)
  })
})

describe('trava do caminho silencioso', () => {
  it('erro devolvido pelo SDK VIRA EXCEÇÃO — não passa por sucesso', async () => {
    recusado('Unauthorized')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' }),
    ).rejects.toBeInstanceOf(EmailDeliveryError)
  })

  it('é exatamente o 401 do incidente que não pode mais passar batido', async () => {
    recusado('Unauthorized')

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' }),
    ).rejects.toThrow('Unauthorized')
  })

  it('resposta sem id de mensagem também é falha, não sucesso', async () => {
    send.mockResolvedValue({ data: null, error: null })

    await expect(
      sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' }),
    ).rejects.toBeInstanceOf(EmailDeliveryError)
  })

  it('sucesso devolve o id da mensagem — prova de que saiu', async () => {
    const id = await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' })

    expect(id).toBe('msg_123')
  })
})

describe('copy dos dois templates (inalterada na migração)', () => {
  it('PT: assunto e primeiro nome', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada Lovelace' })

    const msg = send.mock.calls[0][0]
    expect(msg.subject).toBe('Você está na lista de espera da GnosIQ')
    expect(msg.text).toContain('Ada,')
    expect(msg.html).toContain('Você está na lista, Ada.')
  })

  it('PT: mantém o disclaimer clínico nos dois formatos', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' })

    const msg = send.mock.calls[0][0]
    expect(msg.text).toContain('não substitui avaliação clínica')
    expect(msg.html).toContain('não substitui avaliação clínica')
  })

  it('PT: nome vazio não vira saudação quebrada', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: '   ' })

    expect(send.mock.calls[0][0].text).toContain('olá,')
  })

  it('EN: assunto e primeiro nome', async () => {
    await sendWaitlistConfirmation({ email: 'lead@example.com', name: 'Ada Lovelace' })

    const msg = send.mock.calls[0][0]
    expect(msg.subject).toBe("You're on the GnosIQ waitlist 🧠")
    expect(msg.html).toContain("You're on the waitlist, Ada.")
  })

  it('EN: nome vazio cai em "there"', async () => {
    await sendWaitlistConfirmation({ email: 'lead@example.com', name: '' })

    expect(send.mock.calls[0][0].text).toContain('Hey there,')
  })

  it('os dois templates mandam text E html — cliente sem HTML continua lendo', async () => {
    await sendWaitlistConfirmationPT({ email: 'lead@exemplo.com', name: 'Ada' })
    await sendWaitlistConfirmation({ email: 'lead@example.com', name: 'Ada' })

    for (const [msg] of send.mock.calls) {
      expect(msg.text.length).toBeGreaterThan(0)
      expect(msg.html.length).toBeGreaterThan(0)
    }
  })
})
