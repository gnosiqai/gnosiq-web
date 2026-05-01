# Current Task — GnosIQ
## Status
IN REVIEW — aguardando merge de Carlos

## Tarefa atual
- **Issue:** GNO-80 (Fix: Landing inacessível via in-app browsers)
- **PR:** #66 fix/gno-80-inapp-browser-stability → develop
- **Data:** 2026-04-30
- **SSOT:** v4.0.22

## O que foi feito
- Fix A: vercel.json — redirect 301 www.gnosiq.ai → gnosiq.ai
- Fix B: next.config.ts — X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Fix C: app/api/health/route.ts + vercel.json crons — warming a cada 5 min

## Próxima issue disponível
GNO-81 (ou conforme Carlos definir)
