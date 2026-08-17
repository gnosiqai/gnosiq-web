// GNO-113: materialização idempotente de `founder_tier` / `founder_position`
// sobre a coleção `waitlist`.
//
// PRINCÍPIO: `founder_tier` NÃO é decidido no momento da inscrição — contar
// "sou o 87º?" dentro de uma request serverless é condição de corrida, e um
// off-by-one na fronteira dos 100 vira promessa pública quebrada. A flag é
// DERIVADA da ordenação por `createdAt` e materializada aqui. Rodar N vezes
// produz sempre o mesmo estado; a contagem se reconta na fonte, nunca se
// incrementa. O backfill dos inscritos existentes é caso particular deste
// mesmo código — não existe rotina especial de backfill.
//
// USO:
//   node scripts/founder-tier-materialize.mjs            # dry-run (default)
//   node scripts/founder-tier-materialize.mjs --apply    # escreve + read-back
//   npm run founder:materialize -- --apply
//
// CADÊNCIA: manual — após cada lote de divulgação e antes de fechar os 100.
//
// TRAVAS DE SEGURANÇA (coleção com PII de beta):
//   1. Nunca imprime PII. A leitura usa projeção (`.select`) — e-mail, nome e
//      telefone jamais entram na memória do processo, muito menos no stdout.
//      O relatório carrega apenas contagens, doc IDs e timestamps ISO.
//   2. Escreve SOMENTE `founder_tier` e `founder_position`, via `update()`.
//      `update()` (e não `set(..., {merge:true})`) porque falha alto se o doc
//      não existir: nenhum doc é criado, nenhum é deletado, nenhum outro
//      campo é tocado.
//   3. Credencial via ADC/service account do ambiente — nunca do repositório.
//
// `sonar.sources` não inclui scripts/, então este arquivo fica fora do
// Quality Gate de cobertura (mesma convenção de generate-favicon.mjs).

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { Firestore, FieldValue, Timestamp } from '@google-cloud/firestore'

// --- Constantes de domínio ---

const COLLECTION = 'waitlist' // COLLECTIONS.WAITLIST em lib/firestore.ts
const TIMESTAMP_FIELD = 'createdAt' // nome REAL do campo (o doc da issue dizia `created_at`)
const LEGACY_TIMESTAMP_FIELD = 'created_at' // nunca existiu no repo; verificado por segurança
const FOUNDER_LIMIT = 100
const BATCH_LIMIT = 500 // teto do Firestore por WriteBatch

// projectId espelha lib/firestore.ts, que é o entrypoint único do Firestore na
// APLICAÇÃO. Este script é ferramenta administrativa avulsa rodada da máquina
// do founder: não passa pelo bundler, não pode importar o módulo .ts, e precisa
// aceitar ADC (que o caminho serverless não usa). Se o projectId mudar lá, muda
// aqui — são os dois únicos lugares.
const DEFAULT_PROJECT_ID = 'project-6482cadc-95f4-4adb-a0c'

// Só executa quando invocado direto. Importado (verificação da ordenação e do
// diff sem tocar no Firestore), exporta apenas as funções puras.
const IS_MAIN = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

// --- Credencial ---

/**
 * Resolve a credencial admin a partir do ambiente, na ordem:
 *   1. GOOGLE_APPLICATION_CREDENTIALS_JSON — JSON inline (padrão do runtime Vercel)
 *   2. GOOGLE_APPLICATION_CREDENTIALS      — caminho para o key file
 *   3. ADC implícito (gcloud auth application-default login / metadata server)
 * Aborta com instruções se nada estiver configurado.
 */
async function buildFirestore() {
  const projectId =
    process.env.FIRESTORE_PROJECT_ID || process.env.GCP_PROJECT_ID || DEFAULT_PROJECT_ID

  const inlineJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (inlineJson) {
    const parsed = JSON.parse(inlineJson)
    console.log('credencial: GOOGLE_APPLICATION_CREDENTIALS_JSON (inline)')
    return new Firestore({
      projectId,
      credentials: {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replaceAll(String.raw`\n`, '\n'),
      },
    })
  }

  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (keyFile) {
    // Validado antes de qualquer chamada de rede — erro de credencial deve
    // falhar limpo, antes de tocar o dado. A mensagem não ecoa o conteúdo.
    try {
      JSON.parse(await readFile(keyFile, 'utf8'))
    } catch (err) {
      console.error(`ABORT: GOOGLE_APPLICATION_CREDENTIALS não é um key file JSON legível (${err.code ?? 'parse error'}).`)
      process.exit(2)
    }
    console.log('credencial: GOOGLE_APPLICATION_CREDENTIALS (key file)')
    return new Firestore({ projectId, keyFilename: keyFile })
  }

  console.error('ABORT: nenhuma credencial admin configurada no ambiente.')
  console.error('Configure UMA das opções abaixo antes de rodar:')
  console.error('  export GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/service-account.json')
  console.error('  export GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat service-account.json)"')
  console.error('A chave é provisionada no GCP Console e NUNCA vai para o repositório.')
  process.exit(2)
}

