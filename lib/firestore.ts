/**
 * @file lib/firestore.ts
 * @description Único entrypoint do client Firestore em toda a aplicação.
 * REGRA DRY + LEI DO PROJETO: nunca inicializar Firestore em outro arquivo.
 * ANTI-PATTERN BANIDO: GoogleAuth.getClient em serverless → PERMISSION_DENIED 7.
 * PADRÃO CANÔNICO: credentials explícitas direto no constructor.
 */

import { Firestore, Timestamp } from '@google-cloud/firestore'

let _db: Firestore | null = null

export function getFirestore(): Firestore {
  if (_db) return _db

 // as duas variáveis são OBRIGATÓRIAS e falham alto. Sem fallback
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
 /** E.164 normalizado, ou null quando a pessoa deixou só e-mail. */
  whatsapp?: string | null
 /** Minúsculo e aparado, ou null quando a pessoa deixou só WhatsApp. */
  email?: string | null
  name?: string
  icpSegment?: string | null
}

/**
 * WhatsApp e e-mail são ambos opcionais isoladamente, mas pelo menos
 * um é obrigatório — a rota já garante isso antes de chamar aqui. A dedupe
 * roda no canal que existir, com e-mail tendo precedência quando os dois
 * vierem: é o identificador estável desde a v1, e é por ele que a ordenação
 * da lista é conferida.
 *
 * Uma inscrição só-WhatsApp seguida de uma só-e-mail da mesma pessoa não é
 * detectável e cria dois docs. Isso é aceito conscientemente: o alternativo
 * seria pedir os dois campos, que é exatamente o atrito que a v2 remove.
 */
export async function addToWaitlist({
  whatsapp,
  email,
  name,
  icpSegment,
}: WaitlistEntry): Promise<{ alreadyExists: boolean }> {
  const db = getFirestore()
  const ref = db.collection(COLLECTIONS.WAITLIST)

  const normalizedEmail = email ? email.toLowerCase().trim() : null
  const normalizedWhatsapp = whatsapp ?? null

  const dedupeField = normalizedEmail ? 'email' : 'whatsapp'
  const dedupeValue = normalizedEmail ?? normalizedWhatsapp

  if (dedupeValue) {
    const existing = await ref.where(dedupeField, '==', dedupeValue).limit(1).get()
    if (!existing.empty) return { alreadyExists: true }
  }

  await ref.add({
    email: normalizedEmail,
    whatsapp: normalizedWhatsapp,
    name: (name ?? '').trim(),
    icp_segment: icpSegment ?? null,
    createdAt: Timestamp.now(),
    source: 'landing_page',
    milestone: 'M1',
  })

  return { alreadyExists: false }
}

/**
 * Total de inscritos na lista — `count(waitlist)`.
 *
 * Esta é a fonte do NÚMERO EXIBIDO na página. A condição de entrada é
 * determinada pelo `createdAt` que o servidor grava no instante da inscrição:
 * imutável, atribuído server-side, e portanto já decidido nesse instante. O
 * total de inscritos é, por definição, o total de condições determinadas.
 *
 * Exibir a partir daqui e não da flag persistida é deliberado: a flag é
 * liquidação de um direito que já existe, e a liquidação roda em lote. Uma
 * página que só contasse liquidações mostraria menos do que a realidade da
 * coleção, e ficaria parada entre lotes.
 *
 * Aggregation query: o custo não cresce com a coleção e nenhum documento
 * (nem dado pessoal) trafega para o processo.
 */
export async function countWaitlist(): Promise<number> {
  const db = getFirestore()
  const snapshot = await db.collection(COLLECTIONS.WAITLIST).count().get()

  return snapshot.data().count
}

/**
 * Contagem de condições já liquidadas — `count(founder_tier == true)`.
 *
 * NÃO alimenta a exibição pública. A flag é derivada da ordenação por
 * `createdAt` e gravada em lote por um processo operado fora deste
 * repositório; serve para conferir a liquidação contra a determinação, não
 * para dizer ao público quantas vagas restam.
 *
 * Mesma aggregation query, mesma garantia: nenhum documento trafega.
 */
export async function countFounderTier(): Promise<number> {
  const db = getFirestore()
  const snapshot = await db
    .collection(COLLECTIONS.WAITLIST)
    .where('founder_tier', '==', true)
    .count()
    .get()

  return snapshot.data().count
}
