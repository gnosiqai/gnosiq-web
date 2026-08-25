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
 * GNO-115 — waitlist-first com WhatsApp.
 *
 * GATE CISO T1: o campo WhatsApp é DADO PESSOAL NOVO neste endpoint. Regras
 * aplicadas aqui, para revisão no PR:
 *
 *  1. Nenhum telefone (nem e-mail) aparece em log. A v1 mandava o e-mail
 *     para o PostHog como propriedade do evento; a v2 não manda nenhum dos
 *     dois — o identificador do PostHog basta para atribuir a conversão.
 *  2. O número é normalizado para E.164 ANTES de tocar o Firestore. Um
 *     formato só por documento evita dedupe furada e evita que o mesmo
 *     humano vire dois leads.
 *  3. Validação é server-side de verdade: o cliente valida para dar feedback,
 *     esta rota valida para decidir. Payload malformado morre com 400.
 *  4. Erro interno nunca vaza stack trace nem conteúdo de credencial.
 *  5. Consentimento LGPD é obrigatório e registrado — sem ele, 400.
 *  6. Honeypot server-side contra flood de bot (item 6 do checklist CISO,
 *     parte "a").
 *
 * GNO-120 fecha a parte "b" do mesmo item: Cloudflare Turnstile verificado no
 * servidor ANTES de qualquer escrita ou envio. As duas camadas compartilham a
 * mesma regra de saída — reprovar devolve a resposta de sucesso, byte a byte,
 * porque uma resposta distinta seria um oráculo contando ao atacante qual
 * defesa ele acabou de tocar.
 */

/**
 * Campo-isca. Invisível para humano, irresistível para bot que preenche
 * tudo que encontra no formulário. Preenchido = descarta em silêncio.
 *
 * O nome é plausível de propósito: um campo chamado "honeypot" seria
 * ignorado por qualquer bot minimamente esperto.
 */
const HONEYPOT_FIELD = 'website'

/** Identidade única para todos os trips — conta eventos, não pessoas. */
const HONEYPOT_DISTINCT_ID = 'honeypot-bot'

/** Campo do corpo que carrega o token emitido pelo widget Turnstile. */
const TURNSTILE_FIELD = 'turnstile_token'

/** Mesma lógica do honeypot: conta reprovações, não pessoas. */
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

  // LGPD: consentimento explícito é condição de entrada, não checkbox decorativo.
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
 * GATE CISO T1 (itens 4 e 7 do checklist): a versão anterior devolvia
 * `alreadyExists` e duas mensagens distintas. Isso é um ORÁCULO DE
 * ENUMERAÇÃO — qualquer um podia postar um e-mail ou telefone e descobrir,
 * pela resposta, se aquela pessoa está na waitlist. Numa lista de espera de
 * avaliação cognitiva, confirmar que alguém se inscreveu já é informação
 * pessoal sobre essa pessoa.
 *
 * Custo aceito: o evento do PostHog perdeu a propriedade `already_existed`.
 * O DoD pede o evento de conversão com UTM, e isso continua de pé.
 */
const SUCCESS_RESPONSE = {
  success: true,
  message: 'Pronto. Se estiver tudo certo, avisamos você quando o beta abrir.',
} as const

/**
 * UTMs da origem do envio, lidos do cabeçalho `Referer`.
 *
 * DELIBERADAMENTE não vêm do corpo: quem dispara o honeypot é um bot, e o
 * corpo dele é dado hostil. O Referer é o que o navegador (ou o cliente)
 * declara como página de origem — continua sendo dado de terceiro, mas é
 * metadado de transporte, não payload, e passa por uma allowlist de 5
 * chaves com valor truncado antes de virar propriedade de evento.
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
 * As duas camadas anti-bot, na ordem em que custam.
 *
 * HONEYPOT primeiro, porque é decisão local: nem gasta chamada de rede com um
 * bot que já se entregou. Um bot não pode receber nem sequer feedback de
 * "campo inválido" — isso já seria sinal de que a armadilha existe.
 *
 * TURNSTILE depois, e ainda assim antes de qualquer escrita no Firestore ou
 * envio de e-mail: é essa ordem que a issue exige, e é ela que garante que um
 * token reprovado não deixe rastro nenhum no placar de fundadores.
 *
 * Retorna a resposta a devolver quando o request deve morrer aqui, ou `null`
 * quando ele está liberado para seguir. A resposta é sempre a MESMA de
 * sucesso — nunca um oráculo dizendo qual defesa reprovou.
 */
