import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import Hero from '@/components/landing/Hero'
import MetricsStrip from '@/components/landing/MetricsStrip'
import WhatYouGet from '@/components/landing/WhatYouGet'
import Science from '@/components/landing/Science'
import FounderConditions from '@/components/landing/FounderConditions'
import { DELIVERY_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'

// (mantido) — os componentes que consomem lib/constants/metrics.ts
// devem renderizar os valores canônicos, nunca números soltos no JSX.
// lista atualizada para as seções da LP v2: ApiSection, Solution,
// HowItWorks e SocialProof deixaram de existir.
describe('seções da LP renderizam as métricas canônicas', () => {
  it('Hero traz entrega e páginas no answer block, sem tempo de sessão', () => {
    const html = renderToStaticMarkup(<Hero />)
    expect(html).toContain(`${REPORT_PAGES} páginas`)
    expect(html).toContain(`${DELIVERY_MINUTES} minutos`)
    expect(html).toContain('se ajusta às suas respostas')
  })

  it('MetricsStrip renderiza os valores no SSR, sem frame intermediário, com a entrega como único tempo', () => {
    const html = renderToStaticMarkup(<MetricsStrip />)
    expect(html).toContain(`${DELIVERY_MINUTES}`)
    expect(html).toContain(`${REPORT_PAGES}`)
    expect(html).toContain('DA AVALIAÇÃO AO RELATÓRIO')
  })

  it('WhatYouGet cita páginas e tempo de entrega', () => {
    const html = renderToStaticMarkup(<WhatYouGet />)
    expect(html).toContain(`${REPORT_PAGES} páginas`)
    expect(html).toContain(`${DELIVERY_MINUTES} minutos`)
  })

  it('Science cita o tempo de entrega e o número de páginas no card 03', () => {
    const html = renderToStaticMarkup(<Science />)
    expect(html).toContain(`${REPORT_PAGES} páginas`)
    expect(html).toContain(`${DELIVERY_MINUTES} minutos`)
 // O tempo de preenchimento saiu da seção Ciência por decisão RISK/GROWTH:
 // o card 01 descreve o benefício (adaptativa, no navegador), sem cifra.
    expect(html).not.toMatch(/22\s?min(utos)?\b/i)
  })

  it('FounderConditions usa o tempo de entrega canônico na comparação', () => {
    const html = renderToStaticMarkup(<FounderConditions />)
    expect(html).toContain(`${DELIVERY_MINUTES} minutos`)
  })
})
