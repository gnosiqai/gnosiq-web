/**
 * API do widget Cloudflare Turnstile, carregada via script externo.
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
    turnstile?: TurnstileApi
  }
}

export {}
