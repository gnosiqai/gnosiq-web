'use client'
import Link from 'next/link'
import { useLocale } from '@/lib/context/LocaleContext'
import { DISCLAIMER_PT, DISCLAIMER_EN, LGPD_NOTICE_PT, LGPD_NOTICE_EN } from '@/lib/constants/legal'

export default function Footer() {
  const { locale } = useLocale()

  const disclaimer = locale === 'pt' ? DISCLAIMER_PT : DISCLAIMER_EN
  const lgpd       = locale === 'pt' ? LGPD_NOTICE_PT : LGPD_NOTICE_EN

  const copy = {
    pt: {
      tagline: 'The Cognitive Capital API',
      links: [
        { label: 'Política de Privacidade', href: '/privacy' },
        { label: 'Termos de Uso', href: '/terms' },
      ] as { label: string; href: string }[],
      rights: '© 2026 GnosIQ Tecnologia Ltda. · CNPJ 66.473.762/0001-13',
      address: 'Rua Cristóvão Colombo, 2144, Sala 408, Floresta, Porto Alegre, RS, CEP 90560-001, Brasil',
      feedback: 'Encontrou algo errado? Nos avise',
    },
    en: {
      tagline: 'The Cognitive Capital API',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
      ] as { label: string; href: string }[],
      rights: '© 2026 GnosIQ Tecnologia Ltda. · CNPJ 66.473.762/0001-13',
      address: 'Rua Cristóvão Colombo, 2144, Suite 408, Porto Alegre, RS 90560-001, Brazil',
      feedback: 'Found something wrong? Let us know',
    },
  }
  const t = copy[locale]

  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Disclaimer clínico */}
        <div className="bg-background-secondary rounded-xl p-6 mb-10 border border-white/5">
          <p className="text-xs text-text-muted leading-relaxed mb-3">{disclaimer}</p>
          <p className="text-xs text-text-muted leading-relaxed">{lgpd}</p>
        </div>

        {/* FIX 4 — Social icons SVG inline */}
        <div className="flex items-center justify-center gap-5 mb-6">
          {/* X (Twitter) */}
          <a
            href="https://x.com/gnosiqai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GnosIQ no X (Twitter)"
            className="text-white/40 hover:text-accent transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/gnosiqai/gnosiq-web"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GnosIQ no GitHub"
            className="text-white/40 hover:text-accent transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/gnosiq.ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GnosIQ no Instagram"
            className="text-white/40 hover:text-accent transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/company/gnosiq"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GnosIQ no LinkedIn"
            className="text-white/40 hover:text-accent transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        {/* FIX 5 — Contato mailto */}
        <div className="flex justify-center mb-8">
          <a
            href="mailto:carlos@gnosiq.ai"
            className="text-white/50 hover:text-accent transition-colors text-sm"
          >
            carlos@gnosiq.ai
          </a>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2">
            <span className="opacity-70 font-display text-lg font-bold tracking-tight text-white select-none">
              Gnos<span className="text-accent">IQ</span>
            </span>
            <span className="text-text-muted text-sm">· {t.tagline}</span>
          </div>

          <nav className="flex gap-6">
            {t.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-text-muted">
            {t.rights}<br />
            {t.address}
          </p>
        </div>

        {/* FIX 6 — Feedback link discreto */}
        <div className="flex justify-center mt-6">
          <a
            href="mailto:carlos@gnosiq.ai?subject=Feedback%20gnosiq.ai"
            className="text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            {t.feedback}
          </a>
        </div>
      </div>
    </footer>
  )
}
