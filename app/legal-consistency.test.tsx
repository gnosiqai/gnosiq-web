import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Privacy from '@/app/privacy/page'
import Terms from '@/app/terms/page'
import { PRIVACY_POLICY_VERSION } from '@/lib/constants/legal'

/**
 * GNO-115 — a review CISO T1 bloqueou o merge porque /privacy afirmava
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
