'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import FounderSlots from './FounderSlots'
import { isValidEmail, isValidWhatsApp } from '@/lib/waitlist/phone'
import { getUtmParams } from '@/lib/waitlist/utm'

// GNO-115 — bloco de conversão. Objetivo único da LP v2.
//
// WhatsApp-first: o canal vem primeiro porque é o canal real do público BR.
// E-mail continua aceito. Pelo menos UM dos dois é obrigatório — nenhum é
// obrigatório sozinho. É a regra da issue e do mockup ("Informe o WhatsApp ou
// o e-mail — pelo menos um dos dois").
//
// GATE CISO T1 (WhatsApp = dado pessoal novo), lado cliente:
//  · nenhum evento do PostHog carrega telefone, e-mail ou nome. A v1 mandava
//    `email` como propriedade de `icp_selected` E de `waitlist_signed_up`;
//    isso saiu. O distinct_id do PostHog já atribui a conversão.
//  · consentimento LGPD é checkbox explícito e obrigatório, não pré-marcado,
//    e a rota recusa a inscrição sem ele.
//
// GNO-120 — Cloudflare Turnstile, modo MANAGED. O widget aqui só PRODUZ o
// token; quem decide é o servidor, que revalida contra o siteverify antes de
// escrever qualquer coisa. Nada nesta tela é barreira de segurança: um bot
// pode ignorar o componente inteiro e postar direto na rota. O valor de ter o
// widget é gerar o token para o humano real, sem fricção.

const ROLES = [
  { value: 'profissional', label: 'Profissional' },
  { value: 'founder', label: 'Founder / CEO' },
  { value: 'executivo', label: 'Executivo / Liderança' },
  { value: 'rh', label: 'RH / People' },
  { value: 'estudante', label: 'Estudante' },
  { value: 'curioso', label: 'Curioso' },
  { value: 'other', label: 'Outro' },
] as const

type Status = 'idle' | 'loading' | 'success' | 'error'

/**
 * Renderização EXPLÍCITA (`render=explicit`): a implícita varre o DOM sozinha
 * atrás de `.cf-turnstile` e briga com o ciclo de vida do React, que monta e
 * desmonta o nó quando bem entende. Explícito, quem manda no widget é o
 * efeito abaixo.
 */
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Promise única do script: dois formulários na página não baixam duas vezes. */
let turnstileScript: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (turnstileScript) return turnstileScript

  turnstileScript = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('turnstile script')))
      return
    }

    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('turnstile script'))
    document.head.appendChild(script)
  })

  return turnstileScript
}

