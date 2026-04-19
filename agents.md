# agents.md — GnosIQ Web · Ralph Loop Long-Term Memory

> **Propósito:** Memória de longo prazo para agentes de IA (Ralph Loop, Manus, Perplexity, Cursor, Claude).  
> Contém stack canônica, convenções, regras de commit, env vars obrigatórias e gotchas conhecidos.  
> **Nunca editar manualmente sem atualizar a seção `updated_at`.**

---

## Meta

```yaml
repo:        gnosiqai/gnosiq-web
type:        frontend · marketing site + assessment portal
updated_at:  2026-04-19
owner:       Carlos Alberto Gomes (carlos@gnosiq.ai)
loop:        Ralph Loop v1 (GNO-21)
```

---

## Stack Canônica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | ^15.5.15 |
| Runtime | Node.js | 22 |
| Linguagem | TypeScript | ^5 |
| Estilo | Tailwind CSS | ^3.4.17 |
| React | React / React DOM | ^19 |
| Auth + DB | Firebase Admin SDK + Firestore | ^13.8 |
| Email | SendGrid | ^8.1.4 |
| Analytics | PostHog | ^1.367 |
| Deploy | Vercel (GCP Serverless via OIDC) | — |
| CI/CD | GitHub Actions (`.github/`) | — |
| Linting | ESLint (Next.js config) | ^9 |
| AI (M2) | Anthropic Claude + Google Gemini | — |
| Pagamento (M2) | Stripe | — |

---

## Estrutura de Diretórios

```
gnosiq-web/
├── app/              # App Router: pages, layouts, API routes
├── components/       # React components reutilizáveis
├── docs/             # Documentação interna do projeto
├── hooks/            # React custom hooks
├── lib/              # Utilitários, clients SDK, helpers
├── prompts/          # Prompts LLM versionados
├── public/           # Assets estáticos
├── agents.md         # ← este arquivo (Ralph Loop memory)
├── .env.example      # Template de env vars (nunca contém secrets)
├── .env.local.example
├── CODEOWNERS        # Ownership por diretório
└── next.config.ts    # Configuração Next.js
```

---

## Convenções de Código

### Geral
- **TypeScript strict** — sem `any` implícito; erros de tipo bloqueiam build
- **App Router apenas** — sem Pages Router; toda rota vive em `app/`
- **Server Components por padrão** — usar `"use client"` só quando necessário (interatividade, hooks de estado)
- **Async server components** — `async/await` direto no componente; sem `useEffect` para data fetching
- **Paths absolutos** — usar aliases do `tsconfig.json` (`@/components/...`) em vez de `../../`

### Nomenclatura
- Componentes: `PascalCase` (ex: `AssessmentCard.tsx`)
- Hooks: `camelCase` prefixado com `use` (ex: `useAssessmentResult.ts`)
- Utilitários/helpers: `camelCase` (ex: `formatScore.ts`)
- API Routes: `route.ts` dentro de `app/api/[endpoint]/`
- Constantes: `SCREAMING_SNAKE_CASE`

### Estilo (Tailwind)
- Classes utilitárias Tailwind v3 — sem CSS Modules salvo casos excepcionais
- Design tokens customizados em `tailwind.config.ts`
- Mobile-first: breakpoints `sm:` → `md:` → `lg:`

---

## Regras de Commit

Seguir **Conventional Commits** estritamente:

```
<type>(scope): <descrição imperativa em EN>

Types obrigatórios:
  feat      Nova funcionalidade
  fix       Correção de bug
  docs      Apenas documentação
  style     Formatação, sem mudança de lógica
  refactor  Refactor sem feat/fix
  test      Adicionar/corrigir testes
  chore     Build, CI, deps
  perf      Melhoria de performance

Exemplos válidos:
  feat(assessment): add result caching via Firestore
  fix(api): handle missing env var on cold start
  docs: add agents.md for Ralph Loop long-term memory
  chore(deps): bump next to 15.5.15
```

