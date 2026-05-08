'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import posthog from 'posthog-js'

// GNO-67 Seção 2 — Bloco API independente, abaixo do hero
// Fix 3.7: badge "Beta fechado · Acesso antecipado" (GNO-68: atualizado de 'Acesso para devs em breve')
// CTA: ghost/outlined — NUNCA primário
// NÃO lista preço nesta seção
// GNO-84: FIX-06 eyebrow ICP atualizado
// GNO-92b: dores sem linhas em branco; h2 badge em desenvolvimento com mesmo estilo do body

export default function ApiSection() {
  const { locale } = useLocale()

  const copy = {
    pt: {
      eyebrow: 'Para founders, tech leaders e RH de alta performance',
      h2: (
        <>
          The Cognitive Capital API 🔬{' '}
          <em className="text-base text-text-muted font-normal not-italic" style={{ fontSize: 'inherit' }}>
            em desenvolvimento
          </em>
        </>
      ),
      problem: (
        <>
          Contratações equivocadas. Funcionários em posições erradas.
          <br />Talentos desperdiçados.
          <br />Isso acabou.
        </>
      ),
      body: 'Integre avaliação cognitiva profunda diretamente na sua plataforma.',
      tagline: 'A primeira API que transforma potencial humano em capital computável.\n~30 minutos. Mapeamento profundo. Escala ilimitada.\nDa avaliação individual ao uso corporativo.',
      cta: 'Solicitar acesso beta',
      badge: 'Beta fechado · Acesso antecipado',
      validado: 'API validada do mercado',
    },
    en: {
      eyebrow: 'For founders, tech leaders and high-performance HR',
      h2: (
        <>
          The Cognitive Capital API 🔬{' '}
          <em className="text-base text-text-muted font-normal not-italic" style={{ fontSize: 'inherit' }}>
            under development
          </em>
        </>
      ),
      problem: (
        <>
          Wrong hires. Employees in wrong positions.
          <br />Wasted talent.
          <br />That ends now.
        </>
      ),
      body: 'Integrate deep cognitive evaluation directly into your platform.',
      tagline: 'The first API that turns human potential into computable capital.\n~30 minutes. Deep mapping. Unlimited scale.\nFrom individual evaluation to enterprise use.',
      cta: 'Request beta access',
      badge: 'Closed beta · Early access',
      validado: 'Market-validated API',
    },
  }
  const t = copy[locale]

  const handleCtaClick = () => {
    posthog.capture('cta clicked', {
      label: 'api_section_beta',
      destination: '#waitlist',
    })
  }

  return (
    <section
      className="reveal py-24 px-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-6">
          {t.eyebrow}
        </p>

        {/* Problem statement — sem linhas em branco entre as frases */}
        <p className="text-lg text-text-secondary mb-4 leading-relaxed max-w-2xl">
          {t.problem}
        </p>

        {/* Body */}
        <p className="text-base text-text-muted mb-8 leading-relaxed max-w-2xl">
          {t.body}
        </p>

        {/* H2 — "em desenvolvimento" com mesmo estilo visual do body */}
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
          {t.h2}
        </h2>

        {/* Tagline */}
        <p className="text-lg text-text-secondary mb-10 leading-relaxed max-w-3xl" style={{ whiteSpace: 'pre-line' }}>
          {t.tagline}
        </p>

        {/* CTA ghost/outlined + Badge — centralizados, badge abaixo do CTA */}
        <div className="flex flex-col items-center text-center gap-3">
          <a
            href="#waitlist"
            onClick={handleCtaClick}
            className="border border-accent/40 hover:border-accent text-accent hover:text-accent-light font-semibold px-8 py-3 rounded-xl text-base transition-colors"
          >
            {t.cta}
          </a>
          <p className="text-xs text-text-muted">
            {t.badge}
          </p>
        </div>
      </div>
    </section>
  )
}
