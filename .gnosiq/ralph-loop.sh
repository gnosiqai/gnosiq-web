#!/bin/bash
# ralph-loop.sh — GnosIQ context loader v1.1
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

if [ "$1" = "start" ] && [ -n "$2" ]; then
  echo "" >> "$SCRIPT_DIR/current-task.md"
  echo "## Session $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$SCRIPT_DIR/current-task.md"
  echo "Task: $2" >> "$SCRIPT_DIR/current-task.md"
  echo "✅ Sessão iniciada: $2"
fi