- **Scope** = nome do diretório/feature afetada
- **Descrição** em inglês, imperativo, sem ponto final
- **Commits atômicos** — um propósito por commit
- **Nunca commitar** `.env.local`, secrets ou arquivos de IDE

---

## Env Vars Obrigatórias

> Fonte canônica: `.env.example`. Abaixo: resumo para o agente.

### Runtime (sempre necessárias)
```
NEXT_PUBLIC_POSTHOG_KEY        Analytics PostHog
NEXT_PUBLIC_POSTHOG_HOST       https://app.posthog.com
SENDGRID_API_KEY               Envio de emails transacionais
SENDGRID_FROM_EMAIL            Remetente verificado no SendGrid
GCP_PROJECT_ID                 Projeto GCP ativo
FIRESTORE_PROJECT_ID           Mesmo que GCP_PROJECT_ID (ou alias)
FIRESTORE_CLIENT_EMAIL         Service account email
FIRESTORE_PRIVATE_KEY          Chave privada da service account (com \n)
```

### CI/CD (Vercel — não vão para .env.local)
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### M2 (ainda não ativos em produção)
```
ANTHROPIC_API_KEY
GOOGLE_AI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## Gotchas Conhecidos

### Firebase Admin SDK
- `FIRESTORE_PRIVATE_KEY` deve ter `\n` escapado corretamente — em `.env.local` usar aspas duplas com `\\n`; no Vercel dashboard, colar a chave raw (sem escape adicional)
- Inicializar o Admin SDK **uma única vez** com singleton pattern em `lib/firebase-admin.ts`; múltiplas inicializações causam erro em hot-reload do Next.js dev

### Vercel + GCP OIDC
- `@vercel/oidc` elimina a necessidade de secrets estáticos de SA no CI — preferir esse fluxo para deploy em produção
- Não misturar `GOOGLE_APPLICATION_CREDENTIALS` (path local) com as vars `FIRESTORE_*` (credenciais explícitas) no mesmo ambiente

### Next.js App Router
- API Routes vivem em `app/api/[rota]/route.ts` com `export async function GET/POST(...)`
- `NEXT_PUBLIC_*` são expostas ao browser — **nunca** colocar secrets com esse prefixo
- Server Actions (`"use server"`) podem substituir API Routes simples — avaliar caso a caso
- Cold starts no Vercel Serverless: inicialização de SDK (Firebase, SendGrid) deve ser lazy quando possível

### PostHog
- `posthog-js` roda no client; captura de eventos server-side usa REST API diretamente
- Não logar dados cognitivos de usuários (compliance LGPD/GDPR)

### Tailwind v3
- Purge CSS automático via `content` no `tailwind.config.ts` — garantir que todos os paths de componentes estão incluídos
- Classes dinâmicas (template literals) não são purgadas — usar `safelist` ou classes completas

---

## Princípios Arquiteturais GnosIQ (relevantes para este repo)

Os 16 princípios do Manifesto GnosIQ v1.0 se aplicam. Os mais críticos para `gnosiq-web`:

1. **100% Serverless** — sem servidores dedicados; tudo via Vercel Functions + GCP
2. **Minimum Cost Max Profit** — zero infra cost como default; usar camadas gratuitas
3. **Privacy Sovereign** — dados de avaliação nunca saem para modelos externos; LGPD/GDPR
4. **Solo Founder Scalable** — se 1 pessoa não consegue operar, não vai para produção
5. **API-First** — endpoints bem definidos; frontend é apenas um consumer da API

---

## Relacionado

| Arquivo / Issue | Descrição |
|---|---|
| `GNO-21` | Issue pai — metodologia Ralph Loop completa |
| `GNO-22` | Issue desta entrega — criação deste arquivo |
| `GNO-23` | `current-task.md` — memória de curto prazo (próximo passo) |
| `.env.example` | Fonte canônica de env vars |
| `CODEOWNERS` | Ownership por diretório |
| `docs/` | Documentação adicional do projeto |
