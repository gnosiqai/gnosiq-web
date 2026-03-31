import { Firestore, Timestamp } from '@google-cloud/firestore';
import { createGcpAuthClient } from './gcp-auth';

let _db: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!_db) {
    const auth = createGcpAuthClient();
    _db = new Firestore({
      projectId: process.env.GCP_PROJECT_ID,
      // @ts-expect-error: GoogleAuth é compatível com authClient do Firestore SDK
      authClient: auth,
    });
  }
  return _db;
}

interface WaitlistEntry {
  email: string;
  name: string;
}

export async function addToWaitlist({ email, name }: WaitlistEntry): Promise<{ alreadyExists: boolean }> {
  const db = getFirestore();
  const ref = db.collection('waitlist');

  const existing = await ref.where('email', '==', email.toLowerCase()).limit(1).get();
  if (!existing.empty) return { alreadyExists: true };

  await ref.add({
    email: email.toLowerCase(),
    name: name.trim(),
    createdAt: Timestamp.now(),
    source: 'landing_page',
    milestone: 'M1',
  });

  return { alreadyExists: false };
}
