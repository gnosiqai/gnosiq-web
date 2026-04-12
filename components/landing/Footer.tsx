'use client'
import Image from 'next/image'
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
        { label: 'Termos de Uso',  href: '/legal/terms'   },
        { label: 'Privacidade',    href: '/legal/privacy'  },
        { label: 'API Docs',       href: '/docs'           },
      ],
      rights: '© 2026 GnosIQ. Todos os direitos reservados.',
    },
    en: {
      tagline: 'The Cognitive Capital API',
      links: [
        { label: 'Terms of Use',   href: '/legal/terms'   },
        { label: 'Privacy Policy', href: '/legal/privacy'  },
        { label: 'API Docs',       href: '/docs'           },
      ],
      rights: '© 2026 GnosIQ. All rights reserved.',
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

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.jpg"
              alt="GnosIQ"
              width={120}
              height={34}
              loading="lazy"
              className="h-8 w-auto object-contain opacity-90"
            />
            <span className="text-text-muted text-sm">· {t.tagline}</span>
          </div>

          <nav className="flex gap-6">
            {t.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-xs text-text-muted">{t.rights}</p>
        </div>
      </div>
    </footer>
  )
}
