import { describe, it, expect, vi, afterEach } from 'vitest'
import { armRevealObserver } from './reveal'

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('armRevealObserver ( reveal SSR/no-JS safety)', () => {
  it('leaves content visible until JS arms it, then reveals on intersection', () => {
    document.body.innerHTML = '<section class="reveal">content</section>'
    const section = document.querySelector('.reveal') as HTMLElement

 // Without any JS running (SSR / no-JS client), nothing hides the section —
 // opacity:1 is the CSS default; `.reveal-armed` is only ever added by JS.
    expect(section.classList.contains('reveal-armed')).toBe(false)

    let observerCallback: (entries: { isIntersecting: boolean; target: Element }[]) => void = () => {}
    class FakeIntersectionObserver {
      constructor(cb: typeof observerCallback) {
        observerCallback = cb
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))

    const disconnect = armRevealObserver()

 // Once the observer initializes client-side, the section is armed (hidden
 // pre-animation) — this only ever happens after JS has taken over.
    expect(section.classList.contains('reveal-armed')).toBe(true)

    observerCallback([{ isIntersecting: true, target: section }])

    expect(section.classList.contains('reveal-armed')).toBe(false)
    expect(section.classList.contains('visible')).toBe(true)

    disconnect()
  })

  it('skips arming entirely when the user prefers reduced motion', () => {
    document.body.innerHTML = '<section class="reveal">content</section>'
    const section = document.querySelector('.reveal') as HTMLElement

    vi.stubGlobal('matchMedia', () => ({ matches: true }))

    armRevealObserver()

    expect(section.classList.contains('reveal-armed')).toBe(false)
  })
})
