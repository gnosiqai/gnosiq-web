'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import posthog from 'posthog-js'
import { useLocale } from '@/lib/context/LocaleContext'

export default function Nav() {
  const router = useRouter()
  const { locale, switchLocale } = useLocale()

  const copy = {
    pt: { links: ['Como funciona', 'API'], cta: 'Começar' },
    en: { links: ['How it works', 'API'], cta: 'Get started' },
  }
  const t = copy[locale]

  // FIX 2 — Logo: reset de URL e scroll ao topo
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // FIX 3 — Scroll programático sem hash na URL
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-primary/90 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark tipográfico — FIX 2: logo reset */}
        <Link
          href="/"
          onClick={handleLogoClick}
          aria-label="GnosIQ — Home"
          className="font-display text-xl font-bold tracking-tight text-white select-none hover:opacity-90 transition-opacity"
        >
          Gnos<span className="text-accent">IQ</span>
        </Link>

        {/* Links + CTA + Toggle */}
        <div className="flex items-center gap-6">
          {/* FIX 3 — scroll programático sem hash */}
          <button
            onClick={() => scrollTo('como-funciona')}
            className="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
          >
            {t.links[0]}
          </button>
          <button
            onClick={() => scrollTo('api')}
            className="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
          >
            {t.links[1]}
          </button>

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

          {/* CTA — FIX 3: scroll sem hash + GNO-48: PostHog event */}
          <button
            onClick={() => {
              posthog.capture('cta clicked', {
                label: 'nav_primary',
                destination: '#waitlist',
              })
              scrollTo('waitlist')
            }}
            className="bg-accent hover:bg-accent-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t.cta}
          </button>
        </div>
      </div>
    </nav>
  )
}
