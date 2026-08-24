// GNO-115 — "Por que o mapeamento cognitivo profundo era inacessível?"
//
// CFP (correção 2 da issue): o H2 do wireframe dizia "Por que o DIAGNÓSTICO
// profundo era inacessível?". "Diagnóstico" é palavra proibida em qualquer
// superfície da GnosIQ — trocada por "mapeamento" aqui e no hero.
//
// A tabela que nomeava Hogan, Crystal Knows e BetterUp ("✗ Superficial") saiu
// inteira: é publicidade comparativa depreciativa. A comparação honesta, por
// CATEGORIA, vive em FounderConditions.tsx (item 2 do delta).
//
// Server component: texto puro, sem estado.

export default function Problem() {
  return (
    <section id="problema" className="reveal py-20 md:py-24 px-6 bg-background-secondary">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[40px] font-bold text-text-primary tracking-tight mb-12 max-w-4xl">
          Por que o mapeamento cognitivo profundo era inacessível?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <article className="bg-background-primary border border-accent/[0.14] rounded-2xl p-8 md:p-10">
            <p className="font-mono text-xs md:text-sm text-text-muted uppercase tracking-[0.14em] mb-5">
              Antes
            </p>
            <p className="text-[17px] text-text-secondary leading-relaxed m-0">
              Uma avaliação profunda custava milhares de reais, exigia semanas entre
              sessões presenciais e devolvia um laudo denso, escrito para especialistas.
              Para a maioria das pessoas, conhecer a própria mente simplesmente não era
              uma opção.
            </p>
          </article>

          <article className="bg-background-primary border border-accent/35 rounded-2xl p-8 md:p-10">
            <p className="font-mono text-xs md:text-sm text-accent uppercase tracking-[0.14em] mb-5">
              Agora
            </p>
            <p className="text-[17px] text-text-secondary leading-relaxed m-0">
              A GnosIQ combina instrumentos validados com IA especializada: você responde
              à avaliação do navegador e recebe, em minutos, um relatório que você entende
              de verdade. <span className="text-accent-light font-bold">Isso mudou.</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
