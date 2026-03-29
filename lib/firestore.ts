import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIRESTORE_PROJECT_ID,
        clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
        privateKey: process.env.FIRESTORE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

interface WaitlistEntry {
  email: string;
  name: string;
}

export async function addToWaitlist({ email, name }: WaitlistEntry): Promise<{ alreadyExists: boolean }> {
  const db = getDb();
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
