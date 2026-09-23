/**
 * @file lib/constants/legal/index.ts
 * @description Textos jurídicos por locale. pt-BR é o único locale e o
 * master: um locale novo entra só depois de localização jurídica própria,
 * nunca por tradução.
 */

import {
  AI_GENERATED_NOTICE_PT,
  CONSENT_ASSESSMENT_PT,
  CONSENT_FEEDBACK_PT,
  CONSENT_TESTIMONIAL_PT,
  METHOD_LIMITATION_PT,
  SAFETY_NOTICE_PT,
  SAFETY_RESOURCES_PT,
} from './pt-BR'

export const LEGAL_BY_LOCALE = {
  'pt-BR': {
    CONSENT_ASSESSMENT: CONSENT_ASSESSMENT_PT,
    CONSENT_FEEDBACK: CONSENT_FEEDBACK_PT,
    CONSENT_TESTIMONIAL: CONSENT_TESTIMONIAL_PT,
    AI_GENERATED_NOTICE: AI_GENERATED_NOTICE_PT,
    METHOD_LIMITATION: METHOD_LIMITATION_PT,
    SAFETY_NOTICE: SAFETY_NOTICE_PT,
    SAFETY_RESOURCES: SAFETY_RESOURCES_PT,
  },
} as const

export type LegalLocale = keyof typeof LEGAL_BY_LOCALE
