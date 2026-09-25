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
