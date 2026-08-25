import { NextResponse } from 'next/server'
import { countFounderTier } from '@/lib/firestore'
import { FOUNDER_SLOTS } from '@/lib/constants/founder'

// GNO-115 (item 8 do delta) — a rota era `runtime = 'edge'` devolvendo
// `{ count: 3 }` chumbado. Dois problemas: o número era ficção (a LP promete
// "vagas restantes" como escassez REAL), e o runtime edge não roda
// @google-cloud/firestore — a integração nunca teria funcionado ali.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Placar de fundadores: `count(founder_tier == true)` (GNO-113).
 *
 * Falha é resposta 503 com `available: false`, NUNCA um número de fallback.
 * Um número inventado aqui vira promessa pública quebrada na LP — o
 * componente sabe renderizar a versão sem número.
 */
export async function GET() {
  try {
    const founders = await countFounderTier()

    // Clamp: se a materialização passar de 100 por qualquer motivo, a LP
    // mostra 0 vagas — nunca um número negativo.
    const slotsRemaining = Math.max(0, FOUNDER_SLOTS - founders)

    return NextResponse.json(
      { available: true, founders, slotsRemaining, total: FOUNDER_SLOTS },
      {
        status: 200,
        headers: {
          // O placar muda em lotes (materialização manual), não a cada request.
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    )
  } catch (err) {
    // Log interno detalhado — a resposta não expõe nada da credencial.
    console.error('[waitlist-count] Erro ao contar founder_tier:', err)
    return NextResponse.json({ available: false }, { status: 503 })
  }
}
