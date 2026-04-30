// GNO-76: Declaração de tipo para o PostHog stub injetado via snippet no layout.tsx
// Permite window.posthog?.capture sem erros TypeScript
interface PostHogStub {
  capture: (event: string, properties?: Record<string, unknown>) => void
  identify?: (distinctId: string, properties?: Record<string, unknown>) => void
  reset?: () => void
  [key: string]: unknown
}

declare global {
  interface Window {
    posthog?: PostHogStub
  }
}

export {}
