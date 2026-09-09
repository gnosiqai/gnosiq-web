'use client'

import { useEffect, useState } from 'react'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

// (item 8 do delta) — escassez REAL.
//
// O componente anterior (components/VagasCounter.tsx, órfão: nenhum import no
// repo) tinha `VAGAS_OCUPADAS_INICIAL = 3` chumbado e um fallback SSR que
// renderizava literalmente `<span>97</span>` — o mesmo número que o VETO GATE
// proíbe na página.
//
// Aqui não existe número de fallback. Enquanto a contagem não chega, ou se o
// endpoint falhar, a frase troca para uma versão honesta SEM número. Um
// placar inventado é promessa pública quebrada.

type State =
  | { status: 'loading' }
  | { status: 'ready'; slotsRemaining: number }
  | { status: 'unavailable' }

export default function FounderSlots({ className = '' }: Readonly<{ className?: string }>) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch('/api/waitlist-count')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((d) => {
        if (cancelled) return
        if (typeof d?.slotsRemaining === 'number') {
          setState({ status: 'ready', slotsRemaining: d.slotsRemaining })
        } else {
          setState({ status: 'unavailable' })
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable' })
      })

    return () => {
      cancelled = true
    }
  }, [])

 // Loading e falha renderizam a MESMA frase — sem número, sem layout shift
 // entre os dois estados, e sem nunca exibir um placar que não veio do banco.
  // Linha de preço: estática, acima do contador, nos dois estados (a primeira
  // pintura já mostra o preço, sem depender do fetch).
  // R$97 público na LP por decisão GATE 2026-09-08 (GNO-97 · 02:55:37Z) · GNO-136.
  // Lista BR permanece interna (SSOT pricing). Moeda sempre completa em PT.
  const priceLine = (
    <span className="block font-semibold text-text-secondary">
      Preço de fundador travado: R$97 · 100 primeiros da waitlist · sem cobrança agora
    </span>
  )

  if (state.status !== 'ready') {
    return (
      <p className={className}>
        {priceLine}
        Vagas de fundador limitadas aos{' '}
        <span className="font-bold text-accent-light">{FOUNDER_SLOTS} primeiros</span>
      </p>
    )
  }

  return (
    <p className={className}>
      {priceLine}
      <span className="font-bold text-accent-light">
        {state.slotsRemaining} de {FOUNDER_SLOTS}
      </span>{' '}
      vagas de fundador restantes
    </p>
  )
}
