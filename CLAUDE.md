## Git & Linear — convenção obrigatória

1. BRANCH: Se a tarefa referencia uma issue Linear (GNO-xx), NUNCA gerar
   nome de branch próprio. Buscar o `gitBranchName` da issue via Linear MCP
   (get_issue) e criar/usar exatamente essa branch.
   Se a branch de trabalho já existir com outro nome (sessão herdada),
   NÃO renomear — compensar via magic word (regra 3).
2. Se a tarefa NÃO tem issue Linear associada, perguntar ao founder se
   deve existir uma antes de commitar (Regra 14: validar maior ID no
   Linear antes de criar — nunca confiar em número herdado de documento).
3. PULL REQUEST: título no formato `tipo(escopo): GNO-xx — descrição`
   e corpo contendo `Fixes GNO-xx` na primeira linha. Sem exceção —
   é isso que garante o vínculo e o auto-close no Linear mesmo quando
   a branch fugiu do padrão.
4. Nunca abrir PR sem aprovação explícita do founder ("approved").
7. FECHAMENTO DE ISSUE: usar `Fixes GNO-xx` somente quando o merge conclui
   TODO o DoD da issue. Issues com entregáveis além do código: usar
   `Refs GNO-xx` — fechamento é decisão do founder.
8. REPORT-BACK NO LINEAR: ao encerrar um escopo, postar o report-back completo da
   sessão como comentário na issue de trabalho via MCP, incluindo a seção BECOS SEM
   SAÍDA. Nunca em issue permanente. Canônico: executor_regras_operacionais no SSOT.
