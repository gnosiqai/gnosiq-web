import { Firestore, Timestamp } from '@google-cloud/firestore';

let _db: Firestore | null = null;

export function getFirestore(): Firestore {
  if (_db) return _db;

  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON não definida');
  }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON não é JSON válido');
  }

  // Normaliza \n escapado que o Vercel pode introduzir na env var
  const privateKey = credentials.private_key.replace(/\\n/g, '\n');

  _db = new Firestore({
    projectId: 'project-6482cadc-95f4-4adb-a0c',
    credentials: {
      client_email: credentials.client_email,
      private_key: privateKey,
    },
  });

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
