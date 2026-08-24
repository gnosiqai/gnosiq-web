'use client'

import { useState } from 'react'
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

export default function WaitlistSection() {
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  /** Espelha a regra do servidor. O servidor revalida — isto é só feedback. */
  const validate = (): string | null => {
    const hasWhatsapp = whatsapp.trim().length > 0
    const hasEmail = email.trim().length > 0

    if (!hasWhatsapp && !hasEmail) {
      return 'Informe o WhatsApp ou o e-mail — pelo menos um dos dois.'
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
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
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
        channel:
          whatsapp.trim() && email.trim()
            ? 'both'
            : whatsapp.trim()
              ? 'whatsapp'
              : 'email',
        icp_type: role || null,
        already_existed: data.alreadyExists === true,
        ...getUtmParams(),
      })

      setStatus('success')
    } catch {
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
          <div
            role="status"
            className="bg-semantic-success/10 border border-semantic-success/30 rounded-xl p-8 text-center mt-8"
          >
            <p className="font-bold text-semantic-success text-lg m-0">
              Você está na lista. ✓
            </p>
            <p className="text-text-secondary mt-3">
              Avisamos você assim que o beta abrir, pelo canal que você deixou.
            </p>
            <p className="text-sm text-text-muted mt-3">
              Sem cobrança agora. A GnosIQ não substitui avaliação clínica.
            </p>
          </div>
        ) : (
          <>
            <p className="text-base text-text-muted text-center mb-10">
              Informe o WhatsApp ou o e-mail — pelo menos um dos dois.
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 text-left">
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
                  . Posso pedir a exclusão a qualquer momento.
                </span>
              </label>

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
