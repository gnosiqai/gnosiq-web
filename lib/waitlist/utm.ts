/**
 * @file lib/waitlist/utm.ts
 * @description Captura de parâmetros UTM para o evento de conversão.
 *
 * O DoD da  exige medir conversão v1 vs v2. Sem UTM no evento, o
 * PostHog mostra que alguém converteu mas não de onde veio — e a comparação
 * entre versões vira palpite.
 *
 * A leitura é da URL atual (a LP é single-page: o clique no CTA não navega,
 * então a query string da chegada continua ali). Chaves ausentes são
 * omitidas, não enviadas como null, para não poluir o schema do evento.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>

/** Extrai os UTMs de uma query string. Exportado puro para permitir teste. */
export function parseUtm(search: string): UtmParams {
  const params = new URLSearchParams(search)
  const out: UtmParams = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) out[key] = value
  }

  return out
}

/** UTMs da URL atual. Retorna `{}` no servidor — nunca lança. */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {}
  return parseUtm(window.location.search)
}
