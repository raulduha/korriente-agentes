# SPEC-008: Panel de cliente — trazas, uso y alertas 80/100%

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06-10
- **Caso de éxito base (Playbook)**: el cliente entra al panel y **ve que su agente está
  trabajando y cuánto le ahorra** (conversaciones atendidas, tiempo de respuesta, si
  algo escaló) y nunca se lleva un susto de gasto porque se le avisa al 80% y el tope
  duro al 100% lo protege.

> **Por qué importa.** Hoy el panel (`/dashboard`) solo muestra barras de uso y se cae
> sin backend. No muestra **trazas** (la prueba de que el agente hizo algo) ni emite
> **alertas**. Sin esto no hay cómo demostrar ROI ni cumplir la promesa de "sin factura
> sorpresa" — los dos pilares de venta del proyecto.

## 1. Problema (en lenguaje del cliente)
"¿Cómo sé que esto está funcionando y no es humo? Quiero ver qué hizo el agente, cuántos
clientes atendió, qué pasó con los casos raros, y quiero que me avisen ANTES de que se
me dispare la cuenta, no después."

## 2. Métrica de negocio
- **Visibilidad de ROI**: el cliente puede ver, sin pedirlo, las trazas de su agente
  (input → intención → acción → costo → si escaló). Base: no existe → meta: **100% de
  las corridas con traza visible**.
- **Alertas a tiempo**: aviso al **80%** de conversaciones o `budget_cap`, y corte al
  **100%**. Meta: **0 clientes que superen el cap sin haber sido avisados** antes.
- **Confianza**: el cliente entiende su consumo sin ayuda (lenguaje claro, español de Chile).

## 3. Alcance
- **Incluye**:
  - Vista de **trazas por agente/tenant**: lista filtrable (intención, si escaló, costo),
    con PII enmascarada, leíble por un no-técnico.
  - Vista de **uso** real (ya existe parcialmente): conversaciones, acciones LLM, gasto
    USD vs límites del plan, con estado de color (ok/aviso/tope).
  - **Estado del tenant** visible (trial/activo/moroso/suspendido) — viene de SPEC-006.
  - **Motor de alertas**: al cruzar 80% y 100% (de conversaciones o de `budget_cap`),
    notifica por email/WhatsApp al cliente y a Korriente. Idempotente (no spammea el
    mismo umbral dos veces en el mes).
  - Panel protegido por un acceso simple por tenant (token/clave de lectura) — no es
    auth completa, es lo mínimo para que un cliente vea **solo lo suyo**.
- **NO incluye** (explícito):
  - **Auth/identidad completa (OAuth, multiusuario, roles)** → M2/SaaS.
  - **Edición de configuración del agente desde el panel** → onboarding humano (SPEC-007).
  - **Gráficos históricos/BI avanzado** → basta tabla + barras + totales del mes.
  - **Exportar a Excel/PDF** → nice-to-have, no para la primera entrega.

## 4. Comportamiento esperado (casos)

| # | Input (situación) | Comportamiento esperado | ¿Escala a humano? |
|---|-------------------|-------------------------|-------------------|
| 1 | Cliente abre el panel con su token | ve **solo** sus trazas y su uso; nunca los de otro tenant | No |
| 2 | El agente atiende un lead | aparece una traza nueva (intención, acción, costo, escaló=no) con PII enmascarada | No |
| 3 | Uso cruza el **80%** de conversaciones | una alerta al cliente + Korriente; el panel marca estado "aviso" | No (alerta) |
| 4 | Uso llega al **100%** de `budget_cap` | alerta de tope; el runtime ya **no gasta** (regla existente); panel en "tope" | Sí (deriva a humano) |
| 5 | Mismo umbral ya alertado este mes | **no** se reenvía la alerta (idempotente) | No |
| 6 | Reset mensual de cuotas | el uso vuelve a 0, los umbrales de alerta se rearman, las trazas se conservan | No |
| 7 | Token inválido/ausente | el panel no muestra datos de ningún tenant | No (seguridad) |
| 8 | Tenant `suspendido` (SPEC-006) | el panel lo indica claramente y explica cómo reactivar | No |

