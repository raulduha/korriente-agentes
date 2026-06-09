# Roadmap por fases

Alineado con el Playbook: el stack evoluciona con la cantidad de clientes y la
complejidad, no antes.

## Fase 1 — Validación (este repo) · 0–3 clientes
- Runtime Python propio + conectores (mock + reales mínimos: WhatsApp, email, sheets).
- 2 agentes flagship probados.
- Pricing + límites con budget cap.
- SQLite, 1 worker, deploy simple (Railway/Render/VPS).
- **Objetivo**: entregar un agente real a un cliente pagado en ≤30 días con ROI medible.

## Fase 2 — Productización · 3–10 clientes
- PostgreSQL + colas (RQ/Celery) para asincronía y reintentos.
- Memoria vectorial (Qdrant) para agentes con RAG sobre documentos del cliente.
- Agentes complejos con CrewAI (prototipado por roles) y LangGraph (flujos con HITL
  nativo, loops, auditables). El `Agent` actual define el contrato; estos frameworks
  se enchufan por dentro sin tocar conectores ni pricing.
- Observabilidad con LangSmith / LangFuse.
- Exportador opcional a n8n para clientes que ya viven en n8n.
- Dashboard de cliente self-service (ver uso, límites, trazas).

## Fase 3 — Enterprise · 10+ clientes
- Contenedores + orquestación, SLA 99.9%, despliegue en VPC.
- Azure OpenAI + Semantic Kernel donde el cliente exige Azure/compliance.
- Multi-agente complejo, RBAC, auditoría, SOC2/HIPAA según vertical.

## Indicadores para pasar de fase
- Fase 1 → 2: cuando un 3er cliente del mismo tipo tarda demasiado por falta de colas/
  memoria, o cuando un caso pide RAG.
- Fase 2 → 3: cuando un cliente exige SLA/compliance formal y paga el tier Enterprise.

## Cuándo (y cuándo NO) ir a SaaS self-serve
NO antes de tener ~5–10 clientes del mismo molde entregados y un proceso donde el 80%
del agente es idéntico. Mientras el valor esté en el diagnóstico y la adaptación,
mantenemos el modelo consultivo + suscripción. El SaaS self-serve es una decisión de
Fase 2/3, no de inicio (ver `docs/constitution.md` §3 y §8).
