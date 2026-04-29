'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

// GNO-45: testimonials removido até depoimentos reais disponíveis
// const testimonials = [ ... ] — preservado no git history

export default function SocialProof() {
  const { locale } = useLocale()

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
        {/* Metrics — GNO-57: NPS counter removido (dado sem amostra válida · reintroduzir pós-M2)
            GNO-65: label "Tempo médio de assessment" → "Tempo de preenchimento" (22 min)
                    novo stat "Entrega do relatório" (30 min) adicionado · grid-cols-2 → grid-cols-3 */}
        <div className="grid grid-cols-3 gap-8 mb-20 text-center max-w-lg mx-auto">
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={22} suffix="min" duration={1400} />
            </div>
            <div className="text-sm text-text-muted">Tempo de preenchimento</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={30} suffix="min" duration={1600} />
            </div>
            <div className="text-sm text-text-muted">Entrega do relatório</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={18} duration={1800} />
            </div>
            <div className="text-sm text-text-muted">Páginas de relatório</div>
          </div>
        </div>

        {/* GNO-45: Testimonials removido até depoimentos reais disponíveis */}
        <section className="py-4 text-center">
          <p className="text-sm text-white/60 tracking-wide">
            Early Access · Beta por convite · Preenchimento: 22 min · Entrega: 30 min · Relatório: 18 páginas
          </p>
        </section>
      </div>
    </section>
  )
}
