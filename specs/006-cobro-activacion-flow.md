# SPEC-006: Cobro y activación por pago (Fase 1, Flow.cl)

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06-10
- **Caso de éxito base (Playbook)**: el primer cliente pagado de M1. Firma, paga el
  setup + primera mensualidad por un link de Flow, y su agente queda **activo**. Si un
  mes no paga, el agente de ESE cliente queda **suspendido** automáticamente (responde
  un mensaje de cortesía y deja de gastar en APIs), sin tocar a los demás tenants.

> **Decisión de alcance (anti-sobreingeniería).** Para 1–5 clientes NO se construye
> billing self-serve ni facturación metered. Flow.cl maneja la **recurrencia** (cobro
> mensual automático) y nos avisa por **webhook** cuando un pago entra o falla. Nosotros
> solo mapeamos ese evento a `estado del tenant`. El setup (pago único) y la boleta/
> factura tributaria se gestionan **fuera del software** (SII / link de Flow manual) en
> esta fase. Stripe/cobro metered es M2+, y solo si aparece cliente internacional.

## 1. Problema (en lenguaje del cliente)
*(Interno — el cliente no ve esto; es el problema del negocio Korriente.)*
"Necesito que cuando un cliente paga, su agente funcione, y cuando deja de pagar, el
agente deje de gastar mi plata en WhatsApp y LLM sin que yo tenga que acordarme de
apagarlo a mano. Y necesito no mezclar los pagos de un cliente con la operación de otro."

## 2. Métrica de negocio
- **Tiempo entre 'pago confirmado' y 'agente activo'**: meta **< 5 min, automático**
  (hoy: no existe, sería manual).
- **Gasto en APIs de un tenant moroso tras vencer el pago**: meta **US$0** (el agente
  suspendido no hace llamadas pagadas).
- **Errores de aislamiento** (un evento de pago de un tenant afecta a otro): meta **0**.

## 3. Alcance
- **Incluye**:
  - Modelo `Tenant` con `estado` (`trial | activo | moroso | suspendido | cancelado`),
    `plan_key`, `flow_customer_id`, fechas de inicio/próximo cobro.
  - Webhook `POST /webhooks/flow` que recibe confirmaciones de Flow, **valida la firma**
    y cambia el estado del tenant (pago ok → `activo`; pago fallido → `moroso`).
  - Job que pasa `moroso` → `suspendido` tras N días de gracia (config, default 5).
  - **Gate de activación** en el runtime: antes de cualquier llamada pagada, si el tenant
    no está `activo`/`trial`, el agente responde el mensaje de cortesía y NO gasta.
  - Script de alta de tenant para onboarding (`python -m app.billing.provision`).
- **NO incluye** (explícito):
  - **Checkout self-serve / página de planes que cobra sola** → SaaS, es M2+.
  - **Boleta/factura electrónica automática (SII)** → manual en Fase 1.
  - **Prorrateo, cupones, cambios de plan automáticos** → manual (editar el tenant).
  - **Stripe / cobro por uso (metered)** → M2+, solo si hay cliente internacional.
  - **Reintentos de cobro propios** → los maneja Flow, no nosotros.

## 4. Comportamiento esperado (casos)

| # | Input (evento) | Comportamiento esperado | ¿Escala a humano? |
|---|----------------|-------------------------|-------------------|
| 1 | Webhook Flow: pago OK, firma válida, tenant `trial` | tenant → `activo`; `proximo_cobro` +30d; traza de billing | No |
| 2 | Webhook Flow: pago OK de una mensualidad, tenant `moroso` | tenant → `activo` (se reactiva); agente vuelve a operar | No |
| 3 | Webhook Flow: pago **fallido** | tenant → `moroso`; alerta a Korriente; el agente **sigue activo** durante la gracia | No (alerta interna) |
| 4 | Job diario, tenant `moroso` hace > 5 días | tenant → `suspendido`; alerta al cliente y a Korriente | No (alerta) |
| 5 | Mensaje entrante de WhatsApp, tenant `suspendido` | agente responde cortesía ("servicio en pausa, contáctanos") y **NO** llama LLM/WhatsApp pagado; traza `bloqueado_por_estado` | No |
| 6 | Webhook con **firma inválida** o payload manipulado | se rechaza (401/400), **no** cambia estado, se registra intento | No (seguridad) |
| 7 | Webhook **duplicado** (mismo `payment_id` ya procesado) | idempotente: no cambia nada dos veces | No |
| 8 | Evento de pago del tenant A | **solo** afecta al tenant A; B, C… intactos | No |

## 5. Política Human-in-the-loop
El cobro no decide nada "sensible" de cara al cliente final, pero:
- Toda **suspensión** y todo **pago fallido** generan alerta a Korriente (humano) antes
  de cortar, para poder intervenir (ej: cliente avisó que pagaba con atraso).
