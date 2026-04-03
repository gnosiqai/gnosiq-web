<div align="center">

<img src="./public/gnosiq-banner.png" alt="GnosIQ — The Cognitive Capital API" width="800" height="auto" />

# GnosIQ
[![Status](https://img.shields.io/badge/status-pre--launch-8B5CF6?style=flat-square)](https://gnosiq.ai)
[![Beta NPS](https://img.shields.io/badge/beta%20NPS-76-8B5CF6?style=flat-square)](#)
[![Quality](https://img.shields.io/badge/code%20quality-review%20M2-6D28D9?style=flat-square)](#)
[![Security](https://img.shields.io/badge/security-audit%20M2-6D28D9?style=flat-square)](#)

**The Cognitive Capital API**

*We don't assess people. We unlock the cognitive capital hidden in every human.*

[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%7C%20Vercel%20%7C%20Cloud%20Run%20%7C%20Firestore-0D0B1E?style=flat-square)](#tech-stack)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20→%20Vercel%20(deploy.yml)-0D0B1E?style=flat-square)](#tech-stack)
[![License](https://img.shields.io/badge/license-Proprietary-6D28D9?style=flat-square)](#legal)

[gnosiq.ai](https://gnosiq.ai) · [@gnosiqai](https://x.com/gnosiqai) · [Docs](https://docs.gnosiq.ai) *(coming M4)*

</div>

---

## What is GnosIQ?

GnosIQ is the first API that turns human potential into computable capital.

Where traditional psychometric tools deliver static PDFs locked behind $15,000 enterprise contracts, GnosIQ delivers **deep cognitive assessment at API scale** — programmatic, affordable, and actionable in 30 minutes.

Think of it as the **Bloomberg Terminal for human intelligence**: the same depth institutional investors have always had, now accessible via a single `POST /v1/evaluate`.

```bash
curl -X POST https://api.gnosiq.ai/v1/evaluate \
  -H "Authorization: Bearer giq_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"session_id": "sess_abc123", "responses": [...] }'

# → 18-page cognitive capital report · delivered in 30 min
```


---

## The 3 Surfaces

GnosIQ is one cognitive engine distributed across three independent access surfaces.
The same `POST /v1/evaluate` powers all three. What changes is the wrapper, the buyer, and the price point.

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOSIQ COGNITIVE ENGINE                      │
│     Adaptive CAT · 12 Instruments · 4 Layers (A/B/C/D)          │
└────────────────┬────────────────┬───────────────┬───────────────┘
                 │                │               │
            Surface 1        Surface 2       Surface 3
           B2C Direct        White-Label     Public API
           (M2 · live)       (M3 · B2B)      (M4+ · devs)
```

### Cognitive Engine v2.0 — Adaptive CAT

The same cognitive engine powering all 3 surfaces operates via
**Computerized Adaptive Testing**: Agent1 decides which frameworks
to activate based on the response profile — no instrument is applied
blindly.

| Layer | Frameworks | Milestone | License |
|---|---|---|---|
| **A — Core** | WAIS-IV (inspired) · Big Five NEO | M2+ | Public domain |
| **B — Expansion** | ASRS-v1.1 · AQ-10 · PHQ-9 · GAD-7 · BRIEF-A | M3+ | Public domain |
| **C — Premium** | EQ-i 2.0 · MSCEIT · RAADS-R · Hogan HDS | M4+ | Paid license (BNDES/FINEP) |
| **D — Contextual** | Gardner IM · Renzulli · PTG · Brief Resilience Scale | M2+ conditional | Public domain |


> ⚕️ **Clinical Disclaimer:** This engine identifies cognitive and behavioral patterns
> using internationally validated screening instruments. It does **not replace** clinical
> assessment by a neurologist, clinical psychologist, or psychiatrist. Always consult a
> licensed health professional for clinical decisions (ADHD · ASD · depression · anxiety).

---

### Surface 1 — B2C Assessment *(M2)*

> **Who:** Founders, Tech Leaders, Executive Coaches  
> **Where:** [gnosiq.ai](https://gnosiq.ai) — direct landing page  
> **Price:** $97 one-time · $29/mo Pro

The individual buys directly. Answers a 30-minute adaptive session.
Receives an **18-page Cognitive Capital Report** by email — covering
IQ range, Big Five profile, Multiple Intelligences map, Renzulli AH/SD
indicators, and PTG growth vector.

No enterprise contract. No waiting list. No therapist required.

---

### Surface 2 — White-Label B2B *(M3)*

> **Who:** HR Consultancies, Accelerators, EdTechs, Executive Coaches  
> **Where:** Custom-branded dashboard — GnosIQ invisible on the front  
> **Price:** Starter $2.5K/mo · Professional $5K/mo · Enterprise $12K/mo

Partners configure their own logo, colors, and domain.
Their clients take the assessment. Results land in the partner's dashboard.
GnosIQ is the invisible infrastructure — like Stripe is to payments.

Setup fee: $1,250 · $2,500 · $6,000 (one-time per tier).

---

### Surface 3 — Public API L0 *(M4+)*

> **Who:** Developers, Cognitive Fintechs, HRTechs, EdTechs  
> **Where:** `api.gnosiq.ai` · `npm install @gnosiqai/sdk`  
> **Price:** $0.50–$2.00/eval · Free sandbox (3 evals)

> ⚠️ **Not started.** Prerequisite: $30K+ MRR validated at M3.

```typescript
import { GnosIQ } from '@gnosiqai/sdk';

const client = new GnosIQ({ apiKey: process.env.GNOSIQ_API_KEY });

const report = await client.evaluate({
  sessionId: 'sess_abc123',
  responses: adaptiveResponses,
  webhookUrl: 'https://yourapp.com/webhooks/gnosiq',
});

// report.cognitiveCapitalScore → 0–1000
// report.pdfUrl → signed URL · expires 72h
// report.vectors → { iq, bigFive, gardner, renzulli, ptg }
```

---

## Architecture

```
          ┌─────────────────────┐
          │   gnosiq.ai (web)   │
          │  Next.js 15 · Edge  │
          │   Vercel (global)   │
          └──────────┬──────────┘
                     │ HTTPS
          ┌──────────▼──────────┐
          │   Cloud Run Gen2    │
          │   Node.js 22 LTS    │
          │ southamerica-east1  │
          │                     │
          │  POST /api/waitlist │
          │  POST /api/evaluate │◄── Surface 1 · 2 · 3
          │  POST /api/webhook  │
          └──┬───────┬──────────┘
             │       │
  ┌──────────▼─┐  ┌──▼────────────────────────┐
  │  Firestore │  │     AI Router (CAT)       │
  │ Native Mode│  │   (Metabolic AI v2.0)     │
  │            │  │                           │
  │  reports/  │  │  (Pattern Extractor)      │
  │  partners/ │  │         2.5 Flash         │
  └────────────┘  │  (Psychometrician AI)     │
                  │        Sonnet             │
                  │  (Synthetic Neuropsy.)    │
                  │                           │
                  │ 12 instruments · 4 layers │
                  │  98.1% margin             │
                  └───────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │      SendGrid       │
                │   Report delivery   │
                │  100/day free tier  │
                └─────────────────────┘
```

**Design principles (from the [GnosIQ Architecture Manifesto](docs/ARCHITECTURE.md)):**  
100% Cloud · 100% Serverless · Minimum Cost Max Profit · Metabolic AI ·  
Privacy Sovereign · Solo Founder Scalable · API-First · Async-First

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15 + TypeScript strict | App Router · Edge-ready · SEO |
| Styling | Tailwind CSS | Design tokens · zero runtime CSS |
| Backend | Cloud Run Gen2 · Node.js 22 LTS | Serverless · scales to zero · ~$0 |
| Database | Firestore Native Mode | Realtime · free tier · no ORM needed |
| AI Orchestration | Claude (Anthropic) + Gemini 2.5 Flash | Metabolic routing · cost/quality tradeoff |
| Email | SendGrid API v3 | 100/day free · reliable delivery |
| Analytics | PostHog Cloud | 1M events/mo free · session replay |
| DNS / CDN | Cloudflare | DDoS · SSL · proxy · free |
| CI/CD | GitHub Actions → Vercel CLI (native) | `vercel pull → vercel build --prod → vercel deploy --prebuilt --prod` on push main · workflow: `deploy.yml` |
| Code Quality | SonarCloud | AI code trust mitigation · Quality Gate ✅ · A/A/A (Security / Reliability / Maintainability) |
| Package Manager | npm (only) | yarn/pnpm not used in this repo |

---

## Roadmap

GnosIQ ships in four sequential milestones. Each unlocks the next surface.
No milestone starts before the previous gate is validated — solo founder filter.

```
M1 ──────────► M2 ──────────► M3 ──────────► M4+
Landing        Surface 1      Surface 2      Surface 3

Waitlist       B2C Live       White-Label    Public API
               $97/eval       $2.5K–12K/mo   $0.50–2/eval

Gate: 10       Gate: 10       Gate: $30K     Gate: Series A
leads live     sales +        MRR · 2–3      pipeline
               NPS≥60         partners
```

### M1 — Landing + Waitlist *(now · IN PROGRESS)*

| Task | Status |
|---|---|
| Repo scaffold (Next.js 15 + Tailwind + TypeScript) | ✅ Done |
| Brand identity — 12/12 slides approved | ✅ Done |
| Fix Lovart: favicon + remove teal #14B8A6 | ✅ Done |
| Setup Vercel + DNS Cloudflare | ✅ Done (GNO-5) |
| CI/CD GitHub Actions + Vercel CLI (`deploy.yml`) | ✅ Done (GNO-20) |
| Backend waitlist: Cloud Run → Firestore → SendGrid | ✅ Done (GNO-7) — 2026-04-01 |
| PostHog analytics | 🔲 Todo (GNO-8) |
| Landing page: Nav + Hero + WaitlistForm + Footer | 🔲 Todo (GNO-9) |
| SonarCloud on GitHub Actions | ✅ Done (GNO-6) — 2026-04-02 |
| Google Workspace: carlos@gnosiq.ai | 🔲 Todo (GNO-12) |
| Google for Startups — $350K GCP credits | 🔲 Todo (GNO-13) |

### M2 — API + First Customers *(Surface 1 · B2C)*

- Stripe payment flow → async processing → PDF delivery
- Target: 10 paying customers · NPS ≥ 60
- Linear: [GNO-14](https://linear.app/gnosiq/issue/GNO-14)

### M3 — White-Label + B2B *(Surface 2)*

- Multi-tenant dashboard · partner onboarding · custom branding
- Target: 2–3 white-label partners signed · $30K+ MRR
- Linear: [GNO-15](https://linear.app/gnosiq/issue/GNO-15)

### M4+ — Public API + International Scale *(Surface 3)*

- API key auth · rate limiting · Swagger docs · Node.js SDK
- Geo expansion: US 50% · UK 30% · DE 20%
- Prerequisite: M3 gate validated
- Linear: [GNO-16](https://linear.app/gnosiq/issue/GNO-16)

---

## Unit Economics

> Numbers at current optimized stack. No hockey-stick assumptions.

```

White-Label MRR model (M3 target)
──────────────────────────────────────
2 Starter partners      2 × $2,500 = $5,000/mo
1 Professional          1 × $5,000 = $5,000/mo
                                    ──────────
Minimum M3 floor MRR              $10,000/mo

3 Professional + 1 Enterprise     $27,000/mo   ← $30K gate
```

---

## Market

**TAM $125B+** — $31B psychometric assessment market + $94B HR Tech · CAGR 26.7%

| Competitor | Price | Depth | API | GnosIQ Advantage |
|---|---|---|---|---|
| Hogan Assessments | $15,000/eval | ✅ Deep | ❌ None | Same depth · 150× cheaper · programmatic |
| Crystal Knows | $49/mo | ❌ Surface | ❌ None | Deep vs. shallow · API infrastructure |
| BetterUp | $4,700/seat/yr | — (coaching) | ❌ None | Assessment ≠ coaching — different category |

**Why now:**
- LLMs crossed the threshold where 3-agent orchestration matches
  licensed psychometrician accuracy at 1/1000th the cost
- No competitor has combined: deep assessment + API + affordable pricing
- Remote-first work created permanent demand for async cognitive tools
- Founder is ICP — the $97 report maps exactly this cognitive profile.
  Living proof of concept.

---

## Quick Start

> **M1 (current phase):** the engine is not yet public.  
> This guide reflects the target API shape for M2+.  
> Join the waitlist at [gnosiq.ai](https://gnosiq.ai) for early access.

### Run locally

```bash
# Prerequisites: Node.js 22 LTS · npm · GCP project configured

git clone https://github.com/gnosiqai/gnosiq-web.git
cd gnosiq-web
npm install

# Copy environment variables
cp .env.example .env.local
# → fill ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, SENDGRID_API_KEY,
#   NEXT_PUBLIC_POSTHOG_KEY, FIRESTORE_PROJECT_ID

npm run dev
# → http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `SENDGRID_API_KEY` | M1 | Waitlist confirmation + report delivery |
| `SENDGRID_FROM_EMAIL` | M1 | `carlos@gnosiq.ai` |
| `NEXT_PUBLIC_POSTHOG_KEY` | M1 | Analytics |
| `FIRESTORE_PROJECT_ID` | M1 | Waitlist + sessions persistence |
| `STRIPE_SECRET_KEY` | M2+ | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | M2+ | Async payment confirmation |
| `VERCEL_TOKEN` | CI/CD | Deploy token GitHub Actions |
| `VERCEL_ORG_ID` | CI/CD | Vercel Organization ID |
| `VERCEL_PROJECT_ID` | CI/CD | Vercel Project ID |

### Deploy

```bash
# Frontend → Vercel (auto-deploy via GitHub Actions on push to main)
# Workflow: .github/workflows/deploy.yml
# Pipeline: vercel pull → vercel build --prod → vercel deploy --prebuilt --prod
git push origin main

# Backend → Cloud Run (GNO-7 · M1 backend)
# See: .github/workflows/deploy-cloud-run.yml (pending M1)
```

---

## Project Structure

```
gnosiq-web/
├── app/
│   ├── layout.tsx          # Root layout · PostHog · brand tokens
│   ├── page.tsx            # Landing page
│   └── api/
│       ├── waitlist/       # POST /api/waitlist → Firestore + SendGrid
│       └── evaluate/       # POST /api/evaluate → AI agents (M2+)
├── components/
│   └── sections/           # Nav · Hero · WaitlistForm · Footer · ...
├── lib/
│   ├── constants/
│   │   └── legal.ts        # Canonical clinical disclaimers (LGPD · CFP · GDPR)
│   ├── firestore.ts        # DB client (canonical pattern — GoogleAuth anti-pattern banned)
│   └── sendgrid.ts         # Email client
├── prompts/
│   └── base.ts             # Cognitive Engine agents foundation (GNO-26)
├── public/
│   ├── gnosiq-logo.png     # Brand logo — LOCKED, do not replace
│   └── logo-placeholder.svg
├── .github/
│   └── workflows/          # deploy.yml (sole authorized workflow)
└── .env.example            # All required vars documented
```

---

## Contributing

GnosIQ is a **solo-founder proprietary product**, not an open-source project.

This repository is public for **transparency and developer trust** — consistent
with our API-first positioning and the [GnosIQ Architecture Manifesto](docs/ARCHITECTURE.md).

**What this means:**
- Pull requests from external contributors are **not accepted** at this stage
- Issues and bug reports are **welcome** via [GitHub Issues](https://github.com/gnosiqai/gnosiq-web/issues)
- Architecture decisions are documented in [`docs/ADR/`](docs/ADR/)
- All production merges require approval from [@gnosiqai](https://github.com/gnosiqai)

If you're a developer interested in integrating GnosIQ into your product,
join the [API early access waitlist](https://gnosiq.ai) — Surface 3 (M4+) opens
to external developers after M3 validation.

---

## Security

- Cognitive assessment data is **never used to train external models**
- All evaluation responses are encrypted at rest in Firestore
- API keys are rotated quarterly
- No PII is stored beyond what is strictly necessary for report delivery
- LGPD (BR) · GDPR (EU) compliant by design

Found a vulnerability? Email **carlos@gnosiq.ai** with subject `[SECURITY]`.
We respond within 24 hours.

---

## Legal

**License:** Proprietary — All rights reserved © 2026 GnosIQ

This software and its cognitive assessment frameworks (prompts, scoring models,
agent orchestration logic, and psychometric benchmarks) are proprietary intellectual
property of GnosIQ.

> GnosIQ assessments are tools for self-knowledge and strategic planning.
> They do **not** constitute clinical diagnosis, psychological evaluation,
> or medical advice. Always consult a licensed mental health professional
> for clinical decisions.

---

<div align="center">

**GnosIQ · The Cognitive Capital API**

*The first API that turns human potential into computable capital.*

[gnosiq.ai](https://gnosiq.ai) · [carlos@gnosiq.ai](mailto:carlos@gnosiq.ai)  
[@gnosiqai](https://x.com/gnosiqai) on X · GitHub · ProductHunt · Bluesky  
[@gnosiq.ai](https://instagram.com/gnosiq.ai) on Instagram · YouTube · Threads

---

*Pre-launch · Beta NPS 76 · São Paulo → Silicon Valley*

</div>
