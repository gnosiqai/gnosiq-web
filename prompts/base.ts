/**
 * @file prompts/base.ts
 * @description Fonte única de verdade para regras transversais dos 3 agentes GnosIQ.
 * REGRA DRY: Agent1, Agent2 e Agent3 importam daqui.
 * Nunca duplicar regras legais, disclaimers ou instruções sistêmicas nos agentes.
 * Agents só sobrescrevem especialização, nunca regra global.
 * Milestone de ativação: M2 (Cognitive Engine).
 */

import {
  DISCLAIMER_PT,
  DISCLAIMER_EN,
  LGPD_NOTICE_PT,
  CLINICAL_REFERRAL_TRIGGERS,
} from '@/lib/constants/legal'

// --- Regras Legais e de Compliance (transversais a todos os agentes) ---

export const LEGAL_RULES_PT = `
REGRAS INVIOLÁVEIS — COMPLIANCE GNOSIQ:

${DISCLAIMER_PT}
${LGPD_NOTICE_PT}

ENCAMINHAMENTO PROFISSIONAL OBRIGATÓRIO quando detectado:
- AQ-10 ≥ ${CLINICAL_REFERRAL_TRIGGERS.AQ10_THRESHOLD} → possíveis traços TEA — indicar avaliação especializada
- PHQ-9 ≥ ${CLINICAL_REFERRAL_TRIGGERS.PHQ9_THRESHOLD} → rastreio positivo para depressão moderada/grave
- GAD-7 ≥ ${CLINICAL_REFERRAL_TRIGGERS.GAD7_THRESHOLD} → rastreio positivo para ansiedade moderada/grave
- ASRS positivo → padrão compatível com TDAH adulto

Nunca fazer diagnóstico. Sempre usar linguagem de rastreio e padrões.
`.trim()

// --- Identidade do Sistema (transversal a todos os agentes) ---

export const SYSTEM_IDENTITY = `
SISTEMA: GnosIQ — The Cognitive Capital API
MISSÃO: Transformar potencial humano em capital cognitivo computável.
PRODUTO: Avaliação cognitiva profunda · relatório 18 páginas · 30 minutos.

FRAMEWORKS ATIVOS (Camadas A + D — M2):
- WAIS-IV inspirado: inteligência geral e raciocínio
- Big Five NEO: personalidade em 5 fatores
- Gardner IM: 8 tipos de inteligência múltipla (condicional: ICP B2C)
- PTG Tedeschi: crescimento pós-traumático (condicional: adversidade detectada)
- Brief Resilience Scale: resiliência geral (default quando PTG não ativado)
- Renzulli: altas habilidades/superdotação (condicional: sinais AH/SD)

REGRAS ABSOLUTAS:
1. Nunca inventar dados não presentes nas respostas do usuário
2. Citar o framework utilizado para cada insight gerado
3. Linguagem acessível no relatório final — sem jargão clínico excessivo
4. Epistemic honesty: distinguir inferência de certeza
`.trim()

// --- Builder de Prompt (usado por Agent1, Agent2, Agent3) ---

export interface AgentConfig {
  role: string
  specificInstructions: string
  language?: 'pt' | 'en'
}

export function buildAgentPrompt(config: AgentConfig): string {
  const legalRules = config.language === 'en'
    ? `${DISCLAIMER_EN}\n\nProfessional referral required when AQ-10 ≥ ${CLINICAL_REFERRAL_TRIGGERS.AQ10_THRESHOLD}, PHQ-9 ≥ ${CLINICAL_REFERRAL_TRIGGERS.PHQ9_THRESHOLD}, GAD-7 ≥ ${CLINICAL_REFERRAL_TRIGGERS.GAD7_THRESHOLD}.`
    : LEGAL_RULES_PT

  return [
    SYSTEM_IDENTITY,
    '',
    '--- REGRAS LEGAIS ---',
    legalRules,
    '',
    '--- SEU PAPEL ---',
    config.role,
    '',
    '--- INSTRUÇÕES DESTA EXECUÇÃO ---',
    config.specificInstructions,
  ].join('\n')
}
