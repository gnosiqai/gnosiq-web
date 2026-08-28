<div align="center">

# GnosIQ

**The Cognitive Capital API**

*We don't assess people. We unlock the cognitive capital hidden in every human.*

[![Status](https://img.shields.io/badge/status-private%20beta-8B5CF6?style=flat-square)](https://gnosiq.ai)
[![License](https://img.shields.io/badge/license-BUSL%201.1-6D28D9?style=flat-square)](LICENSE)

[gnosiq.ai](https://gnosiq.ai) · [hello@gnosiq.ai](mailto:hello@gnosiq.ai)

</div>

---

## What is Cognitive Capital

Cognitive capital is the part of human potential that never reached a balance
sheet: how a person thinks, learns, decides under pressure, and recovers from
adversity.

Financial capital has been programmable for a decade. Cognitive capital has
not. Reading it has meant weeks of scheduling, a specialist's calendar, and a
static PDF at the end.

GnosIQ makes cognitive capital computable: one adaptive session in the browser,
one structured report, one programmatic surface.

## What is GnosIQ

GnosIQ maps a cognitive profile from an adaptive session and returns a written
report in about 30 minutes, grounded in the CHC model, the most widely accepted
framework in contemporary intelligence research.

Three specialized AI agents, in sequence:

| | Agent | What it does |
|---|---|---|
| 01 | Adaptive assessment | Runs the session and adjusts the path to the answers given |
| 02 | Psychometric analysis | Computes the GnoScore™ and the profile across CHC domains |
| 03 | Report writing | Writes the report: what the numbers mean and what to do with them |

## Status

**Private beta.** The assessment is not open to the public yet.
Join the waitlist at [gnosiq.ai](https://gnosiq.ai/#waitlist).

## Repository scope

This repository is the public web surface only: the landing page, the waitlist
flow, and the legal pages. The GnosIQ cognitive engine is proprietary, lives
outside this repository, and is not documented here.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| Styling | Tailwind CSS |
| Runtime | Vercel serverless · Node.js 24 |
| Database | Firestore Native Mode |
| Transactional email | Resend |
| Anti-bot | Cloudflare Turnstile |
| Analytics | PostHog Cloud |
| Tests | Vitest + Testing Library |

## Run locally

```bash
git clone https://github.com/gnosiqai/gnosiq-web.git
cd gnosiq-web
npm install

cp .env.example .env.local
# → every variable is documented in .env.example, with its failure mode

npm run dev    # http://localhost:3000
npm test       # Vitest suite
npm run build
```

## Contact

- General: [hello@gnosiq.ai](mailto:hello@gnosiq.ai)
- Early access: [Join the waitlist](https://gnosiq.ai/#waitlist)
- Security: report privately, per [`.github/SECURITY.md`](.github/SECURITY.md). Please do not open a public issue for a vulnerability.
- Legal: [Privacy policy](https://gnosiq.ai/privacy) · [Terms of use](https://gnosiq.ai/terms)

## License and use

Source is published for transparency, not as an open source project.

The Licensed Work is covered by the **Business Source License 1.1**
([`LICENSE`](LICENSE)): non-production use is permitted, with an additional
grant for personal, non-commercial evaluation. Production use requires a
commercial license. The license converts to MIT on 2029-01-01.

External pull requests are not accepted at this stage. The GnosIQ cognitive
engine, its scoring models and its prompts are not covered by this license and
are not published.

GnosIQ™ and GnoScore™ are trademarks filed with the INPI (Brazil). The license
grants no right in any GnosIQ trademark or logo.

---

<div align="center">

**GnosIQ · The Cognitive Capital API**

*We don't assess people. We unlock the cognitive capital hidden in every human.*

This report identifies cognitive and behavioral patterns using validated
screening instruments. It does NOT replace clinical diagnosis by a licensed
neurologist, clinical psychologist, or psychiatrist.

© 2026 GnosIQ Tecnologia Ltda. · CNPJ 66.473.762/0001-13 · Porto Alegre, Brazil

</div>
