// PLANTA (b): identificador em código, SEM import — o grep literal de
// "GoogleAuth.getClient" não pegaria estas duas linhas separadas.
declare const GoogleAuth: new () => { getClient: () => Promise<unknown> }
const a = new GoogleAuth()
export const client = a.getClient()
