import { Firestore } from '@google-cloud/firestore';
import { createGcpAuthClient } from './gcp-auth';

let _db: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!_db) {
    _db = new Firestore({
      projectId: process.env.GCP_PROJECT_ID,
      authClient: createGcpAuthClient() as any,
    });
  }
  return _db;
}
