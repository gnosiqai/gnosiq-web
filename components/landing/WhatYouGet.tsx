'use client'

import ReportExcerpt from './ReportExcerpt'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import { DELIVERY_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'

// GNO-115 — "O que eu recebo exatamente?" (H2 como pergunta).
//
// Prova de produto logo após o hero: o trecho real do relatório converte mais
// que features genéricas, e é o bloco que a issue manda subir na página.
//
// Substitui Solution.tsx + ApiSection.tsx:
//  · o conteúdo dos 6 cards de benefício da v1 sobrevive como TEXTO crawlable
//    (item da issue: "Conteúdo dos 6 cards de benefício como texto crawlable");
//  · a ApiSection inteira (H2 próprio, CTA próprio, "Solicitar acesso beta")
//    vira UMA linha sem CTA, como a issue determina — a v2 tem CTA único.

const BENEFITS = [
  {
    title: 'Como você pensa e aprende',
    body: 'Seus padrões cognitivos dominantes, como você processa informação e qual estilo de aprendizado maximiza sua performance.',
  },
  {
    title: 'Como você decide sob pressão',
    body: 'Seus vieses cognitivos, gatilhos de decisão e o que muda no seu raciocínio quando o custo do erro é alto.',
  },
  {
    title: 'Onde estão seus pontos cegos',
    body: 'Os padrões que surgem sob pressão de decisão: os que afetam contratações, sócios e mudanças de rumo antes que você perceba.',
  },
  {
    title: 'O que bloqueia sua alta performance',
    body: 'Os freios cognitivos específicos que limitam seu potencial, com recomendações práticas para removê-los.',
  },
  {
    title: 'Como você se recupera de adversidade',
    body: 'Sua resiliência cognitiva, capacidade de adaptação e os recursos internos que você aciona em momentos de crise.',
  },
  {
    title: 'Comparativo e evolução',
    body: 'Um comparativo anônimo com a faixa da população e acesso ao histórico para acompanhar a sua evolução nas reavaliações.',
  },
] as const

export default function WhatYouGet() {
  const staggerRef = useStaggerReveal<HTMLUListElement>(90)

  return (
    <section id="o-que-recebo" className="reveal py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[420px_1fr] gap-12 lg:gap-16 items-start">
          {/* Coluna esquerda — a prova */}
          <ReportExcerpt />

          {/* Coluna direita — a resposta */}
          <div>
            {/* Item 6 do delta (opcional, decisão CEO no PR): eyebrow herdado
                do H1 da v1, que era "O Manual de Instruções da sua Mente". */}
            <p className="font-mono text-xs md:text-sm text-accent uppercase tracking-[0.14em] mb-4">
              O Manual de Instruções da sua Mente
            </p>

            <h2 className="text-3xl md:text-[40px] font-bold text-text-primary tracking-tight mb-6">
              O que eu recebo exatamente?
            </h2>

            <p className="text-lg text-text-secondary leading-relaxed">
              Você recebe um relatório de {REPORT_PAGES} páginas com o seu GnoScore™; um
              mapa das suas forças e zonas de desenvolvimento nos domínios do modelo CHC;
              a leitura do seu estilo de processamento em linguagem clara, sem jargão;
              recomendações práticas para estudo, trabalho e decisões; um comparativo
              anônimo com a faixa da população; e acesso ao histórico para acompanhar a
              sua evolução nas reavaliações. Entrega em cerca de {DELIVERY_MINUTES} minutos.
            </p>

            {/* Os 6 benefícios da v1 — texto crawlable, não imagem */}
            <ul ref={staggerRef} className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mt-10 list-none p-0">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="stagger-item">
                  <h3 className="font-bold text-text-primary mb-1.5">{benefit.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{benefit.body}</p>
                </li>
              ))}
            </ul>

            {/* Assinatura de categoria — 1 linha, sem CTA próprio (issue) */}
            <p className="text-[15px] text-text-muted mt-10">
              Em breve, para empresas via API.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
