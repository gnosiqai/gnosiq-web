#!/usr/bin/env bash
# .gnosiq/ralph-loop.sh — Ralph Loop wrapper leve para GnosIQ
# Substitui Wiggum CLI (descartado — ver GNO-24)
# Uso:
#   ./ralph-loop.sh              → exibe contexto do projeto (agents.md + current-task.md)
#   ./ralph-loop.sh start "GNO-XX descrição"  → inicia sessão com nova tarefa

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_FILE="$SCRIPT_DIR/agents.md"
TASK_FILE="$SCRIPT_DIR/current-task.md"

# Cores (sem teal #14B8A6 — regra GnosIQ)
PURPLE='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
RESET='\033[0m'

print_separator() {
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

print_header() {
  echo ""
  print_separator
  echo -e "${WHITE}  🧠 GnosIQ — Ralph Loop${RESET}"
  print_separator
  echo ""
}

show_context() {
  print_header

  if [ -f "$AGENTS_FILE" ]; then
    echo -e "${PURPLE}📋 AGENTS CONTEXT${RESET}"
    print_separator
    cat "$AGENTS_FILE"
    echo ""
  else
    echo -e "${GRAY}⚠️  agents.md não encontrado em $AGENTS_FILE${RESET}"
  fi

  if [ -f "$TASK_FILE" ]; then
    echo -e "${PURPLE}🎯 CURRENT TASK${RESET}"
    print_separator
    cat "$TASK_FILE"
    echo ""
  else
    echo -e "${GRAY}⚠️  current-task.md não encontrado em $TASK_FILE${RESET}"
  fi

  print_separator
  echo -e "${GRAY}  Sessão iniciada em: $(date '+%Y-%m-%d %H:%M %Z')${RESET}"
  print_separator
  echo ""
}

start_task() {
  local task_desc="${1:-}"
  if [ -z "$task_desc" ]; then
    echo "Uso: $0 start \"GNO-XX descrição da tarefa\""
    exit 1
  fi

  show_context

  echo -e "${PURPLE}🚀 NOVA TAREFA INICIADA${RESET}"
  print_separator
  echo -e "${WHITE}  $task_desc${RESET}"
  echo -e "${GRAY}  Iniciado em: $(date '+%Y-%m-%d %H:%M %Z')${RESET}"
  print_separator
  echo ""

  # Append ao session log do current-task.md
  if [ -f "$TASK_FILE" ]; then
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M BRT')
    # Insere antes do fechamento do bloco de código do session log
    sed -i "s|^\`\`\`$|[$timestamp] $task_desc\n\`\`\`|" "$TASK_FILE" 2>/dev/null || true
  fi
}

# Entry point
case "${1:-}" in
  start)
    start_task "${2:-}"
    ;;
  *)
    show_context
    ;;
esac
