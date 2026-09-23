import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Privacy from '@/app/privacy/page'
import Terms from '@/app/terms/page'
import { createHash } from 'node:crypto'
import * as legal from '@/lib/constants/legal'
import { PRIVACY_POLICY_VERSION } from '@/lib/constants/legal'
import { LEGAL_BY_LOCALE } from '@/lib/constants/legal/index'

/**
 * a revisão de segurança bloqueou o merge porque /privacy afirmava
 * "Não coletamos ... telefone" enquanto o código passava a coletar WhatsApp.
 * O checkbox de consentimento aponta para essa política, então o usuário
 * consentia por referência a um documento que negava a coleta.
 *
 * Estes testes existem para que a contradição não volte em silêncio. Eles
 * não julgam mérito jurídico — verificam que as páginas legais descrevem os
 * dados que o código realmente coleta.
 */

const privacy = renderToStaticMarkup(<Privacy />)
const terms = renderToStaticMarkup(<Terms />)
const text = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')

describe('/privacy descreve os dados que o código coleta', () => {
  const t = text(privacy)

  it('não nega mais a coleta de telefone', () => {
    expect(t).not.toMatch(/Não coletamos[^.]*telefone/i)
    expect(t).not.toMatch(/No name, national ID, phone/i)
  })

  it('não afirma mais coletar apenas o domínio do e-mail', () => {
    expect(t).not.toMatch(/exclusivamente o\s*domínio/i)
    expect(t).not.toMatch(/collects only the\s*email domain/i)
  })

  it('declara WhatsApp, e-mail e papel profissional — PT e EN', () => {
    expect(t).toContain('WhatsApp')
    expect(t).toMatch(/papel\s*profissional/i)
    expect(t).toMatch(/professional role/i)
  })

  it('o EN explica o que é a LGPD — sigla nua não informa leitor em inglês', () => {
 // Redação chancelada pelo CLO em 2026-08-25.
    expect(t).toMatch(/art\.\s*7\(I\) of the LGPD, the Brazilian data protection law/i)
  })

  it('declara finalidade, base legal e canal de exclusão', () => {
    expect(t).toMatch(/Base legal:\s*consentimento/i)
    expect(t).toMatch(/Legal basis:\s*consent/i)
    expect(t).toMatch(/art\.\s*7º?,\s*I/i)
    expect(t).toContain('hello@gnosiq.ai')
  })

  it('a versão foi carimbada — política que muda de conteúdo muda de versão', () => {
    expect(PRIVACY_POLICY_VERSION).not.toBe('1.0')
    expect(t).toContain(PRIVACY_POLICY_VERSION)
  })
})

describe('/terms descreve os mesmos dados', () => {
  const t = text(terms)

  it('a cláusula da lista de espera cita WhatsApp, não só e-mail', () => {
    expect(t).toMatch(/Lista de espera:[^✦]*WhatsApp/i)
  })

  it('mantém a base legal do consentimento', () => {
    expect(t).toMatch(/Art\.\s*7º?,\s*inciso I/i)
  })

  it('a versão foi carimbada junto com a mudança de conteúdo', () => {
    expect(t).not.toMatch(/v\s*1\.0\b/)
  })
})

describe('coerência entre o formulário e a política', () => {
  it('todo canal que a rota aceita está declarado em /privacy', () => {
 // Os canais são os que app/api/waitlist/route.ts persiste.
    for (const canal of ['e-mail', 'WhatsApp']) {
      expect(text(privacy)).toContain(canal)
    }
  })
})

