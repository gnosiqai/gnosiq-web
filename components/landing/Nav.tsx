'use client'

import { useLocale } from '@/lib/useLocale'

export default function Nav() {
  const { locale, switchLocale } = useLocale()

  const copy = {
    pt: { links: ['Como funciona', 'API'], cta: 'Começar' },
    en: { links: ['How it works', 'API'], cta: 'Get started' },
  }

  const t = copy[locale]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-primary/90 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span className="font-bold text-lg text-text-primary tracking-tight">
          Gnos<span className="text-accent">IQ</span>
        </span>

        {/* Links + CTA + Toggle */}
        <div className="flex items-center gap-6">
          <a
            href="#como-funciona"
            className="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t.links[0]}
          </a>
          <a
            href="#api"
            className="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t.links[1]}
          </a>

          {/* Locale toggle */}
          <div className="flex items-center gap-1 bg-background-secondary rounded-full px-1 py-1 text-xs font-bold">
            <button
              onClick={() => switchLocale('pt')}
              className={`px-3 py-1 rounded-full transition-colors ${
                locale === 'pt'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`px-3 py-1 rounded-full transition-colors ${
                locale === 'en'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="#waitlist"
            className="bg-accent hover:bg-accent-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </nav>
  )
}
