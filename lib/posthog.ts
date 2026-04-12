import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  if (posthog.__loaded) return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // só eventos manuais por ora
  })
}
