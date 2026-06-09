# Arquitectura

La arquitectura sigue el patrón de 6 capas del Playbook Korriente. Es agnóstica al
framework: lo que cambia entre Fase 1 y Fase 3 es control y escala, no el patrón.

```
                ┌──────────────────────────────────────────────┐
   Canal entra  │  1. INPUT PARSER                               │
  (WhatsApp,    │  Recibe y normaliza: webhook, email, form, API │
   email, web)  └───────────────┬──────────────────────────────┘
                                 ▼
                ┌──────────────────────────────────────────────┐
                │  2. LLM CORE  (app/llm)                        │
                │  Razonamiento. Provider-agnóstico.             │
                │  Modelo barato por defecto.                    │
                └───────────────┬──────────────────────────────┘
                                 ▼
                ┌──────────────────────────────────────────────┐
                │  3. RUNTIME / ORQUESTADOR  (app/runtime)       │
                │  Decide qué tool usar, en qué orden.           │
                │  Cuenta uso + aplica límites (app/core).       │
                └───────┬───────────────────────┬──────────────┘
                        ▼                       ▼
        ┌───────────────────────────┐  ┌────────────────────────┐
        │  4. TOOLS LAYER (app/tools)│  │  6. HUMAN-IN-THE-LOOP   │
        │  WhatsApp, email, CRM,     │  │  Escala a humano según  │
        │  Sheets/Airtable, HTTP     │  │  umbral/regla del agente│
        └───────────────────────────┘  └────────────────────────┘
                        ▼
        ┌───────────────────────────┐  ┌────────────────────────┐
        │  5. MEMORY (app/runtime/   │  │  OUTPUT                 │
        │  memory.py): contexto,     │  │  Respuesta por el canal │
        │  SQLite→PostgreSQL→Qdrant  │  │  + traza/observabilidad │
        └───────────────────────────┘  └────────────────────────┘
```

## Componentes (backend)

| Carpeta            | Responsabilidad |
|--------------------|-----------------|
| `app/llm/`         | `LLMProvider` (base) + providers (`mock`, `openai`, `anthropic`). Nadie más habla con el modelo. |
| `app/runtime/`     | `Agent` (clase base), bucle de orquestación, memoria, contabilidad de uso, política HITL. |
| `app/tools/`       | Conectores. Cada uno hereda de `Tool`, tiene modo `mock`, declara `cost_per_call`. |
| `app/agents/`      | Agentes concretos (`lead_classifier`, `cobranza`). Cada uno = `AgentSpec` + lógica. |
| `app/core/`        | `config`, `pricing` (planes), `limits` (cuotas + budget cap), `errors`. |
| `app/api/`         | Routers FastAPI: webhooks de canal, endpoints de dashboard, health. |

## Flujo de una corrida (run)

1. Llega evento al webhook (`app/api/webhooks.py`) → `InputParser` normaliza a `Message`.
2. Se resuelve el `tenant` (cliente PyME) y su `Plan`.
3. `limits.check()` valida cuota y budget cap. Si excede → bloquea + alerta.
4. El `Agent` corre: arma prompt → `LLMProvider.complete()` → decide tool(s).
5. `runtime` ejecuta tools (con costo contabilizado) y evalúa la política HITL.
6. Output al canal + traza persistida (input, decisiones, tools, costo, escaló?).

## Por qué orquestación Python propia (no n8n) en el núcleo
- **Testeable**: pruebas simuladas determinísticas con mocks (ver `tests/`).
- **Versionable**: el comportamiento vive en código + specs, no en un canvas.
- **Escalable**: el mismo `Agent` migra a CrewAI/LangGraph en Fase 2 sin reescribir
  conectores ni pricing.
- n8n sigue siendo útil para prototipos rápidos con un cliente puntual; se puede
  exportar a n8n más adelante (ver `docs/roadmap.md`, Fase 2).

## Multi-tenant
Cada cliente PyME es un `tenant` con su `Plan`, sus credenciales de conectores y su
contador de uso mensual. El aislamiento se hace por `tenant_id` en memoria, trazas y
límites. (En Fase 1, SQLite por entorno; en prod, PostgreSQL con `tenant_id`.)

## Madurez por fase (resumen, ver roadmap)
- **Fase 1 (este repo)**: runtime propio + conectores mock/reales, SQLite, 1 worker.
- **Fase 2**: PostgreSQL/Qdrant, colas (RQ/Celery), CrewAI/LangGraph para agentes
  complejos, observabilidad con LangSmith/LangFuse.
- **Fase 3**: contenedores, SLA, despliegue VPC, multi-agente complejo.
