/**
 * GNO-120 — verificação server-side do Cloudflare Turnstile.
 *
 * Este módulo existe separado da rota por um motivo de segurança, não de
 * estilo: a decisão "aceita ou não aceita" precisa ser testável sem subir o
 * handler inteiro, e precisa ter UM caminho só. Rota que decide sozinha, com
 * `if` espalhado, é rota que um dia aceita token vazio.
 *
 * Modo do widget: MANAGED (decisão de execução da issue, 2026-08-25). O modo
 * Invisible exigiria referenciar o Turnstile Privacy Addendum na nossa
 * política de privacidade; o Managed não carrega essa condição contratual e
 * só apresenta desafio a tráfego suspeito.
 *
 * PRIVACIDADE: `remoteip` é OPCIONAL no siteverify e NÃO é enviado aqui de
 * propósito. Mandar o IP do visitante seria um fluxo de dado pessoal novo
 * para um terceiro, e a linha de sub-processador chancelada para o /privacy
 * promete "sem rastreamento de cliques ou identidade". O ganho antifraude do
 * campo não paga essa contradição.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Teto de espera pelo siteverify. Sem timeout, uma indisponibilidade da
 * Cloudflare vira request pendurada no serverless até o limite da plataforma,
 * e a pessoa fica olhando "Enviando..." por 30s.
 */
const VERIFY_TIMEOUT_MS = 5_000

/**
 * Secret ausente em runtime. NÃO é o mesmo que token reprovado: é defeito de
 * configuração nossa, e o padrão da GNO-105 vale aqui — nada se assume, falha
 * alto e visível para quem opera.
 */
export class TurnstileConfigError extends Error {
  constructor() {
    super('TURNSTILE_SECRET_KEY ausente em runtime')
    this.name = 'TurnstileConfigError'
  }
}

/**
 * Siteverify inalcançável (rede, timeout, 5xx). Também NÃO é token reprovado:
 * é o serviço fora do ar.
 *
 * FAIL-CLOSED, decisão explícita da issue: com o Turnstile fora, a inscrição
 * NÃO passa. A alternativa (deixar passar enquanto o serviço não responde)
 * transforma qualquer instabilidade da Cloudflare em janela de flood contra o
 * placar público de 100 fundadores, que é justamente o ativo que esta camada
 * protege. Quem paga o preço é o humano legítimo, que recebe "tente de novo"
 * em vez de silêncio — e por isso este caso é distinguido de reprovação: a
 * rota responde 503, não a resposta genérica.
 */
export class TurnstileUnavailableError extends Error {
  constructor(cause: string) {
    super(`siteverify indisponível: ${cause}`)
    this.name = 'TurnstileUnavailableError'
  }
}

/**
 * Veredito de um token. Reprovação não detalha o motivo para quem chamou a
 * rota: os `error-codes` da Cloudflare ficam no log interno, nunca na
 * resposta HTTP.
 */
export type TurnstileVerdict =
  | { ok: true }
  | { ok: false; reason: 'missing-token' | 'rejected' }

/** Resposta do siteverify, só os campos que consumimos. */
type SiteverifyResponse = {
  success?: unknown
  'error-codes'?: unknown
}

/**
 * Verifica um token do widget contra o siteverify da Cloudflare.
 *
 * @throws {TurnstileConfigError} secret ausente (defeito de configuração)
 * @throws {TurnstileUnavailableError} siteverify fora do ar (fail-closed)
 */
export async function verifyTurnstileToken(token: unknown): Promise<TurnstileVerdict> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) throw new TurnstileConfigError()

  // Token só existe se veio string não vazia. Qualquer outra coisa (undefined,
  // número, objeto forjado) é reprovação, não erro: é exatamente o que um bot
  // que ignora o widget manda.
  if (typeof token !== 'string' || token.trim().length === 0) {
    return { ok: false, reason: 'missing-token' }
  }

  let response: Response
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    })
  } catch (err) {
    throw new TurnstileUnavailableError(err instanceof Error ? err.name : 'desconhecido')
  }

  if (!response.ok) {
    throw new TurnstileUnavailableError(`HTTP ${response.status}`)
  }

  let body: SiteverifyResponse
  try {
    body = (await response.json()) as SiteverifyResponse
  } catch {
    throw new TurnstileUnavailableError('corpo não é JSON')
  }

  if (body.success === true) return { ok: true }

  /*
    Log interno com os error-codes da Cloudflare. É diagnóstico operacional
    puro: os códigos descrevem o TOKEN (ausente, expirado, já gasto, sitekey
    trocada), nunca a pessoa. Nenhum campo do formulário chega aqui.
  */
  const codes = Array.isArray(body['error-codes']) ? body['error-codes'].join(',') : 'sem-codigo'
  console.warn('[turnstile] token reprovado:', codes)

  return { ok: false, reason: 'rejected' }
}
