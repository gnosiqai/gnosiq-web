/**
 * @file lib/constants/legal.ts
 * @description Fonte única de verdade para disclaimers clínicos e avisos LGPD/GDPR.
 * REGRA DRY: nunca repetir este conteúdo em componentes, páginas ou prompts.
 * Importar sempre deste arquivo.
 */

// --- Disclaimer Clínico ---

export const DISCLAIMER_PT =
  'Este relatório descreve padrões cognitivos e de personalidade a partir das suas respostas. ' +
  'NÃO substitui avaliação diagnóstica conduzida por psicólogo, psiquiatra ou neurologista ' +
  'habilitado.'

export const DISCLAIMER_EN =
  'This report describes cognitive and personality patterns based on your answers. ' +
  'It does NOT replace a diagnostic assessment conducted by a licensed psychologist, ' +
  'psychiatrist or neurologist.'

// --- Aviso LGPD / GDPR ---

export const LGPD_NOTICE_PT =
  'Seus dados são processados exclusivamente para geração deste relatório e nunca ' +
  'utilizados para treinamento de modelos de IA externos. ' +
  'Conforme LGPD (Lei 13.709/2018).'

export const LGPD_NOTICE_EN =
  'Your data is processed solely for generating this report and never used to train ' +
  'external AI models. Per LGPD (Brazilian Data Protection Law 13.709/2018) and GDPR.'

// ─── Privacy Policy ────────────────────────────────────────────────
// | 2026-04-28
// 1.0 -> 1.1. A v1.0 afirmava que telefone NÃO era coletado; a LP v2
// coleta WhatsApp. Mudança material de escopo de dados exige carimbo novo —
// uma política que muda de conteúdo sem mudar de versão mente sobre si mesma.
export const PRIVACY_POLICY_VERSION = '1.1';
export const PRIVACY_POLICY_DATE = '2026-08-25';
export const PRIVACY_POLICY_URL = '/privacy';

// --- Disclaimer da landing page ------------------------------
// CFP: a LP não pode conter a palavra "diagnóstico" em nenhuma flexão.
// DISCLAIMER_PT acima diz "avaliação diagnóstica" e por isso NÃO pode ser
// renderizado na LP — ele continua válido para relatório e páginas legais,
// onde o termo técnico é apropriado e exigido.
export const CLINICAL_DISCLAIMER_LP = 'A GnosIQ não substitui avaliação clínica.'

// --- Textos canônicos pt-BR (consentimentos, avisos e bloco de segurança) ---
export * from './legal/pt-BR'
