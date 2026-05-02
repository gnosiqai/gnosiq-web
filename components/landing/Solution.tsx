'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'

// GNO-67: Fix 3.6 — Agent1/2/3, L0/M3/$0.50/eval removidos (tags internas)
//          Fix 3.8 — assessment → avaliação
//          Fix 3.9 — cards B2C: frameworks técnicos → linguagem funcional
// GNO-84: FIX-02 cleanup LinkedIn · FIX-03 terminologia canônica · FIX-04 pontos cegos founder · FIX-05 bloco insight

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
          Avaliação cognitiva profunda, acessível e com resultado imediato
        </h2>

        {/* Body */}
        <p className="text-lg text-text-secondary mb-12 leading-relaxed max-w-3xl">
          A GnosIQ combina instrumentos psicométricos validados internacionalmente
          com inteligência artificial especializada. O resultado: um relatório de 18 páginas
          sobre seu perfil cognitivo completo, em ~30 minutos, por R$97.
        </p>

        {/* FIX-05: Bloco exemplo de insight — relatório real */}
        <div className="bg-background-secondary border border-accent/20 rounded-xl p-5 mb-10 max-w-2xl mx-auto text-left">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">
            Exemplo de insight — relatório real
          </p>

          <p className="text-sm text-text-secondary leading-relaxed italic">
            &ldquo;Padrão identificado: sob ambiguidade de dados, seu perfil cognitivo tende a acelerar decisões antes de explorar alternativas com profundidade. Esse padrão pode aumentar velocidade de execução, mas também elevar o risco de fechar opções cedo demais em momentos críticos.&rdquo;
          </p>

          <p className="text-xs text-white/40 mt-3">
            ↑ Tipo de insight presente no relatório de 18 páginas. Exemplo ilustrativo para demonstração.
          </p>
        </div>

        {/* Cards B2C — linguagem funcional */}
        <div ref={staggerRef} className="grid md:grid-cols-3 gap-8">
          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="font-bold text-text-primary mb-2">Como você pensa e aprende</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Descubra seus padrões cognitivos dominantes, como você processa informação
              e qual estilo de aprendizado maximiza sua performance.
            </p>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="font-bold text-text-primary mb-2">Como você decide sob pressão</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Identifique seus vieses cognitivos, gatilhos de decisão e o que muda no seu
              raciocínio quando o custo do erro é alto.
            </p>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="font-bold text-text-primary mb-2">Onde estão seus pontos cegos</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Mapeie os padrões que surgem sob pressão de decisão — os que afetam contratações,
              co-founders e pivôs antes que você perceba.
            </p>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">🚧</div>
            <h3 className="font-bold text-text-primary mb-2">O que bloqueia sua alta performance</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Entenda os freios cognitivos específicos que limitam seu potencial e receba
              recomendações práticas para removê-los.
            </p>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="font-bold text-text-primary mb-2">Como você se recupera de adversidade</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Avalie sua resiliência cognitiva, capacidade de adaptação e os recursos
              internos que você aciona em momentos de crise.
            </p>
          </div>

          <div className="stagger-item bg-background-secondary rounded-xl p-6 border border-white/5 card-hover">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="font-bold text-text-primary mb-2">Entrega em ~30 minutos</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Relatório de 18 páginas com seu GnoScore™ verificado. Compartilhamento de resultados disponível no lançamento.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
