#!/bin/bash
# ralph-loop.sh — GnosIQ context loader v1.2
# Novidade v1.2: back-merge guard — bloqueia sessão se main drift detectado
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)"

echo "═══════════════════════════════════"
echo "  RALPH LOOP — GnosIQ Context Load"
echo "═══════════════════════════════════"
cat "$SCRIPT_DIR/agents.md"
echo ""
echo "─── SSOT Reference ─────────────────"
cat "$SCRIPT_DIR/ssot-ref.md"
echo ""
echo "─── Current Task ───────────────────"
cat "$SCRIPT_DIR/current-task.md"
echo "═══════════════════════════════════"

# ── BACK-MERGE GUARD ─────────────────────────────────────────────────────────
echo ""
echo "─── Branch Sync Check ──────────────"
if [ -n "$REPO_ROOT" ]; then
  git -C "$REPO_ROOT" fetch origin --quiet 2>/dev/null
  CURRENT_BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null)
  DRIFT=$(git -C "$REPO_ROOT" log origin/develop..origin/main --oneline 2>/dev/null)

  if [ -n "$DRIFT" ]; then
    echo "⚠️  BACK-MERGE NECESSÁRIO — main tem commits que develop NÃO tem:"
    echo "$DRIFT"
    echo ""
    echo "🚫 SESSÃO BLOQUEADA. Execute antes de qualquer tarefa:"
    echo "   git checkout develop"
    echo "   git merge origin/main -m 'chore: back-merge main→develop'"
    echo "   git push origin develop"
    echo ""
    echo "Após sync, rode ralph-loop.sh novamente para desbloquear."
    echo "═══════════════════════════════════"
    exit 1
  else
    echo "✅ develop sincronizado com main — sem drift"
    echo "   Branch atual: $CURRENT_BRANCH"
  fi
else
  echo "⚠️  Não é um repositório git — sync check ignorado"
fi
echo "═══════════════════════════════════"
# ── FIM BACK-MERGE GUARD ──────────────────────────────────────────────────────

if [ "$1" = "start" ] && [ -n "$2" ]; then
  echo "" >> "$SCRIPT_DIR/current-task.md"
  echo "## Session $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$SCRIPT_DIR/current-task.md"
  echo "Task: $2" >> "$SCRIPT_DIR/current-task.md"
  echo "✅ Sessão iniciada: $2"
fi
