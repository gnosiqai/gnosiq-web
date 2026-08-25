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
 * Teto de tamanho do token, aplicado ANTES de qualquer chamada de rede.
 *
 * Um token real do Turnstile não passa de ~2 KB. Sem teto, o que chega no
 * corpo atravessa inteiro para a Cloudflare: a auditoria CISO T3 mediu 500.000
 * bytes encaminhados a partir de um único POST. `MAX_FIELD_LENGTH` da rota
 * protege whatsapp, e-mail e nome, mas nunca olhou este campo, então a trava
 * mora aqui, onde o token é consumido.
 *
 * Acima do teto NÃO é erro: é token inválido, e recebe o mesmo tratamento de
 * qualquer outro. A resposta continua sendo a de sucesso, e a defesa continua
 * sem se denunciar.
 */
const MAX_TOKEN_LENGTH = 2048

/**
 * Chaves de TESTE oficiais da Cloudflare, verbatim da doc
 * (developers.cloudflare.com/turnstile/troubleshooting/testing/).
 *
 * As secrets estão aqui pelo motivo óbvio: `1x0000...AA` faz o siteverify
 * aprovar TUDO. Se ela vazar para Production, a camada anti-bot vira enfeite,
 * os testes continuam verdes, o log fica mudo e nada no produto denuncia. É
 * fail-open silencioso, a mesma classe de falha que a GNO-122 matou no caminho
 * de e-mail, e é o achado R1 da auditoria CISO T3 do PR #105.
 *
 * As SITEKEYS estão aqui por outro motivo: não são secrets válidas, mas colar
 * a sitekey no campo da secret é o erro de configuração mais provável que
 * existe, e o sintoma dele (siteverify recusando todo mundo) é caro de
 * diagnosticar às 3h da manhã. Nomeado na hora, custa uma linha.
 */
const DUMMY_KEYS = new Set([
  // secrets
  '1x0000000000000000000000000000000AA', // sempre aprova
  '2x0000000000000000000000000000000AA', // sempre reprova
  '3x0000000000000000000000000000000AA', // token já gasto
  // sitekeys
  '1x00000000000000000000AA',
  '2x00000000000000000000AB',
  '1x00000000000000000000BB',
  '2x00000000000000000000BB',
  '3x00000000000000000000FF',
])

/**
 * Configuração inválida em runtime: secret ausente, ou (GNO-123) chave de
 * TESTE em Production. NÃO é o mesmo que token reprovado: é defeito nosso, e o
 * padrão da GNO-105 vale aqui — nada se assume, falha alto e visível para quem
 * opera.
 */
export class TurnstileConfigError extends Error {
  /**
   * A mensagem nomeia a VARIÁVEL e o defeito, nunca o valor: ela vai para o
   * log da rota, e log que ecoa credencial é vazamento, mesmo quando a
   * credencial em questão é uma chave de teste pública.
   */
  constructor(motivo = 'TURNSTILE_SECRET_KEY ausente em runtime') {
    super(motivo)
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
 * @throws {TurnstileConfigError} secret ausente ou dummy em produção
 * @throws {TurnstileUnavailableError} siteverify fora do ar (fail-closed)
 */
export async function verifyTurnstileToken(token: unknown): Promise<TurnstileVerdict> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) throw new TurnstileConfigError()

  /*
    GNO-123 — chave de teste em Production é defeito de CONFIGURAÇÃO, e é
    tratado como tal: mesmo caminho do secret ausente, mesmo 503 fail-closed,
    nada gravado. A checagem vem antes de olhar o token de propósito: um
    defeito de configuração independe do que a pessoa enviou, e é isso que o
    mantém fora da categoria de oráculo.

    `VERCEL_ENV` é variável de sistema da plataforma (production | preview |
    development) e chega ao runtime da função sem precisar ser declarada. Fora
    da Vercel ela não existe, então a trava não dispara em teste nem em dev
    local, que é exatamente onde as chaves dummy DEVEM funcionar.
  */
  if (process.env.VERCEL_ENV === 'production' && DUMMY_KEYS.has(secret)) {
    throw new TurnstileConfigError('TURNSTILE_SECRET_KEY é chave de TESTE em produção')
  }

  // Token só existe se veio string não vazia. Qualquer outra coisa (undefined,
  // número, objeto forjado) é reprovação, não erro: é exatamente o que um bot
  // que ignora o widget manda.
  if (typeof token !== 'string' || token.trim().length === 0) {
    return { ok: false, reason: 'missing-token' }
  }

  // Token acima do teto morre aqui, sem gastar rede nossa nem da Cloudflare.
  if (token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, reason: 'rejected' }
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
