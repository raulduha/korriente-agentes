# Backlog por milestones

Convención: cada agente/feature nuevo nace de una spec en `specs/` (ver `CLAUDE.md`).
Marca `[x]` al completar. El orden importa: no saltarse hitos.

## M0 — Scaffold (HECHO)
- [x] Documentos guía (`docs/`) y constitución
- [x] Runtime de agentes + LLM provider-agnóstico
- [x] Pricing + límites con budget cap (PyME-first)
- [x] Conectores mock (whatsapp, email, crm, sheets, http)
- [x] 2 agentes flagship (lead-classifier, cobranza) + specs
- [x] Pruebas simuladas (64 tests en verde: 46 backend + 18 frontend) + 3 ejemplos
- [x] API FastAPI (webhooks + dashboard) y frontend Next.js base

## M1 — Primer cliente real (Fase 1)
> Orden de ataque recomendado (ver `docs/plan-negocio.md` §4): 005 → 007 → 006 → 008 → 004.
> **Plan ejecutable fase a fase, con prompts para el agente y gates: `docs/plan-ejecucion-mvp.md`.**
- [x] Conector WhatsApp **real** (BSP: 360dialog) + webhook entrante — SPEC-005 implementada
- [x] Cobro Flow.cl + activación/suspensión por estado del tenant — SPEC-006 implementada
- [x] Deploy Railway/Render + onboarding checklist + runbook — SPEC-007 implementada (deploy real pendiente tú)
- [x] Panel: trazas por tenant + alertas 80/100% — SPEC-008 implementada
- [ ] Solicitudes de cambio + consola de admin (modelo servicio gestionado) — spec **borrador** (SPEC-009)
- [ ] RAG sobre documentos del cliente (knowledge tool) — spec **borrador** (SPEC-004, adelantado de M2)
- [ ] Conector email real (SMTP/IMAP) y CRM real del cliente (HTTP)
- [x] Persistencia SQLite (tenants, uso mensual, trazas) — `app/core/storage.py` (SPEC-003)
- [ ] Job de reset mensual de cuotas — cubierto por SPEC-008
- [ ] **Quick win comercial:** botón "Agendar diagnóstico" → form real (correo/WhatsApp). Antes que cualquier feature.

## M2 — Productización (Fase 2)
- [ ] PostgreSQL + migraciones (Alembic) y `tenant_id` en todo
- [ ] Colas (RQ/Celery) para reintentos y asincronía
- [ ] Memoria vectorial (Qdrant) + agente RAG sobre documentos del cliente
- [ ] Integrar CrewAI/LangGraph para agentes complejos (mismo contrato `Agent`)
- [ ] Observabilidad: LangSmith/LangFuse (tracing + evals automáticos)
- [ ] Exportador opcional a workflow n8n
- [ ] Calculadora de diagnóstico/pricing (Bloque C del Playbook) en el panel
- [ ] 3er agente: triage/intake con HITL obligatorio (caso salud)

## M3 — Enterprise (Fase 3)
- [ ] Multi-agente complejo + RBAC + auditoría
- [ ] Azure OpenAI + Semantic Kernel donde el cliente lo exige
- [ ] SLA 99.9%, contenedores, despliegue VPC
- [ ] Compliance por vertical (SOC2/HIPAA según corresponda)

## Deuda técnica / mejoras continuas
- [ ] Más casos de prueba por agente (edge cases reales de clientes)
- [ ] Validación de prompts con un set de evals dorado
- [ ] Endurecer enmascarado de PII y revisión Ley 19.628 con abogado
- [ ] CI: correr `pytest` en cada push (GitHub Actions)
