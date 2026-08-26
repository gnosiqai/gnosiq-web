import { NextRequest, NextResponse } from 'next/server'
import { addToWaitlist } from '@/lib/firestore'
import { normalizeToE164, isValidEmail } from '@/lib/waitlist/phone'
import { parseUtm } from '@/lib/waitlist/utm'
import { captureServerEvent } from '@/lib/posthog-server'
import {
  verifyTurnstileToken,
  TurnstileConfigError,
  TurnstileUnavailableError,
} from '@/lib/turnstile'
import { sendWaitlistConfirmationPT, EmailConfigError } from '@/lib/email'

export const runtime = 'nodejs'

/**
 * Entrada da lista de espera.
 *
 * O corpo carrega dado pessoal (telefone e e-mail), então as regras abaixo
 * valem para toda alteração neste arquivo:
 *
 *  1. Nenhum telefone e nenhum e-mail aparece em log ou em propriedade de
 *     evento. O identificador do produto basta para atribuir a conversão.
 *  2. O número é normalizado para E.164 antes de tocar o Firestore. Um
 *     formato só por documento evita que o mesmo humano vire dois registros.
 *  3. Validação é server-side de verdade: o cliente valida para dar feedback,
 *     esta rota valida para decidir. Payload malformado morre com 400.
 *  4. Erro interno nunca vaza stack trace nem conteúdo de credencial.
 *  5. Consentimento é obrigatório e registrado — sem ele, 400.
 */

/** Campo do corpo cuja presença invalida o envio. */
const DISCARD_FIELD = 'website'

/** Identidade única para os descartes — conta eventos, não pessoas. */
const DISCARD_DISTINCT_ID = 'discarded-submission'

/** Campo do corpo que carrega o token emitido pelo widget Turnstile. */
const TURNSTILE_FIELD = 'turnstile_token'

/** Mesma lógica: conta reprovações, não pessoas. */
const TURNSTILE_DISTINCT_ID = 'turnstile-bot'

/** Falha de e-mail é evento de INFRA. Conta incidentes, não inscritos. */
const EMAIL_FAILURE_DISTINCT_ID = 'email-infra'

/** Tamanho máximo do corpo aceito — trava barata contra payload inflado. */
const MAX_FIELD_LENGTH = 254

/** Segmentos aceitos no campo "Sou um..." — allowlist, não texto livre. */
const ALLOWED_ROLES = new Set([
  'founder',
  'executivo',
  'profissional',
  'estudante',
  'curioso',
  'rh',
  'other',
])

const GENERIC_ERROR = 'Serviço temporariamente indisponível. Tente novamente em instantes.'

/** Lê um campo de texto do corpo sem confiar no tipo que chegou. */
function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

type ParsedChannels =
  | { ok: true; whatsapp: string | null; email: string | null }
  | { ok: false; error: string }

/**
 * Resolve os dois canais. Extraída do handler porque a regra "pelo menos um,
 * nenhum obrigatório sozinho" é o ponto mais denso da rota, e mantê-la inline
 * empurrava a complexidade cognitiva do POST para 22 (limite 15).
 */
function parseChannels(rawWhatsapp: string, rawEmail: string): ParsedChannels {
  const hasWhatsapp = rawWhatsapp.trim().length > 0
  const hasEmail = rawEmail.trim().length > 0

  if (!hasWhatsapp && !hasEmail) {
    return { ok: false, error: 'Informe o WhatsApp ou o e-mail: pelo menos um dos dois.' }
  }

  let whatsapp: string | null = null
  if (hasWhatsapp) {
    whatsapp = normalizeToE164(rawWhatsapp)
    if (!whatsapp) {
      return {
        ok: false,
        error: 'WhatsApp inválido. Use o formato com DDD, por exemplo (11) 91234-5678.',
      }
    }
  }

  let email: string | null = null
  if (hasEmail) {
    if (!isValidEmail(rawEmail)) {
      return { ok: false, error: 'E-mail inválido. Verifique e tente novamente.' }
    }
    email = rawEmail.trim().toLowerCase()
  }

  return { ok: true, whatsapp, email }
}

type ParsedSubmission =
  | { ok: true; whatsapp: string | null; email: string | null; name: string; icpSegment: string | null }
  | { ok: false; error: string }

/**
 * Valida o corpo inteiro. Pura: não toca rede nem Firestore, o que a torna
 * testável isoladamente e mantém o handler com uma responsabilidade só.
 */
