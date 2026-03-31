import { GoogleAuth } from 'google-auth-library';

let _auth: GoogleAuth | null = null;

export function createGcpAuthClient() {
  if (!_auth) {
    const keyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!keyJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON não configurada');
    }
    const credentials = JSON.parse(keyJson);
    _auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
  return _auth;
}
