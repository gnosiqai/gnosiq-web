/**
 * @file lib/waitlist/phone.ts
 * @description Normalização e validação de WhatsApp em E.164 (GNO-115).
 *
 * Compartilhado entre o formulário (feedback imediato) e a rota de API
 * (validação de verdade). O cliente NUNCA é a fonte de verdade: a rota
 * revalida com esta mesma função antes de persistir.
 *
 * E.164: '+' seguido de 1 a 15 dígitos, o primeiro diferente de zero.
 * Na prática nenhum país usa menos de 8 dígitos contando o código do país,
 * então o piso aqui é 8 — evita aceitar "+5511" como telefone.
 */

/** Código de país assumido quando o usuário digita um número local. */
const DEFAULT_COUNTRY_CODE = '55' // Brasil — público da waitlist é BR-first

const E164_RE = /^\+[1-9]\d{7,14}$/

/**
 * Normaliza entrada humana para E.164.
 *
 * Aceita máscara brasileira ("(11) 91234-5678"), com ou sem DDI, e formato
 * internacional já pronto ("+351 912 345 678"). Retorna `null` quando o
 * resultado não é um E.164 plausível — o chamador decide a mensagem.
 *
 * Sem '+' explícito o número é tratado como brasileiro: 10 dígitos (fixo com
 * DDD) ou 11 (celular com DDD) ganham +55; 12 ou 13 dígitos que já comecem
 * com 55 são tratados como DDI presente com '+' esquecido.
 */
export function normalizeToE164(raw: string): string | null {
  if (typeof raw !== 'string') return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  let candidate: string

  if (hasPlus) {
    candidate = `+${digits}`
  } else if (digits.length === 10 || digits.length === 11) {
    // Número local brasileiro: DDD + 8 ou 9 dígitos
    candidate = `+${DEFAULT_COUNTRY_CODE}${digits}`
  } else if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith(DEFAULT_COUNTRY_CODE)
  ) {
    // DDI presente, '+' esquecido
    candidate = `+${digits}`
  } else {
    // Internacional sem '+': assumir que os dígitos já incluem o DDI
    candidate = `+${digits}`
  }

  return E164_RE.test(candidate) ? candidate : null
}

/** `true` se a entrada humana produz um E.164 válido. */
export function isValidWhatsApp(raw: string): boolean {
  return normalizeToE164(raw) !== null
}

/*
  O domínio é descrito rótulo a rótulo, com `.` FORA das classes de caractere.
  A forma anterior — /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — permitia que `.` casasse
  tanto dentro de [^\s@] quanto no ponto literal, e essa ambiguidade dá
  backtracking super-linear: uma entrada como "a@" seguida de muitos pontos
  faz o motor testar um número explosivo de divisões. Num endpoint público
  isso é vetor de ReDoS, ainda que o teto de 254 caracteres limite o estrago.
  Esta forma é inequívoca — cada rótulo não contém ponto — e roda em tempo
  linear. Efeito colateral: passou a rejeitar "a@b..c", que a anterior
  aceitava. Mais correto, e nenhum e-mail válido perde.
*/
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

/** Validação de e-mail — mesmo critério que a rota usa desde a v1. */
export function isValidEmail(raw: string): boolean {
  if (typeof raw !== 'string') return false
  const trimmed = raw.trim()
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_RE.test(trimmed)
}