## 5. Política Human-in-the-loop
- La alerta de **100%** y cualquier escalamiento del agente se reflejan en el panel como
  "requiere atención", para que el humano de la PyME tome el caso.
- Korriente recibe copia de toda alerta de 80/100% para intervenir proactivamente.

## 6. Conectores (tools) necesarios
- Reusa `app/tools/whatsapp.py` y `email` para enviar alertas.
- Lee de `app/core/storage.py` (`Usage`, `traces`, y `Tenant` de SPEC-006).
- Frontend: extiende `frontend/app/dashboard/page.tsx` (hoy client-side con `lib/api.ts`).

## 7. Datos y Ley 19.628
- Las trazas mostradas **ya vienen con PII enmascarada** (`mask()` en `tools/base.py`);
  el panel nunca debe revelar RUT/teléfono/datos bancarios completos.
- El token de acceso por tenant es de **solo lectura** y acotado a ese tenant.
- Minimización: el panel muestra lo necesario para entender el servicio, no más.

## 8. Costo y plan
- Las alertas usan canales ya contabilizados (WhatsApp/email); su costo es marginal y
  **no** consume cuota del cliente (son mensajes operativos de Korriente).
- No cambia ningún plan. Refuerza el cumplimiento del `budget_cap` existente.

## 9. Plan técnico
- **Archivos a crear/tocar**:
  - `app/api/dashboard.py`: endpoints de **trazas por tenant** (paginadas, filtrables) y
    de **estado del tenant**; exigir token de lectura por tenant.
  - `app/core/limits.py`: emitir evento al cruzar 80%/100% (hoy ya bloquea en el cap;
    falta el **disparo de alerta** idempotente por umbral/mes).
  - `app/alerts/service.py` (NUEVO): `notify_threshold(tenant, umbral)` idempotente
    (registra qué umbral ya se avisó este mes), envía por email/WhatsApp.
  - `app/jobs/monthly_reset.py` (NUEVO o existente de M1): resetea uso y **rearma** los
    umbrales de alerta; conserva trazas.
  - `frontend/app/dashboard/page.tsx`: pestaña/tabla de **trazas** (legible, PII
    enmascarada) + estado del tenant + acceso por token; reusar estilos existentes.
  - `frontend/lib/api.ts`: métodos para trazas y estado.
  - `examples/06_alertas_demo.py` (NUEVO): simula consumo cruzando 80% y 100% con mocks.
- **Casos de prueba** (mocks):
  - `tests/api/test_dashboard_traces.py`: aislamiento por tenant (§4.1, §4.7).
  - `tests/alerts/test_thresholds.py`: dispara a 80/100, idempotente (§4.3–§4.5).
  - `tests/jobs/test_monthly_reset.py`: resetea uso, rearma umbrales, conserva trazas (§4.6).
  - Frontend: render de trazas con PII enmascarada; token ausente no muestra datos.
  - Regresión: tests actuales en verde.

## 10. Criterios de aceptación
- [ ] El cliente ve **solo** sus trazas y uso (aislamiento por token/tenant)
- [ ] Trazas legibles por un no-técnico, con PII enmascarada
- [ ] Alerta al 80% y al 100% (conversaciones y `budget_cap`), idempotente por mes
- [ ] Al 100% el runtime no gasta (regla existente) y el panel lo refleja
- [ ] Reset mensual conserva trazas y rearma alertas
- [ ] Ejemplo ejecutable `examples/06_alertas_demo.py` con mocks

---

## Dependencias abiertas
1. **Canal de alerta preferido** del cliente (email, WhatsApp, ambos).
2. **Textos de alerta** 80/100% en español de Chile (claros, sin alarmismo).
3. Depende de SPEC-006 para el campo `estado` del tenant y de SPEC-007 para estar desplegado.

## Specs hermanas
- SPEC-006 (estado del tenant), SPEC-007 (deploy), SPEC-005 (WhatsApp real, fuente de trazas).
