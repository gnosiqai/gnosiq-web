'use client'

import { useEffect, useState } from 'react'

const TOTAL_VAGAS = 100
const VAGAS_OCUPADAS_INICIAL = 3

export function VagasCounter() {
  const [vagasRestantes, setVagasRestantes] = useState<number | null>(null)

  useEffect(() => {
    // Fase 1: hardcoded — evita hydration mismatch (SSR retorna null → span vazio)
    // Fase 2: descomentar fetch abaixo quando endpoint estiver integrado ao Notion
    // fetch('/api/waitlist-count')
    //   .then(r => r.json())
    //   .then(d => setVagasRestantes(TOTAL_VAGAS - d.count))
    //   .catch(() => setVagasRestantes(TOTAL_VAGAS - VAGAS_OCUPADAS_INICIAL))
    setVagasRestantes(TOTAL_VAGAS - VAGAS_OCUPADAS_INICIAL)
  }, [])

  if (vagasRestantes === null) return <span>97</span>
  return <span>{vagasRestantes}</span>
}
