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
        {/* Metrics — GNO-57: NPS counter removido (dado sem amostra válida · reintroduzir pós-M2) */}
        <div className="grid grid-cols-2 gap-8 mb-20 text-center max-w-sm mx-auto">
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={22} suffix="min" duration={1400} />
            </div>
            <div className="text-sm text-text-muted">Tempo médio de assessment</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={18} duration={1600} />
            </div>
            <div className="text-sm text-text-muted">Páginas de relatório</div>
          </div>
        </div>

        {/* GNO-45: Testimonials removido até depoimentos reais disponíveis */}
        <section className="py-4 text-center">
          <p className="text-sm text-white/60 tracking-wide">
            Early Access · Beta por convite · Tempo médio: 22 min · Relatório: 18 páginas
          </p>
        </section>
      </div>
    </section>
  )
}
