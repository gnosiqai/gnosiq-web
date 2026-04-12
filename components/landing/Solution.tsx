'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

export default function Solution() {
  const { locale } = useLocale()
  const staggerRef = useStaggerReveal(100)

  if (locale === 'en') {
    return (
      <section className="reveal py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ComingSoonBanner milestone="M2" />
        </div>
      </section>
    )
  }

  return (
    <section className="reveal py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">
          A GnosIQ
        </p>

        {/* H2 */}
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
          Assessment cognitivo profundo, programático e acessível
        </h2>

        {/* Body */}
        <p className="text-lg text-text-secondary mb-12 leading-relaxed max-w-3xl">
          A GnosIQ combina 12 instrumentos psicométricos validados internacionalmente
          com 3 agentes de IA especializados. O resultado: um relatório de 18 páginas
          sobre seu perfil cognitivo completo — em 30 minutos, por R$97.
        </p>

        {/* Cards */}
        <div ref={staggerRef} className="grid md:grid-cols-3 gap-8">
          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="font-bold text-text-primary mb-2">Profundidade clínica</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              12 instrumentos psicométricos em 4 camadas adaptativas: WAIS-IV · Big Five ·
              Inteligências Múltiplas · PTG · Renzulli. Profundidade de Hogan, preço de Crystal.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">Camadas A–D</span>
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">CAT Adaptativo</span>
            </div>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-bold text-text-primary mb-2">Entrega em 30 minutos</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              3 agentes de IA em pipeline: Extrator de Padrões → Psicometrista IA →
              Neuropsicólogo Sintético.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">Agent1</span>
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">Agent2</span>
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">Agent3</span>
            </div>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">🔌</div>
            <h3 className="font-bold text-text-primary mb-2">API-first</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Integre o assessment em qualquer produto. API L0 a partir de $0,50/eval.
              O único assessment cognitivo profundo com interface programática acessível do mercado.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">L0 $0.50–2/eval</span>
              <span className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">White-Label M3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
