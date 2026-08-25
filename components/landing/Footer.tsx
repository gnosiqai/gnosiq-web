import Link from 'next/link'
import {
  COMPANY_LEGAL_NAME,
  COMPANY_CNPJ,
  COMPANY_ADDRESS_PT,
  COMPANY_EMAIL,
  TRADEMARK_NOTICE_PT,
} from '@/lib/constants/company'
import { CLINICAL_DISCLAIMER_LP, LGPD_NOTICE_PT } from '@/lib/constants/legal'
import { LAST_UPDATED_ISO, LAST_UPDATED_LABEL } from '@/lib/lastUpdated'

// GNO-115 — rodapé legal REAL (item 7 do delta).
//
// O mockup trazia um CNPJ com um dígito trocado (66.473.782/...). O valor
// correto — confirmado pelo founder em 2026-08-24 — mora em
// lib/constants/company.ts, junto com endereço e e-mail. Nada literal aqui.
//
// O disclaimer usa CLINICAL_DISCLAIMER_LP, não DISCLAIMER_PT: este último
// contém "avaliação diagnóstica", e a LP não pode conter a palavra
// (CFP, correção 2 da issue).
//
// Server component: precisa ser, porque LAST_UPDATED é avaliado no build —
// em client component o valor divergiria entre SSR e hidratação.

const SOCIAL = [
  { href: 'https://x.com/gnosiqai', label: 'X (Twitter)' },
  { href: 'https://github.com/gnosiqai', label: 'GitHub' },
  { href: 'https://instagram.com/gnosiq.ai', label: 'Instagram' },
  { href: 'https://linkedin.com/company/gnosiq', label: 'LinkedIn' },
] as const

const PRODUCT_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#ciencia', label: 'Ciência' },
  { href: '#faq', label: 'FAQ' },
] as const

export default function Footer() {
  return (
    <footer className="border-t border-accent/10 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-10 mb-10">
          <div>
            <p className="text-2xl font-bold tracking-tight text-text-primary m-0">
              Gnos<span className="text-accent">IQ</span>
            </p>
            <p className="font-mono text-xs text-text-muted tracking-[0.06em] mt-2.5">
              THE COGNITIVE CAPITAL API
            </p>
          </div>

          <div className="flex flex-wrap gap-10 md:gap-12 text-sm">
            <nav aria-label="Produto" className="grid gap-2.5 content-start">
              <p className="font-mono text-[11px] text-text-muted tracking-[0.1em] m-0">
                PRODUTO
              </p>
              {PRODUCT_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <nav aria-label="Legal" className="grid gap-2.5 content-start">
              <p className="font-mono text-[11px] text-text-muted tracking-[0.1em] m-0">
                LEGAL
              </p>
              <Link href="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/terms" className="text-text-secondary hover:text-text-primary transition-colors">
                Termos de Uso
              </Link>
              <a
                href={`mailto:${COMPANY_EMAIL}`}
                className="text-accent-light hover:text-accent transition-colors"
              >
                {COMPANY_EMAIL}
              </a>
            </nav>

            <nav aria-label="Redes sociais" className="grid gap-2.5 content-start">
              <p className="font-mono text-[11px] text-text-muted tracking-[0.1em] m-0">
                REDES
              </p>
              {SOCIAL.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* LGPD */}
        <p className="text-xs text-text-muted leading-relaxed border-t border-white/[0.08] pt-6 mb-4">
          {LGPD_NOTICE_PT}
        </p>

        {/* Identidade legal + carimbo de atualização real */}
        <div className="flex flex-col md:flex-row md:justify-between gap-3 text-xs text-text-muted">
          <p className="m-0">
            {COMPANY_LEGAL_NAME} · CNPJ {COMPANY_CNPJ}
            <br />
            {COMPANY_ADDRESS_PT}
          </p>
          <p className="font-mono m-0 whitespace-nowrap">
            Atualizado em:{' '}
            <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_LABEL}</time>
          </p>
        </div>

        <p className="text-xs text-text-muted mt-4">
          {TRADEMARK_NOTICE_PT} {CLINICAL_DISCLAIMER_LP}
        </p>
      </div>
    </footer>
  )
}
