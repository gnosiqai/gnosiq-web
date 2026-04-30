#!/bin/bash
# install-hooks.sh — GnosIQ Ralph Loop Camada 2
# Instala pre-commit hook que valida .gnosiq/ssot-ref.md antes de cada commit
# Ref: GNO-61 — https://linear.app/gnosiq/issue/GNO-61

HOOK=".git/hooks/pre-commit"

cat > $HOOK << 'EOF'
#!/bin/bash
SSOT_REF=".gnosiq/ssot-ref.md"
if [ ! -f "$SSOT_REF" ]; then
  echo "[RALPH] ERRO: .gnosiq/ssot-ref.md ausente — execute ralph-loop.sh primeiro"
  exit 1
fi
VERSION=$(grep -oP '(?<=version: )[\d.]+' "$SSOT_REF" | head -1)
if [ -z "$VERSION" ]; then
  echo "[RALPH] ERRO: versão não detectada em ssot-ref.md — arquivo corrompido"
  exit 1
fi
echo "[RALPH] ✓ ssot-ref.md presente — SSOT v$VERSION"
exit 0
EOF

chmod +x $HOOK
echo "[RALPH] Hook instalado em $HOOK"
