# Plan de ejecución MVP — del repo al primer cliente pagando

> **Qué es este documento.** El plan maestro ejecutable. `docs/plan-negocio.md` dice el
> *qué* y el *por qué*; las specs 005–008 dicen el *cómo* de cada pieza; este documento
> las encadena en orden, con prompts listos para dárselos a un agente (Claude/Sonnet),
> gates de verificación entre fases, y la lista de tareas que **solo un humano** puede
> hacer. Si se sigue de arriba a abajo, el resultado es el MVP operando con un cliente
> real.

**Definición de MVP (no negociable):** UN cliente real, pagando por Flow, con su agente
respondiendo su WhatsApp real en producción, visible en su panel con alertas de gasto.
Nada más es MVP. RAG, más agentes, más páginas: fuera.

**Orden de fases:** `0 (humano) → 1 (SPEC-005) → 2 (SPEC-007) → 3 (SPEC-006) → 4 (SPEC-008) → 5 (go-live)`
Las fases 1–4 las ejecuta el agente; la 0 y la 5 son mayormente humanas.

---

## Reglas para el agente ejecutor (leer antes de cada fase)

1. **Spec-driven estricto** (`CLAUDE.md`): la spec de la fase es el contrato. Si algo no
   está en la spec, no se construye. Si la spec tiene una ambigüedad real, se pregunta
   al humano; no se inventa alcance.
2. **Gate de aprobación**: antes de implementar, el campo `Estado` de la spec debe decir
   `aprobada`. Cambiarlo es decisión del humano (Raúl), no del agente.
3. **Tests primero, y deben fallar primero.** Se escriben los tests de §9 de la spec
   (mock LLM + conectores mock), se corre `pytest` para verlos fallar, y recién entonces
   se implementa hasta verde. Nunca llamadas reales en tests.
4. **Regresión obligatoria**: al cerrar cada fase, la suite COMPLETA en verde
   (`cd backend && pytest -q`), no solo los tests nuevos.
5. **Cero secretos en el repo.** Claves solo en variables de entorno; `.env.example`
   documenta nombres, no valores.
6. **Al cerrar cada fase**: marcar los criterios de aceptación (§10) en la spec, cambiar
   su `Estado` a `implementada`, marcar el checkbox en `tasks/tasks.md`, y commit con
   mensaje `feat(spec-NNN): ...`.
7. **Strings de cara al usuario en español de Chile.** LLM solo vía `app/llm/base.py`.

---

## Fase 0 — Trámites y cuentas (SOLO HUMANO, partir HOY)

Estas tareas tienen días de espera externa. Ningún agente puede hacerlas. Pártelas
antes de escribir una línea de código, en paralelo a todo lo demás.

- [ ] **Formulario "Agendar diagnóstico" real** (quick win, ~30 min): crear un form en
      Tally/Formspree que llegue al correo/WhatsApp de Korriente y conectar el botón del
      sitio. *(La conexión del botón sí la puede hacer el agente: ver prompt en Fase 0-b.)*
- [ ] **Cuenta 360dialog** + verificación de Meta Business (tarda días) → obtener
      `api_key`, `phone_number_id`, definir `verify_token` y `app_secret`.
- [ ] **Cuenta Flow.cl** como comercio (alta tarda días) → credenciales API + secret del
      webhook. Decidir días de gracia (propuesta: 5).
- [ ] **Cuenta Railway** (o Render) con método de pago.
- [ ] **Dominio** (ej: `korriente.cl`) + DNS en Cloudflare → URL fija HTTPS para webhooks.
- [ ] **API key del LLM** (Anthropic) con **tope de gasto configurado en el panel del
      proveedor** (doble cinturón sobre el `budget_cap`).
- [ ] **Gestor de contraseñas** (Bitwarden/1Password) para credenciales propias y de
      clientes. Nada en texto plano.
- [ ] **Vender**: contactar 5 PyMEs del vertical elegido por semana. Sin pipeline no hay
      MVP que entregar.

### Fase 0-b — Prompt para el agente (conectar el formulario)

```text
Lee CLAUDE.md y docs/plan-ejecucion-mvp.md (Fase 0-b). Crea una spec corta
specs/011-form-diagnostico.md (usa el template) y conecta todos los botones
"Agendar diagnóstico" del frontend a este formulario externo: <URL_DEL_FORM>.
Los botones hoy apuntan a /#precios. Mantén el estilo existente. Verifica con
npm run build. No toques nada más.
```

---

## Fase 1 — SPEC-005: WhatsApp real (360dialog)