async function screenForBots(req: NextRequest, body: unknown): Promise<NextResponse | null> {
  const trap = fieldOf(body, HONEYPOT_FIELD)
  if (typeof trap === 'string' && trap.trim().length > 0) {
    await captureServerEvent('waitlist_honeypot_tripped', HONEYPOT_DISTINCT_ID, {
      lp_version: 'v2',
      ...utmFromReferer(req),
    })
    return NextResponse.json(SUCCESS_RESPONSE, { status: 200 })
  }

  const verdict = await verifyTurnstileToken(fieldOf(body, TURNSTILE_FIELD))
  if (!verdict.ok) {
    /*
      `reason` separa "nem mandou token" (bot que ignora o widget) de "mandou
      token reprovado" (token forjado, expirado ou já gasto). É métrica de
      operação, não de pessoa: nenhum campo do formulário entra no evento.
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
      Corpo ilegível morre aqui, ANTES do gate anti-bot, e continua sendo 400
      como na GNO-115.

      Não é inconsistência com a regra do não-oráculo: isto é erro de
      TRANSPORTE, não veredito sobre quem enviou. Não dá para screenar o que
      não dá para ler, e um 400 aqui não conta nada sobre nenhuma pessoa - só
      diz que o que chegou não era JSON. Devolver a resposta de sucesso neste
      caso esconderia bug de cliente nosso atrás de uma tela verde.
    */
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Requisição inválida.' }, { status: 400 })
    }

    // Gate anti-bot ANTES de validar, de persistir e de enviar e-mail.
    const blocked = await screenForBots(req, body)
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
      await sendConfirmationEmail(parsed.email, parsed.name)
    }

    return NextResponse.json(SUCCESS_RESPONSE, { status: 200 })
  } catch (err) {
    /*
      FAIL-CLOSED do Turnstile, explícito.

      Secret ausente (defeito de configuração nosso) e siteverify fora do ar
      são as DUAS situações em que a camada anti-bot não consegue decidir. Nas
      duas, a inscrição não passa: nada é escrito, nada é enviado.

      E a resposta aqui é 503, não a resposta genérica de sucesso — de
      propósito. Não há oráculo nisso: a falha independe do que a pessoa
      digitou, então não conta nada sobre ninguém. O que ela conta é para o
      humano legítimo, que recebe "tente de novo em instantes" em vez de uma
      tela de sucesso mentindo sobre uma inscrição que não aconteceu. Essa
      mentira silenciosa é exatamente a classe de falha que a GNO-122 está
      matando no caminho de e-mail.
    */
    if (err instanceof TurnstileConfigError || err instanceof TurnstileUnavailableError) {
      console.error('[waitlist] Turnstile fail-closed:', err.message)
      return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 503 })
    }

    // Log interno sem PII: só a mensagem do erro, nunca o corpo da requisição.
    console.error('[waitlist] Erro:', err instanceof Error ? err.message : 'desconhecido')
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 503 })
  }
}

/**
 * Token com cara de e-mail, em tempo LINEAR.
 *
 * Duas decisões, e as duas são de segurança:
 *
 *  1. `@` está EXCLUÍDO das duas classes. A versão anterior
 *     (`[^\s<>()"',;]+@[^\s<>()"',;]+`) deixava o `@` cair dentro das
 *     classes, então existiam N formas de dividir a mesma string em
 *     "antes do @" e "depois do @". Numa string longa sem match, o motor
 *     testava todas: custo quadrático. Medido antes da correção, com uma
 *     string de 'a' e nenhum `@`: 4k chars = 9ms, 64k = 2369ms (16x a
 *     entrada, 249x o tempo). Sem o `@` nas classes só existe uma divisão
 *     possível, e o mesmo teste vira 2,4ms e 39ms (16x a entrada, 16x o
 *     tempo). Achado typescript:S8786.
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
 * PII em log é anterior a qualquer conveniência de diagnóstico, e o custo
 * de casar essa regra não pode ser uma superfície de DoS.
 */
function redactEmails(text: string): string {
  return text.replace(/[^\s<>()"',;:@]{1,254}@[^\s<>()"',;:@]{1,254}/g, '[e-mail]')
}

/**
 * GNO-122 — a falha de e-mail vira sinal, não silêncio.
 *
 * Esta função é a resposta direta ao incidente que originou a issue: o erro
 * ia para `console.error` numa função serverless que ninguém lê, enquanto a
 * pessoa via tela de sucesso. Agora ele sai em DOIS lugares:
 *
 *  · log estruturado (JSON de uma linha), que dá para filtrar no Vercel;
 *  · evento de produto, que aparece no PostHog junto do resto e permite
 *    alarme sobre "e-mail parou de sair" sem ninguém abrir log nenhum.
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
 * O que MUDOU na GNO-122 não é isso, é o oposto disso: continuar não derrubando
 * a inscrição, mas parar de esconder a falha. Devolver erro para a pessoa aqui
 * seria trocar uma mentira por outra - a inscrição dela deu certo mesmo.
 */
async function sendConfirmationEmail(email: string, name: string): Promise<void> {
  try {
    await sendWaitlistConfirmationPT({ email, name })
  } catch (err) {
    await reportEmailFailure(err)
  }
}