function parseSubmission(body: unknown): ParsedSubmission {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Requisição inválida.' }
  }

  const fields = body as Record<string, unknown>
  const rawWhatsapp = asString(fields.whatsapp)
  const rawEmail = asString(fields.email)
  const rawName = asString(fields.name)

  const tooLong = [rawWhatsapp, rawEmail, rawName].some(
    (value) => value.length > MAX_FIELD_LENGTH,
  )
  if (tooLong) {
    return { ok: false, error: 'Requisição inválida.' }
  }

 // Consentimento explícito é condição de entrada, não checkbox decorativo.
  if (fields.consent !== true) {
    return {
      ok: false,
      error: 'É necessário aceitar a Política de Privacidade para entrar na lista.',
    }
  }

  const channels = parseChannels(rawWhatsapp, rawEmail)
  if (!channels.ok) return channels

  const rawRole = fields.icp_segment
  const icpSegment =
    typeof rawRole === 'string' && ALLOWED_ROLES.has(rawRole) ? rawRole : null

  return {
    ok: true,
    whatsapp: channels.whatsapp,
    email: channels.email,
    name: rawName,
    icpSegment,
  }
}

/**
 * Resposta de sucesso ÚNICA, idêntica para inscrição nova e para quem já
 * estava na lista.
 *
 * Uma resposta que variasse permitiria a qualquer um postar um e-mail ou
 * telefone e descobrir, pela diferença, se aquela pessoa está na lista. Numa
 * lista de espera de avaliação cognitiva, confirmar que alguém se inscreveu já
 * é informação pessoal sobre essa pessoa.
 *
 * Custo aceito: o evento do produto perdeu a propriedade `already_existed`.
 */
const SUCCESS_RESPONSE = {
  success: true,
  message: 'Pronto. Se estiver tudo certo, avisamos você quando o beta abrir.',
} as const

/**
 * UTMs da origem do envio, lidos do cabeçalho `Referer`.
 *
 * Deliberadamente não vêm do corpo: o corpo de um envio descartado é dado
 * hostil. O Referer continua sendo dado de terceiro, mas é metadado de
 * transporte, não payload, e passa por uma allowlist de 5 chaves com valor
 * truncado antes de virar propriedade de evento.
 */
function utmFromReferer(req: NextRequest): Record<string, string> {
  const referer = req.headers.get('referer')
  if (!referer) return {}

  try {
    const utm = parseUtm(new URL(referer).search)
    return Object.fromEntries(
      Object.entries(utm).map(([key, value]) => [key, String(value).slice(0, 100)]),
    )
  } catch {
 // Referer malformado — some com ele, não quebra a resposta.
    return {}
  }
}

/** Lê um campo do corpo sem confiar em nada que veio dele. */
function fieldOf(body: unknown, name: string): unknown {
  return body && typeof body === 'object' ? (body as Record<string, unknown>)[name] : undefined
}

/**
 * Triagem do envio, antes de qualquer escrita no Firestore ou envio de
 * e-mail. Nada que não passe por aqui deixa rastro no placar.
 *
 * Retorna a resposta a devolver quando o request deve morrer aqui, ou `null`
 * quando ele está liberado para seguir. A resposta é sempre a MESMA de
 * sucesso: uma resposta distinta contaria ao remetente o que aconteceu com o
 * envio dele.
 */
async function screenSubmission(req: NextRequest, body: unknown): Promise<NextResponse | null> {
  const discard = fieldOf(body, DISCARD_FIELD)
  if (typeof discard === 'string' && discard.trim().length > 0) {
    await captureServerEvent('waitlist_submission_discarded', DISCARD_DISTINCT_ID, {
      lp_version: 'v2',
      ...utmFromReferer(req),
    })
    return NextResponse.json(SUCCESS_RESPONSE, { status: 200 })
  }

  const verdict = await verifyTurnstileToken(fieldOf(body, TURNSTILE_FIELD))
  if (!verdict.ok) {
 /*
      `reason` é métrica de operação, não de pessoa: nenhum campo do
      formulário entra no evento.
 */
    await captureServerEvent('waitlist_turnstile_rejected', TURNSTILE_DISTINCT_ID, {
      lp_version: 'v2',
      reason: verdict.reason,
      ...utmFromReferer(req),
    })
    return NextResponse.json(SUCCESS_RESPONSE, { status: 200 })
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

 /*
      Corpo ilegível morre aqui, antes da triagem, e continua sendo 400.

      Isto é erro de TRANSPORTE, não veredito sobre quem enviou: não dá para
      triar o que não dá para ler, e um 400 aqui não conta nada sobre nenhuma
      pessoa — só diz que o que chegou não era JSON. Devolver sucesso neste
      caso esconderia bug de cliente nosso atrás de uma tela verde.
 */
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Requisição inválida.' }, { status: 400 })
    }

 // Triagem antes de validar, de persistir e de enviar e-mail.
    const blocked = await screenSubmission(req, body)
    if (blocked) return blocked

    const parsed = parseSubmission(body)

    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
    }

    const { alreadyExists } = await addToWaitlist({
      whatsapp: parsed.whatsapp,
      email: parsed.email,
      name: parsed.name,
      icpSegment: parsed.icpSegment,
    })

 // E-mail de confirmação só para inscrição nova e só se houver e-mail.
 // O `alreadyExists` decide o efeito colateral, mas NUNCA vaza na resposta.
    if (!alreadyExists && parsed.email) {
      await sendConfirmationEmail(parsed.email)
    }

    return NextResponse.json(SUCCESS_RESPONSE, { status: 200 })
  } catch (err) {
 /*
      Quando a verificação do Turnstile não consegue decidir — secret ausente
      (defeito de configuração nosso) ou serviço fora do ar — a inscrição não
      passa: nada é escrito, nada é enviado.

      E a resposta aqui é 503, não a de sucesso. A falha independe do que a
      pessoa digitou, então não conta nada sobre ninguém; o que ela conta é
      para o humano legítimo, que recebe "tente de novo em instantes" em vez
      de uma tela de sucesso mentindo sobre uma inscrição que não aconteceu.
 */
    if (err instanceof TurnstileConfigError || err instanceof TurnstileUnavailableError) {
      console.error('[waitlist] Turnstile indisponível:', err.message)
      return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 503 })
    }

 // Log interno sem dado pessoal: só a mensagem do erro, nunca o corpo.
    console.error('[waitlist] Erro:', err instanceof Error ? err.message : 'desconhecido')
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 503 })
  }
}

