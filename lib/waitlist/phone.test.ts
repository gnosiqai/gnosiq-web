import { describe, it, expect } from 'vitest'
import { normalizeToE164, isValidWhatsApp, isValidEmail } from './phone'

// revisão de segurança — o WhatsApp é dado pessoal novo no endpoint.
// A normalização é a fronteira: o que passa daqui vai para o Firestore em
// formato único, e o que não passa nunca chega lá.

describe('normalizeToE164 — números brasileiros', () => {
  it('aceita celular com DDD e máscara', () => {
    expect(normalizeToE164('(11) 91234-5678')).toBe('+5511912345678')
  })

  it('aceita celular com DDD sem máscara', () => {
    expect(normalizeToE164('11912345678')).toBe('+5511912345678')
  })

  it('aceita fixo de 10 dígitos', () => {
    expect(normalizeToE164('1132145678')).toBe('+551132145678')
  })

  it('aceita DDI presente com "+" esquecido', () => {
    expect(normalizeToE164('5511912345678')).toBe('+5511912345678')
  })

  it('aceita formato E.164 já pronto', () => {
    expect(normalizeToE164('+55 11 91234-5678')).toBe('+5511912345678')
  })

  it('normaliza formas equivalentes para a MESMA string — dedupe depende disso', () => {
    const forms = [
      '(11) 91234-5678',
      '11912345678',
      '+55 11 91234-5678',
      '55 11 9 1234 5678',
      ' +5511912345678 ',
    ]
    const normalized = new Set(forms.map(normalizeToE164))
    expect(normalized.size).toBe(1)
    expect([...normalized][0]).toBe('+5511912345678')
  })
})

describe('normalizeToE164 — internacional', () => {
  it('aceita número português em E.164', () => {
    expect(normalizeToE164('+351 912 345 678')).toBe('+351912345678')
  })

  it('aceita número americano em E.164', () => {
    expect(normalizeToE164('+1 415 555 0132')).toBe('+14155550132')
  })
})

describe('normalizeToE164 — rejeições', () => {
  it.each([
    ['string vazia', ''],
    ['só espaços', '   '],
    ['curto demais', '+5511'],
    ['sem dígito nenhum', 'meu whatsapp'],
    ['acima de 15 dígitos', '+5511912345678901'],
    ['começando em zero após o "+"', '+05511912345678'],
  ])('rejeita %s', (_label, input) => {
    expect(normalizeToE164(input)).toBeNull()
    expect(isValidWhatsApp(input)).toBe(false)
  })

  it('rejeita entrada que não é string', () => {
    expect(normalizeToE164(null as unknown as string)).toBeNull()
    expect(normalizeToE164(42 as unknown as string)).toBeNull()
  })
})

describe('isValidEmail', () => {
  it('aceita e-mail comum', () => {
    expect(isValidEmail('voce@exemplo.com')).toBe(true)
  })

  it.each([
    ['sem @', 'voceexemplo.com'],
    ['sem domínio', 'voce@'],
    ['sem TLD', 'voce@exemplo'],
    ['com espaço', 'vo ce@exemplo.com'],
    ['vazio', ''],
  ])('rejeita e-mail %s', (_label, input) => {
    expect(isValidEmail(input)).toBe(false)
  })

  it('rejeita acima de 254 caracteres', () => {
    expect(isValidEmail(`${'a'.repeat(250)}@exemplo.com`)).toBe(false)
  })

  it('rejeita rótulo de domínio vazio', () => {
 // A regex anterior aceitava "a@b..c"; a atual descreve rótulo a rótulo.
    expect(isValidEmail('a@b..c')).toBe(false)
    expect(isValidEmail('a@.com')).toBe(false)
    expect(isValidEmail('a@b.')).toBe(false)
  })

  it('aceita subdomínio', () => {
    expect(isValidEmail('voce@mail.exemplo.com.br')).toBe(true)
  })

  it('entrada patológica não trava — a regex é linear, não backtracking', () => {
 // Formato que fazia a versão ambígua explodir: muitos pontos sem TLD.
    const pathological = `a@${'.'.repeat(120)}`
    const started = performance.now()
    expect(isValidEmail(pathological)).toBe(false)
    expect(performance.now() - started).toBeLessThan(50)
  })
})
