'use client'

import { useState } from 'react'
import { FAQ_ITEMS } from '@/lib/constants/faq'

// GNO-115 — FAQ com perguntas reais de DM/comentários.
//
// O conteúdo vem de lib/constants/faq.ts, o MESMO array que alimenta o
// JSON-LD FAQPage. Divergir schema de conteúdo visível é structured data spam
// aos olhos do Google — a fonte única elimina a possibilidade.
//
// <details>/<summary> nativo: a resposta está no DOM mesmo fechada, então
// crawler e motor de resposta leem tudo sem depender de JS. O estado só
// controla o ícone +/−.

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="reveal py-20 md:py-24 px-6 border-t border-accent/10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-[40px] font-bold text-text-primary tracking-tight mb-12">
          Perguntas frequentes
        </h2>

        <div className="grid gap-3.5">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.question}
              open={openIndex === index}
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) setOpenIndex(index)
                else if (openIndex === index) setOpenIndex(null)
              }}
              className="group bg-background-secondary border border-accent/[0.14] rounded-xl px-7 py-6"
            >
              <summary className="flex justify-between items-center gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-[17px] font-bold text-text-primary m-0">
                  {item.question}
                </h3>
                <span
                  aria-hidden="true"
                  className="text-accent text-xl leading-none shrink-0 group-open:hidden"
                >
                  +
                </span>
                <span
                  aria-hidden="true"
                  className="text-accent text-xl leading-none shrink-0 hidden group-open:inline"
                >
                  −
                </span>
              </summary>
              <p className="text-[15px] text-text-muted leading-relaxed mt-3.5 mb-0">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
