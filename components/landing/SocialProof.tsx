'use client'

import { useLocale } from '@/lib/context/LocaleContext'
import ComingSoonBanner from '@/components/landing/ComingSoonBanner'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

const testimonials = [
  {
    quote: '"Finalmente entendi por que tomo decisões bem em algumas áreas e trava em outras. O relatório foi cirúrgico."',
    author: 'R. Mendes',
    role: 'Founder, SaaS B2B · São Paulo',
    tag: 'Beta tester',
  },
  {
    quote: '"Melhor R$97 que investi em autoconhecimento profissional. Mais útil que o MBTI que fiz por R$600."',
    author: 'F. Oliveira',
    role: 'Head de Produto · Belo Horizonte',
    tag: 'Beta tester',
  },
  {
    quote: '"Recebi o relatório e fiquei em silêncio por alguns minutos. Era a primeira vez que alguém descrevia como eu funciono sem que eu precisasse explicar."',
    author: 'A. Torres',
    role: 'Empreendedora · Remoto',
    tag: 'Beta tester · Assessment B2C',
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
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={76} duration={1200} />
            </div>
            <div className="text-sm text-text-muted">NPS Beta</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={22} suffix="min" duration={1400} />
            </div>
            <div className="text-sm text-text-muted">Tempo médio de assessment</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">
              <AnimatedCounter value={18} duration={1600} />
            </div>
            <div className="text-sm text-text-muted">Páginas de relatório</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="bg-background-secondary rounded-xl p-6 border border-white/5 card-hover"
            >
              <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">
                {t.quote}
              </p>
              <div>
                <p className="font-bold text-text-primary text-sm">{t.author}</p>
                <p className="text-text-muted text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
