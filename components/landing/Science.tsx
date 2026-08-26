'use client'

import Image from 'next/image'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import founderPhoto from '@/public/foto-de-perfil-linkedin.jpg'
import { FILL_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'

// "Isso tem base científica?" · bloco de PROVA da categoria.
//
// ⚠️ ESTE BLOCO EXIGE REVIEW RISK DOCUMENTADA ANTES DO DEPLOY (issue, correção 3).
//
// Lição Rafael/WAIS-IV, aplicada aqui:
// cita o modelo CHC (taxonomia pública, acadêmica) e a expressão genérica
// "instrumentos validados";
// NÃO lista bateria nominal de frameworks teóricos;
// NÃO nomeia instrumento clínico proprietário (WAIS, WISC, Raven e afins);
// NÃO afirma correlação, equivalência ou validação cruzada com nenhum deles.
// Qualquer nome próprio de instrumento que voltar a esta seção reabre o risco
// que a correção 3 fechou.
//
// Substitui HowItWorks.tsx: os 3 passos (os 3 agentes de IA, em nível alto,
// zero internals e zero prompts) migram para cá como a metodologia que
// sustenta a resposta "sim, tem base científica".

const STEPS = [
  {
    num: '01',
    title: 'Avaliação adaptativa',
    body: `Um agente de IA conduz a avaliação e ajusta o percurso às suas respostas, em cerca de ${FILL_MINUTES} minutos.`,
  },
  {
    num: '02',
    title: 'Análise psicométrica',
    body: 'Um segundo agente calcula o seu GnoScore™ e o perfil por domínio do modelo CHC.',
  },
  {
    num: '03',
    title: 'Relatório em linguagem clara',
    body: `Um terceiro agente redige as ${REPORT_PAGES} páginas: o que os números significam e o que fazer com eles.`,
  },
] as const

export default function Science() {
  const staggerRef = useStaggerReveal(110)

  return (
    <section id="ciencia" className="reveal py-20 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[40px] font-bold text-text-primary tracking-tight mb-5">
          Isso tem base científica?
        </h2>

        <p className="text-lg text-text-secondary leading-relaxed max-w-3xl mb-12">
          Sim. A avaliação é construída com base no modelo CHC - a referência mais
          aceita na pesquisa contemporânea sobre inteligência - com uma combinação
          única de instrumentos validados e IA especializada em cognição.
        </p>

        {/* Metodologia em 3 passos — âncora "Como funciona" da navbar */}
        <div
          id="como-funciona"
          ref={staggerRef}
          className="grid md:grid-cols-3 gap-7 mb-12 scroll-mt-24"
        >
          {STEPS.map((step) => (
            <article
              key={step.num}
              className="stagger-item bg-background-secondary border border-accent/[0.14] rounded-2xl p-8 card-hover"
            >
              <p className="font-mono text-sm text-accent mb-3.5">{step.num}</p>
              <h3 className="text-lg font-bold text-text-primary mb-2.5">{step.title}</h3>
              <p className="text-[15px] text-text-muted leading-relaxed m-0">{step.body}</p>
            </article>
          ))}
        </div>

        {/* Byline do founder — autoria da metodologia + LGPD + disclaimer */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 bg-background-secondary border border-accent/[0.14] rounded-2xl p-8 md:px-10">
          <div className="flex items-center gap-6">
            {/*
              Asset 400x400 quadrado: o next/image gera webp/avif e serve o
              tamanho certo por DPR. SEM `sizes`: para imagem de tamanho fixo
              o Next emite srcset 1x/2x (72px e 144px). Com `sizes="72px"` ele
              cai no caminho de descritor `w` e lista de 16w a 3840w, fazendo
              o browser buscar 256px para exibir 72.
              `loading="lazy"` porque a byline está bem abaixo da dobra.
 */}
            <Image
              src={founderPhoto}
              alt="Carlos Alberto Gomes, CEO &amp; Founder da GnosIQ"
              width={72}
              height={72}
              loading="lazy"
              className="w-[72px] h-[72px] rounded-full object-cover border-2 border-accent/50 shrink-0"
            />
            <div>
              <p className="text-[17px] font-bold text-text-primary m-0">
                Carlos Alberto Gomes
              </p>
              <p className="font-mono text-xs text-text-muted tracking-[0.08em] mt-1">
                CEO &amp; FOUNDER · AUTOR DA METODOLOGIA
              </p>
              <a
                href="https://www.linkedin.com/in/carlosalbertogomessp/"
                target="_blank"
                rel="me noopener noreferrer"
                className="inline-block text-xs text-accent-light hover:text-accent underline mt-2 transition-colors"
              >
                Perfil no LinkedIn
              </a>
            </div>
          </div>

          <p className="text-[13.5px] text-text-muted leading-relaxed md:text-right md:max-w-md m-0">
            Dados tratados conforme a LGPD, com consentimento explícito.
            <br />
            A GnosIQ não substitui avaliação clínica.
          </p>
        </div>
      </div>
    </section>
  )
}
