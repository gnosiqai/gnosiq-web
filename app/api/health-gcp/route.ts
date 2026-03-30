import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firestore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('_health').limit(1).get();
    return NextResponse.json({
      ok: true,
      firestore: 'connected',
      docs: snapshot.size,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