- La **reactivación manual** (override) está disponible: un humano puede poner un tenant
  en `activo` aunque Flow no haya confirmado, dejando traza de quién y por qué.

## 6. Conectores (tools) necesarios
- **NUEVO** `app/billing/flow.py`: cliente del API de Flow (crear cliente/suscripción,
  verificar firma del webhook). Modo `mock` (firma y eventos deterministas para tests).
- Reusa `app/tools/whatsapp.py` y `email` para las alertas de morosidad/suspensión.
- No requiere tocar `app/llm/*`.

## 7. Datos y Ley 19.628
- **NUNCA** se guardan datos de tarjeta ni cuenta bancaria: Flow es el único que toca el
  medio de pago (PCI es de Flow, no nuestro). Guardamos solo `flow_customer_id` y un
  `payment_id` opaco por evento.
- El correo/teléfono del contacto de facturación se enmascara en logs con `mask()`.
- La firma del webhook se valida siempre (no se confía en el payload).
- Cláusula: Korriente = encargado del tratamiento; Flow = sub-encargado de pagos. Debe
  quedar en el contrato y en la política de privacidad.

## 8. Costo y plan
- Flow cobra ~**2,89% + IVA** por transacción (referencial, junio 2026). Para Starter
  ($290.000/mes) ≈ **$8.380 + IVA** de comisión por cobro → se descuenta del margen, no
  del `budget_cap` del cliente (el cap es solo costo de APIs del agente).
- El gate de activación **reduce** costo: un moroso/suspendido deja de gastar APIs.
- No mueve `included_conversations` ni `budget_cap_usd` de ningún plan.

## 9. Plan técnico
- **Archivos a crear/tocar**:
  - `app/core/storage.py`: agregar tabla/dataclass `Tenant` (estado, plan_key,
    flow_customer_id, inicio, proximo_cobro, dias_gracia) y métodos
    `get_tenant/put_tenant/all_tenants`. La `Usage` actual se asocia por `tenant_id`
    (hoy el tenant es implícito; esta spec lo hace explícito).
  - `app/billing/flow.py` (NUEVO): `FlowClient` (real + mock), `verify_signature()`.
  - `app/billing/service.py` (NUEVO): `apply_payment_event(event) -> Tenant` con la
    máquina de estados (casos §4), idempotente por `payment_id`.
  - `app/billing/provision.py` (NUEVO): alta de tenant en onboarding (CLI).
  - `app/api/webhooks.py`: endpoint `POST /webhooks/flow` (valida firma → service →
    200 inmediato; idempotente; nunca filtra estado de otro tenant).
  - `app/runtime/agent.py`: **gate de activación** al inicio de la corrida — si el
    estado del tenant no permite gasto, cortar con traza `bloqueado_por_estado` antes de
    cualquier llamada pagada (espeja el patrón del budget cap de `core/limits.py`).
  - `app/jobs/dunning.py` (NUEVO): job diario `moroso (>gracia) → suspendido` + alertas.
  - `examples/05_billing_demo.py` (NUEVO): simula pago OK → activo → falla → moroso →
    suspendido, todo con `FlowClient` mock.
- **Casos de prueba** (mock Flow + mock conectores):
  - `tests/billing/test_flow_signature.py`: firma válida pasa, inválida se rechaza (§4.6).
  - `tests/billing/test_service.py`: los 8 casos de §4, incluyendo idempotencia (§4.7) y
    aislamiento por tenant (§4.8).
  - `tests/runtime/test_activation_gate.py`: tenant `suspendido` no gasta APIs (§4.5).
  - `tests/jobs/test_dunning.py`: transición moroso→suspendido tras gracia (§4.4).
  - Regresión: los tests actuales siguen en verde.

## 10. Criterios de aceptación
- [ ] Tests en verde sin claves reales (firma, máquina de estados, idempotencia, aislamiento)
- [ ] Ejemplo ejecutable `examples/05_billing_demo.py` (con Flow mock)
- [ ] Un tenant `suspendido` registra **US$0** de gasto de APIs en la traza
- [ ] Webhook con firma inválida nunca cambia estado
- [ ] Un evento de pago jamás altera a otro tenant
- [ ] Reactivación manual con traza de auditoría (quién/por qué)

---

## Dependencias abiertas (del negocio, no de diseño)
1. **Cuenta Flow.cl de Korriente** (merchant) + credenciales API/secret del webhook.
2. **Definir días de gracia** por defecto (propuesta: 5) y el texto del mensaje de
   cortesía del agente suspendido (español de Chile, sin culpar al cliente).
3. **Decisión tributaria**: quién emite la boleta/factura y cuándo (manual en Fase 1).

## Specs hermanas
- El WhatsApp real que el gate protege va en **SPEC-005** (webhook 360dialog).
- El panel donde se ve el estado del tenant y las alertas va en **SPEC-008**.
