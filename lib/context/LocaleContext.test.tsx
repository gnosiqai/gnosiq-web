import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { LocaleProvider, useLocale } from './LocaleContext'

function Probe() {
  const { locale } = useLocale()
  return <span data-testid="locale">{locale}</span>
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('LocaleContext ( Googlebot regression)', () => {
  it('stays pt even when the browser reports an English locale', () => {
 // Before the fix, an effect read navigator.language and switched to 'en'.
 // Googlebot renders with Accept-Language: en, which used to flip this and
 // serve the "Coming in M2" placeholders to the crawler.
    vi.stubGlobal('navigator', { ...navigator, language: 'en-US' })

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )

    expect(screen.getByTestId('locale').textContent).toBe('pt')
  })

  it('stays pt even when a previous EN selection is stored in localStorage', () => {
 // Before the fix, an effect also read a stored 'gnosiq_locale' value on mount.
    localStorage.setItem('gnosiq_locale', 'en')

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )

    expect(screen.getByTestId('locale').textContent).toBe('pt')
    localStorage.removeItem('gnosiq_locale')
  })
})
