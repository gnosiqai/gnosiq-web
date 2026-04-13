// instrumentation-client.ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ph',
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
})
