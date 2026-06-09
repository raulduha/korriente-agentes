# CLAUDE.md — Guía para Claude Code

Este repo es **Korriente Agentes**: una "fábrica" interna para construir, probar y
operar agentes de IA para PyMEs chilenas con calidad y costo controlado.

NO es un curso ni un SaaS self-serve (todavía). Es el **acelerador de entrega**:
plantillas, runtime probado, conectores y límites de costo, para que un agente nuevo
salga en días en vez de semanas.

## Flujo spec-driven (obligatorio)

Trabajamos por specs. El orden NUNCA se salta:

1. **Spec primero.** Todo agente o feature empieza con un archivo en `specs/`
   usando `specs/SPEC-TEMPLATE.md`. Si no hay spec aprobada, no se escribe código.
2. **Plan.** En la sección "Plan técnico" de la spec se listan archivos a tocar,
   conectores necesarios y casos de prueba.
3. **Tests antes que implementación.** Se escriben pruebas simuladas (mock LLM +
   mock conectores) que describen el comportamiento esperado. Deben fallar primero.
4. **Implementación.** Se escribe el código hasta que las pruebas pasan.
5. **Verificación.** `pytest` en verde + ejemplo ejecutable en `examples/`.

Cuando el usuario te pida "haz el agente X", tu primer paso es crear/actualizar la
spec en `specs/`, no escribir código.

## Principios (resumen — ver `docs/constitution.md`)

- **Vendemos resultados, no tecnología.** Cada agente declara su métrica de negocio.
- **Costo bajo control.** Ningún agente puede gastar más allá del `budget_cap` de su
  plan. El LLM es una pieza intercambiable; por defecto usamos modelos baratos
  (clasificación con modelos "mini/haiku"), no el más caro "por si acaso".
- **Human-in-the-loop por diseño.** Todo agente define cuándo escala a un humano.
- **Datos chilenos con cuidado.** Ley 19.628: minimización, sin tarjetas/datos
  bancarios en claro, cláusula de tratamiento de datos.
- **Provider-agnóstico.** El LLM se accede vía `app/llm/base.py`. Nunca importes el
  SDK de un proveedor fuera de `app/llm/providers/`.

## Orquestador de skills

Antes de cualquier tarea no trivial, consulta `docs/skills-orchestrator.md`: indica qué
skill/plugin usar según el tipo de pedido (seguridad, optimización, limpieza, UX/UI,
gestión, integraciones) y en qué orden encadenarlas. Regla clave: spec → tests →
implementar → revisar → **seguridad (bloqueante)** → optimizar/limpiar → UX → deploy.

## Estructura

```
docs/        Documentos guía (constitution, arquitectura, pricing, conectores, roadmap,
             skills-orchestrator)
specs/       Una spec por agente/feature (SPEC-TEMPLATE.md + las aprobadas)
tasks/       Backlog priorizado por milestones
backend/     FastAPI: llm, runtime, tools (conectores), agents, core (pricing/limits), api
frontend/    Next.js (dashboard de agentes, uso y límites)
examples/    Ejemplos pre-hechos y probados (corren con mocks, sin claves reales)
```

## Comandos

```bash
# Backend
cd backend
pip install -e ".[dev]"      # instala deps + dev (pytest)
pytest -q                    # corre toda la suite (usa mocks, no necesita claves)
uvicorn app.main:app --reload

# Ejemplos (corren con el MockLLMProvider — sin gastar dinero)
python examples/01_lead_classifier_demo.py
python examples/02_cobranza_demo.py

# Frontend
cd frontend && npm install && npm run dev
```

## Reglas para escribir código aquí

- Todo conector nuevo hereda de `app/tools/base.py:Tool` y tiene un modo `mock`.
- Todo agente nuevo hereda de `app/runtime/agent.py:Agent` y declara su `AgentSpec`.
- Toda llamada al LLM pasa por `runtime` para que cuente uso y respete límites.
- Las pruebas usan `MockLLMProvider` y conectores en modo mock. Nunca llamadas reales.
- Strings de cara al usuario en **español de Chile**.
