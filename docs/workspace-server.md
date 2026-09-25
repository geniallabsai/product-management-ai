# Workspace server

O Product Management AI agora tem uma aplicação local em Node, servida em `localhost`, para substituir o HTML estático quando a pessoa quer navegar de verdade.

## Rodar

```bash
pm-ai serve --path . --port 4738
```

Ou:

```bash
npm run serve
```

## Por que Node primeiro

Node mantém o produto instalável via npm, reaproveita o CLI existente e entrega uma experiência mais próxima de produto: API local, front-end separado, canvas interativo, pan, zoom e cards arrastáveis.

## Próximos adapters

- Go: binário único e rápido para análise/servidor local.
- Django: modo equipe, banco, login, histórico de análises e colaboração.
- Java/Spring: modo enterprise para times grandes.
