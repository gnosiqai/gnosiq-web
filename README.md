<div align="center">

# GnosIQ
[![Status](https://img.shields.io/badge/status-pre--launch-8B5CF6?style=flat-square)](https://gnosiq.ai)
[![Quality](https://img.shields.io/badge/code%20quality-SonarCloud%20A-8B5CF6?style=flat-square)](https://sonarcloud.io/project/overview?id=gnosiqai_gnosiq-web)
[![Security](https://img.shields.io/badge/security-0%20vulnerabilities-8B5CF6?style=flat-square)](https://sonarcloud.io/project/overview?id=gnosiqai_gnosiq-web)

**The Cognitive Capital API**

*We don't assess people. We unlock the cognitive capital hidden in every human.*

[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%7C%20Vercel%20%7C%20Cloud%20Run%20%7C%20Firestore-0D0B1E?style=flat-square)](#tech-stack)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20→%20Vercel-0D0B1E?style=flat-square)](#tech-stack)
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

12+ validated psychometric instruments across 4 progressive assessment layers —
activated adaptively based on each individual's response profile.


> ⚕️ **Clinical Disclaimer:** This engine identifies cognitive and behavioral patterns
> using internationally validated screening instruments. It does **not replace** clinical
> assessment by a neurologist, clinical psychologist, or psychiatrist. Always consult a
> licensed health professional for clinical decisions (ADHD · ASD · depression · anxiety).

---

### Surface 1 — B2C Assessment *(M2)*

> **Who:** Founders, Tech Leaders, Executive Coaches
> **Where:** [gnosiq.ai](https://gnosiq.ai) — direct landing page
> **Price:** [gnosiq.ai/pricing](https://gnosiq.ai/pricing)

The individual buys directly. Answers a 30-minute adaptive session.
Receives an **18-page Cognitive Capital Report** by email — covering
IQ range, Big Five profile, Multiple Intelligences map, Renzulli AH/SD
indicators, and PTG growth vector.

No enterprise contract. No waiting list. No therapist required.

---

### Surface 2 — White-Label B2B *(M3)*

> **Who:** HR Consultancies, Accelerators, EdTechs, Executive Coaches
> **Where:** Custom-branded dashboard — GnosIQ invisible on the front
> **Price:** [gnosiq.ai/pricing](https://gnosiq.ai/pricing)

Partners configure their own logo, colors, and domain.
Their clients take the assessment. Results land in the partner's dashboard.
GnosIQ is the invisible infrastructure — like Stripe is to payments.

---

### Surface 3 — Public API L0 *(M4+)*

> **Who:** Developers, Cognitive Fintechs, HRTechs, EdTechs
> **Where:** `api.gnosiq.ai` · `npm install @gnosiqai/sdk`
> **Price:** [gnosiq.ai/pricing](https://gnosiq.ai/pricing)

> ⚠️ **Not started.** Prerequisite: M3 gate validated.

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
          │   southamerica-east1│
          │                     │
          │  POST /api/waitlist │
          │  POST /api/evaluate │◄── Surface 1 · 2 · 3
          │  POST /api/webhook  │
          └──┬───────┬──────────┘
             │       │
  ┌──────────▼─┐  ┌──▼─────────────────────┐
  │  Firestore │  │   AI Cognitive Engine  │
  │ Native Mode│  │  Adaptive CAT · 3 LLM  │
  │            │  │  agents · 12 instruments│
  │  reports/  │  │  4 layers (A/B/C/D)    │
  │  partners/ │  └────────────────────────┘
  └────────────┘           │
                ┌──────────▼──────────┐
                │      SendGrid       │
                │   Report delivery   │
                │  100/day free tier  │
                └─────────────────────┘
```

**Design principles (GnosIQ Architecture Manifesto v1.0):**  
100% Cloud · 100% Serverless · Minimum Cost Max Profit ·  
Privacy Sovereign · Solo Founder Scalable · API-First · Async-First

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15 + TypeScript strict | App Router · Edge-ready · SEO |
| Styling | Tailwind CSS | Design tokens · zero runtime CSS |
| Backend | Cloud Run Gen2 · Node.js 22 LTS | Serverless · scales to zero · ~$0 |
| Database | Firestore Native Mode | Realtime · free tier · no ORM needed |
| AI Orchestration | Multi-LLM adaptive routing | Cost/quality optimization per cognitive layer |
| Email | SendGrid API v3 | 100/day free · reliable delivery |
| Analytics | PostHog Cloud | 1M events/mo free · session replay |
| DNS / CDN | Cloudflare | DDoS · SSL · proxy · free |
| CI/CD | GitHub Actions → Vercel | Automated deploy on push to `main` |
| Code Quality | SonarCloud | AI code trust mitigation · Quality Gate ✅ · A/A/A (Security / Reliability / Maintainability) |
| Package Manager | npm (only) | yarn/pnpm not used in this repo |

---

## Roadmap

GnosIQ ships in sequential milestones, each unlocking the next access surface.

**Coming soon:**
- API access for individual developers and teams
- Team plans with collaborative cognitive insights
- Enterprise tier with custom branding and white-label deployment
- Public API with SDK support for third-party integrations

> For early access and updates, join the waitlist at [gnosiq.ai](https://gnosiq.ai).

---

## Market

**TAM $125B+** — $31B psychometric assessment market + $94B HR Tech · CAGR 26.7%

| Competitor | Price | Depth | API | GnosIQ Advantage |
|---|---|---|---|---|
| Hogan Assessments | $15,000/eval | ✅ Deep | ❌ None | ✅ Same depth · 150× cheaper · programmatic |
| Crystal Knows | $49/mo | ❌ Surface | ❌ None | ✅ Deep vs. shallow · API infrastructure |
| BetterUp | $4,700/seat/yr | — (coaching) | ❌ None | ✅ Assessment ≠ coaching — different category |

**Why now:**
- LLMs crossed the threshold where 3-agent orchestration matches
  licensed psychometrician accuracy at 1/1000th the cost
- No competitor has combined: deep assessment + API + affordable pricing
- Remote-first work created permanent demand for async cognitive tools
- Founder is ICP — the report maps exactly this cognitive profile.
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
# → fill all required variables documented in .env.example

npm run dev
# → http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `SENDGRID_API_KEY` | M1 | Waitlist confirmation + report delivery |
| `SENDGRID_FROM_EMAIL` | M1 | Sender email address |
| `NEXT_PUBLIC_POSTHOG_KEY` | M1 | Analytics |
| `FIRESTORE_PROJECT_ID` | M1 | Waitlist + sessions persistence |
| `STRIPE_SECRET_KEY` | M2+ | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | M2+ | Async payment confirmation |
| CI/CD secrets | CI/CD | Configured in GitHub Actions · not documented here |

### Deploy

```bash
# Frontend → auto-deploy via GitHub Actions on push to main
git push origin main

# Backend → Cloud Run · auto-deploy via GitHub Actions on push to main
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
│   ├── constants/           # App constants (proprietary)
│   ├── firestore.ts        # DB client (canonical pattern — GoogleAuth anti-pattern banned)
│   └── sendgrid.ts         # Email client
├── prompts/                # Cognitive Engine (proprietary · not documented)
├── public/
│   ├── gnosiq-logo.png     # Brand logo — LOCKED, do not replace
│   └── logo-placeholder.svg
├── .github/
│   └── workflows/          # CI/CD workflows
└── .env.example            # All required vars documented
```

---

## Contributing

GnosIQ is a **solo-founder proprietary product**, not an open-source project.

This repository is public for **transparency and developer trust** — consistent
with our API-first positioning and the GnosIQ Architecture Manifesto.

**What this means:**
- Pull requests from external contributors are **not accepted** at this stage
- Issues and bug reports are **welcome** via [GitHub Issues](https://github.com/gnosiqai/gnosiq-web/issues)
- Architecture decisions are documented in `docs/ADR/` *(coming M2)*
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

Found a vulnerability? Email **security@gnosiq.ai** with subject `[SECURITY]`.
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

[gnosiq.ai](https://gnosiq.ai) · [contact](https://gnosiq.ai#waitlist)  
[@gnosiqai](https://x.com/gnosiqai) on X · GitHub · ProductHunt · Bluesky  
[@gnosiq.ai](https://instagram.com/gnosiq.ai) on Instagram · YouTube · Threads

---

*Pre-launch · Sao Paulo → Silicon Valley*

</div>
