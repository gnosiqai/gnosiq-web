import { NextResponse } from 'next/server'
import { countWaitlist } from '@/lib/firestore'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Placar público de vagas restantes.
 *
 * FONTE: `count(waitlist)` — o total de inscritos, lido na hora. A condição
 * de entrada é determinada pelo `createdAt` que o servidor grava no instante
 * da inscrição, então o total de inscritos JÁ É o total de condições
 * determinadas. Contar aqui é reportar a realidade da coleção, não antecipar
 * nada: o placar deixa de depender de um processo em lote para dizer a
 * verdade.
 *
 * Custo: uma aggregation query por request. Não cresce com a coleção e nenhum
 * documento trafega para o processo.
 *
 * Falha é 503 com `available: false`, NUNCA um número de fallback. Um número
 * inventado aqui vira promessa pública quebrada — o componente sabe renderizar
 * a versão sem número.
 */
export async function GET() {
  try {
    const signups = await countWaitlist()

 // Clamp: passando de 100, a página mostra 0 vagas — nunca um negativo.
    const slotsRemaining = Math.max(0, FOUNDER_SLOTS - signups)

    return NextResponse.json(
      { available: true, signups, slotsRemaining, total: FOUNDER_SLOTS },
      {
        status: 200,
        headers: {
 // `max-age=0` obriga o navegador a revalidar: sem isso um F5 comum
 // continua mostrando o número anterior por até um minuto.
 // `s-maxage=10` deixa a borda absorver rajada sem esconder a fonte.
          'Cache-Control': 'public, max-age=0, s-maxage=10',
        },
      },
    )
  } catch (err) {
 // Log interno detalhado — a resposta não expõe nada da credencial.
    console.error('[waitlist-count] Erro ao contar inscritos:', err)
    return NextResponse.json({ available: false }, { status: 503 })
  }
}
