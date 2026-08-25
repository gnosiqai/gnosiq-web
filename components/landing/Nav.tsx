'use client'

import Link from 'next/link'
import posthog from 'posthog-js'

// GNO-115 — navbar da v2. Os links espelham os H2-pergunta da página
// (formato AEO: a navegação é o índice das perguntas que a LP responde).
// CTA único, igual ao do hero e ao do formulário.

const LINKS = [
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'ciencia', label: 'Ciência' },
  { id: 'faq', label: 'FAQ' },
] as const

export default function Nav() {
  /** Scroll programático — sem empurrar hash para a URL (mantido da v1). */
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-primary/90 backdrop-blur-sm border-b border-accent/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="GnosIQ - início"
          className="text-xl font-bold tracking-tight text-text-primary select-none hover:opacity-90 transition-opacity"
        >
          Gnos<span className="text-accent">IQ</span>
        </Link>

        <div className="flex items-center gap-6">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          <a
            href="#waitlist"
            onClick={(e) => {
              e.preventDefault()
              posthog.capture('cta clicked', {
                label: 'nav_primary',
                destination: '#waitlist',
              })
              scrollTo('waitlist')
            }}
            className="bg-accent hover:bg-accent-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Entrar na lista
          </a>
        </div>
      </div>
    </nav>
  )
}
