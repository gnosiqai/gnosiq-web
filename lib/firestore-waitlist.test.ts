import { describe, it, expect, vi, beforeEach } from 'vitest'

// dedupe e contagem de fundadores.
//
// A dedupe decide se um humano vira um lead ou dois. Com WhatsApp e e-mail
// ambos opcionais, o campo usado na busca passou a ser condicional — e é
// exatamente o tipo de lógica que quebra em silêncio.
//
// lib/firestore.test.ts cobre a validação de credencial; aqui o
// alvo são os helpers de domínio, com o client inteiro mockado.

const where = vi.fn()
const limit = vi.fn()
const get = vi.fn()
const add = vi.fn()
const countGet = vi.fn()
const collection = vi.fn()

vi.mock('@google-cloud/firestore', () => ({
  Firestore: class {
    collection = collection
  },
  Timestamp: { now: () => 'TS' },
  FieldValue: {},
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  process.env.GCP_PROJECT_ID = 'proj'
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
    client_email: 'a@b.iam.gserviceaccount.com',
    private_key: 'k',
  })

  get.mockResolvedValue({ empty: true })
  limit.mockReturnValue({ get })
  where.mockReturnValue({ limit, count: () => ({ get: countGet }) })
  collection.mockReturnValue({ where, add })
})

const load = async () => await import('./firestore')

describe('addToWaitlist — dedupe', () => {
  it('deduplica por e-mail quando ele existe', async () => {
    const { addToWaitlist } = await load()
    await addToWaitlist({ email: 'voce@exemplo.com', whatsapp: '+5511912345678' })
    expect(where).toHaveBeenCalledWith('email', '==', 'voce@exemplo.com')
  })

  it('deduplica por whatsapp quando não há e-mail', async () => {
    const { addToWaitlist } = await load()
    await addToWaitlist({ whatsapp: '+5511912345678' })
    expect(where).toHaveBeenCalledWith('whatsapp', '==', '+5511912345678')
  })

  it('normaliza o e-mail para minúsculo antes de comparar e de gravar', async () => {
    const { addToWaitlist } = await load()
    await addToWaitlist({ email: '  Voce@Exemplo.COM  ' })
    expect(where).toHaveBeenCalledWith('email', '==', 'voce@exemplo.com')
    expect(add).toHaveBeenCalledWith(expect.objectContaining({ email: 'voce@exemplo.com' }))
  })

  it('não grava duplicata quando já existe', async () => {
    get.mockResolvedValue({ empty: false })
    const { addToWaitlist } = await load()
    const result = await addToWaitlist({ email: 'voce@exemplo.com' })
    expect(result).toEqual({ alreadyExists: true })
    expect(add).not.toHaveBeenCalled()
  })

  it('grava os dois canais e o segmento, com os metadados da origem', async () => {
    const { addToWaitlist } = await load()
    await addToWaitlist({
      whatsapp: '+5511912345678',
      email: 'voce@exemplo.com',
      name: '  Carlos  ',
      icpSegment: 'founder',
    })
    expect(add).toHaveBeenCalledWith({
      email: 'voce@exemplo.com',
      whatsapp: '+5511912345678',
      name: 'Carlos',
      icp_segment: 'founder',
      createdAt: 'TS',
      source: 'landing_page',
      milestone: 'M1',
    })
  })

  it('canal ausente é gravado como null, não undefined — Firestore rejeita undefined', async () => {
    const { addToWaitlist } = await load()
    await addToWaitlist({ whatsapp: '+5511912345678' })
    const doc = add.mock.calls[0][0]
    expect(doc.email).toBeNull()
    expect(doc.icp_segment).toBeNull()
    expect(Object.values(doc)).not.toContain(undefined)
  })
})

describe('countFounderTier', () => {
  it('conta pela flag persistida, não pelo total da coleção', async () => {
    countGet.mockResolvedValue({ data: () => ({ count: 42 }) })
    const { countFounderTier } = await load()

    expect(await countFounderTier()).toBe(42)
    expect(where).toHaveBeenCalledWith('founder_tier', '==', true)
  })
})
