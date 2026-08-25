import { describe, it, expect, vi, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

/**
 * Captura o payload do Resend sem sair para a rede.
 *
 * GNO-122 — o mock migrou de `@sendgrid/mail` para `resend` junto com o
 * provedor. A trava de voz continua olhando exatamente os mesmos campos
 * (subject, text, html) dos MESMOS dois templates: o que mudou foi por onde
 * eles saem, não o que eles dizem.
 */
const sentMessages: Record<string, unknown>[] = []

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (msg: Record<string, unknown>) => {
        sentMessages.push(msg)
        return { data: { id: 'test-message-id' }, error: null }
      },
    }
  },
}))

vi.mock('@/lib/firestore', () => ({
  addToWaitlist: async () => ({ alreadyExists: false }),
}))

vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: vi.fn(),
}))

import Home from '@/app/page'
import Privacy from '@/app/privacy/page'
import Terms from '@/app/terms/page'
import { sendWaitlistConfirmation } from '@/lib/email'
import { POST } from '@/app/api/waitlist/route'

/**
 * GNO-121 — trava permanente de voz da marca.
 *
 * Regra do CMO doc (`CMO_GNOSIQ_v5.md`, linhas 56 e 81): travessão (—, U+2014)
 * e meia-risca (–, U+2013) são PROIBIDOS em texto público. O substituto é
 * hífen com espaços, vírgula, dois-pontos ou parênteses.
 *
 * A regressão que originou esta issue não veio de descuido de escrita: veio de
 * uma spec redigida com travessões sendo aplicada por cima de um mockup que o
 * founder já havia corrigido à mão. Revisão humana não segura isso — só um
 * teste segura. Por isso a trava roda sobre a superfície INTEIRA (HTML
 * renderizado das páginas públicas + meta tags + templates de e-mail), e não
 * sobre um arquivo ou outro.
 *
 * Comentários de código estão fora do alvo de propósito: não são superfície
 * pública, e proibi-los custaria legibilidade sem nenhum ganho de marca.
 */

const EM_DASH = '—'
const EN_DASH = '–'
const DASHES = new RegExp(`[${EM_DASH}${EN_DASH}]`, 'g')

/**
 * ALLOWLIST — frases canônicas congeladas do CMO doc ("ativos congelados"),
 * que ficam intactas SE usadas verbatim.
 *
 * Está vazia hoje: nenhuma frase congelada do CMO doc em uso na LP ou nas
 * páginas legais contém travessão (os disclaimers canônicos de
 * `lib/constants/legal.ts` não têm nenhum). A lista existe para o dia em que
 * uma frase congelada COM travessão entrar em produção — e a entrada tem que
 * ser a frase exata, verbatim, nunca um trecho solto ou um regex.
 */
const CANONICAL_ALLOWLIST: readonly string[] = []

/** Remove as frases canônicas antes de procurar travessão no resto. */
function stripAllowlisted(content: string): string {
  return CANONICAL_ALLOWLIST.reduce(
    (acc, phrase) => acc.split(phrase).join(''),
    content,
  )
}

/** Contexto legível ao redor de cada violação — erro que diz ONDE consertar. */
function findDashes(content: string): string[] {
  const stripped = stripAllowlisted(content)
  const hits: string[] = []

  for (const match of stripped.matchAll(DASHES)) {
    const at = match.index ?? 0
    hits.push(
      `${match[0] === EM_DASH ? 'U+2014' : 'U+2013'} em: ` +
        `...${stripped.slice(Math.max(0, at - 60), at + 60).replace(/\s+/g, ' ')}...`,
    )
  }

  return hits
}

/**
 * Fonte de um arquivo SEM as linhas de comentário.
 *
 * Usada só onde não dá para renderizar: as meta tags nascem do objeto
 * `metadata` de app/layout.tsx, que só o Next monta em <head> — importar o
 * módulo aqui puxaria `next/font/google` e o CSS global. Varrer os literais da
 * fonte é o proxy fiel: o que estiver escrito ali é o que vai para o HTML.
 *
 * Só linhas INTEIRAS de comentário caem. Um comentário no fim de uma linha de
 * código não pode esconder nada: o que viria antes dele já foi varrido.
 */
