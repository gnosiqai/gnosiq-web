// instrumentation-client.ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
  api_host: '/ph',
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  // Pins de comportamento (bump 1.367.0 → 1.424.1): a lib mudou defaults de
  // captura; o que é capturado é decisão GROWTH+RISK, não default da lib.
  // Ligar qualquer um destes é decisão explícita, não carona de bump.
  // 1.419.0: atribuição de web vitals passou a ['INP','LCP'] por default (era false).
  // `web_vitals` fica ausente de propósito — segue o remote config como antes.
  capture_performance: { web_vitals_attribution: false },
  // 1.394.0: super-property $device_model via UA client hints (Android Chromium).
  disableDeviceModel: true,
})
