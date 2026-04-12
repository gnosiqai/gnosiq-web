'use client'
import { useLocale } from '@/lib/context/LocaleContext'
import HeroBackground from './HeroBackground'

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props: object) => void
    }
  }
}

export default function Hero() {
  const { locale } = useLocale()

  const price    = locale === 'en' ? '$97'                         : 'R$97'
  const ctaLabel = locale === 'en' ? `Start Assessment — ${price}` : `Começar Avaliação — ${price}`

  const copy = {
    pt: {
      eyebrow: 'Capital Cognitivo · Assessment com IA · Relatório em 30 minutos',
      h1: 'Desbloqueie o Capital Cognitivo escondido em você',
      sub: 'A primeira API que transforma potencial humano em capital computável. Para founders e líderes que precisam de mais do que um teste de personalidade.',
      cta2: 'Sou desenvolvedor → ver API',
      micro: ['✓ Pagamento único', '✓ Relatório de 18 páginas', '✓ Entrega em 30 minutos', '✓ NPS Beta: 76'],
    },
    en: {
      eyebrow: 'Cognitive Capital · AI Assessment · 30-minute Report',
      h1: 'Unlock the Cognitive Capital hidden in every human',
      sub: 'The first API that turns human potential into computable capital. For founders and leaders who need more than a personality test.',
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
    <section className="relative overflow-hidden min-h-screen flex items-center">

      {/* LAYER 1: Neural canvas — z-index 0 */}
      <HeroBackground />

      {/* LAYER 2: Radial purple glow — z-index 1 */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.18) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />

      {/* LAYER 3: Noise texture overlay — z-index 2 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          zIndex: 2,
        }}
      />

      {/* CONTEÚDO — z-index 10 */}
      <div className="relative z-10 container mx-auto px-6 py-32 text-center max-w-4xl">
        {/* Eyebrow badge com SVG cognitivo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="text-accent flex-shrink-0"
          >
            <circle cx="8" cy="8" r="2.5" fill="currentColor" opacity="0.9" />
            <circle cx="8" cy="2" r="1.5" fill="currentColor" opacity="0.5" />
            <circle cx="8" cy="14" r="1.5" fill="currentColor" opacity="0.5" />
            <circle cx="2" cy="8" r="1.5" fill="currentColor" opacity="0.5" />
            <circle cx="14" cy="8" r="1.5" fill="currentColor" opacity="0.5" />
            <line x1="8" y1="5.5" x2="8" y2="3.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="8" y1="10.5" x2="8" y2="12.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="5.5" y1="8" x2="3.5" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="10.5" y1="8" x2="12.5" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
          <span className="text-xs font-bold text-accent uppercase tracking-widest">
            {t.eyebrow}
          </span>
        </div>

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
            className="btn-cta-primary cta-pulse bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            {ctaLabel}
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
