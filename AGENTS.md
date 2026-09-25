# Instruções para agentes de IA

Você está no repositório Startup AI OS.

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


## Escopo ampliado

O Startup AI OS deve cobrir a estrutura completa de criação e evolução de empresas:

- Estratégia e founder office.
- Business model, PV, PUV, oferta e pricing.
- Product Management, discovery, MVP, roadmap e métricas.
- UX/UI e experiência.
- Engenharia, arquitetura e qualidade.
- Dados, IA, agentes, MLOps e governança.
- DevOps e Platform como leitura de impacto, versões e maturidade; execução profunda de infraestrutura pode virar DevOps OS.
- Growth, vendas, marketing e customer success.
- Operação física/digital, processos, rituais, finance/legal e pessoas.

Nunca reduza o projeto a uma ferramenta apenas de PM. PM é uma camada dentro do sistema operacional de startups e empresas digitais.