- **Spec**: `specs/005-webhook-360dialog.md` (la más detallada; 11 casos de prueba).
- **Por qué primero**: sin canal real no hay producto entregable. Todo lo demás se puede
  probar con mocks mientras tanto; esto no.
- **Depende de**: nada para implementarse (todo corre con mocks). Las credenciales
  reales (Fase 0) solo se necesitan al conectar en producción (Fase 2).

### Prompt para el agente

```text
Lee CLAUDE.md, docs/plan-ejecucion-mvp.md (reglas) y specs/005-webhook-360dialog.md
completa. Verifica que su Estado sea "aprobada"; si no, detente y avisa.
Implementa la spec siguiendo §9 al pie de la letra, en este orden:
1) Escribe TODOS los tests listados en §9 (test_webhook_whatsapp, test_security,
   test_tenant_registry, test_dedup, test_whatsapp_parser, test_whatsapp_send).
   Córrelos: deben fallar.
2) Implementa los archivos de §9 hasta que pasen, sin romper los 64 tests existentes.
3) Crea examples/05_whatsapp_webhook_demo.py (sin red, sin claves).
4) Corre pytest -q completo y reporta el resultado.
Al terminar: marca los criterios de §10 en la spec, Estado → implementada,
actualiza tasks/tasks.md y haz commit feat(spec-005).
```

### Gate de salida (verificar antes de pasar a Fase 2)
- `pytest -q` completo en verde, sin claves reales.
- Los 11 casos de §4 cubiertos por tests (firma inválida → 403; duplicado → ignorado).
- El modo mock de `whatsapp` intacto (demos y tests previos no cambian).

---

## Fase 2 — SPEC-007: Deploy + onboarding repetible

- **Spec**: `specs/007-deploy-onboarding-primer-cliente.md`.
- **Por qué segundo**: el webhook de la Fase 1 necesita una URL pública HTTPS para que
  360dialog y Flow apunten a algo. Además produce el runbook y el checklist de
  onboarding (los documentos operativos del negocio).
- **Depende de**: Fase 0 (cuenta Railway, dominio) para el deploy real; el código y los
  docs se pueden dejar listos antes.

### Prompt para el agente

```text
Lee CLAUDE.md, docs/plan-ejecucion-mvp.md y specs/007-deploy-onboarding-primer-cliente.md.
Verifica Estado "aprobada". Implementa §9:
1) tests/core/test_config.py (fail-fast si falta env var crítica) — primero, en rojo.
2) app/core/config.py (validación estricta), GET /health en app/main.py,
   archivos de deploy (railway.json o render.yaml + Procfile/Dockerfile mínimo),
   scripts/smoke_test.py.
3) docs/runbook.md y docs/onboarding-checklist.md COMPLETOS según §9 (el checklist
   espeja el flujo de PricingTabs del sitio: intake → tenant → prompts → sandbox →
   go-live → 48h → reunión 30 días).
4) pytest -q completo en verde. .env.example actualizado (nombres, sin valores).
Cierra igual que la fase anterior (criterios §10, Estado, tasks.md, commit).
NO ejecutes el deploy real: deja el comando exacto documentado en el runbook
para que lo corra el humano con sus credenciales.
```

### Gate de salida
- Deploy ejecutado **por el humano** siguiendo el runbook: `GET /health` = 200 en HTTPS.
- Smoke test post-deploy deja traza.
- Webhook de la Fase 1 conectado en el panel de 360dialog (URL real) y challenge OK.
- Cero secretos en el repo (revisar el diff completo antes del push).

---

## Fase 3 — SPEC-006: Cobro Flow + activación/suspensión

- **Spec**: `specs/006-cobro-activacion-flow.md`.
- **Por qué tercero**: con producto entregable y desplegado, esto lo convierte en
  negocio: pago → activo, impago → pausa, automático y por tenant.
- **Depende de**: Fase 2 (URL pública para el webhook de Flow) y cuenta Flow (Fase 0).

### Prompt para el agente

```text
Lee CLAUDE.md, docs/plan-ejecucion-mvp.md y specs/006-cobro-activacion-flow.md.
Verifica Estado "aprobada". Implementa §9 con tests primero:
1) tests/billing/* , tests/runtime/test_activation_gate.py, tests/jobs/test_dunning.py
   (los 8 casos de §4, idempotencia y aislamiento por tenant incluidos) — en rojo.
2) Tenant en storage.py, app/billing/{flow,service,provision}.py,
   POST /webhooks/flow, gate de activación en runtime/agent.py (espejando el patrón
   del budget cap), app/jobs/dunning.py.
3) examples/05_billing_demo.py con FlowClient mock (pago→activo→falla→moroso→suspendido).
4) pytest -q completo en verde. Cierre estándar (criterios, Estado, tasks.md, commit).
Recuerda: NUNCA se guardan datos de tarjeta; solo flow_customer_id y payment_id opacos.
```

