'use client'
import { useState } from 'react'
import posthog from 'posthog-js'
import { useLocale } from '@/lib/context/LocaleContext'

export default function WaitlistCTA() {
  const { locale } = useLocale()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const price       = locale === 'en' ? '$97'                       : 'R$97'
  const ctaLabel    = locale === 'en' ? `Get My Report: ${price}`  : `Quero meu Relatório: ${price}`
  const placeholder = locale === 'en' ? 'your@email.com'            : 'seu@email.com'

  const copy = {
    pt: {
      eyebrow: 'Acesso antecipado',
      h2: 'Entre na lista de espera',
      sub: 'Seja notificado quando o acesso beta abrir. Primeiros 100 usuários recebem 50% de desconto.',
      loading: 'Enviando...',
      success: '✓ Você está na lista! Entraremos em contato em breve.',
      error: 'Algo deu errado. Tente novamente.',
    },
    en: {
      eyebrow: 'Early access',
      h2: 'Join the waitlist',
      sub: 'Get notified when beta access opens. First 100 users receive 50% off.',
      loading: 'Sending...',
      success: '✓ You are on the list! We will be in touch soon.',
      error: 'Something went wrong. Please try again.',
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
        body: JSON.stringify({ email: email.trim() }),
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
    } catch {
      setStatus('error')
      // Nunca expor mensagem técnica ao usuário final
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
        <p className="text-lg text-text-secondary mb-10 leading-relaxed">
          {t.sub}
        </p>
        {status === 'success' ? (
          <div className="bg-semantic-success/10 border border-semantic-success/30 rounded-xl p-6">
            <p className="text-semantic-success font-bold">{t.success}</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading'}
                className="flex-1 bg-background-primary border border-white/10 focus:border-accent/50 rounded-xl px-5 py-4 text-text-primary placeholder-text-muted outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-cta-primary bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl transition-colors whitespace-nowrap"
              >
                {status === 'loading' ? t.loading : ctaLabel}
              </button>
            </form>
            {/* GNO-45b FIX C: GnoScore mention — mt-6 spacing + copy atualizado */}
            <p className="mt-6 text-xs text-white/50 text-center">
              Primeiros 100 inscritos recebem o GnoScore™ e acesso beta com 50% de desconto.
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
