/**
 * @file lib/constants/faq.ts
 * @description Fonte única do FAQ da LP (GNO-115).
 *
 * O bloco visível e o JSON-LD FAQPage leem DESTE array. Google trata
 * divergência entre schema e conteúdo visível como structured data spam —
 * duplicar as perguntas em dois lugares é como isso acontece na prática.
 *
 * As respostas são texto puro de propósito: `Answer.text` do schema.org não
 * aceita JSX, e manter os dois lados idênticos exige uma forma só.
 *
 * CFP: nenhuma resposta usa a palavra "diagnóstico" (nem flexões).
 * VETO GATE: nenhuma resposta traz preço numérico.
 */

import { FILL_MINUTES, DELIVERY_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'É um teste de QI?',
    answer:
      'Não. O GnoScore™ é um índice do seu perfil cognitivo nos domínios do modelo CHC — mais amplo que um número único de QI e focado em como você processa informação, não em rotular pessoas.',
  },
  {
    question: 'Que dados são coletados e quem acessa?',
    answer:
      'Coletamos apenas o que você informa no formulário — WhatsApp ou e-mail, e opcionalmente o seu perfil — para avisar sobre o acesso ao beta. O acesso é restrito à equipe da GnosIQ e o tratamento segue a LGPD (Lei 13.709/2018), com consentimento explícito.',
  },
  {
    question: 'Meus resultados treinam IA?',
    answer:
      'Não. Seus dados são processados exclusivamente para gerar o seu relatório e nunca são usados para treinar modelos de IA externos.',
  },
  {
    question: 'Substitui psicólogo?',
    answer:
      'Não. A GnosIQ não substitui avaliação clínica. O relatório tem finalidade informativa e de desenvolvimento pessoal; se você procura avaliação clínica, busque um profissional habilitado.',
  },
  {
    question: 'Quanto tempo leva e como recebo?',
    answer:
      `A avaliação é adaptativa e leva cerca de ${FILL_MINUTES} minutos, direto do navegador. O relatório de ${REPORT_PAGES} páginas com o seu GnoScore™ fica pronto em cerca de ${DELIVERY_MINUTES} minutos e chega pelo canal que você cadastrou.`,
  },
  {
    question: 'Quando o beta abre?',
    answer:
      `A GnosIQ está em fase de pré-lançamento e ainda não tem data pública de abertura. Quem está na lista de espera é avisado primeiro, e os ${FOUNDER_SLOTS} primeiros entram nas Condições de Fundador.`,
  },
  {
    question: 'Posso apagar meus dados?',
    answer:
      'Pode, a qualquer momento. Escreva para hello@gnosiq.ai pedindo a exclusão e removemos os seus dados da lista de espera, conforme os direitos previstos na LGPD.',
  },
] as const
