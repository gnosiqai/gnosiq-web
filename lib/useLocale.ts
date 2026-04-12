'use client'

import { useState, useEffect } from 'react'

export type Locale = 'pt' | 'en'

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('pt')

  useEffect(() => {
    const stored = localStorage.getItem('gnosiq_locale') as Locale | null
    if (stored === 'en' || stored === 'pt') {
      setLocale(stored)
    } else {
      // Fallback: detectar idioma do browser
      const detected = navigator.language.startsWith('en') ? 'en' : 'pt'
      setLocale(detected)
    }
  }, [])

  const switchLocale = (next: Locale) => {
    setLocale(next)
    localStorage.setItem('gnosiq_locale', next)
    // PostHog event — dado de mercado valioso
    if (typeof window !== 'undefined' && (window as Window & { posthog?: { capture: (event: string, props: object) => void } }).posthog) {
      (window as Window & { posthog?: { capture: (event: string, props: object) => void } }).posthog!.capture('locale_switch', { from: locale, to: next })
    }
  }

  return { locale, switchLocale }
}
