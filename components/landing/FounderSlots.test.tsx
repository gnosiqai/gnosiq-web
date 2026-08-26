import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import FounderSlots from './FounderSlots'

// (item 8 do delta) — "nunca número inventado".
//
// A regra não é "mostrar o contador": é NÃO mostrar placar que não veio do
// banco. O componente anterior falhava exatamente aqui — tinha 3 inscritos
// chumbados e um fallback SSR que imprimia 97. Estes testes travam os três
// caminhos: sucesso, falha do endpoint e resposta malformada.

const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const NO_NUMBER = /Vagas de fundador limitadas aos/i

describe('quando o endpoint responde', () => {
  it('mostra o placar real vindo do banco', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ available: true, slotsRemaining: 87, total: 100 }),
    })
    render(<FounderSlots />)
    expect(await screen.findByText(/87 de 100/)).toBeDefined()
    expect(screen.getByText(/vagas de fundador restantes/i)).toBeDefined()
  })

  it('mostra zero vagas sem inventar arredondamento', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ available: true, slotsRemaining: 0, total: 100 }),
    })
    render(<FounderSlots />)
    expect(await screen.findByText(/0 de 100/)).toBeDefined()
  })
})

describe('quando o endpoint NÃO responde — nenhum número na tela', () => {
  it('503 cai na frase sem placar', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ available: false }) })
    const { container } = render(<FounderSlots />)
    await waitFor(() => expect(screen.getByText(NO_NUMBER)).toBeDefined())
    expect(container.textContent).not.toMatch(/\d+ de 100/)
  })

  it('queda de rede cai na frase sem placar', async () => {
    fetchMock.mockRejectedValue(new Error('network'))
    const { container } = render(<FounderSlots />)
    await waitFor(() => expect(screen.getByText(NO_NUMBER)).toBeDefined())
    expect(container.textContent).not.toMatch(/\d+ de 100/)
  })

  it('resposta 200 malformada não vira placar', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ available: true }) })
    const { container } = render(<FounderSlots />)
    await waitFor(() => expect(screen.getByText(NO_NUMBER)).toBeDefined())
    expect(container.textContent).not.toMatch(/\d+ de 100/)
  })

  it('slotsRemaining não-numérico é descartado', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ available: true, slotsRemaining: 'muitas' }),
    })
    const { container } = render(<FounderSlots />)
    await waitFor(() => expect(screen.getByText(NO_NUMBER)).toBeDefined())
    expect(container.textContent).not.toContain('muitas')
  })
})

describe('estado inicial', () => {
  it('o primeiro render — o que o crawler vê — não traz placar', () => {
    fetchMock.mockReturnValue(new Promise(() => {})) // nunca resolve
    const { container } = render(<FounderSlots />)
    expect(container.textContent).toMatch(NO_NUMBER)
    expect(container.textContent).not.toMatch(/\d+ de 100/)
  })

  it('não atualiza estado depois de desmontado', async () => {
    let resolve!: (v: unknown) => void
    fetchMock.mockReturnValue(new Promise((r) => { resolve = r }))
    const { unmount } = render(<FounderSlots />)
    unmount()
    resolve({ ok: true, json: async () => ({ available: true, slotsRemaining: 87 }) })
 // Sem o guard `cancelled`, isto emitiria warning de setState pós-unmount.
    await waitFor(() => expect(screen.queryByText(/87 de 100/)).toBeNull())
  })
})
