'use client'

import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { FILL_MINUTES, DELIVERY_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'

// faixa de métricas reais, preservada da LP atual (a issue lista
// "~22 min preenchimento · ~30 min entrega · 18 páginas" entre os itens que
// o wireframe cortou e que DEVEM sobreviver).
//
// Substitui components/landing/SocialProof.tsx, cujo nome já não descrevia o
// conteúdo: os depoimentos saíram na e o NPS na sobrando só
// esta faixa. Valores vêm da fonte canônica em lib/constants/metrics.ts.

export default function MetricsStrip() {
  return (
    <section className="reveal border-y border-accent/10 py-12 px-6">
      <dl className="max-w-3xl mx-auto grid grid-cols-3 gap-6 md:gap-20 text-center">
        <div>
          <dd className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
            ~<AnimatedCounter value={FILL_MINUTES} duration={1400} />
            <span className="text-lg md:text-2xl text-accent-light">min</span>
          </dd>
          <dt className="font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] text-text-muted mt-2">
            Avaliação
          </dt>
        </div>
        <div>
          <dd className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
            ~<AnimatedCounter value={DELIVERY_MINUTES} duration={1600} />
            <span className="text-lg md:text-2xl text-accent-light">min</span>
          </dd>
          <dt className="font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] text-text-muted mt-2">
            Entrega
          </dt>
        </div>
        <div>
          <dd className="text-3xl md:text-5xl font-bold text-accent tracking-tight">
            <AnimatedCounter value={REPORT_PAGES} duration={1800} />
          </dd>
          <dt className="font-mono text-[10px] md:text-xs uppercase tracking-[0.14em] text-text-muted mt-2">
            Páginas
          </dt>
        </div>
      </dl>
    </section>
  )
}
