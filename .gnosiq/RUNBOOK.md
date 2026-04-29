# Ralph Loop — Runbook de Falha

> Princípio 7: falha ruidosa e cedo é infinitamente melhor que falha silenciosa e tarde.

## Cenário 1: Camada 1 falhou (ralph-loop.sh não executa)

**Sintoma:** script trava, erro de permissão, ou arquivo ausente

**Diagnóstico:**
```bash
ls -la .gnosiq/
bash --version
```

**Recover:**
```bash
chmod +x .gnosiq/ralph-loop.sh
./.gnosiq/ralph-loop.sh
```

**Se .gnosiq/ ausente:** repo foi clonado sem o diretório — verificar merge do PR GNO-24.

---

## Cenário 2: Camada 2 falhou (pre-commit hook bloqueou)

**Sintoma:** `[RALPH] ERRO: .gnosiq/ssot-ref.md ausente`

**Causa mais comum:** ssot-ref.md desatualizado ou deletado acidentalmente

**Recover:**
```bash
./.gnosiq/ralph-loop.sh   # recria contexto
./install-hooks.sh         # reinstala hook se necessário
git commit ...             # tente novamente
```

---

## Cenário 3: Camada 3 falhou (CI bloqueou PR)

**Sintoma:** GitHub Actions reporta falha em "Ralph Guard" no PR

**Causa mais comum:** PR criado sem .gnosiq/ (branch antiga ou fork)

**Recover:**
```bash
git checkout develop       # ou main
git pull origin develop
git checkout -b feat/sua-branch
# recriar commits com .gnosiq/ presente
```

---

## Reset completo (nuclear)

```bash
cd ~/gnosiqai/gnosiq-web   # ou gnosiq-internal
git pull origin develop
./.gnosiq/ralph-loop.sh
./install-hooks.sh
```
