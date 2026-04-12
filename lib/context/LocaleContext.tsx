'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type Locale = 'pt' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  switchLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'pt',
  setLocale: () => {},
  switchLocale: () => {},
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')

  useEffect(() => {
    const stored = localStorage.getItem('gnosiq_locale') as Locale | null
    if (stored === 'en' || stored === 'pt') {
      setLocaleState(stored)
      return
    }
    const detected = navigator.language.startsWith('en') ? 'en' : 'pt'
    setLocaleState(detected)
  }, [])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    localStorage.setItem('gnosiq_locale', next)
    if (
      typeof window !== 'undefined' &&
      (
        window as Window & {
          posthog?: { capture: (event: string, props: object) => void }
        }
      ).posthog
    ) {
      ;(
        window as Window & {
          posthog?: { capture: (event: string, props: object) => void }
        }
      ).posthog!.capture('locale_switch', { from: locale, to: next })
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, switchLocale: setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

// Hook canônico — substituir useLocale() anterior em TODOS os componentes
export const useLocale = () => useContext(LocaleContext)
