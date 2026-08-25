import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

const capture = vi.fn()
vi.mock('posthog-js', () => ({ default: { capture: (...a: unknown[]) => capture(...a) } }))

import Nav from './Nav'

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe('Nav — CTA único e navegação sem hash', () => {
  it('os links espelham os H2-pergunta da página', () => {
    render(<Nav />)
    for (const label of ['Como funciona', 'Ciência', 'FAQ']) {
      expect(screen.getByRole('button', { name: label })).toBeDefined()
    }
  })

  it('o CTA mede o clique antes de rolar', () => {
    render(<Nav />)
    const target = document.createElement('div')
    target.id = 'waitlist'
    target.scrollIntoView = vi.fn()
    document.body.appendChild(target)

    fireEvent.click(screen.getByRole('link', { name: /entrar na lista/i }))

    expect(capture).toHaveBeenCalledWith('cta clicked', {
      label: 'nav_primary',
      destination: '#waitlist',
    })
    expect(target.scrollIntoView).toHaveBeenCalled()
    target.remove()
  })

  it('o clique no CTA não empurra hash para a URL', () => {
    render(<Nav />)
    const before = window.location.href
    fireEvent.click(screen.getByRole('link', { name: /entrar na lista/i }))
    expect(window.location.href).toBe(before)
  })

  it('link para seção ausente não quebra', () => {
    render(<Nav />)
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Ciência' })),
    ).not.toThrow()
  })
})
