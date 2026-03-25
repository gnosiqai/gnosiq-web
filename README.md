# GnosIQ — The Cognitive Capital API

> "The first API that turns human potential into computable capital."

Landing page oficial da GnosIQ em [gnosiq.ai](https://gnosiq.ai).

---

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js | 15 (App Router) |
| TypeScript | strict mode |
| Tailwind CSS | 3.x |
| Node.js | 22 LTS |
| Package Manager | npm (NUNCA yarn/pnpm) |

---

## Setup Local

### Pré-requisitos

- Node.js 22 LTS
- npm 10+

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/gnosiqai/gnosiq-web.git
cd gnosiq-web

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com os valores reais (nunca commite este arquivo)

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no browser.

---

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha os valores:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | Chave do projeto PostHog (analytics) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Host PostHog (padrão: `https://app.posthog.com`) |
| `SENDGRID_API_KEY` | API Key do SendGrid (email transacional) |
| `SENDGRID_FROM_EMAIL` | Email remetente (padrão: `carlos@gnosiq.ai`) |
| `FIRESTORE_PROJECT_ID` | ID do projeto GCP com Firestore |
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho para o JSON de credenciais GCP |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação (padrão: `https://gnosiq.ai`) |

---

## Comandos npm

```bash
npm run dev      # Servidor de desenvolvimento (localhost:3000)
npm run build    # Build de produção
npm run start    # Servidor de produção (após build)
npm run lint     # Verificação de lint (ESLint)
```

---

## Estrutura do Projeto

```
gnosiq-web/
├── app/
│   ├── layout.tsx              # Root layout · metadata SEO · PostHog · fontes
│   ├── page.tsx                # Landing page (PLACEHOLDER)
│   ├── globals.css             # Tailwind base + design tokens GnosIQ
│   └── api/
│       └── waitlist/
│           └── route.ts        # POST handler waitlist (PLACEHOLDER)
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # variant: primary | ghost | outline
│   │   ├── Input.tsx           # com label + error state
│   │   └── Badge.tsx           # variant: default | success | accent
│   ├── sections/
│   │   ├── Nav.tsx             # PLACEHOLDER
│   │   ├── Hero.tsx            # PLACEHOLDER
│   │   ├── SocialProof.tsx     # PLACEHOLDER
│   │   ├── HowItWorks.tsx      # PLACEHOLDER
│   │   ├── WaitlistForm.tsx    # PLACEHOLDER
│   │   └── Footer.tsx          # PLACEHOLDER
│   └── layout/
│       └── PageWrapper.tsx     # max-w + padding padrão
├── lib/
│   ├── firebase.ts             # Firestore client init (PLACEHOLDER)
│   └── sendgrid.ts             # Email helper (PLACEHOLDER)
├── public/
│   └── logo-placeholder.svg   # SVG placeholder (substituir pelo logo final)
├── .github/
│   └── workflows/
│       └── deploy.yml          # Push main → Vercel deploy automático
├── .env.example                # Template de variáveis (sem valores reais)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts          # Design tokens GnosIQ completos
├── tsconfig.json               # strict: true
└── package.json
```

---

## Design Tokens

| Token | Valor |
|---|---|
| Background Primary | `#0D0B1E` |
| Background Secondary | `#1A1730` |
| Accent | `#8B5CF6` |
| Accent Light | `#A78BFA` |
| Accent Dark | `#6D28D9` |
| Brand Blue | `#3A4E8D` |
| Text Primary | `#FFFFFF` |
| Text Muted | `#9CA3AF` |
| **COR PROIBIDA** | **`#14B8A6` (teal — jamais use)** |

---

## Deploy

O deploy é automático via GitHub Actions ao fazer push na branch `main`.

**Pré-requisitos para CI/CD:**

Configure os seguintes secrets no repositório GitHub (Settings → Secrets → Actions):

- `VERCEL_TOKEN` — Token da conta Vercel
- `VERCEL_ORG_ID` — ID do time no Vercel
- `VERCEL_PROJECT_ID` — ID do projeto gnosiq-web no Vercel

---

## Workflow Git

```bash
# Criar branch de trabalho
git checkout -b feat/[nome-da-tarefa]

# Commitar com mensagens semânticas
git commit -m "feat: descrição da mudança"
git commit -m "fix: descrição do fix"
git commit -m "chore: descrição da tarefa"

# Push e abrir PR
git push -u origin feat/[nome-da-tarefa]
# Abrir Pull Request → main no GitHub
# NUNCA fazer merge sozinho — Carlos aprova sempre
```

---

## Arquitetura

- **Frontend:** Next.js 15 (App Router) hospedado na Vercel
- **Backend:** API Routes Next.js → Cloud Run Gen2 (southamerica-east1)
- **Banco de dados:** Firestore Native Mode (free tier)
- **Email:** SendGrid API v3 (100 emails/dia free)
- **Analytics:** PostHog Cloud (1M events/mês free)
- **DNS/CDN:** Cloudflare (gnosiq.ai)

---

*GnosIQ · gnosiq.ai · "The Cognitive Capital API"*
