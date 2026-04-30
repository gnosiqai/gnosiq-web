export const runtime = 'edge'

// GNO-67 Fix 3.5 — Fase 1: hardcoded
// Fase 2: integrar Notion API para contar entradas reais na waitlist
export async function GET() {
  // TODO: integrar Notion API
  // const count = await getNotionWaitlistCount()
  return Response.json({ count: 3 })
}
