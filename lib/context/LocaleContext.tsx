'use client'
import {
  createContext,
  useContext,
  useState,
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

// GNO-93: EN desconectado até M2 — sem auto-detecção via navigator.language/localStorage,
// que fazia o Googlebot (Accept-Language: en) renderizar os placeholders "Coming in M2".
// locale nasce e permanece 'pt'; setLocale/switchLocale ficam prontos para o toggle voltar em M2.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')

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