### Gate de salida
- Tenant `suspendido` registra US$0 de gasto de APIs en la traza (test lo prueba).
- Webhook con firma inválida jamás cambia estado.
- **Humano**: webhook configurado en el panel de Flow apuntando al deploy; un pago de
  prueba real recorre el ciclo completo.

---

## Fase 4 — SPEC-008: Panel con trazas + alertas 80/100%

- **Spec**: `specs/008-panel-trazas-alertas.md`.
- **Por qué cuarto**: es la prueba de ROI de cara al cliente y la promesa "sin factura
  sorpresa". Se construye al final porque consume lo que producen las fases 1 y 3
  (trazas reales y estado del tenant).
- **Depende de**: Fases 1–3 implementadas.

### Prompt para el agente

```text
Lee CLAUDE.md, docs/plan-ejecucion-mvp.md y specs/008-panel-trazas-alertas.md.
Verifica Estado "aprobada". Implementa §9 con tests primero:
1) tests/api/test_dashboard_traces.py (aislamiento por token/tenant),
   tests/alerts/test_thresholds.py (80/100, idempotente por mes),
   tests/jobs/test_monthly_reset.py — en rojo.
2) Endpoints de trazas con token de lectura por tenant, app/alerts/service.py,
   app/jobs/monthly_reset.py, y el frontend: tabla de trazas legible por un
   no-técnico (PII enmascarada) + estado del tenant en dashboard/page.tsx.
3) examples/06_alertas_demo.py (cruza 80% y 100% con mocks).
4) pytest -q + npm run build en verde. Cierre estándar.
Los textos de alerta en español de Chile, claros y sin alarmismo.
```

### Gate de salida
- Un token solo muestra SU tenant (test de aislamiento en verde).
- Alerta 80% y 100% disparan una sola vez por umbral/mes.
- El panel desplegado se ve bien con datos reales del smoke test.

---

## Fase 5 — Go-live del primer cliente (HUMANO, con el checklist de Fase 2)

Ya no es código: es seguir `docs/onboarding-checklist.md` (producido en Fase 2) con un
cliente firmado. Resumen del ciclo completo (detalle en el checklist):

1. Diagnóstico 30 min → propuesta escrita → contrato → **cobro del setup por Flow antes
   de partir**.
2. `python -m app.billing.provision` → tenant con plan y budget_cap.
3. Conectar su WhatsApp Business en 360dialog → llenar el registro
   `phone_number_id → tenant`.
4. Cargar su información real (catálogo, precios, políticas, tono) en el prompt del
   agente plantilla. **RAG (SPEC-004) solo si sus documentos no caben en el prompt.**
5. Sandbox: el cliente revisa y aprueba por escrito.
6. Go-live + monitoreo 48 h en la consola.
7. Reunión a 30 días con métricas del panel → renovación + pedir caso de éxito.
8. Documentar qué se repitió → el cliente 2 debe tardar la mitad.

---

## Qué queda explícitamente FUERA del MVP

SPEC-004 (RAG) salvo necesidad del primer cliente · SPEC-009 (solicitudes de cambio:
en Fase 1 los cambios llegan por WhatsApp/correo y se registran a mano) · Postgres,
colas, Qdrant, LangFuse, CrewAI/LangGraph (M2) · SaaS self-serve (regla del roadmap:
no antes de 5–10 clientes del mismo molde) · más workflows n8n y más páginas del sitio.

## Tablero de avance

| Fase | Spec | Estado | Gate verificado |
|------|------|--------|-----------------|
| 0 | trámites + form | ☐ | — |
| 1 | SPEC-005 WhatsApp | ✅ implementada | ✅ 117 tests verde |
| 2 | SPEC-007 Deploy | ✅ implementada | ☐ deploy real (tú) |
| 3 | SPEC-006 Flow | ✅ implementada | ✅ 117 tests verde |
| 4 | SPEC-008 Panel | ✅ implementada | ✅ 117 tests verde |
| 5 | Go-live cliente 1 | ☐ | ☐ |

> **Métrica de salud semanal** (de `docs/plan-negocio.md` §6): *¿avancé hacia el primer
> cliente esta semana?* Si la única respuesta es "escribí más código", alerta roja.
