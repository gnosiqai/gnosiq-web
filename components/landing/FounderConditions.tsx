'use client'

import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import { DELIVERY_MINUTES } from '@/lib/constants/metrics'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

// "Condições de Fundador" (correção 1 da issue).
//
// VETO GATE: este bloco SUBSTITUI o card de preço "R$97" do wireframe. Não há
// número de preço aqui, nem na tabela, nem em atributo, nem em comentário de
// JSX que vá para o HTML. A condição é descrita qualitativamente — "preço de
// fundador travado" — até o GATE fixar o preço final.
//
// Item 2 do delta: a comparação é POR CATEGORIA. Sem nomes de concorrentes
// (publicidade comparativa depreciativa) e sem cifra nossa. "R$ milhares" e
// "Grátis" descrevem as CATEGORIAS alheias, não a GnosIQ.

const CONDITIONS = [
  {
    title: 'Preço de fundador travado',
    body: `A condição de entrada dos ${FOUNDER_SLOTS} primeiros fica congelada para sempre, mesmo quando o preço público subir.`,
  },
  {
    title: 'Reavaliação gratuita em 6 meses',
    body: 'Refaça a avaliação sem custo e acompanhe a evolução do seu GnoScore™ ao longo do tempo.',
  },
  {
    title: 'Acesso antecipado',
    body: 'Você entra antes da abertura pública e participa das decisões do produto no beta.',
  },
] as const

interface ComparisonRow {
  solution: string
  cost: string
  depth: string
  depthTone: 'positive' | 'negative'
  delivery: string
 /** Só a linha da GnosIQ. */
  highlight?: boolean
}

const COMPARISON: readonly ComparisonRow[] = [
  {
    solution: 'Avaliação tradicional',
    cost: 'R$ milhares',
    depth: 'Profunda',
    depthTone: 'positive',
    delivery: 'Semanas a meses',
  },
  {
    solution: 'Testes grátis de internet',
    cost: 'Grátis',
    depth: 'Superficial',
    depthTone: 'negative',
    delivery: 'Imediata',
  },
  {
    solution: 'GnosIQ',
    cost: 'Fração do custo',
    depth: 'Profunda',
    depthTone: 'positive',
    delivery: `~${DELIVERY_MINUTES} minutos`,
    highlight: true,
  },
] as const

export default function FounderConditions() {
  const staggerRef = useStaggerReveal(100)

  return (
    <section
      id="condicoes"
      className="reveal py-20 md:py-24 px-6 bg-background-secondary"
      style={{
        backgroundImage: 'radial-gradient(rgba(139,92,246,0.14) 1.5px, transparent 1.5px)',
        backgroundSize: '36px 36px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-xs md:text-sm text-accent uppercase tracking-[0.14em] mb-4">
          Os {FOUNDER_SLOTS} primeiros da lista
        </p>
        <h2 className="text-3xl md:text-[40px] font-bold text-text-primary tracking-tight mb-12">
          Condições de Fundador
        </h2>

        <div ref={staggerRef} className="grid md:grid-cols-3 gap-7">
          {CONDITIONS.map((condition) => (
            <article
              key={condition.title}
              className="stagger-item bg-background-primary border border-accent/35 rounded-2xl p-8 md:p-10 card-hover"
            >
              <h3 className="text-xl font-bold text-text-primary mb-3">{condition.title}</h3>
              <p className="text-[15px] text-text-muted leading-relaxed m-0">{condition.body}</p>
            </article>
          ))}
        </div>

        {/* Comparação por categoria — sem nomear concorrentes */}
        <div className="mt-14">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            Como a GnosIQ se compara?
          </h3>

          <div className="border border-accent/[0.14] rounded-2xl overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <caption className="sr-only">
                Comparação entre categorias de avaliação cognitiva: custo, profundidade e
                prazo de entrega.
              </caption>
              <thead>
                <tr className="bg-background-primary border-b border-accent/[0.14]">
                  <th scope="col" className="text-left font-mono text-xs tracking-[0.1em] text-text-muted font-normal py-4 px-8">
                    SOLUÇÃO
                  </th>
                  <th scope="col" className="text-left font-mono text-xs tracking-[0.1em] text-text-muted font-normal py-4 px-4">
                    CUSTO
                  </th>
                  <th scope="col" className="text-left font-mono text-xs tracking-[0.1em] text-text-muted font-normal py-4 px-4">
                    PROFUNDIDADE
                  </th>
                  <th scope="col" className="text-left font-mono text-xs tracking-[0.1em] text-text-muted font-normal py-4 px-4">
                    ENTREGA
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.solution}
                    className={
                      row.highlight
                        ? 'bg-accent/10 border-l-[3px] border-l-accent font-bold'
                        : 'bg-background-primary border-b border-accent/10'
                    }
                  >
                    <th scope="row" className="text-left font-normal py-5 px-8 text-text-secondary">
                      {row.solution === 'GnosIQ' ? (
                        <span className="text-text-primary font-bold">
                          Gnos<span className="text-accent">IQ</span>
                        </span>
                      ) : (
                        row.solution
                      )}
                    </th>
                    <td className="py-5 px-4 text-text-muted">{row.cost}</td>
                    <td className="py-5 px-4">
                      <span
                        className={
                          row.depthTone === 'positive'
                            ? 'text-semantic-success'
                            : 'text-semantic-error'
                        }
                      >
                        {row.depthTone === 'positive' ? '✓' : '✗'} {row.depth}
                      </span>
                    </td>
                    <td className={`py-5 px-4 ${row.highlight ? 'text-accent-light' : 'text-text-muted'}`}>
                      {row.delivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