// --- Leitura e ordenação ---

/** Milissegundos do campo de timestamp, ou null se ausente/de tipo inesperado. */
function toMillis(value) {
  if (value instanceof Timestamp) return value.toMillis()
  if (value instanceof Date) return value.getTime()
  return null
}

/**
 * Lê a coleção inteira em projeção (sem PII) e separa docs ordenáveis dos
 * excluídos. Docs sem timestamp válido NUNCA recebem posição inventada.
 */
async function readCollection(db) {
  const snap = await db
    .collection(COLLECTION)
    .select(TIMESTAMP_FIELD, LEGACY_TIMESTAMP_FIELD, 'founder_tier', 'founder_position')
    .get()

  const ordered = []
  const excluded = []

  for (const doc of snap.docs) {
    const data = doc.data()
    const millis = toMillis(data[TIMESTAMP_FIELD])
    const entry = {
      id: doc.id,
      ref: doc.ref,
      millis,
      tier: data.founder_tier,
      position: data.founder_position,
      hasLegacyField: data[LEGACY_TIMESTAMP_FIELD] !== undefined,
    }
    if (millis === null) excluded.push(entry)
    else ordered.push(entry)
  }

  return { total: snap.size, ordered: sortOrdered(ordered), excluded }
}

/**
 * Ordenação determinística: `createdAt` ASC, docId ASC como desempate para
 * timestamps idênticos (`Timestamp.now()` tem resolução de ms — colisão é
 * improvável, não impossível). Sem o desempate, duas execuções poderiam trocar
 * posições entre si e a idempotência seria falsa.
 */
function sortOrdered(docs) {
  return [...docs].sort(
    (a, b) => (a.millis - b.millis) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  )
}

// --- Diff ---

/**
 * Estado desejado por doc e as escritas mínimas para chegar lá.
 * Posição >100 recebe `founder_tier: false` EXPLÍCITO (não ausência): é
 * queryável e autodocumentado, e `founder_position` é removido.
 */
function planWrites(ordered) {
  const plan = { toTrue: [], toFalse: [], noop: [], positionFix: [] }

  ordered.forEach((doc, index) => {
    const isFounder = index < FOUNDER_LIMIT
    const position = index + 1

    if (isFounder) {
      const correct = doc.tier === true && doc.position === position
      if (correct) {
        plan.noop.push(doc)
      } else {
        const update = { founder_tier: true, founder_position: position }
        // Já era fundador e só a posição mudou: classificar como correção,
        // não como "novo fundador" — o relatório não pode inflar o placar.
        if (doc.tier === true) plan.positionFix.push({ doc, update, from: doc.position, to: position })
        else plan.toTrue.push({ doc, update, to: position })
      }
      return
    }

    const correct = doc.tier === false && doc.position === undefined
    if (correct) plan.noop.push(doc)
    else plan.toFalse.push({ doc, update: { founder_tier: false, founder_position: FieldValue.delete() } })
  })

  return plan
}

// --- Relatório (somente contagens, doc IDs e timestamps) ---

function iso(millis) {
  return new Date(millis).toISOString()
}

function countWrites(plan) {
  return plan.toTrue.length + plan.positionFix.length + plan.toFalse.length
}

