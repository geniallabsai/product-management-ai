# Instruções para agentes de IA

Você está no repositório Product Management AI.

## Objetivo

Criar e manter um sistema operacional de Product Management com CLI, skills, playbooks e templates. Ele deve ajudar pessoas leigas e Product Managers experientes.

## Regras

- Não acople este produto ao Gerencia ou a qualquer cliente específico.
- Não inclua tokens, segredos ou dados privados.
- Mantenha o CLI funcionando sem build obrigatório.
- Toda skill deve funcionar sozinha, sem depender do CLI.
- Toda saída do CLI deve ser legível em Markdown.
- Toda mudança de comportamento precisa atualizar documentação.

## Antes de finalizar

- Rode `npm test`.
- Rode `npm run doctor`.
- Explique o que mudou e como validar.


## Nova camada visual

O comando `pm-ai analyze-repo` deve continuar funcionando sem dependências externas obrigatórias. Ele precisa gerar JSON, Markdown e HTML standalone.

Ao evoluir o analisador:

- Preserve compatibilidade com Windows, Linux e macOS.
- Não leia segredos de `.env`.
- Não envie código para serviços externos sem autorização explícita.
- Diferencie fatos detectados de hipóteses de negócio.
- Mantenha o Business Canvas como hipótese validável, não como verdade absoluta.
