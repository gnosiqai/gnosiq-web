'use client'

import { useEffect } from 'react'
import { armRevealObserver } from '@/lib/reveal'

// o observer de scroll-reveal vivia num useEffect dentro de
// app/page.tsx, o que obrigava a página inteira a ser 'use client'. A v2
// precisa que a página seja server component (o carimbo "Atualizado em" e o
// JSON-LD são resolvidos no build), então o efeito virou este componente
// vazio: monta, arma o observer, não renderiza nada.

export default function RevealObserver() {
  useEffect(() => armRevealObserver(), [])
  return null
}