function report({ total, ordered, excluded }, plan, apply) {
  const writes = countWrites(plan)
  const founders = Math.min(FOUNDER_LIMIT, ordered.length)

  console.log('')
  console.log(`=== GNO-113 · founder_tier — ${apply ? 'APPLY' : 'DRY-RUN'} ===`)
  console.log(`coleção .................. ${COLLECTION}`)
  console.log(`campo de ordenação ....... ${TIMESTAMP_FIELD} ASC, docId ASC (desempate)`)
  console.log(`total de docs lidos ...... ${total}`)
  console.log(`ordenáveis (com ${TIMESTAMP_FIELD}) . ${ordered.length}`)
  console.log(`excluídos (sem timestamp)  ${excluded.length}`)
  console.log('')
  console.log(`fundadores esperados ..... ${founders}  (min(${FOUNDER_LIMIT}, ordenáveis))`)
  console.log(`  a marcar true .......... ${plan.toTrue.length}`)
  console.log(`  correções de posição ... ${plan.positionFix.length}`)
  console.log(`  a marcar false ......... ${plan.toFalse.length}`)
  console.log(`  já corretos (no-op) .... ${plan.noop.length}`)
  console.log(`ESCRITAS ................. ${writes}`)

  if (ordered.length > 0) {
    const first = ordered[0]
    const last = ordered[Math.min(founders, ordered.length) - 1]
    console.log('')
    console.log(`janela dos fundadores .... #1 ${first.id} @ ${iso(first.millis)}`)
    console.log(`                        .. #${founders} ${last.id} @ ${iso(last.millis)}`)
    console.log(`vagas restantes .......... ${Math.max(0, FOUNDER_LIMIT - founders)}`)
  }

  if (excluded.length > 0) {
    console.log('')
    console.log(`WARNING: ${excluded.length} doc(s) sem \`${TIMESTAMP_FIELD}\` — NÃO recebem posição`)
    console.log('         (nenhuma posição é inventada; resolver na fonte e re-rodar)')
    for (const doc of excluded) {
      const legacy = doc.hasLegacyField ? ` [tem \`${LEGACY_TIMESTAMP_FIELD}\` legado]` : ''
      const stale = doc.tier !== undefined ? ` [founder_tier=${doc.tier} preexistente, intocado]` : ''
      console.log(`         - ${doc.id}${legacy}${stale}`)
    }
  }

  const staleTrueExcluded = excluded.filter((d) => d.tier === true)
  if (staleTrueExcluded.length > 0) {
    console.log('')
    console.log(`WARNING: ${staleTrueExcluded.length} doc(s) excluído(s) já carrega(m) \`founder_tier: true\`.`)
    console.log('         Ficam intocados (trava: sem timestamp, sem posição) mas CONTAM no read-back.')
    console.log('         Decisão do founder — este script não arbitra.')
  }

  return { writes, founders, staleTrueExcluded: staleTrueExcluded.length }
}

// --- Escrita + read-back ---

async function applyWrites(db, plan) {
  const all = [
    ...plan.toTrue.map((w) => [w.doc.ref, w.update]),
    ...plan.positionFix.map((w) => [w.doc.ref, w.update]),
    ...plan.toFalse.map((w) => [w.doc.ref, w.update]),
  ]

  for (let i = 0; i < all.length; i += BATCH_LIMIT) {
    const chunk = all.slice(i, i + BATCH_LIMIT)
    const batch = db.batch()
    for (const [ref, update] of chunk) batch.update(ref, update)
    await batch.commit()
    console.log(`batch commitado: ${chunk.length} doc(s)`)
  }

  return all.length
}

/** Conta `founder_tier == true` na fonte. Aggregation query, sem ler campos. */
async function countFounders(db) {
  const query = db.collection(COLLECTION).where('founder_tier', '==', true)
  try {
    const agg = await query.count().get()
    return agg.data().count
  } catch {
    // Fallback para SDK sem aggregation: projeção vazia, nenhum campo trafega.
    const snap = await query.select().get()
    return snap.size
  }
}

// --- Main ---

async function main() {
  const argv = process.argv.slice(2)
  const apply = argv.includes('--apply')

  const unknown = argv.filter((a) => a !== '--apply')
  if (unknown.length > 0) {
    console.error(`ABORT: flag desconhecida: ${unknown.join(', ')}`)
    console.error('Uso: node scripts/founder-tier-materialize.mjs [--apply]')
    return 2
  }

  const db = await buildFirestore()

  const state = await readCollection(db)
  const plan = planWrites(state.ordered)
  const { writes, founders, staleTrueExcluded } = report(state, plan, apply)

  if (!apply) {
    console.log('')
    console.log(writes === 0
      ? 'DRY-RUN: estado já materializado — 0 escritas necessárias.'
      : `DRY-RUN: nada foi escrito. Rode com --apply para executar as ${writes} escrita(s).`)
    return 0
  }

  console.log('')
  const written = await applyWrites(db, plan)
  console.log(`APPLY concluído: ${written} escrita(s).`)

  // Read-back OBRIGATÓRIO: reconta na fonte. Divergência = FALHA, não warning.
  const expected = founders + staleTrueExcluded
  const actual = await countFounders(db)

  console.log('')
  console.log(`read-back: founder_tier == true → ${actual} (esperado ${expected})`)

  if (actual !== expected) {
    console.error('FALHA: read-back divergente. Estado do Firestore NÃO confere com o plano.')
    console.error('Investigar antes de qualquer anúncio público baseado nesta contagem.')
    return 1
  }

  // Prova de idempotência: replaneja a partir de uma LEITURA NOVA e exige 0
  // escritas. Replanejar sobre o snapshot antigo provaria nada.
  const after = await readCollection(db)
  const residualWrites = countWrites(planWrites(after.ordered))

  console.log(`prova de idempotência: replanejamento pós-apply → ${residualWrites} escrita(s)`)

  if (residualWrites !== 0) {
    console.error('FALHA: re-execução ainda planeja escritas — materialização não é idempotente.')
    return 1
  }

  console.log('')
  console.log('OK: read-back confere e re-execução é no-op.')
  return 0
}

if (IS_MAIN) {
  process.exit(await main())
}

export { planWrites, countWrites, toMillis, sortOrdered, report, FOUNDER_LIMIT }
