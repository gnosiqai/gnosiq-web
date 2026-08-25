import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'

// GNO-115 · GATE CISO T1 — comportamento do formulário no cliente.
//
// A rota já é coberta por app/api/waitlist/route.test.ts. Aqui o alvo é o
// que só acontece no browser: o que é ENVIADO, o que é MEDIDO e, sobretudo,
// o que NUNCA sai daqui. A v1 mandava o e-mail do inscrito em duas
// propriedades de evento do PostHog; estes testes travam a correção.

const capture = vi.fn()
vi.mock('posthog-js', () => ({ default: { capture: (...a: unknown[]) => capture(...a) } }))

import WaitlistSection from './WaitlistSection'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, alreadyExists: false }),
  })
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const submit = () => fireEvent.click(screen.getByRole('button', { name: /entrar na lista/i }))
const type = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
const consent = () => fireEvent.click(screen.getByRole('checkbox'))
/*
  WaitlistSection contém FounderSlots, que busca /api/waitlist-count na
  montagem. Sem filtrar, essa chamada ocuparia mock.calls[0] e toda asserção
  de "não chamou a API" passaria a olhar para o contador, não para o envio.
*/
const waitlistCalls = () =>
  fetchMock.mock.calls.filter(([url]) => url === '/api/waitlist')
const sentBody = () => JSON.parse(waitlistCalls()[0][1].body)

describe('validação antes de sair do browser', () => {
  it('sem canal nenhum não chama a API', async () => {
    render(<WaitlistSection />)
    consent()
    submit()
    await screen.findByRole('alert')
    expect(waitlistCalls()).toHaveLength(0)
    expect(screen.getByRole('alert').textContent).toMatch(/pelo menos um/i)
  })

  it('sem consentimento não chama a API — LGPD é bloqueante, não aviso', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '(11) 91234-5678')
    submit()
    await screen.findByRole('alert')
    expect(waitlistCalls()).toHaveLength(0)
    expect(screen.getByRole('alert').textContent).toMatch(/Política de Privacidade/i)
  })

  it('WhatsApp malformado não chama a API', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '+5511')
    consent()
    submit()
    await screen.findByRole('alert')
    expect(waitlistCalls()).toHaveLength(0)
  })

  it('e-mail malformado não chama a API', async () => {
    render(<WaitlistSection />)
    type(/ou e-mail/i, 'nao-e-email')
    consent()
    submit()
    await screen.findByRole('alert')
    expect(waitlistCalls()).toHaveLength(0)
  })
})

describe('envio', () => {
  it('só WhatsApp é suficiente', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '(11) 91234-5678')
    consent()
    submit()
    await waitFor(() => expect(waitlistCalls()).toHaveLength(1))
    expect(sentBody()).toMatchObject({ whatsapp: '(11) 91234-5678', consent: true })
  })

  it('só e-mail é suficiente', async () => {
    render(<WaitlistSection />)
    type(/ou e-mail/i, 'voce@exemplo.com')
    consent()
    submit()
    await waitFor(() => expect(waitlistCalls()).toHaveLength(1))
    expect(sentBody()).toMatchObject({ email: 'voce@exemplo.com', consent: true })
  })

  it('o role escolhido acompanha o envio', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    fireEvent.change(screen.getByLabelText(/sou um/i), { target: { value: 'founder' } })
    consent()
    submit()
    await waitFor(() => expect(waitlistCalls()).toHaveLength(1))
    expect(sentBody().icp_segment).toBe('founder')
  })

  it('mostra confirmação e some com o formulário no sucesso', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    consent()
    submit()
    expect(await screen.findByText(/Você está na lista/i)).toBeDefined()
    expect(screen.queryByRole('button', { name: /entrar na lista/i })).toBeNull()
  })

  it('erro da API vira mensagem, não tela de sucesso', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'WhatsApp inválido.' }),
    })
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    consent()
    submit()
    expect((await screen.findByRole('alert')).textContent).toContain('WhatsApp inválido.')
    expect(screen.queryByText(/Você está na lista/i)).toBeNull()
  })

  it('queda de rede não deixa a tela travada em "Enviando..."', async () => {
    fetchMock.mockRejectedValue(new Error('network'))
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    consent()
    submit()
    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: /entrar na lista/i })).toBeDefined()
  })
})

describe('honeypot no formulário (GATE CISO, item 6)', () => {
  it('o campo existe e é enviado vazio numa submissão humana', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    consent()
    submit()
    await waitFor(() => expect(waitlistCalls()).toHaveLength(1))
    expect(sentBody()).toHaveProperty('website', '')
  })

  it('está fora da tela, NÃO em display:none — bot esperto pula campo oculto', () => {
    const { container } = render(<WaitlistSection />)
    const trap = container.querySelector('input[name="website"]') as HTMLInputElement

    expect(trap).not.toBeNull()
    expect(trap.className).toContain('hp-field')
    expect(trap.getAttribute('style') ?? '').not.toContain('display: none')
    expect(trap.getAttribute('style') ?? '').not.toContain('visibility: hidden')
  })

  it('fora da ordem de tabulação, sem autocomplete e invisível a leitor de tela', () => {
    const { container } = render(<WaitlistSection />)
    const trap = container.querySelector('input[name="website"]') as HTMLInputElement

    expect(trap.getAttribute('tabindex')).toBe('-1')
    expect(trap.getAttribute('autocomplete')).toBe('off')
    expect(trap.getAttribute('aria-hidden')).toBe('true')
  })

  it('não tem label — não aparece para quem navega o formulário', () => {
    render(<WaitlistSection />)
    expect(screen.queryByLabelText(/website/i)).toBeNull()
  })

  it('é o primeiro campo do formulário — o que um bot em ordem encontra antes', () => {
    const { container } = render(<WaitlistSection />)
    const first = container.querySelector('form input')
    expect(first?.getAttribute('name')).toBe('website')
  })
})

describe('evento de conversão — DoD e GATE CISO', () => {
  it('não dispara antes da confirmação da API', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: false }) })
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    consent()
    submit()
    await screen.findByRole('alert')
    expect(capture).not.toHaveBeenCalled()
  })

  it('carrega os UTM da URL de chegada', async () => {
    window.history.replaceState(
      {}, '', '/?utm_source=linkedin&utm_medium=social&utm_campaign=inpi',
    )
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    consent()
    submit()
    await waitFor(() => expect(capture).toHaveBeenCalled())
    expect(capture).toHaveBeenCalledWith(
      'waitlist_signed_up',
      expect.objectContaining({
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'inpi',
        lp_version: 'v2',
      }),
    )
  })

  it('marca o canal sem revelar o valor digitado', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '11912345678')
    type(/ou e-mail/i, 'voce@exemplo.com')
    consent()
    submit()
    await waitFor(() => expect(capture).toHaveBeenCalled())
    expect(capture.mock.calls[0][1].channel).toBe('both')
  })

  it('NENHUMA PII no evento — a v1 mandava o e-mail do inscrito', async () => {
    render(<WaitlistSection />)
    type(/whatsapp/i, '(11) 91234-5678')
    type(/ou e-mail/i, 'vaza@exemplo.com')
    consent()
    submit()
    await waitFor(() => expect(capture).toHaveBeenCalled())

    const payload = JSON.stringify(capture.mock.calls[0][1])
    expect(payload).not.toContain('vaza@exemplo.com')
    expect(payload).not.toContain('91234')
    expect(payload).not.toContain('5678')
  })
})
