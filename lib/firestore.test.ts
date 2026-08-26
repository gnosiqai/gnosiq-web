/**
 * trava do init de credencial.
 *
 * Mudança T1: o project-id saiu de hardcoded para variável de ambiente. O risco
 * que estes testes seguram é o de um fallback silencioso reaparecer — um
 * default que faça a aplicação escrever no projeto GCP errado sem ninguém ver.
 * Faltando qualquer variável, a inicialização tem que MORRER, não adivinhar.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const VALID_CREDENTIALS = JSON.stringify({
  client_email: 'test@example.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\\nFAKE\\n-----END PRIVATE KEY-----\\n',
})

// Importa em módulo novo a cada teste: getFirestore memoiza em escopo de
// módulo, então um import compartilhado mascararia o caminho de validação.
async function loadGetFirestore() {
  vi.resetModules()
  return (await import('./firestore')).getFirestore
}

describe('getFirestore — validação de ambiente ()', () => {
  const saved = { ...process.env }

  beforeEach(() => {
    delete process.env.GCP_PROJECT_ID
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  })

  afterEach(() => {
    process.env = { ...saved }
  })

  it('falha alto quando GCP_PROJECT_ID está ausente', async () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = VALID_CREDENTIALS
    const getFirestore = await loadGetFirestore()
    expect(() => getFirestore()).toThrow(/GCP_PROJECT_ID is not set/)
  })

  it('falha alto quando GCP_PROJECT_ID está vazio — sem cair em default', async () => {
    process.env.GCP_PROJECT_ID = ''
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = VALID_CREDENTIALS
    const getFirestore = await loadGetFirestore()
    expect(() => getFirestore()).toThrow(/GCP_PROJECT_ID is not set/)
  })

  it('falha alto quando a credencial está ausente', async () => {
    process.env.GCP_PROJECT_ID = 'some-project'
    const getFirestore = await loadGetFirestore()
    expect(() => getFirestore()).toThrow(/GOOGLE_APPLICATION_CREDENTIALS_JSON is not set/)
  })

  it('não restou project-id hardcoded: com credencial válida e sem env, ainda morre', async () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = VALID_CREDENTIALS
    const getFirestore = await loadGetFirestore()
 // Se algum default sobrevivesse, esta chamada teria sucesso silenciosamente.
    expect(() => getFirestore()).toThrow()
  })

  it('a mensagem de erro cita só o NOME da variável, nunca o conteúdo da credencial', async () => {
 // app/api/health-gcp/route.ts devolve `err.message` no corpo da resposta.
    process.env.GCP_PROJECT_ID = 'some-project'
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = VALID_CREDENTIALS
    const getFirestore = await loadGetFirestore()
    try {
      getFirestore()
    } catch (err) {
      expect((err as Error).message).not.toContain('PRIVATE KEY')
      expect((err as Error).message).not.toContain('iam.gserviceaccount.com')
    }
  })

  it('memoiza: duas chamadas devolvem a mesma instância', async () => {
    process.env.GCP_PROJECT_ID = 'some-project'
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = VALID_CREDENTIALS
    const getFirestore = await loadGetFirestore()
    expect(getFirestore()).toBe(getFirestore())
  })
})
