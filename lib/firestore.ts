/**
 * @file lib/firestore.ts
 * @description Único entrypoint do client Firestore em toda a aplicação.
 * REGRA DRY + LEI DO PROJETO: nunca inicializar Firestore em outro arquivo.
 * ANTI-PATTERN BANIDO: GoogleAuth.getClient() em serverless → PERMISSION_DENIED 7.
 * PADRÃO CANÔNICO: credentials explícitas direto no constructor.
 */

import { Firestore, Timestamp } from '@google-cloud/firestore'

let _db: Firestore | null = null

export function getFirestore(): Firestore {
  if (_db) return _db

  // GNO-105: as duas variáveis são OBRIGATÓRIAS e falham alto. Sem fallback
  // silencioso — nem para um project-id hardcoded, nem para ADC implícito.
  // Um default aqui significaria escrever no projeto errado sem ninguém notar;
  // preferimos derrubar a rota e ver o erro no health check.
  // As mensagens citam apenas NOMES de variáveis, nunca conteúdo de credencial
  // (app/api/health-gcp/route.ts ecoa `err.message` na resposta).
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('[GnosIQ] GCP_PROJECT_ID is not set')
  }

  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!raw) {
    throw new Error('[GnosIQ] GOOGLE_APPLICATION_CREDENTIALS_JSON is not set')
  }

  const credentials = JSON.parse(raw) as {
    client_email: string
    private_key: string
  }

  _db = new Firestore({
    projectId,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replaceAll(String.raw`\n`, '\n'),
    },
  })

  return _db
}

// --- Coleções canônicas ---
export const COLLECTIONS = {
  WAITLIST:    'waitlist',
  EVALUATIONS: 'evaluations', // M2
  REPORTS:     'reports',     // M2
  TENANTS:     'tenants',     // M3
} as const

// --- Helpers de domínio ---

interface WaitlistEntry {
  email: string
  name: string
  icpSegment?: string | null
}

export async function addToWaitlist({ email, name, icpSegment }: WaitlistEntry): Promise<{ alreadyExists: boolean }> {
  const db = getFirestore()
  const ref = db.collection(COLLECTIONS.WAITLIST)

  const existing = await ref.where('email', '==', email.toLowerCase()).limit(1).get()
  if (!existing.empty) return { alreadyExists: true }

  await ref.add({
    email: email.toLowerCase(),
    name: name.trim(),
    icp_segment: icpSegment ?? null,
    createdAt: Timestamp.now(),
    source: 'landing_page',
    milestone: 'M1',
  })

  return { alreadyExists: false }
}
