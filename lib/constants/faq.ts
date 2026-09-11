/**
 * @file lib/constants/faq.ts
 * @description Fonte única do FAQ da LP.
 *
 * O bloco visível e o JSON-LD FAQPage leem DESTE array. Google trata
 * divergência entre schema e conteúdo visível como structured data spam —
 * duplicar as perguntas em dois lugares é como isso acontece na prática.
 *
 * As respostas são texto puro de propósito: `Answer.text` do schema.org não
 * aceita JSX, e manter os dois lados idênticos exige uma forma só.
 *
 * CFP: nenhuma resposta usa a palavra "diagnóstico" (nem flexões).
 * Preço: R$97 público por decisão GATE 2026-09-08. A única resposta com
 * cifra é a das Condições de Fundador, sempre "R$97" (moeda completa).
 */

import { DELIVERY_MINUTES, REPORT_PAGES } from '@/lib/constants/metrics'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'É um teste de QI?',
    answer:
      'Não. O GnoScore™ é um índice do seu perfil cognitivo nos domínios do modelo CHC: mais amplo que um número único de QI e focado em como você processa informação, não em rotular pessoas.',
  },
  {
    question: 'Que dados são coletados e quem acessa?',
    answer:
      'Coletamos apenas o que você informa no formulário (WhatsApp ou e-mail, e opcionalmente o seu perfil) para comunicação sobre o acesso antecipado ao beta e as condições de fundador. O acesso é restrito à equipe da GnosIQ e o tratamento segue a LGPD (Lei 13.709/2018), com consentimento explícito.',
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
      `Cerca de ${DELIVERY_MINUTES} minutos do início da avaliação até o relatório de ${REPORT_PAGES} páginas, direto do navegador, sem semanas de espera. A avaliação é adaptativa: se ajusta às suas respostas, por isso o tempo varia um pouco de pessoa para pessoa.`,
  },
  {
    question: 'Quando o beta abre?',
    answer:
      `A GnosIQ está em fase de pré-lançamento e ainda não tem data pública de abertura. Quem está na lista de espera é avisado primeiro, e os ${FOUNDER_SLOTS} primeiros entram nas Condições de Fundador.`,
  },
  {
    question: 'Quanto custa? O que é “preço de fundador travado”?',
    answer:
      `Os ${FOUNDER_SLOTS} primeiros inscritos na lista de espera (ordem de inscrição, um por e-mail) entram nas Condições de Fundador: a sua avaliação individual custa R$97 no lançamento, e esse valor fica travado para você enquanto o serviço existir e sua conta estiver ativa, mesmo quando o preço público for outro. Não há cobrança agora: você só paga quando o acesso abrir e decidir fazer a avaliação. Fundadores também refazem a avaliação sem custo uma vez, entre o 6º e o 9º mês após a primeira avaliação concluída. O preço público será anunciado no lançamento; não há data comprometida.`,
  },
  {
    question: 'Posso apagar meus dados?',
    answer:
      'Pode, a qualquer momento. Escreva para hello@gnosiq.ai pedindo a exclusão e removemos os seus dados da lista de espera, conforme os direitos previstos na LGPD.',
  },
] as const
