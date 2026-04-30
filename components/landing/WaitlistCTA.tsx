'use client'
import { useState } from 'react'
import posthog from 'posthog-js'
import { useLocale } from '@/lib/context/LocaleContext'

export default function WaitlistCTA() {
  const { locale } = useLocale()
  const [email, setEmail] = useState('')
  const [icpSegment, setIcpSegment] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const copy = {
    pt: {
      eyebrow: 'Acesso Antecipado · Vagas Limitadas',
      h2: 'Entre na lista de espera',
      sub: 'Seja notificado quando o acesso beta abrir.',
      cta: 'Entrar na lista de espera →',
      placeholder: 'seu@email.com',
      loading: 'Enviando...',
      error: 'Algo deu errado. Tente novamente.',
      vagas: 'Primeiros 100 inscritos: acesso beta por R$97 (preço de lançamento).',
      icpPlaceholder: 'Sou um... (opcional)',
    },
    en: {
      eyebrow: 'Early Access · Limited Spots',
      h2: 'Join the waitlist',
      sub: 'Get notified when beta access opens.',
      cta: 'Join the waitlist →',
      placeholder: 'your@email.com',
      loading: 'Sending...',
      error: 'Something went wrong. Please try again.',
      vagas: 'First 100 subscribers: beta access for R$97 (launch price).',
      icpPlaceholder: 'I am a... (optional)',
    },
  }
  const t = copy[locale]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          icp_segment: icpSegment || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Request failed')
      }
      setStatus('success')
      // GNO-48: PostHog event — LGPD: apenas domínio do email, nunca PII completo
      posthog.capture('waitlist signed_up', {
        source: 'landing_cta',
        email_domain: email.trim().split('@')[1],
      })
      // GNO-74: PostHog icp_selected — guard obrigatório: só dispara se preenchido
      if (icpSegment) {
        posthog.capture('icp_selected', { segment: icpSegment })
      }
    } catch {
      setStatus('error')
      setErrorMsg(
        locale === 'en'
          ? 'Service temporarily unavailable. Please try again in a moment.'
          : 'Serviço temporariamente indisponível. Tente novamente em instantes.',
      )
    }
  }

  return (
    <section id="waitlist" className="reveal py-24 px-6 bg-background-secondary">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-4">
          {t.eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t.h2}
        </h2>
        <p className="text-lg text-text-secondary mb-4 leading-relaxed">
          {t.sub}
        </p>
        <p className="text-sm text-text-muted mb-8">
          {t.vagas}
        </p>
        {status === 'success' ? (
          <div className="bg-semantic-success/10 border border-semantic-success/30 rounded-xl p-6">
            <p className="font-semibold text-semantic-success">Você está na lista. ✓</p>
            <p className="text-text-secondary mt-2">Assim que o beta abrir, você recebe o link direto no e-mail.</p>
            <p className="text-sm text-text-muted mt-2">
              Primeiros 100 inscritos garantem acesso ao preço de lançamento.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                name="icp_segment"
                value={icpSegment}
                onChange={(e) => setIcpSegment(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 bg-background-primary border border-white/10 focus:border-accent/50 rounded-xl px-5 py-4 text-text-primary placeholder-text-muted outline-none transition-colors disabled:opacity-50"
              >
                <option value="">{t.icpPlaceholder}</option>
                <option value="founder">Founder / CEO</option>
                <option value="product">Gestor de Produto / CPO</option>
                <option value="coach">Coach Executivo</option>
                <option value="dev">Desenvolvedor / CTO</option>
                <option value="hr">RH / People</option>
                <option value="other">Outro</option>
              </select>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  disabled={status === 'loading'}
                  className="flex-1 bg-background-primary border border-white/10 focus:border-accent/50 rounded-xl px-5 py-4 text-text-primary placeholder-text-muted outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-cta-primary bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl transition-colors whitespace-nowrap"
                >
                  {status === 'loading' ? t.loading : t.cta}
                </button>
              </div>
            </form>
            <p className="mt-3 text-xs text-white/40 text-center">
              Ao se inscrever, você concorda com nossa{' '}
              <a href="/privacy" className="text-accent/70 hover:text-accent underline">
                Política de Privacidade
              </a>
              . Seus dados não serão compartilhados com terceiros.
            </p>
            <p className="mt-6 text-xs text-white/50 text-center">
              Primeiros 100 inscritos: acesso beta por R$97 (preço de lançamento).
            </p>
          </>
        )}
        {status === 'error' && (
          <p className="mt-4 text-semantic-error text-sm">{errorMsg || t.error}</p>
        )}
      </div>
    </section>
  )
}
