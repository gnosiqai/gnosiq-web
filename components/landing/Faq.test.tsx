import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Faq from './Faq'
import { FAQ_ITEMS } from '@/lib/constants/faq'

afterEach(cleanup)

describe('FAQ — AEO depende da resposta estar no DOM', () => {
  it('toda resposta está no DOM mesmo com o item fechado', () => {
    const { container } = render(<Faq />)
    for (const item of FAQ_ITEMS) {
      expect(container.textContent).toContain(item.question)
      expect(container.textContent).toContain(item.answer)
    }
  })

  it('o primeiro item nasce aberto', () => {
    const { container } = render(<Faq />)
    const details = container.querySelectorAll('details')
    expect(details[0].open).toBe(true)
    expect(details[1].open).toBe(false)
  })

  it('abrir um item fecha o anterior — acordeão', () => {
    const { container } = render(<Faq />)
    const details = container.querySelectorAll('details')

    details[1].open = true
    fireEvent(details[1], new Event('toggle'))
    expect(details[0].open).toBe(false)
  })

  it('fechar o item aberto não abre outro', () => {
    const { container } = render(<Faq />)
    const details = container.querySelectorAll('details')

    details[0].open = false
    fireEvent(details[0], new Event('toggle'))
    expect([...details].some((d) => d.open)).toBe(false)
  })

  it('as perguntas são headings — estrutura semântica para o crawler', () => {
    render(<Faq />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(FAQ_ITEMS.length)
  })
})
