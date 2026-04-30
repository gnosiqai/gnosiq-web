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
              Decisões estratégicas tomadas sem dados sobre o ativo mais
              crítico: você mesmo. O resultado aparece depois, numa
              demissão, num burnout, numa sociedade errada.
            </p>
          </div>

          <div className="stagger-item bg-background-primary rounded-xl p-6 border border-white/5 card-hover">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-accent font-bold text-sm">02</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Testes de personalidade custam R$300 a R$600 e entregam um PDF
              genérico. Avaliações clínicas custam R$4.000 ou mais e levam
              meses. Há um vácuo entre os dois.
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

        {/* GNO-67 Fix 3.10: métricas de tempo/preço mantidas apenas na tabela comparativa abaixo */}
        {/* Competitor table */}
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-violet-500/30">
                <th className="text-left py-3 px-4 text-white/60 font-medium">
                  Solução
                </th>
                <th className="text-center py-3 px-4 text-white/60 font-medium">
                  Preço
                </th>
                <th className="text-center py-3 px-4 text-white/60 font-medium">
                  Profundidade
                </th>
                <th className="text-center py-3 px-4 text-white/60 font-medium">
                  API
                </th>
                <th className="text-center py-3 px-4 text-white/60 font-medium">
                  Entrega
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-medium">
                  Hogan Assessments
                </td>
                <td className="py-3 px-4 text-center text-white/70">
                  R$15.000/eval
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#22C55E]">&#10003; Profunda</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#EF4444]">&#10007; Nenhuma</span>
                </td>
                <td className="py-3 px-4 text-center text-white/70">
                  Semanas
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-medium">
                  Crystal Knows
                </td>
                <td className="py-3 px-4 text-center text-white/70">
                  $49/mês
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#EF4444]">&#10007; Superficial</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#EF4444]">&#10007; Nenhuma</span>
                </td>
                <td className="py-3 px-4 text-center text-white/70">
                  Imediata
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-white font-medium">
                  Avaliação Clínica
                </td>
                <td className="py-3 px-4 text-center text-white/70">
                  R$4.000+
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#22C55E]">&#10003; Profunda</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#EF4444]">&#10007; Nenhuma</span>
                </td>
                <td className="py-3 px-4 text-center text-white/70">
                  2 a 4 meses
                </td>
              </tr>
              <tr className="bg-violet-500/10">
                <td className="py-3 px-4 text-white font-bold">
                  GnosIQ
                </td>
                <td className="py-3 px-4 text-center text-white font-semibold">
                  R$97
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#22C55E] font-semibold">&#10003; Profunda</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#22C55E] font-semibold">&#10003; API-first</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[#22C55E] font-semibold">~30 minutos</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