describe('sub-processadores declarados nos DOIS idiomas', () => {
  const t = text(privacy)

 /**
 * O espelho EN não tinha seção de compartilhamento com terceiros: PostHog e
 * SendGrid estavam declarados só em PT. Declarar o Turnstile apenas em PT
 * repetiria a divergência, e é exatamente a classe de incoerência que esta
 * suite existe para impedir. A seção EN foi criada como tradução fiel da PT.
 */
  it('declara o Cloudflare Turnstile, em PT e em EN', () => {
    expect(t).toMatch(/proteção anti-bot do formulário de lista de espera/i)
    expect(t).toMatch(/anti-bot protection of the waiting list form/i)
  })

  it('promete o mesmo em PT e EN: sem rastreamento de identidade', () => {
    expect(t).toMatch(/sem rastreamento de cliques ou identidade/i)
    expect(t).toMatch(/no click or identity tracking/i)
  })

  it('todo sub-processador aparece nos dois idiomas — lista não diverge', () => {
    for (const nome of ['PostHog', 'Resend', 'Cloudflare Turnstile']) {
      expect(t.split(nome).length - 1).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('a política nomeia o provedor de e-mail REAL', () => {
  const t = text(privacy)

  it('declara Resend nos dois idiomas', () => {
    expect(t.split('Resend').length - 1).toBeGreaterThanOrEqual(2)
  })

  it('não sobrou nenhuma menção a SendGrid', () => {
 // O provedor saiu do código nesta issue. Política que cita sub-processador
 // que não processa mais nada é declaração falsa, não sobra inofensiva.
    expect(t).not.toContain('SendGrid')
  })
})

/**
 * Textos jurídicos canônicos: pino por sha256.
 *
 * O texto é a letra revisada, não copy. Qualquer mudança de uma vírgula
 * troca o hash e quebra este teste: a mudança só passa se o literal abaixo
 * for atualizado junto, o que torna a revisão explícita. O engine vendoriza
 * os mesmos textos com os mesmos hashes.
 */
describe('textos jurídicos canônicos: pino por hash', () => {
  const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex')

  const PINS = {
    CONSENT_ASSESSMENT_PT: '2c74bf7b86a36f3f06f2882d99d543980ceda23ec6f132fa816943f7932d557a',
    CONSENT_FEEDBACK_PT: '5497efd85896943ca29a14f7cc0f48ec1370f728838366e8b9ecb978572fc81a',
    CONSENT_TESTIMONIAL_PT: 'ad6b065eebc50cb4b68602c221745ef8eb82be1a5e1348930646911d3df9af16',
    AI_GENERATED_NOTICE_PT: '4d5fca905b484159957644e79ed8287aa9a545f9a3c24bb787c9db263d118bd3',
    METHOD_LIMITATION_PT: '97ed17109b0abe70b254f10ff0ba48bc5aebe82dfd77078e08ad1c2c41146eee',
    SAFETY_NOTICE_PT: 'b5fcff645dbc64e34d6d1231fb2c03f8ef75b2e13f2a3884ab08676f08a353be',
    DISCLAIMER_PT: '96d7713807effdab537cd5d661fcac4c49e647deeece3c3f83aa6b90b0911126',
    DISCLAIMER_EN: 'c414b3998b194e59aa4d82760f6a81f75f343d744a3290c680b50298c0faa560',
  } as const

  for (const [name, pin] of Object.entries(PINS)) {
    it(`${name} bate com o hash fixado`, () => {
      expect(sha256(legal[name as keyof typeof PINS])).toBe(pin)
    })
  }

  it('o mapa por locale aponta para as mesmas constantes, com pt-BR único', () => {
    expect(Object.keys(LEGAL_BY_LOCALE)).toEqual(['pt-BR'])
    const pt = LEGAL_BY_LOCALE['pt-BR']
    expect(pt.CONSENT_ASSESSMENT).toBe(legal.CONSENT_ASSESSMENT_PT)
    expect(pt.CONSENT_FEEDBACK).toBe(legal.CONSENT_FEEDBACK_PT)
    expect(pt.CONSENT_TESTIMONIAL).toBe(legal.CONSENT_TESTIMONIAL_PT)
    expect(pt.AI_GENERATED_NOTICE).toBe(legal.AI_GENERATED_NOTICE_PT)
    expect(pt.METHOD_LIMITATION).toBe(legal.METHOD_LIMITATION_PT)
    expect(pt.SAFETY_NOTICE).toBe(legal.SAFETY_NOTICE_PT)
    expect(pt.SAFETY_RESOURCES).toBe(legal.SAFETY_RESOURCES_PT)
  })

  it('o bloco de segurança traz os canais que ele promete', () => {
    for (const canal of ['188', '192', 'cvv.com.br']) {
      expect(legal.SAFETY_NOTICE_PT).toContain(canal)
    }
    expect(legal.SAFETY_RESOURCES_PT.cvv.phone).toBe('188')
    expect(legal.SAFETY_RESOURCES_PT.samu.phone).toBe('192')
  })

  it('limiares de encaminhamento clínico não voltam ao módulo público', () => {
 // O encaminhamento é o bloco de segurança, exibido por código. Limiar de
 // escala clínica em repo público é desenho exposto e jogável.
    expect(Object.keys(legal).filter((k) => /REFERRAL|TRIGGER|THRESHOLD/.test(k))).toEqual([])
    expect(Object.keys(legal)).not.toContain('COGNITIVE_ASSESSMENT_DISCLAIMER')
  })
})

/** Minúsculas e sem acento: a varredura não depende de grafia. */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Todas as strings exportadas pelo módulo, inclusive as aninhadas em objetos. */
function exportedStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (value && typeof value === 'object') return Object.values(value).flatMap(exportedStrings)
  return []
}

describe('coerência: nenhum texto jurídico afirma o que o produto não sustenta', () => {
 // Sem base normativa, o produto não pode se dizer validado nem de rastreio,
 // e não promete que os dados nunca saem de um perímetro: há suboperadores.
  const strings = exportedStrings(legal).map(normalize)

  for (const termo of ['validad', 'rastreio', 'perimetro', 'nunca saem']) {
    it(`nenhuma string exportada contém "${termo}"`, () => {
      expect(strings.filter((s) => s.includes(termo))).toEqual([])
    })
  }
})

describe('linha CFP: vocabulário vetado fora dos textos canônicos', () => {
 /*
      Vocabulário vetado em todo relatório. É lista pública por natureza: diz
      o que o produto não afirma, não como algo é detectado. Casamento por
      fronteira de palavra, sem acento, com flexões (a palavra perde a vogal
      final e aceita até quatro letras de sufixo).
 */
  const VETADOS = [
    // mensuração clínica
    'QI', 'quociente de inteligência', 'IQ', 'percentil', 'desvio padrão',
    'escore padronizado', 'escore-z', 'norma', 'normativo',
    // referência a população
    'acima da média', 'abaixo da média', 'na média', 'a maioria das pessoas',
    '% da população', 'raro', 'superior', 'inferior', 'deficit', 'déficit',
    // ato privativo ou diagnóstico
    'diagnóstico', 'diagnosticar', 'laudo', 'parecer psicológico',
    'avaliação psicológica', 'avaliação neuropsicológica', 'teste psicológico',
    'psicodiagnóstico', 'prognóstico',
    // rótulos clínicos
    'transtorno', 'síndrome', 'distúrbio', 'patologia', 'sintoma', 'TDAH', 'TEA',
    'autismo', 'autista', 'bipolar', 'depressão', 'depressivo', 'borderline',
    'esquizofrenia', 'dislexia', 'neurodivergente', 'neurodivergência',
    'tratamento', 'medicação', 'medicamento', 'terapia',
    // veredito sobre a pessoa
    'superdotado', 'superdotação', 'altas habilidades', 'AH/SD', 'gênio',
    'talento excepcional',
    // certeza indevida
    'comprova', 'prova que', 'garante', 'definitivamente', 'certamente', 'sem dúvida',
  ] as const

 // As negações exigidas pela própria linha CFP: o texto nega o ato, não o pratica.
  const ALLOWLIST = [
    'NÃO substitui avaliação diagnóstica',
    'does NOT replace a diagnostic assessment',
    'Não é avaliação psicológica, laudo ou diagnóstico clínico',
  ].map(normalize)

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  const pattern = (termo: string) => {
    const t = normalize(termo)
    const flexao = /[a-z]{5,}[aeo]$/.test(t) ? `${escape(t.slice(0, -1))}[a-z]{0,4}` : `${escape(t)}s?`
    return new RegExp(`(?<![a-z0-9])${flexao}(?![a-z0-9])`)
  }

  const CONSTANTES = [
    'CONSENT_ASSESSMENT_PT', 'CONSENT_FEEDBACK_PT', 'CONSENT_TESTIMONIAL_PT',
    'AI_GENERATED_NOTICE_PT', 'METHOD_LIMITATION_PT', 'SAFETY_NOTICE_PT',
    'DISCLAIMER_PT', 'DISCLAIMER_EN',
  ] as const

  for (const nome of CONSTANTES) {
    it(`${nome} não usa vocabulário vetado`, () => {
      const texto = ALLOWLIST.reduce((acc, frase) => acc.split(frase).join(' '), normalize(legal[nome]))
      expect(VETADOS.filter((termo) => pattern(termo).test(texto))).toEqual([])
    })
  }

  it('a varredura enxerga flexão e acento (sem falso negativo)', () => {
    expect(pattern('diagnóstico').test(normalize('uma avaliação DIAGNÓSTICA'))).toBe(true)
    expect(pattern('déficit').test(normalize('deficits'))).toBe(true)
  })

  it('a varredura respeita fronteira de palavra (sem falso positivo)', () => {
    expect(pattern('TEA').test(normalize('teatro'))).toBe(false)
    expect(pattern('norma').test(normalize('informação'))).toBe(false)
  })

  it('sem a allowlist, as negações canônicas seriam pegas: ela é necessária, não enfeite', () => {
    expect(pattern('diagnóstico').test(normalize(legal.DISCLAIMER_PT))).toBe(true)
    expect(pattern('laudo').test(normalize(legal.AI_GENERATED_NOTICE_PT))).toBe(true)
  })
})
