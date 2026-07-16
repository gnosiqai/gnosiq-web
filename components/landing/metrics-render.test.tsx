import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import ApiSection from '@/components/landing/ApiSection'
import Problem from '@/components/landing/Problem'
import Solution from '@/components/landing/Solution'
import HowItWorks from '@/components/landing/HowItWorks'
import SocialProof from '@/components/landing/SocialProof'

// GNO-93: os 6 componentes que consomem lib/constants/metrics.ts devem
// renderizar os valores canônicos (22/30/18), tanto em PT quanto em EN
// (que hoje cai no ComingSoonBanner, mas Hero/Nav/ApiSection sempre mostram PT
// já que o locale está travado — ver LocaleContext).
describe('landing components render canonical metrics (GNO-93 SSOT)', () => {
  it('Hero shows 22/30/18 in its micro-copy and price line', () => {
    const html = renderToStaticMarkup(<Hero />)
    expect(html).toContain('18 páginas')
    expect(html).toContain('30 minutos')
  })

  it('ApiSection tagline shows the canonical delivery time', () => {
    expect(renderToStaticMarkup(<ApiSection />)).toContain('30 minutos')
  })

  it('Problem table shows the canonical delivery time', () => {
    expect(renderToStaticMarkup(<Problem />)).toContain('30 minutos')
  })

  it('Solution shows 18 páginas and 30 minutos', () => {
    const html = renderToStaticMarkup(<Solution />)
    expect(html).toContain('18')
    expect(html).toContain('30')
  })

  it('HowItWorks shows 22/30/18', () => {
    const html = renderToStaticMarkup(<HowItWorks />)
    expect(html).toContain('22')
    expect(html).toContain('30')
    expect(html).toContain('18')
  })

  it('SocialProof renders the canonical AnimatedCounter values, not the old 85% SSR fallback', () => {
    const html = renderToStaticMarkup(<SocialProof />)
    expect(html).toContain('22min')
    expect(html).toContain('30min')
    expect(html).toContain('18')
    expect(html).not.toContain('15')
  })

  it('Nav still renders without the removed PT/EN toggle', () => {
    const html = renderToStaticMarkup(<Nav />)
    expect(html).not.toContain('>EN<')
  })
})
