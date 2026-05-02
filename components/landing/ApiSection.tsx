'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import posthog from 'posthog-js'

// GNO-67 Seção 2 — Bloco API independente, abaixo do hero
// Fix 3.7: badge "Beta fechado · Acesso antecipado" (GNO-68: atualizado de 'Acesso para devs em breve')
// CTA: ghost/outlined — NUNCA primário
// NÃO lista preço nesta seção
// GNO-84: FIX-06 eyebrow ICP atualizado

export default function ApiSection() {
  const { locale } = useLocale()

  const copy = {
    pt: {
      eyebrow: 'Para founders, tech leaders e times de produto',
      h2: 'The Cognitive Capital API',
      problem: 'Contratações equivocadas. Funcionários em posições erradas. Talentos desperdiçados.',
      problemPunch: 'Isso acabou.',
      body: 'Integre avaliação cognitiva profunda diretamente na sua plataforma.',
      tagline: 'A primeira API que transforma potencial humano em capital computável. Acesso direto via API, resposta em tempo real, escalabilidade massiva. Da avaliação individual ao uso corporativo.',
      cta: 'Solicitar acesso beta',
      badge: 'Beta fechado · Acesso antecipado',
      validado: 'API validada do mercado',
    },
    en: {
      eyebrow: 'For HR, product teams, companies, devs',
      h2: 'The Cognitive Capital API',
      problem: 'Wrong hires. Employees in wrong positions. Wasted talent.',
      problemPunch: 'That ends now.',
      body: 'Integrate deep cognitive evaluation directly into your platform.',
      tagline: 'The first API that turns human potential into computable capital. Direct API access, real-time response, massive scalability. From individual evaluation to enterprise use.',
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

        {/* Problem statement */}
        <p className="text-lg text-text-secondary mb-4 leading-relaxed max-w-2xl">
          {t.problem}
          <br />
          {t.problemPunch}
        </p>

        {/* Body */}
        <p className="text-base text-text-muted mb-8 leading-relaxed max-w-2xl">
          {t.body}
        </p>

        {/* H2 */}
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
          {t.h2}
        </h2>

        {/* Tagline */}
        <p className="text-lg text-text-secondary mb-10 leading-relaxed max-w-3xl">
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
