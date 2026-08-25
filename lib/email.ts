import { Resend } from 'resend'

/**
 * GNO-122 — e-mail transacional via Resend.
 *
 * Substitui `lib/sendgrid.ts` e o template PT que vivia inline em
 * `app/api/waitlist/route.ts`. Os dois senders passam a morar aqui: eram duas
 * implementações do mesmo ato, com dois jeitos diferentes de falhar.
 *
 * O QUE ORIGINOU ESTA MIGRAÇÃO (incidente do E2E da LP v2): o SendGrid
 * respondia 401 em produção, o erro morria num `console.error` que ninguém lê,
 * e a pessoa via tela verde de sucesso. É bem possível que nenhum e-mail de
 * confirmação tenha saído desde 28/mai/2026 sem que ninguém percebesse.
 *
 * Daí as duas regras que este módulo existe para impor:
 *
 *  1. FAIL-FAST DE CONFIGURAÇÃO. Env ausente é erro explícito, nunca fallback.
 *     A versão SendGrid caía em `|| 'noreply@gnosiq.ai'` quando o remetente
 *     não estava configurado: um endereço que não existe no domínio, ou seja,
 *     entrega quebrada disfarçada de código que "funciona".
 *
 *  2. FALHA DE ENVIO É OBSERVÁVEL. O SDK do Resend NÃO lança em erro de API:
 *     devolve `{ data, error }`. Quem não olha o `error` acha que enviou.
 *     Aqui o `error` vira exceção tipada, e quem chama decide o que fazer com
 *     ela - mas não tem como não ficar sabendo.
 */

/** Remetente: nome de exibição fixo, endereço vindo do ambiente. */
const SENDER_NAME = 'Carlos @ GnosIQ'

/** Env de e-mail ausente em runtime. Defeito de configuração, não de envio. */
export class EmailConfigError extends Error {
  constructor(variable: string) {
    super(`${variable} ausente em runtime`)
    this.name = 'EmailConfigError'
  }
}

/** O provedor recusou o envio. Carrega o motivo, nunca o destinatário. */
export class EmailDeliveryError extends Error {
  constructor(reason: string) {
    super(reason)
    this.name = 'EmailDeliveryError'
  }
}

/**
 * Configuração obrigatória, sem default nenhum.
 *
 * Nada de `||` com valor de emergência: um remetente inventado passa no
 * TypeScript e falha na caixa de entrada de quem se inscreveu.
 */
function requireEmailConfig(): { apiKey: string; from: string } {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new EmailConfigError('RESEND_API_KEY')

  const from = process.env.EMAIL_FROM
  if (!from) throw new EmailConfigError('EMAIL_FROM')

  return { apiKey, from }
}

type Payload = {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * Envia e confirma que enviou.
 *
 * @throws {EmailConfigError} env ausente
 * @throws {EmailDeliveryError} provedor recusou
 */
async function send({ to, subject, text, html }: Payload): Promise<string> {
  const { apiKey, from } = requireEmailConfig()

  // Instância por chamada: cliente no topo do módulo explode no cold start
  // quando a env não está lá, e derruba a rota inteira por causa do e-mail.
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: `${SENDER_NAME} <${from}>`,
    to,
    subject,
    text,
    html,
  })

  /*
    O ponto exato da classe de falha silenciosa que esta issue mata: o SDK
    devolve o erro em vez de lançar. Sem este `if`, um 401 vira sucesso.
  */
  if (error) {
    throw new EmailDeliveryError(error.message || error.name || 'erro sem detalhe do provedor')
  }

  if (!data?.id) {
    throw new EmailDeliveryError('provedor não devolveu id da mensagem')
  }

  return data.id
}

interface ConfirmationParams {
  email: string
  name: string
}

/**
 * Confirmação PT da lista de espera. Copy INALTERADA na migração: já estava
 * conforme a regra de voz da marca (GNO-121) e a trava cobre os dois templates.
 */
export async function sendWaitlistConfirmationPT({
  email,
  name,
}: ConfirmationParams): Promise<string> {
  const firstName = name.trim().split(' ')[0] || 'olá'

  return send({
    to: email,
    subject: 'Você está na lista de espera da GnosIQ',
    text: `${firstName},\n\nVocê está na lista de espera da GnosIQ.\n\nA GnosIQ mapeia o seu perfil cognitivo com instrumentos validados e IA especializada, e entrega um relatório com o seu GnoScore™.\n\nAviso: a GnosIQ não substitui avaliação clínica.\n\nAvisamos você pessoalmente quando o acesso beta abrir.\n\n- Carlos\nFounder, GnosIQ\ngnosiq.ai`,
    html: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"></head><body style="background:#0D0B1E;color:#FFFFFF;font-family:Inter,sans-serif;padding:40px 24px;max-width:600px;margin:0 auto;"><p style="color:#8B5CF6;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;">GNOSIQ</p><h1 style="font-size:24px;font-weight:700;margin-bottom:16px;">Você está na lista, ${firstName}.</h1><p style="color:#A1A1AA;line-height:1.7;margin-bottom:24px;">A GnosIQ mapeia o seu perfil cognitivo com instrumentos validados e IA especializada, e entrega um relatório com o seu GnoScore™.</p><p style="color:#A1A1AA;line-height:1.7;margin-bottom:32px;">Avisamos você pessoalmente quando o acesso beta abrir.</p><hr style="border:none;border-top:1px solid #1F1B3A;margin-bottom:32px;"><p style="color:#6B7280;font-size:13px;">A GnosIQ não substitui avaliação clínica.</p><p style="color:#6B7280;font-size:13px;">Carlos Alberto Gomes · Founder, GnosIQ<br><a href="https://gnosiq.ai" style="color:#8B5CF6;">gnosiq.ai</a></p></body></html>`,
  })
}

/**
 * Confirmação EN. Copy INALTERADA na migração (vinha de lib/sendgrid.ts).
 */
export async function sendWaitlistConfirmation({
  email,
  name,
}: ConfirmationParams): Promise<string> {
  const firstName = name.split(' ')[0] || 'there'

  return send({
    to: email,
    subject: "You're on the GnosIQ waitlist 🧠",
    text: `Hey ${firstName},\n\nYou're officially on the GnosIQ waitlist.\n\nGnosIQ is the first API that turns human potential into computable capital.\n\nWe'll reach out personally when early access opens.\n\n- Carlos\nFounder, GnosIQ\ngnosiq.ai`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="background:#0D0B1E;color:#FFFFFF;font-family:Inter,sans-serif;padding:40px 24px;max-width:600px;margin:0 auto;"><p style="color:#8B5CF6;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;">GNOSIQ</p><h1 style="font-size:24px;font-weight:700;margin-bottom:16px;">You're on the waitlist, ${firstName}.</h1><p style="color:#A1A1AA;line-height:1.7;margin-bottom:24px;">GnosIQ is the first API that turns human potential into computable capital.<br>Deep cognitive assessment. Affordable. Programmatic. 30 minutes.</p><p style="color:#A1A1AA;line-height:1.7;margin-bottom:32px;">We'll reach out personally when early access opens.</p><hr style="border:none;border-top:1px solid #1F1B3A;margin-bottom:32px;"><p style="color:#6B7280;font-size:13px;">Carlos Gomes · Founder, GnosIQ<br><a href="https://gnosiq.ai" style="color:#8B5CF6;">gnosiq.ai</a></p></body></html>`,
  })
}