export default function WaitlistSection() {
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [consent, setConsent] = useState(false)
  // Campo-isca: humano nunca preenche, então qualquer valor aqui é bot.
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  // Token do Turnstile. `null` = ainda não veio, expirou ou já foi gasto.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // Script bloqueado (bloqueador de anúncio, rede fora): sem widget, sem token.
  const [widgetFailed, setWidgetFailed] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)

  /*
    Sitekey é público por definição (vai no HTML de qualquer jeito), por isso
    NEXT_PUBLIC. Ausente = configuração incompleta: o formulário assume o
    mesmo fail-closed do servidor e não deixa enviar, em vez de mandar um POST
    que a rota vai descartar em silêncio.
  */
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  useEffect(() => {
    if (!siteKey) return

    let cancelled = false

    const mountWidget = () => {
      if (cancelled || !widgetRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token: string) => setTurnstileToken(token),
        // Token do Turnstile é de uso único e expira. Nos dois casos o
        // estado volta a `null` e o widget se reapresenta sozinho.
        'error-callback': () => setTurnstileToken(null),
        'expired-callback': () => setTurnstileToken(null),
      })
    }

    /*
      API já presente (remontagem do componente, navegação client-side) =
      monta na hora, sem passar pelo carregamento de novo. Fora a economia,
      isso evita o piscar de um espaço vazio onde o widget já poderia estar.
    */
    if (window.turnstile) {
      mountWidget()
    } else {
      loadTurnstileScript()
        .then(mountWidget)
        .catch(() => {
          if (!cancelled) setWidgetFailed(true)
        })
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = undefined
    }
  }, [siteKey])

  /** Devolve o widget ao estado inicial: token gasto não serve para reenvio. */
  const resetWidget = () => {
    setTurnstileToken(null)
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current)
  }

  /** Espelha a regra do servidor. O servidor revalida — isto é só feedback. */
  const validate = (): string | null => {
    const hasWhatsapp = whatsapp.trim().length > 0
    const hasEmail = email.trim().length > 0

    if (!hasWhatsapp && !hasEmail) {
      return 'Informe o WhatsApp ou o e-mail: pelo menos um dos dois.'
    }
    if (hasWhatsapp && !isValidWhatsApp(whatsapp)) {
      return 'WhatsApp inválido. Use o formato com DDD, por exemplo (11) 91234-5678.'
    }
    if (hasEmail && !isValidEmail(email)) {
      return 'E-mail inválido. Verifique e tente novamente.'
    }
    if (!consent) {
      return 'É necessário aceitar a Política de Privacidade para entrar na lista.'
    }
    if (!siteKey || widgetFailed) {
      return 'Verificação de segurança indisponível. Recarregue a página e tente de novo.'
    }
    if (!turnstileToken) {
      return 'Aguarde a verificação de segurança terminar e tente de novo.'
    }
    return null
  }

  /** Qual canal a pessoa usou — nunca o valor digitado (GATE CISO). */
  const resolveChannel = (): 'both' | 'whatsapp' | 'email' => {
    const hasWhatsapp = whatsapp.trim().length > 0
    const hasEmail = email.trim().length > 0
    if (hasWhatsapp && hasEmail) return 'both'
    return hasWhatsapp ? 'whatsapp' : 'email'
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'loading') return

    const validationError = validate()
    if (validationError) {
      setStatus('error')
      setErrorMsg(validationError)
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          icp_segment: role || null,
          consent,
          website,
          turnstile_token: turnstileToken,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
        // O token já foi consumido na tentativa: sem reset, o reenvio levaria
        // um token gasto e o servidor reprovaria de novo, para sempre.
        resetWidget()
        setStatus('error')
        setErrorMsg(data?.error ?? 'Serviço temporariamente indisponível. Tente novamente em instantes.')
        return
      }

      /*
        EVENTO DE CONVERSÃO — só após confirmação da API, e com UTM anexado
        (DoD: medir conversão v1 vs v2 por origem). Sem PII: o que vai é o
        CANAL escolhido, não o valor digitado.
      */
      posthog.capture('waitlist_signed_up', {
        lp_version: 'v2',
        channel: resolveChannel(),
        icp_type: role || null,
        ...getUtmParams(),
      })

      setStatus('success')
    } catch {
      resetWidget()
      setStatus('error')
      setErrorMsg('Serviço temporariamente indisponível. Tente novamente em instantes.')
    }
  }

  const fieldClass =
    'w-full bg-background-secondary border border-accent/[0.14] focus:border-accent/60 rounded-lg px-5 py-4 text-base text-text-primary placeholder-text-muted outline-none transition-colors disabled:opacity-50'

  return (
    <section
      id="waitlist"
      className="reveal py-20 md:py-24 px-6 scroll-mt-20"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 70% 60% at 50% 110%, rgba(139,92,246,0.18) 0%, transparent 70%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Item 3 do delta: citação do founder como proof block junto do form */}
        <blockquote className="border-l-2 border-accent pl-6 max-w-xl mx-auto mb-12 m-0">
          <p className="text-lg text-text-secondary leading-relaxed italic m-0">
            &ldquo;Construí a GnosIQ porque fui o primeiro a precisar dela. Passei anos
            tomando decisões de alta consequência sem entender como a minha própria mente
            funcionava.&rdquo;
          </p>
          <footer className="text-sm text-text-muted mt-3">
            <span className="text-text-primary font-bold">Carlos Alberto Gomes</span> · CEO
            &amp; Founder
          </footer>
        </blockquote>

        <h2 className="text-3xl md:text-[40px] font-bold text-text-primary tracking-tight text-center mb-3.5">
          Entrar na lista de espera
        </h2>

        {status === 'success' ? (
          <output className="block bg-semantic-success/10 border border-semantic-success/30 rounded-xl p-8 text-center mt-8">
            <p className="font-bold text-semantic-success text-lg m-0">
              Você está na lista. ✓
            </p>
            <p className="text-text-secondary mt-3">
              Avisamos você assim que o beta abrir, pelo canal que você deixou.
            </p>
            <p className="text-sm text-text-muted mt-3">
              Sem cobrança agora. A GnosIQ não substitui avaliação clínica.
            </p>
          </output>
        ) : (
          <>
            <p className="text-base text-text-muted text-center mb-10">
              Informe o WhatsApp ou o e-mail: pelo menos um dos dois.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 text-left">
              {/*
                HONEYPOT (GNO-115, item 6 do checklist CISO — parte "a").
                Primeiro campo do formulário: é o que um bot que preenche em
                ordem encontra antes de tudo. Invisível ao humano, fora da
                ordem de tabulação e ignorado por leitor de tela. O servidor
                decide — isto aqui só carrega o valor.
              */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hp-field"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label htmlFor="wa" className="block text-sm font-semibold text-text-secondary mb-2">
                  WhatsApp
                </label>
                <input
                  id="wa"
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+55 11 91234-5678"
                  disabled={status === 'loading'}
                  className={`${fieldClass} border-accent/35`}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-secondary mb-2">
                  ou e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  disabled={status === 'loading'}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-text-secondary mb-2">
                  Sou um... <span className="text-text-muted font-normal">(opcional)</span>
                </label>
                <select
                  id="role"
                  name="icp_segment"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={status === 'loading'}
                  className={fieldClass}
                >
                  <option value="">Selecionar</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consentimento LGPD — explícito, não pré-marcado */}
              <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer mt-1">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={status === 'loading'}
                  className="mt-1 w-4 h-4 shrink-0 accent-[#8B5CF6] cursor-pointer"
                />
                <span className="text-[13px] text-text-muted leading-relaxed">
                  Concordo que a GnosIQ use os dados acima para me avisar sobre o acesso
                  beta, conforme a{' '}
                  <a
                    href="/privacy"
                    className="text-accent-light hover:text-accent underline"
                  >
                    Política de Privacidade
                  </a>
                  {'. '}Posso pedir a exclusão a qualquer momento.
                </span>
              </label>

              {/*
                GNO-120 — widget Turnstile (modo Managed). Fica junto do botão
                porque é o último passo antes do envio; o desafio interativo,
                quando aparece, aparece onde o olho já está.
              */}
              <div ref={widgetRef} className="flex justify-center min-h-[65px]" />

              {(!siteKey || widgetFailed) && (
                <p role="alert" className="text-semantic-error text-sm text-center">
                  Verificação de segurança indisponível. Recarregue a página e tente de novo.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-cta-primary bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-bold text-lg py-[18px] rounded-xl transition-colors mt-2"
              >
                {status === 'loading' ? 'Enviando...' : 'Entrar na lista de espera'}
              </button>

              {status === 'error' && (
                <p role="alert" className="text-semantic-error text-sm text-center">
                  {errorMsg}
                </p>
              )}

              <p className="text-[13px] text-text-muted text-center leading-relaxed">
                Sem cobrança agora. Usamos seus dados apenas para o acesso ao beta.
              </p>

              <FounderSlots className="text-[13px] text-text-muted text-center" />
            </form>
          </>
        )}
      </div>
    </section>
  )
}
