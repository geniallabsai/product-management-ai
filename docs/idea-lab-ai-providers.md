# Idea Lab e Providers de IA

O Startup AI OS suporta múltiplos providers locais/remotos para a etapa de ideação e planejamento.

## Providers

- Offline Startup AI: modo local sem API Key.
- OpenAI: usa Chat Completions.
- Google Gemini: usa generateContent.
- Anthropic Claude: usa Messages API.
- OpenAI-compatible endpoint: serve para Ollama, vLLM, LiteLLM, gateways e proxies.
- Local harness webhook: permite plugar um harness próprio expondo endpoint compatível.

## Segurança local

As chaves ficam em `.startup-ai/ai-secrets.json`, que está no `.gitignore`. Não committe chaves.

## Jornada Idea Lab

O usuário descreve a ideia e recebe: diagnóstico, ICP, jobs to be done, PV, PUV, Value Proposition Canvas, Business Model Canvas, SWOT, Eisenhower, RICE/ICE/MoSCoW, MVP, Kanban, Scrum, plano 7/30/90 dias, roadmap, métricas e riscos.
