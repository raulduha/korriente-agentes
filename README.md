# Korriente Agentes

Fábrica interna para construir, probar y operar **agentes de IA para PyMEs chilenas**
con calidad consistente y costo bajo control.

> Meta del producto: **PyMEs satisfechas**. Un agente nuevo debe salir en días, costar
> menos de lo que el cliente puede pagar, y demostrar ROI medible en ≤30 días.

## Qué incluye este repo

- **Spec-driven development**: cada agente nace de una spec (`specs/`) → tests → código.
- **Runtime de agentes en Python** (provider-agnóstico): orquesta LLM + conectores,
  cuenta uso y aplica límites de costo por plan.
- **2 agentes flagship probados**:
  - `lead-classifier-whatsapp` — clasifica y responde leads de WhatsApp 24/7.
  - `cobranza-recordatorios` — recordatorios de pago y seguimiento (con HITL).
- **Catálogo de conectores** (WhatsApp, email, CRM, Sheets/Airtable, HTTP) con mocks.
- **Pricing y límites** pensados para PyMEs (`docs/pricing.md`) con topes de gasto.
- **Pruebas simuladas** (`pytest`) que corren sin claves reales.
- **Frontend Next.js** (dashboard de agentes, uso y límites).

## Stack

| Capa        | Tecnología                          | Por qué |
|-------------|-------------------------------------|---------|
| Frontend    | Next.js (App Router) + TypeScript   | Dashboard, lo que ya manejas |
| Backend     | FastAPI (Python 3.10+)              | Async, streaming LLM, webhooks, liviano |
| Runtime     | Orquestación Python propia          | Control, testeable, escala a CrewAI/LangGraph en Fase 2 |
| LLM         | Abstracción provider-agnóstica      | Cambiar de modelo sin tocar agentes |
| Datos (dev) | SQLite → (prod) PostgreSQL          | Simple en dev, robusto en prod |

## Arranque rápido

```bash
cd backend
pip install -e ".[dev]"
pytest -q                 # todo en verde, sin claves
python ../examples/01_lead_classifier_demo.py
```

Lee `CLAUDE.md` para el flujo de trabajo y `docs/` para el detalle.
