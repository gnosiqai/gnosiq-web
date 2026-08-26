import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { render, screen, cleanup, act } from '@testing-library/react'
import AnimatedCounter from './AnimatedCounter'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AnimatedCounter ( regression)', () => {
  it('renders the exact final value on static/SSR output, not an intermediate frame', () => {
 // Before the fix, static output showed Math.floor(value * 0.85) — e.g. 22 -> 18,
 // 30 -> 25, 18 -> 15 — which is exactly the "stale" counters reported in prod.
    const fill = renderToStaticMarkup(<AnimatedCounter value={22} suffix="min" />)
    const delivery = renderToStaticMarkup(<AnimatedCounter value={30} suffix="min" />)
    const pages = renderToStaticMarkup(<AnimatedCounter value={18} />)

    expect(fill).toContain('22min')
    expect(delivery).toContain('30min')
    expect(pages).toContain('18')
    expect(fill).not.toContain('18min')
    expect(delivery).not.toContain('25min')
  })

  it('still respects an explicit `from` for the eventual client-side animation start', () => {
 // `from` only affects the animated count-up after hydration; static output is
 // always the target value.
    expect(renderToStaticMarkup(<AnimatedCounter value={22} from={10} />)).toContain('22')
  })

  it('keeps the final value immediately when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<AnimatedCounter value={22} suffix="min" />)
    expect(screen.getByText('22min')).toBeTruthy()
  })

  it('animates from 0 up to the target value once it intersects, client-side only', () => {
    let observerCallback: (entries: { isIntersecting: boolean }[]) => void = () => {}
    class FakeIntersectionObserver {
      constructor(cb: typeof observerCallback) {
        observerCallback = cb
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.spyOn(performance, 'now').mockReturnValue(0)

    let rafCallback: (t: number) => void = () => {}
    vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
      rafCallback = cb
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    const { container } = render(<AnimatedCounter value={22} duration={1000} />)

 // Before intersecting, the SSR/hydration value (22) is still shown.
    expect(container.textContent).toBe('22')

    act(() => {
      observerCallback([{ isIntersecting: true }])
    })

 // Once armed, the progressive-enhancement count-up restarts from 0...
    expect(container.textContent).toBe('0')

    act(() => {
      rafCallback(1000) // full duration elapsed
    })

 // ...and lands back on the exact target value.
    expect(container.textContent).toBe('22')
  })
})
