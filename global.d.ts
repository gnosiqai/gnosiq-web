// GNO-76: Declaração de tipo para o PostHog stub injetado via snippet no layout.tsx
// Permite window.posthog?.capture sem erros TypeScript
interface PostHogStub {
  capture: (event: string, properties?: Record<string, unknown>) => void
  identify?: (distinctId: string, properties?: Record<string, unknown>) => void
  reset?: () => void
  [key: string]: unknown
}

/**
 * GNO-120: API do widget Cloudflare Turnstile, carregada via script externo.
 * Só os membros que o WaitlistSection realmente usa - declarar a API inteira
 * seria inventar contrato que ninguém verifica.
 */
interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme?: 'auto' | 'light' | 'dark'
      callback?: (token: string) => void
      'error-callback'?: () => void
      'expired-callback'?: () => void
    },
  ) => string | undefined
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    posthog?: PostHogStub
    turnstile?: TurnstileApi
  }
}

export {}
