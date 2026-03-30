import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firestore';

export async function GET() {
  // Diagnóstico temporário — remover após validação
  const envCheck = {
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID ?? 'MISSING',
    GCP_PROJECT_NUMBER: process.env.GCP_PROJECT_NUMBER ?? 'MISSING',
    GCP_SERVICE_ACCOUNT_EMAIL: process.env.GCP_SERVICE_ACCOUNT_EMAIL ?? 'MISSING',
    GCP_WORKLOAD_IDENTITY_POOL_ID: process.env.GCP_WORKLOAD_IDENTITY_POOL_ID ?? 'MISSING',
    GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID ?? 'MISSING',
  };

  // Se alguma var estiver faltando, retorna antes de tentar conectar
  const missing = Object.entries(envCheck).filter(([, v]) => v === 'MISSING').map(([k]) => k);
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, stage: 'env_vars', missing, present: envCheck });
  }

  try {
    const db = getFirestore();
    const snapshot = await db.collection('health').limit(1).get();
    return NextResponse.json({
      ok: true,
      firestore: 'connected',
      docs: snapshot.size,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, stage: 'firestore', error: message }, { status: 500 });
  }
}
