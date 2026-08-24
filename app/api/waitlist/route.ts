import { NextRequest, NextResponse } from 'next/server'
import { addToWaitlist } from '@/lib/firestore'
import { normalizeToE164, isValidEmail } from '@/lib/waitlist/phone'

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
 */

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Requisição inválida.' },
        { status: 400 },
      )
    }

    const rawWhatsapp: string = typeof body.whatsapp === 'string' ? body.whatsapp : ''
    const rawEmail: string = typeof body.email === 'string' ? body.email : ''
    const rawName: string = typeof body.name === 'string' ? body.name : ''
    const rawRole: unknown = body.icp_segment
    const consent: unknown = body.consent

    if (
      rawWhatsapp.length > MAX_FIELD_LENGTH ||
      rawEmail.length > MAX_FIELD_LENGTH ||
      rawName.length > MAX_FIELD_LENGTH
    ) {
      return NextResponse.json(
        { success: false, error: 'Requisição inválida.' },
        { status: 400 },
      )
    }

    // LGPD: consentimento explícito é condição de entrada, não checkbox decorativo.
    if (consent !== true) {
      return NextResponse.json(
        {
          success: false,
          error: 'É necessário aceitar a Política de Privacidade para entrar na lista.',
        },
        { status: 400 },
      )
    }

    const hasWhatsapp = rawWhatsapp.trim().length > 0
    const hasEmail = rawEmail.trim().length > 0

    // Regra da v2: pelo menos um canal. Nenhum dos dois é individualmente obrigatório.
    if (!hasWhatsapp && !hasEmail) {
      return NextResponse.json(
        { success: false, error: 'Informe o WhatsApp ou o e-mail — pelo menos um dos dois.' },
        { status: 400 },
      )
    }

    let whatsapp: string | null = null
    if (hasWhatsapp) {
      whatsapp = normalizeToE164(rawWhatsapp)
      if (!whatsapp) {
        return NextResponse.json(
          {
            success: false,
            error: 'WhatsApp inválido. Use o formato com DDD, por exemplo (11) 91234-5678.',
          },
          { status: 400 },
        )
      }
    }

    let email: string | null = null
    if (hasEmail) {
      if (!isValidEmail(rawEmail)) {
        return NextResponse.json(
          { success: false, error: 'E-mail inválido. Verifique e tente novamente.' },
          { status: 400 },
        )
      }
      email = rawEmail.trim().toLowerCase()
    }

    const icpSegment =
      typeof rawRole === 'string' && ALLOWED_ROLES.has(rawRole) ? rawRole : null

    const { alreadyExists } = await addToWaitlist({
      whatsapp,
      email,
      name: rawName,
      icpSegment,
    })

    // E-mail de confirmação só faz sentido se a pessoa deixou e-mail.
    if (!alreadyExists && email) {
      await sendConfirmationEmail(email, rawName)
    }

    return NextResponse.json(
      {
        success: true,
        alreadyExists,
        message: alreadyExists
          ? 'Você já está na lista de espera.'
          : 'Você está na lista de espera.',
      },
      { status: 200 },
    )
  } catch (err) {
    // Log interno sem PII: só a mensagem do erro, nunca o corpo da requisição.
    console.error('[waitlist] Erro:', err instanceof Error ? err.message : 'desconhecido')
    return NextResponse.json({ success: false, error: GENERIC_ERROR }, { status: 503 })
  }
}

/**
 * Confirmação por e-mail. Falha aqui NUNCA derruba a inscrição: o lead já
 * está no Firestore, e um erro do SendGrid não é problema do usuário.
 */
async function sendConfirmationEmail(email: string, name: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey) {
    console.warn('[waitlist] SENDGRID_API_KEY ausente em runtime — e-mail não enviado')
    return
  }

  try {
    // Import dinâmico: evita instância top-level que explode no cold start.
    const sgMail = (await import('@sendgrid/mail')).default
    sgMail.setApiKey(apiKey)

    const firstName = name.trim().split(' ')[0] || 'olá'

    await sgMail.send({
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@gnosiq.ai',
        name: 'Carlos @ GnosIQ',
      },
      subject: 'Você está na lista de espera da GnosIQ',
      text: `${firstName},\n\nVocê está na lista de espera da GnosIQ.\n\nA GnosIQ mapeia o seu perfil cognitivo com instrumentos validados e IA especializada, e entrega um relatório com o seu GnoScore™.\n\nAviso: a GnosIQ não substitui avaliação clínica.\n\nAvisamos você pessoalmente quando o acesso beta abrir.\n\n— Carlos\nFounder, GnosIQ\ngnosiq.ai`,
      html: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"></head><body style="background:#0D0B1E;color:#FFFFFF;font-family:Inter,sans-serif;padding:40px 24px;max-width:600px;margin:0 auto;"><p style="color:#8B5CF6;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;">GNOSIQ</p><h1 style="font-size:24px;font-weight:700;margin-bottom:16px;">Você está na lista, ${firstName}.</h1><p style="color:#A1A1AA;line-height:1.7;margin-bottom:24px;">A GnosIQ mapeia o seu perfil cognitivo com instrumentos validados e IA especializada, e entrega um relatório com o seu GnoScore™.</p><p style="color:#A1A1AA;line-height:1.7;margin-bottom:32px;">Avisamos você pessoalmente quando o acesso beta abrir.</p><hr style="border:none;border-top:1px solid #1F1B3A;margin-bottom:32px;"><p style="color:#6B7280;font-size:13px;">A GnosIQ não substitui avaliação clínica.</p><p style="color:#6B7280;font-size:13px;">Carlos Alberto Gomes · Founder, GnosIQ<br><a href="https://gnosiq.ai" style="color:#8B5CF6;">gnosiq.ai</a></p></body></html>`,
    })
  } catch (emailErr) {
    console.error(
      '[waitlist] SendGrid error:',
      emailErr instanceof Error ? emailErr.message : 'desconhecido',
    )
  }
}
