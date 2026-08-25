// GNO-115 — TRECHO REAL do relatório, em HTML navegável.
//
// O wireframe é explícito: "navegável, não print". Um print seria invisível
// para crawler e para motor de resposta, e é justamente esta a prova nº 1 do
// produto. Por isso os escores, os domínios e o insight são TEXTO — não a
// imagem /public/report-preview.png que a v1 usava.
//
// Escores mascarados de propósito (8✕ / ✕✕): a LP mostra a FORMA do
// resultado, nunca um resultado real de uma pessoa real.
//
// Server component: nenhuma interatividade, então nada de 'use client'.

import { REPORT_PAGES } from '@/lib/constants/metrics'

/** Domínios do modelo CHC exibidos no exemplo. `width` é ilustrativo. */
const DOMAINS = [
  { label: 'Raciocínio fluido', width: '78%', color: 'bg-accent' },
  { label: 'Memória de trabalho', width: '62%', color: 'bg-accent-light' },
  { label: 'Velocidade de processamento', width: '84%', color: 'bg-accent-dark' },
] as const

export default function ReportExcerpt() {
  return (
    <figure className="bg-background-secondary border border-accent/25 rounded-2xl p-7 md:p-9 m-0">
      <div className="flex justify-between items-center mb-6 gap-3">
        <span className="font-mono text-[11px] md:text-xs tracking-[0.14em] text-text-muted">
          RELATÓRIO · TRECHO REAL
        </span>
        <span className="inline-flex items-center gap-2 border border-accent/35 bg-accent/10 rounded-full px-3 py-1 text-xs font-bold text-text-primary whitespace-nowrap">
          <span className="w-[7px] h-[7px] rounded-full bg-accent inline-block" aria-hidden="true" />
          {' '}GnoScore™
        </span>
      </div>

      {/* Escore mascarado */}
      <p className="text-5xl md:text-6xl font-bold text-accent tracking-tight m-0">
        8<span className="text-text-muted" aria-hidden="true">✕</span>
        <span className="sr-only"> (escore mascarado)</span>
      </p>
      <p className="text-[13px] text-text-muted mt-1 mb-7">
        escore mascarado · exemplo público
      </p>

      {/* Perfil por domínio do modelo CHC */}
      <ul className="grid gap-3.5 list-none p-0 m-0">
        {DOMAINS.map((domain) => (
          <li key={domain.label}>
            <div className="flex justify-between text-[13px] text-text-secondary mb-1.5">
              <span>{domain.label}</span>
              <span className="text-text-muted" aria-hidden="true">✕✕</span>
            </div>
            <div className="h-2 bg-accent/15 rounded" aria-hidden="true">
              <div className={`h-2 rounded ${domain.color}`} style={{ width: domain.width }} />
            </div>
          </li>
        ))}
      </ul>

      {/*
        Item 1 do delta: o insight narrativo real. A voz do relatório é a
        prova nº 1 — features genéricas não convertem, um parágrafo que soa
        como o produto converte.
      */}
      <div className="border-t border-accent/20 mt-6 pt-5">
        <p className="font-mono text-[11px] text-accent-light tracking-[0.12em] mb-3">
          EXEMPLO DE INSIGHT · RELATÓRIO REAL
        </p>
        <blockquote className="text-sm text-text-secondary leading-relaxed italic m-0">
          &ldquo;Padrão identificado: sob ambiguidade de dados, seu perfil cognitivo tende
          a acelerar decisões antes de explorar alternativas com profundidade. Esse
          padrão pode aumentar velocidade de execução, mas também elevar o risco de
          fechar opções cedo demais em momentos críticos.&rdquo;
        </blockquote>
        <figcaption className="text-xs text-text-muted mt-3">
          ↑ Tipo de insight presente no relatório de {REPORT_PAGES} páginas. Exemplo
          ilustrativo.
        </figcaption>
      </div>
    </figure>
  )
}
