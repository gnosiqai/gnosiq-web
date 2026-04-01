import { GoogleAuth } from 'google-auth-library';

let _auth: GoogleAuth | null = null;

export function createGcpAuthClient() {
  if (!_auth) {
    const keyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!keyJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON nao configurada');
    }

    let credentials;
    try {
      credentials = JSON.parse(keyJson);
    } catch (e) {
      throw new Error(`JSON.parse falhou na SA key: ${e instanceof Error ? e.message : String(e)} | primeiros 80 chars: ${keyJson.slice(0, 80)}`);
    }

    if (!credentials.private_key) {
      throw new Error(`private_key ausente no JSON. Campos presentes: ${Object.keys(credentials).join(', ')}`);
    }

    if (!credentials.private_key.includes('\n')) {
      throw new Error(`private_key nao tem newlines reais (tem \\\\n literal?). Length: ${credentials.private_key.length}`);
    }

    _auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
  return _auth;
}
