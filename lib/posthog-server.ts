/**
 * @file lib/posthog-server.ts
 * @description Captura de evento do lado do SERVIDOR (GNO-115).
 *
 * Um bot que cai no honeypot nunca executa o JavaScript da página, então o
 * `posthog-js` do cliente não registra nada. Sem isto, a armadilha dispara
 * em silêncio e ninguém sabe se está pegando alguma coisa.
 *
 * Implementado com `fetch` direto na API de captura em vez de `posthog-node`:
 * é uma chamada só, e evitar mais uma dependência no runtime serverless
 * mantém o cold start curto. A chave usada é a `NEXT_PUBLIC_POSTHOG_KEY` —
 * chave de projeto é write-only por design, e já vai para o browser.
 */

/** Timeout curto: telemetria nunca pode segurar a resposta HTTP. */
const CAPTURE_TIMEOUT_MS = 2000

/**
 * Envia um evento. Nunca lança e nunca rejeita — falha de telemetria é
 * registrada em log e morre ali.
 *
 * `properties` deve conter apenas dados NÃO pessoais: esta função é chamada
 * em caminhos que lidam com payload hostil, e nada do corpo da requisição
 * deve chegar aqui.
 */
export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Record<string, string> = {},
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

  try {
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties,
      }),
      signal: AbortSignal.timeout(CAPTURE_TIMEOUT_MS),
    })
  } catch (err) {
    console.warn(
      '[posthog-server] captura falhou:',
      err instanceof Error ? err.message : 'desconhecido',
    )
  }
}
