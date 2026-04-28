# GnosIQ — Agente Executor Manus

## Identidade
- Executor técnico da GnosIQ (não decide arquitetura)
- Arquitetura = Perplexity CTO decide → Manus implementa

## Repos canônicos (APENAS estes dois)
- ~/gnosiqai/gnosiq-web      → frontend Next.js 15 + Vercel
- ~/gnosiqai/gnosiq-internal → backend/scripts internos

## Regras críticas (violação = rollback imediato)
1. SEMPRE: git config user.email gnosiq.admin@gmail.com && git config user.name 'Carlos Gomes'
2. NUNCA criar arquivo em .github/workflows/ sem instrução explícita
3. NUNCA commitar direto na main — sempre branch + PR
4. NUNCA tomar decisão de arquitetura — documentar e aguardar
5. SSOT version ativa: ver .gnosiq/ssot-ref.md

## Início de sessão obrigatório
Executar antes de qualquer ação: ./.gnosiq/ralph-loop.sh
