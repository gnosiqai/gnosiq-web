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

  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!raw) {
    throw new Error('[GnosIQ] GOOGLE_APPLICATION_CREDENTIALS_JSON is not set')
  }

  const credentials = JSON.parse(raw) as {
    client_email: string
    private_key: string
  }

  _db = new Firestore({
    projectId: 'project-6482cadc-95f4-4adb-a0c',
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
}

export async function addToWaitlist({ email, name }: WaitlistEntry): Promise<{ alreadyExists: boolean }> {
  const db = getFirestore()
  const ref = db.collection(COLLECTIONS.WAITLIST)

  const existing = await ref.where('email', '==', email.toLowerCase()).limit(1).get()
  if (!existing.empty) return { alreadyExists: true }

  await ref.add({
    email: email.toLowerCase(),
    name: name.trim(),
    createdAt: Timestamp.now(),
    source: 'landing_page',
    milestone: 'M1',
  })

  return { alreadyExists: false }
}
