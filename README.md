<div align="center">

# GnosIQ
[![Status](https://img.shields.io/badge/status-pre--launch-8B5CF6?style=flat-square)](https://gnosiq.ai)
[![Quality](https://img.shields.io/badge/code%20quality-SonarCloud%20A-8B5CF6?style=flat-square)](https://sonarcloud.io/project/overview?id=gnosiqai_gnosiq-web)
[![Security](https://img.shields.io/badge/security%20rating-SonarCloud%20A-8B5CF6?style=flat-square)](https://sonarcloud.io/project/overview?id=gnosiqai_gnosiq-web)

**The Cognitive Capital API**

*We don't assess people. We unlock the cognitive capital hidden in every human.*

[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%7C%20Vercel%20%7C%20Firestore%20%7C%20Resend-0D0B1E?style=flat-square)](#tech-stack)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20→%20Vercel-0D0B1E?style=flat-square)](#tech-stack)
[![License](https://img.shields.io/badge/license-Proprietary-6D28D9?style=flat-square)](#legal)

[gnosiq.ai](https://gnosiq.ai) · [@gnosiqai](https://x.com/gnosiqai) · [hello@gnosiq.ai](mailto:hello@gnosiq.ai)

</div>

---

## What is Cognitive Capital

Cognitive capital is the part of human potential that never made it onto a
balance sheet: how a person thinks, how they learn, how they decide when the
cost of being wrong is high, and how they recover from adversity.

Financial capital has been programmable for a decade. Cognitive capital has
not. Reading it has meant weeks of scheduling, a specialist's calendar, and a
static PDF at the end, priced for enterprises and out of reach for the
individual who actually needed it.

GnosIQ makes cognitive capital computable: one adaptive session in the
browser, one structured report, one programmatic surface.

That is the category. Everything below is how it is built.

---

## What is GnosIQ

A person answers an adaptive session in the browser. Specialized AI reads the
response profile against the CHC model, the most widely accepted framework in
contemporary intelligence research, using a combination of validated
instruments. The result is an 18 page cognitive capital report, delivered in
about 30 minutes.

No enterprise contract. No specialist waiting room. No jargon in the output.

> ⚕️ **Clinical disclaimer:** This report identifies cognitive and behavioral
> patterns using validated screening instruments. It does NOT replace clinical
> diagnosis by a licensed neurologist, clinical psychologist, or psychiatrist.

---

## How it works

Three specialized AI agents, in sequence:

| Step | Agent | What it does |
|---|---|---|
| 01 | Adaptive assessment | Runs the session and adjusts the path to the answers given, in about 22 minutes |
| 02 | Psychometric analysis | Computes the GnoScore™ and the profile across CHC domains |
| 03 | Report writing | Writes the 18 pages: what the numbers mean and what to do with them |

The engine itself (instrument selection logic, scoring models, agent prompts)
is proprietary and is not documented here or in this repository.

---

## Access surfaces

One engine, three ways in. What changes is the wrapper and the buyer.

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOSIQ COGNITIVE ENGINE                      │
└────────────────┬────────────────┬───────────────┬───────────────┘
                 │                │               │
            Surface 1        Surface 2       Surface 3
           B2C direct        White label     Public API
```

### Surface 1: B2C assessment

**Who:** founders, tech leaders, executive coaches
**Where:** [gnosiq.ai](https://gnosiq.ai)

The individual buys directly, answers the adaptive session, and receives the
cognitive capital report by email.

### Surface 2: White label B2B

**Who:** HR consultancies, accelerators, EdTechs, coaching practices

Partners configure their own logo, colors, and domain. Their clients take the
assessment, results land in the partner's dashboard. GnosIQ is the invisible
infrastructure, the way Stripe is to payments.

### Surface 3: Public API

**Who:** developers, cognitive fintechs, HRTechs, EdTechs

> ⚠️ **Not available yet.** The snippet below is the planned shape of the
> client, published early so integrators can react to it. It does not run
> today, and no endpoint is live.

```typescript
import { GnosIQ } from '@gnosiqai/sdk';

const client = new GnosIQ({ apiKey: process.env.GNOSIQ_API_KEY });

const report = await client.evaluate({
  sessionId: 'sess_abc123',
  responses: adaptiveResponses,
  webhookUrl: 'https://yourapp.com/webhooks/gnosiq',
});
```

Interested in integrating GnosIQ? Join the waitlist at
[gnosiq.ai](https://gnosiq.ai) or write to
[hello@gnosiq.ai](mailto:hello@gnosiq.ai).

---

## Architecture

This repository is the public web surface: the landing page, the waitlist
flow, and the legal pages. It runs entirely on Vercel, with no server to
operate.

```
                ┌───────────────────────────────┐
                │  gnosiq.ai                    │
                │  Next.js 15 · App Router      │
                │  Vercel (serverless + edge)   │
                └───────────────┬───────────────┘
                                │
                ┌───────────────▼───────────────┐
                │  Route handlers (/api)        │
                │  waitlist · waitlist-count    │
                │  health · health-gcp          │
                └──┬─────────┬─────────┬────────┘
                   │         │         │
        ┌──────────▼──┐  ┌───▼─────┐  ┌▼──────────────────┐
        │  Firestore  │  │ Resend  │  │ Cloudflare        │
        │ Native Mode │  │  email  │  │ Turnstile         │
        │  waitlist   │  │ hello@  │  │ anti-bot, managed │
        └─────────────┘  └─────────┘  └───────────────────┘

        PostHog Cloud: product analytics, proxied through /ph/*
        Cloudflare:    DNS, SSL, and the DKIM/SPF records for Resend
```

**Design principles (GnosIQ Architecture Manifesto v1.0):**
100% cloud · 100% serverless · minimum cost, maximum profit ·
privacy sovereign · solo founder scalable · API first · async first

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15 App Router + TypeScript strict | Server rendered HTML, crawler and answer engine friendly |
| Styling | Tailwind CSS | Design tokens · zero runtime CSS |
| Runtime | Vercel serverless functions · Node.js 24 | Scales to zero · no server to operate |
| Database | Firestore Native Mode | Realtime · free tier · no ORM needed |
| Transactional email | Resend | Domain authenticated on gnosiq.ai · fails loud when misconfigured |
| Anti-bot | Cloudflare Turnstile (managed mode) | Waitlist form protection · fails closed |
| Analytics | PostHog Cloud | Product analytics · reverse proxied to survive blockers |
| DNS / CDN | Cloudflare | DDoS · SSL · proxy |
| CI/CD | GitHub Actions → Vercel | Automated deploy on push to `main` |
| Tests | Vitest + Testing Library | Suite runs on every pull request |
| Code quality | SonarCloud | Quality gate on every push · A rating on security, reliability, maintainability |
| Package manager | npm (only) | yarn and pnpm are not used in this repo |

The AI cognitive engine is not part of this repository.

---

## Quick Start

> The assessment engine is not public yet. This repository builds and runs the
> public web surface. Join the waitlist at [gnosiq.ai](https://gnosiq.ai) for
> early access.

### Run locally

```bash
# Prerequisites: Node.js 24 · npm · a GCP project with Firestore enabled

git clone https://github.com/gnosiqai/gnosiq-web.git
cd gnosiq-web
npm install

# Copy environment variables
cp .env.example .env.local
# → fill in the variables documented in .env.example

npm run dev
# → http://localhost:3000
```

### Checks

```bash
npm test     # Vitest suite
npm run lint # ESLint (next lint)
npm run build
```

### Environment variables

Every variable is documented, with its Vercel scope and its failure mode, in
[`.env.example`](.env.example).

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Transactional email: waitlist confirmation |
| `EMAIL_FROM` | Yes | Sender address (`hello@gnosiq.ai`), no fallback |
| `GCP_PROJECT_ID` | Yes | Firestore target project |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Yes | Service account JSON **content** (serverless has no key file) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile sitekey (public by design) |
| `TURNSTILE_SECRET_KEY` | Yes | Turnstile siteverify secret · never in the client, never in CI |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | Product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog host |
| `STRIPE_SECRET_KEY` | Later | Payment processing, not wired yet |
| `STRIPE_WEBHOOK_SECRET` | Later | Async payment confirmation, not wired yet |
| CI/CD secrets | CI/CD | Configured in GitHub Actions, not documented here |

### Deploy

Push to `main`. GitHub Actions builds and deploys to Vercel production, then
runs the SonarCloud analysis.

---

## Project Structure

```
gnosiq-web/
├── app/
│   ├── layout.tsx           # Root layout · metadata · PostHog · brand tokens
│   ├── page.tsx             # Landing page
│   ├── privacy/             # Privacy policy (PT + EN)
│   ├── terms/               # Terms of use (PT + EN)
│   ├── opengraph-image.tsx  # Generated share images
│   └── api/
│       ├── waitlist/        # POST · Turnstile → Firestore → Resend
│       ├── waitlist-count/  # GET · cached public counter
│       ├── health/          # GET · liveness
│       └── health-gcp/      # GET · Firestore reachability
├── components/
│   ├── landing/             # Live landing page sections
│   ├── layout/              # Page wrapper
│   └── ui/                  # Button · Input · Badge · AnimatedCounter
├── lib/
│   ├── constants/           # Company identity · legal copy · metrics · FAQ
│   ├── firestore.ts         # DB client (canonical pattern)
│   ├── email.ts             # Email client (Resend)
│   ├── turnstile.ts         # Anti-bot siteverify · fails closed
│   └── waitlist/            # Phone and UTM normalization
├── public/                  # Logo (locked) · report preview · founder photo
├── .github/workflows/       # Deploy · SonarCloud · content policy
└── .env.example             # Every required variable, documented
```

Tests live next to the code they cover (`*.test.ts`, `*.test.tsx`), including
the surface wide locks on brand voice and on legal consistency.

---

## Contributing

GnosIQ is a **solo founder proprietary product**, not an open source project.

This repository is public for **transparency and developer trust**, consistent
with the API first positioning and the GnosIQ Architecture Manifesto.

**What this means:**
- Pull requests from external contributors are **not accepted** at this stage
- Issues and bug reports are **welcome** via [GitHub Issues](https://github.com/gnosiqai/gnosiq-web/issues)
- All production merges require approval from [@gnosiqai](https://github.com/gnosiqai)

---

## Security

- Cognitive assessment data is **never used to train external AI models**
- Data at rest in Firestore is encrypted by the platform
- No personal data is stored beyond what is needed to deliver the report
- The waitlist form fails closed: no anti-bot verification, no write
- LGPD (BR) and GDPR (EU) compliant by design

Found a vulnerability? Follow [`SECURITY.md`](SECURITY.md). Please do not open
a public issue for it.

For anything else, [hello@gnosiq.ai](mailto:hello@gnosiq.ai) is the public
contact.

---

## Legal

**License:** Proprietary, all rights reserved © 2026 GnosIQ Tecnologia Ltda.

This software and its cognitive assessment frameworks (prompts, scoring
models, agent orchestration logic, and psychometric benchmarks) are
proprietary intellectual property of GnosIQ. See [`LICENSE`](LICENSE).

GnosIQ™ and GnoScore™ are trademarks filed with the INPI (Brazil).

> GnosIQ assessments are tools for self knowledge and strategic planning. They
> do **not** constitute clinical diagnosis, psychological evaluation, or
> medical advice. Always consult a licensed mental health professional for
> clinical decisions.

Privacy policy and terms of use: [gnosiq.ai/privacy](https://gnosiq.ai/privacy)
· [gnosiq.ai/terms](https://gnosiq.ai/terms)

---

<div align="center">

**GnosIQ · The Cognitive Capital API**

*We don't assess people. We unlock the cognitive capital hidden in every human.*

[gnosiq.ai](https://gnosiq.ai) · [hello@gnosiq.ai](mailto:hello@gnosiq.ai)

[X](https://x.com/gnosiqai) · [GitHub](https://github.com/gnosiqai) ·
[LinkedIn](https://linkedin.com/company/gnosiq) ·
[Instagram](https://instagram.com/gnosiq.ai)

---

*GnosIQ Tecnologia Ltda. · CNPJ 66.473.762/0001-13 · Porto Alegre, Brazil*

</div>