function sourceWithoutComments(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

const PAGES = [
  ['/ (LP v2)', renderToStaticMarkup(<Home />)],
  ['/privacy', renderToStaticMarkup(<Privacy />)],
  ['/terms', renderToStaticMarkup(<Terms />)],
] as const

describe('GNO-121 · voz da marca — zero travessão no HTML renderizado', () => {
  for (const [label, html] of PAGES) {
    it(`${label} não renderiza U+2014 nem U+2013`, () => {
      expect(findDashes(html)).toEqual([])
    })
  }
})

describe('GNO-121 · voz da marca — meta tags e assets de compartilhamento', () => {
  for (const file of ['app/layout.tsx', 'app/opengraph-image.tsx']) {
    it(`${file} não declara travessão em nenhum literal`, () => {
      expect(findDashes(sourceWithoutComments(file))).toEqual([])
    })
  }
})

describe('GNO-121 · voz da marca — e-mails transacionais', () => {
  beforeAll(async () => {
    sentMessages.length = 0

    /*
      GNO-120 — a rota agora verifica o Turnstile antes de escrever ou enviar
      qualquer coisa, então o e-mail PT só existe para ser inspecionado se o
      token passar. O siteverify é mockado: nenhuma chamada de rede sai daqui.
    */
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) }),
    )

    // EN: lib/email.ts. GNO-123 removeu o parâmetro `name` dos dois templates;
    // a trava de voz olha os mesmos campos, que agora são constantes.
    await sendWaitlistConfirmation({ email: 'lead@example.com' })

    // PT: lib/email.ts, disparado pela rota (é ela que decide se o e-mail sai)
    await POST({
      json: async () => ({
        email: 'lead@example.com',
        whatsapp: '',
        icp_segment: 'founder',
        consent: true,
        turnstile_token: 'token-de-teste',
      }),
      headers: { get: () => null },
    } as unknown as Parameters<typeof POST>[0])

    vi.unstubAllGlobals()
  })

  it('os dois templates foram capturados — senão a trava não está olhando nada', () => {
    expect(sentMessages).toHaveLength(2)
  })

  it('nenhum campo de texto do e-mail contém travessão', () => {
    for (const msg of sentMessages) {
      for (const field of ['subject', 'text', 'html'] as const) {
        expect(findDashes(String(msg[field] ?? ''))).toEqual([])
      }
    }
  })
})

describe('GNO-121 · copy de valorização "combinação única"', () => {
  const [, homeHtml] = PAGES[0]
  const text = homeHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

  it('o hero abre com a combinação única (redação aprovada pelo CMO)', () => {
    expect(text).toContain(
      'A GnosIQ mapeia o seu perfil cognitivo com uma combinação única de ' +
        'instrumentos validados e IA especializada, e entrega um relatório de',
    )
  })

  it('o bloco científico usa a redação aprovada, verbatim', () => {
    expect(text).toContain(
      'Sim. A avaliação é construída com base no modelo CHC - a referência mais ' +
        'aceita na pesquisa contemporânea sobre inteligência - com uma combinação ' +
        'única de instrumentos validados e IA especializada em cognição.',
    )
  })

  it('o card AGORA mantém "combina" e NÃO recebe "única" — 3ª repetição dilui o claim', () => {
    expect(text).toContain('A GnosIQ combina instrumentos validados com IA especializada')
    expect(text.match(/combinação única/g) ?? []).toHaveLength(2)
  })
})

describe('GNO-121 · correções legais menores', () => {
  const privacyHtml = PAGES[1][1]
  const termsHtml = PAGES[2][1]

  it('/privacy §4 lista só sub-processadores REAIS — agora Resend, não SendGrid', () => {
    // GNO-122 inverteu esta trava: o provedor migrou, e a política acompanha
    // o código. Declarar SendGrid depois da migração seria a mesma classe de
    // mentira que a GNO-121 corrigiu ao remover Resend antes da migração.
    expect(privacyHtml).toContain('Resend')
    expect(privacyHtml).not.toContain('SendGrid')
  })

  it('/terms cláusula 4 usa hello@, o único endereço público', () => {
    expect(termsHtml).not.toContain('support@gnosiq.ai')
    expect(termsHtml).toContain('hello@gnosiq.ai')
  })

  it('o assunto do canal LGPD é o mesmo prefixo em PT e EN', () => {
    expect(privacyHtml).toContain('LGPD - [seu direito]')
    expect(privacyHtml).toContain('LGPD - [your request]')
  })
})
