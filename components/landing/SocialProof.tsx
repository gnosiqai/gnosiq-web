'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'

const testimonials = [
  {
    quote: '"Finalmente entendi por que tomo decisões bem em algumas áreas e trava em outras. O relatório foi cirúrgico."',
    name: 'Founder, SaaS B2B',
    role: 'Beta tester · São Paulo',
  },
  {
    quote: '"Melhor R$97 que investi em autoconhecimento profissional. Mais útil que o MBTI que fiz por R$600."',
    name: 'Head de Produto',
    role: 'Beta tester · Belo Horizonte',
  },
  {
    quote: '"Integrei a API no meu app de coaching em 2 horas. Documentação clara, latência ótima."',
    name: 'Desenvolvedor Independente',
    role: 'Beta tester · Remoto',
  },
]

export default function SocialProof() {
  const { locale } = useLocale()

  if (locale === 'en') {
    return (
      <section className="reveal py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ComingSoonBanner milestone="M2" />
        </div>
      </section>
    )
  }

  return (
    <section className="reveal py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-8 mb-20 text-center">
          <div>
            <div className="text-4xl font-bold text-accent mb-2">76</div>
            <div className="text-sm text-text-muted">NPS Beta</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">22min</div>
            <div className="text-sm text-text-muted">Tempo médio de assessment</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">18</div>
            <div className="text-sm text-text-muted">Páginas de relatório</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-background-secondary rounded-xl p-6 border border-white/5">
              <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">
                {t.quote}
              </p>
              <div>
                <p className="font-bold text-text-primary text-sm">{t.name}</p>
                <p className="text-text-muted text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
