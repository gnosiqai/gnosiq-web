'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

// GNO-67: assessment → avaliação · Agent1/2/3 removidos (tags internas)
// GNO-84: FIX-02 cleanup LinkedIn passo 03 · FIX-07 título e descrição passo 02
const steps = [
  {
    num: '01',
    title: 'Responda a avaliação',
    desc: 'Formulário adaptativo de 40 a 60 perguntas. Tempo médio: ~22 minutos. Mobile-first, sem login necessário.',
  },
  {
    num: '02',
    title: '3 agentes de IA especializados analisam em conjunto',
    desc: 'Extração de padrões cognitivos, cruzamento com base psicométrica validada e síntese narrativa, processados em conjunto.'
  },
  {
    num: '03',
    title: 'Receba seu relatório',
    desc: null, // renderizado como JSX para LinkedIn highlight
  },
]

export default function HowItWorks() {
  const { locale } = useLocale()
  const staggerRef = useStaggerReveal(110)

  if (locale === 'en') {
    return (
      <section id="como-funciona" className="reveal py-24 px-6 bg-background-secondary">
        <div className="max-w-4xl mx-auto">
          <ComingSoonBanner milestone="M2" />
        </div>
      </section>
    )
  }

  return (
    <section id="como-funciona" className="reveal py-24 px-6 bg-background-secondary">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">
          Como funciona
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-16">
          De zero a relatório em ~30 minutos
        </h2>

        <div ref={staggerRef} className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="stagger-item relative">
              <div className="text-5xl font-bold text-accent/20 mb-4 font-mono">
                {step.num}
              </div>
              <h3 className="font-bold text-text-primary mb-3">{step.title}</h3>
              {step.num === '03' ? (
                <p className="text-text-secondary text-sm leading-relaxed">
                  18 páginas cobrindo: Perfil Cognitivo, Mapa de Forças, Pontos Cegos
                  e Recomendações de Carreira. Inclui seu GnoScore™ verificado.
                </p>
              ) : (
                <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
