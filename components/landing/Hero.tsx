'use client'

import { useLocale } from '@/lib/useLocale'

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props: object) => void
    }
  }
}

export default function Hero() {
  const { locale } = useLocale()

  const copy = {
    pt: {
      eyebrow: 'Capital Cognitivo · Assessment com IA · Relatório em 30 minutos',
      h1: 'Desbloqueie o Capital Cognitivo escondido em você',
      sub: 'A primeira API que transforma potencial humano em capital computável. Para founders e líderes que precisam de mais do que um teste de personalidade.',
      cta1: 'Começar Avaliação — R$97',
      cta2: 'Sou desenvolvedor → ver API',
      micro: ['✓ Pagamento único', '✓ Relatório de 18 páginas', '✓ Entrega em 30 minutos', '✓ NPS Beta: 76'],
    },
    en: {
      eyebrow: 'Cognitive Capital · AI Assessment · 30-minute Report',
      h1: 'Unlock the Cognitive Capital hidden in every human',
      sub: 'The first API that turns human potential into computable capital. For founders and leaders who need more than a personality test.',
      cta1: 'Start Assessment — $97',
      cta2: "I'm a developer → View API",
      micro: ['✓ One-time payment', '✓ 18-page report', '✓ Delivered in 30 minutes', '✓ Beta NPS: 76'],
    },
  }

  const t = copy[locale]

  const handleCta1Click = () => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('waitlist_signup', {
        source: locale === 'pt' ? 'landing_hero_pt' : 'landing_hero_en',
      })
    }
  }

  const handleCta2Click = () => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('cta_click', { cta: 'developer_api', locale })
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-6">
          {t.eyebrow}
        </p>

        {/* H1 */}
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
          {t.h1}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="#waitlist"
            onClick={handleCta1Click}
            className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {t.cta1}
          </a>
          <a
            href="#como-funciona"
            onClick={handleCta2Click}
            className="border border-white/20 hover:border-accent/50 text-text-secondary hover:text-text-primary font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {t.cta2}
          </a>
        </div>

        {/* Micro-copy */}
        <div className="flex flex-wrap justify-center gap-4">
          {t.micro.map((item) => (
            <span key={item} className="text-sm text-text-muted">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
