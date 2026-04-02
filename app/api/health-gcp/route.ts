import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firestore';

export async function GET() {
  try {
    const db = getFirestore();
    // Teste de leitura real — sem escrever dados
    await db.collection('_health').limit(1).get();
    return NextResponse.json({ ok: true, stage: 'firestore', ts: Date.now() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, stage: 'firestore', error: message },
      { status: 500 }
    );
  }
}
