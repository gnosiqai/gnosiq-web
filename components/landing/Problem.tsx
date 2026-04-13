'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

export default function Problem() {
  const { locale } = useLocale()
  const staggerRef = useStaggerReveal(100)

  if (locale === 'en') {
    return (
      <section className="reveal py-24 px-6 bg-background-secondary">
        <div className="max-w-4xl mx-auto">
          <ComingSoonBanner milestone="M2" />
        </div>
      </section>
    )
  }

  return (
    <section className="reveal py-24 px-6 bg-background-secondary">
      <div className="max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">
          O problema que ninguém mede
        </p>

        {/* H2 */}
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
          Nenhum balanço captura capital cognitivo, até hoje
        </h2>

        {/* Body */}
        <p className="text-lg text-text-secondary mb-12 leading-relaxed max-w-3xl">
          Você investe em infra, produto e time. Mas o ativo que dirige todas essas
          decisões: como você pensa, processa e age, nunca foi medido com rigor.
        </p>

        {/* Pain points */}
        <div ref={staggerRef} className="grid md:grid-cols-3 gap-8">
          <div className="stagger-item bg-background-primary rounded-xl p-6 border border-white/5 card-hover">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-accent font-bold text-sm">01</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Decisões estratégicas são tomadas com base em intuição, não em dados
              cognitivos. O custo é invisível até aparecer no resultado.
            </p>
          </div>

          <div className="stagger-item bg-background-primary rounded-xl p-6 border border-white/5 card-hover">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-accent font-bold text-sm">02</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Testes de personalidade custam R$800 e entregam um PDF genérico.
              Avaliações clínicas custam R$5.000 e levam meses. Há um vácuo entre os dois.
            </p>
          </div>

          <div className="stagger-item bg-background-primary rounded-xl p-6 border border-white/5 card-hover">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-accent font-bold text-sm">03</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Ferramentas existentes como Hogan, Crystal e BetterUp ou são profundas e
              inacessíveis, ou acessíveis e superficiais. Nenhuma tem API.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