/**
 * Token com cara de e-mail, em tempo LINEAR.
 *
 * Duas decisões, e as duas são de segurança:
 *
 *  1. `@` está EXCLUÍDO das duas classes. Deixá-lo cair dentro delas cria N
 *     formas de dividir a mesma string em "antes do @" e "depois do @", e
 *     numa string longa sem match o motor testa todas: custo quadrático.
 *     Sem o `@` nas classes só existe uma divisão possível, e o custo volta
 *     a ser linear. Achado typescript:S8786.
 *
 *  2. Quantificadores LIMITADOS, como defesa em profundidade: mesmo que
 *     alguém reintroduza ambiguidade aqui um dia, o trabalho por posição
 *     tem teto. O limite é 254 e não 64 (o máximo de um local-part
 *     válido) de propósito: um endereço com local-part maior que o teto
 *     seria redigido pela METADE, vazando o começo do endereço. 254 é o
 *     mesmo MAX_FIELD_LENGTH que esta rota já impõe na entrada, então
 *     nenhum endereço que o nosso pipeline aceita escapa inteiro.
 *
 * Por que isto importa e não é cosmético: o texto que passa por aqui é a
 * mensagem de ERRO do provedor, e provedor gosta de ecoar o campo que
 * recusou ("Invalid `to` field: fulano@..."). Ou seja, entrada influenciada
 * pelo usuário atravessa esta regex, no caminho de falha. A regra de zero
 * dado pessoal em log é anterior a qualquer conveniência de diagnóstico, e o
 * custo de casar essa regra não pode ser uma superfície de negação de serviço.
 */
function redactEmails(text: string): string {
  return text.replace(/[^\s<>()"',;:@]{1,254}@[^\s<>()"',;:@]{1,254}/g, '[e-mail]')
}

/**
 * A falha de e-mail vira sinal, não silêncio.
 *
 * O erro ia para `console.error` numa função serverless que ninguém lê,
 * enquanto a pessoa via tela de sucesso. Agora ele sai em DOIS lugares:
 *
 *  log estruturado (JSON de uma linha), que dá para filtrar no Vercel;
 *  evento de produto, que permite alarme sobre "e-mail parou de sair" sem
 *    ninguém abrir log nenhum.
 *
 * `kind` separa defeito de CONFIGURAÇÃO (env faltando, que é problema nosso e
 * some com um deploy) de recusa de ENTREGA (provedor disse não), porque as
 * duas pedem ações diferentes de quem opera.
 */
async function reportEmailFailure(err: unknown): Promise<void> {
  const kind = err instanceof EmailConfigError ? 'config' : 'delivery'
  const reason = redactEmails(err instanceof Error ? err.message : 'desconhecido')

  console.error(
    JSON.stringify({
      level: 'error',
      event: 'waitlist_email_failed',
      provider: 'resend',
      kind,
      reason,
    }),
  )

  await captureServerEvent('waitlist_email_failed', EMAIL_FAILURE_DISTINCT_ID, {
    lp_version: 'v2',
    kind,
    reason,
  })
}

/**
 * Confirmação por e-mail. Falha aqui NUNCA derruba a inscrição: o lead já está
 * no Firestore, e uma recusa do provedor não é problema de quem se inscreveu.
 *
 * Continuar não derrubando a inscrição, mas parar de esconder a falha.
 * Devolver erro para a pessoa aqui seria trocar uma mentira por outra — a
 * inscrição dela deu certo mesmo.
 *
 * O `name` NÃO é repassado ao template. Ele entrava cru no HTML do e-mail, e o
 * destinatário também vem do corpo: era conteúdo arbitrário entregue a
 * endereço arbitrário pelo nosso domínio autenticado. O campo continua sendo
 * persistido no Firestore; o que morreu é a ponte dele para o corpo da
 * mensagem.
 */
async function sendConfirmationEmail(email: string): Promise<void> {
  try {
    await sendWaitlistConfirmationPT({ email })
  } catch (err) {
    await reportEmailFailure(err)
  }
}
