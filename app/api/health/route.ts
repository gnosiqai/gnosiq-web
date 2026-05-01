// GNO-80: Fix C — endpoint leve para Vercel Cron warming (a cada 5 min)
// Mantém a função serverless quente sem consumir quota do Firestore
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() })
}
