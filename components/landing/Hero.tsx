'use client'
import posthog from 'posthog-js'
import { useLocale } from '@/lib/context/LocaleContext'
import HeroBackground from './HeroBackground'

export default function Hero() {
  const { locale } = useLocale()

  const copy = {
    pt: {
      eyebrow: 'Beta Privado · Acesso Antecipado',
      h1: 'GnosIQ. O Manual de Instruções da sua mente.',
      sub1: 'A inteligência humana é o único ativo que nenhum balanço patrimonial consegue capturar. Até agora.',
      sub2: 'O autoconhecimento científico era caro, demorado e inacessível. Isso mudou.',
      sub3: 'Para founders, líderes e profissionais de alta performance: a profundidade de uma avaliação clínica psicométrica cientificamente validada pela fração do tempo e do custo.',
      price: 'A partir de R$97 · relatório online em até ~30 minutos.',
      cta1: 'Entrar na lista de espera →',
      cta2: 'Ver como funciona →',
      disclaimer: 'Avaliação cognitiva · não substitui avaliação clínica.',
      gnoscoreNote: 'Inclui seu GnoScore™ compartilhável no',
      micro: ['✓ Pagamento único', '✓ Relatório de 18 páginas', '✓ Entrega em ~30 minutos', '✓ Acesso Antecipado · Vagas Limitadas'],
    },
    en: {
      eyebrow: 'Private Beta · Early Access',
      h1: 'GnosIQ. The Instruction Manual for your mind.',
      sub1: 'Human intelligence is the only asset no balance sheet can capture. Until now.',
      sub2: 'Scientific self-knowledge was expensive, slow and inaccessible. That changed.',
      sub3: 'For founders, leaders and high-performance professionals: the depth of a scientifically validated psychometric evaluation at a fraction of the time and cost.',
      price: 'Starting at $97 · online report in up to ~30 minutes.',
      cta1: 'Join the waitlist →',
      cta2: 'See how it works →',
      disclaimer: 'Cognitive evaluation · does not replace clinical assessment.',
      gnoscoreNote: 'Includes your shareable GnoScore™ on',
      micro: ['✓ One-time payment', '✓ 18-page report', '✓ Delivered in ~30 minutes', '✓ Early Access · Limited Spots'],
    },
  }
  const t = copy[locale]

  const handleCta1Click = () => {
    posthog.capture('cta clicked', {
      label: 'hero_primary',
      destination: '#waitlist',
    })
  }

  const handleCta2Click = () => {
    posthog.capture('cta clicked', {
      label: 'hero_secondary',
      destination: '#como-funciona',
    })
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

        {/* Subtitle — 3 parágrafos + preço */}
        <div className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed space-y-4">
          <p>{t.sub1}</p>
          <p>{t.sub2}</p>
          <p>{t.sub3}</p>
          <p className="font-semibold text-text-primary">{t.price}</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="#waitlist"
            onClick={handleCta1Click}
            className="btn-cta-primary cta-pulse bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
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

        {/* GnoScore note */}
        <p className="mt-2 text-xs text-white/50 text-center">
          {t.gnoscoreNote}{' '}
          <span className="text-violet-400 font-semibold">LinkedIn</span>
        </p>

        {/* Disclaimer cognitivo */}
        <p className="hero-disclaimer mt-2 text-center">
          {t.disclaimer}
        </p>

        {/* Micro-copy */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
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
