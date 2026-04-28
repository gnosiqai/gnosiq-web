/**
 * @file lib/constants/legal.ts
 * @description Fonte única de verdade para disclaimers clínicos e avisos LGPD/GDPR.
 * REGRA DRY: nunca repetir este conteúdo em componentes, páginas ou prompts.
 * Importar sempre deste arquivo.
 */

// --- Disclaimer Clínico ---

export const DISCLAIMER_PT =
  'Este relatório identifica padrões cognitivos e comportamentais com base em instrumentos ' +
  'de rastreio validados internacionalmente. NÃO substitui avaliação diagnóstica conduzida ' +
  'por neurologista, psicólogo clínico ou psiquiatra habilitado.'

export const DISCLAIMER_EN =
  'This report identifies cognitive and behavioral patterns using validated screening ' +
  'instruments. It does NOT replace clinical diagnosis by a licensed neurologist, ' +
  'clinical psychologist, or psychiatrist.'

// --- Aviso LGPD / GDPR ---

export const LGPD_NOTICE_PT =
  'Seus dados são processados exclusivamente para geração deste relatório e nunca ' +
  'utilizados para treinamento de modelos de IA externos. ' +
  'Conforme LGPD (Lei 13.709/2018).'

export const LGPD_NOTICE_EN =
  'Your data is processed solely for generating this report and never used to train ' +
  'external AI models. Per LGPD (Brazilian Data Protection Law 13.709/2018) and GDPR.'

// --- Gatilhos de Encaminhamento Clínico (Agent1 CAT) ---

export const CLINICAL_REFERRAL_TRIGGERS = {
  AQ10_THRESHOLD: 6,       // possíveis traços TEA — acionar RAADS-R + aviso profissional
  PHQ9_THRESHOLD: 10,      // rastreio depressão moderada/grave
  GAD7_THRESHOLD: 10,      // rastreio ansiedade moderada/grave
  ASRS_POSITIVE: true,     // padrão TDAH confirmado pelo ASRS
} as const

// ─── Privacy Policy ────────────────────────────────────────────────
// GNO-49 | 2026-04-28
export const PRIVACY_POLICY_VERSION = '1.0';
export const PRIVACY_POLICY_DATE = '2026-04-28';
export const PRIVACY_POLICY_URL = '/privacy';

// Disclaimer canônico CFP/LGPD — usar em todos os relatórios de avaliação
export const COGNITIVE_ASSESSMENT_DISCLAIMER =
  'Este relatório é gerado por IA e não substitui diagnóstico clínico. ' +
  'Os dados são confidenciais e nunca saem do perímetro GnosIQ.';
