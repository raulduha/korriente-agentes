# SPEC-005: Conector WhatsApp real (360dialog) — webhook entrante + envío

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06
- **Caso de éxito base (Playbook)**: primer cliente real de M1. El agente
  `lead-classifier-whatsapp` debe **recibir** mensajes reales de WhatsApp y **responder**
  por WhatsApp, no solo correr con payloads simulados. Es el bloqueante #1 de M1 junto
  con SPEC-004 (RAG).

> Diseño acordado en sesión `grill-me`. Reemplaza el stub `NotImplementedError` de
> `app/tools/whatsapp.py` y el webhook de testing `/webhooks/message` (que confía en un
> `tenant_id` del body). BSP elegido: **360dialog** (oficial, sin riesgo de baneo; el
> baneo viene de librerías NO oficiales tipo Baileys/whatsapp-web.js, que quedan prohibidas).

## 1. Problema (en lenguaje del cliente)
"Quiero que el agente conteste en MI WhatsApp de negocio, de verdad, 24/7. Que cuando un
cliente me escribe, el agente lo reciba al toque y responda por el mismo WhatsApp. Y que
nadie pueda meterse a mandar mensajes falsos por el sistema ni que me cierren la cuenta
de WhatsApp por usar algo trucho."

## 2. Métrica de negocio
- **Mensajes reales recibidos y respondidos 24/7**: base 0% (hoy solo mocks) → meta
  **100% de mensajes entrantes válidos procesados** y respondidos o derivados, con
  tiempo de respuesta < 2 min (alimenta la métrica de SPEC-001).
- **0 mensajes forjados procesados** (todo POST sin firma válida se rechaza).
- **0 duplicados** (reintentos de WhatsApp no generan respuestas/cobros dobles).

## 3. Alcance
- **Incluye**:
  - Webhook entrante real `/webhooks/whatsapp`: verificación (GET challenge), firma
    (HMAC), parseo del payload de 360dialog/Cloud API, normalización a `Message`.
  - **Routing** `phone_number_id → {tenant_id, agent_key, plan}` (registro persistente).
  - **Idempotencia** por `message_id` (dedup).
  - **Procesamiento asíncrono** in-process (200 inmediato + `BackgroundTask`).
  - **Envío real** (`WhatsAppTool._send`): `send_message` y `send_template` vía API de
    360dialog, dentro de la ventana de servicio de 24h.
  - Manejo de callbacks de **estado** (delivered/read/failed) y mensajes **no-texto**.
- **NO incluye** (explícito):
  - **Cola durable** (RQ/Celery/Redis) → es M2. En Fase 1, si el proceso crashea a
    medias, ese mensaje se pierde (límite conocido y aceptado).
  - **Multimedia entrante procesada** (imágenes/audio/documentos) → en M1 se acusa
    recibo y se deriva; no se transcribe ni interpreta.
  - **Self-service de alta de números** → el registro se llena en onboarding.
  - **Reintentos de envío con backoff persistente** → un reintento simple en memoria; lo
    robusto es M2 con cola.

## 4. Comportamiento esperado (casos)

| # | Input | Comportamiento esperado | ¿Escala a humano? |
|---|-------|-------------------------|-------------------|
| 1 | `GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=OK&hub.challenge=123` | Devuelve `123` (texto plano, 200) si el token coincide | No |
| 2 | `GET` con `hub.verify_token` incorrecto | **403**, no devuelve challenge | No |
| 3 | `POST` con firma `X-Hub-Signature-256` válida + mensaje de texto | Verifica firma → resuelve tenant por `phone_number_id` → dedup → **200 inmediato** → procesa el agente en background → responde por WhatsApp | (según agente) |
| 4 | `POST` con firma inválida/ausente | **403**, no procesa, log de seguridad (sin PII) | No |
| 5 | `POST` con `phone_number_id` no registrado | **200** (acusa recibo, evita reintentos) pero **no procesa**; log de advertencia | No |
| 6 | `POST` repetido con el mismo `message_id` (reintento de WhatsApp) | **200**, **se ignora** (ya procesado); no corre el agente de nuevo | No |
| 7 | `POST` con mensaje **no-texto** (imagen/audio/botón) | **200**; responde holding "por ahora solo texto, un ejecutivo te ayuda" y **escala** | **Sí** |
| 8 | `POST` que es **callback de estado** (sent/delivered/read/failed) | **200**; se registra en la traza/uso, **no** corre el agente | No |
| 9 | `POST` con payload malformado (sin `messages` ni `statuses`) | **200** (ack), se ignora con log; no rompe | No |
| 10 | Envío saliente dentro de la ventana de 24h | `send_message` vía API 360dialog → `message_id` real en la traza | No |
| 11 | Envío fuera de ventana de 24h (sesión expirada) | requiere `send_template` con plantilla aprobada; si no hay, **escala** a humano (no se fuerza) | **Sí** |

## 5. Política Human-in-the-loop
El webhook es infraestructura: no cambia las reglas de escalamiento de los agentes
(SPEC-001/004). Agrega dos situaciones operativas que derivan a humano:
- **Mensaje no-texto** (caso 7): el agente de M1 no interpreta multimedia → holding + escala.
- **Fuera de ventana 24h sin plantilla** (caso 11): no se puede iniciar conversación
  automática → escala para que un humano use una plantilla aprobada.

## 6. Conectores (tools) necesarios
- **`app/tools/whatsapp.py`** (existe; implementar el path real):
  - `send_message(to, body)` → `POST` a la API de 360dialog (mensaje de sesión).
  - `send_template(to, template, params)` → mensaje de plantilla (fuera de ventana).
  - Mantiene modo `mock` intacto (tests/demos siguen sin red).
- **NUEVO** registro de tenants (no es un `Tool`, es infraestructura): ver §9.

## 7. Datos y Ley 19.628
- **PII tocada**: número de teléfono del cliente (`from` / `wa_id`), nombre de perfil,
  texto del mensaje. Es el mínimo para responder y dar seguimiento.
- **Enmascarado**: todo número/`message_id` en logs pasa por `mask()` (`+569****1234`).
  La firma/secretos **nunca** se loguean.
- **Minimización**: no se guardan datos bancarios; el texto se trunca igual que en
  SPEC-001. El `app_secret`, `verify_token` y la API key de 360dialog viven en variables
  de entorno/secret manager, nunca en el repo.
- **Transferencia**: 360dialog es BSP oficial; el tratamiento se cubre con su DPA. Se
  documenta en la cláusula de tratamiento de datos del cliente (Ley 19.628; anticipa
  21.719).

## 8. Costo y plan
- El webhook en sí **no tiene costo LLM**. El costo de procesar el mensaje es el del
  agente (SPEC-001/004) + 1 conversación de WhatsApp (~US$0,05) por el envío.
- El dedup, el routing y el GET challenge son operaciones locales (sin costo).
- No cambia el `budget_cap` ni los planes; respeta los límites existentes (cada corrida
  del agente pasa por `runtime`/`LimitsService` como hoy).

## 9. Plan técnico

**Decisiones (sesión grill-me):** (1) routing por registro `phone_number_id → tenant` ·
(2) auth HMAC `X-Hub-Signature-256` + GET challenge · (3) 200 inmediato + `BackgroundTask`
(sin cola) · (4) dedup por `message_id` · (5) respuestas del agente dentro de la ventana
24h (sin plantilla); seguimiento proactivo humano usa plantilla aprobada.

- **Archivos a crear/tocar**:
  - `app/api/webhooks.py`:
    - `GET /webhooks/whatsapp` → verificación de challenge (compara `hub.verify_token`
      con `settings.wa_verify_token`; devuelve `hub.challenge`).
    - `POST /webhooks/whatsapp` → (1) verificar HMAC del raw body con `app_secret`
      (rechaza 403 si no calza); (2) parsear payload; (3) si es `statuses` → registrar y
      200; (4) si es `messages` → resolver tenant, dedup, **200 inmediato**, encolar el
      procesamiento en `BackgroundTask`.
    - El `POST /webhooks/message` actual queda como **interno/testing** (documentado), no
      expuesto al canal real.
  - `app/api/whatsapp_parser.py` (NUEVO): traduce el payload anidado de 360dialog/Cloud
    API (`entry[].changes[].value.{messages,statuses,metadata}`) a `Message` (o a un
    evento de estado). Extrae `phone_number_id`, `from`, `text.body`, `message_id`, `type`.
  - `app/core/tenant_registry.py` (NUEVO): `TenantRegistry` con backend SQLite (extiende
    el patrón de `app/core/storage.py`, SPEC-003). `resolve(phone_number_id) ->
    {tenant_id, agent_key, plan}` o `None`. Se llena con un comando de onboarding.
  - `app/core/dedup.py` (NUEVO): `SeenMessages` (set persistente en SQLite con TTL ~48h,
    limpieza perezosa). `seen(message_id) -> bool` + `mark(message_id)`.
  - `app/core/security.py` (NUEVO): `verify_signature(raw_body, header, app_secret)`
    (HMAC-SHA256, comparación en tiempo constante con `hmac.compare_digest`).
  - `app/tools/whatsapp.py`: implementar `_send` real con `httpx` contra la API de
    360dialog (header de API key); `send_template` con `template` + `params`. Errores de
    red → `ToolResult(ok=False, ...)` (no rompe el agente).
  - `app/core/config.py`: agregar `wa_verify_token`, `wa_app_secret`,
    `dialog360_api_key`, `dialog360_base_url` (desde entorno).
  - `examples/05_whatsapp_webhook_demo.py` (NUEVO): simula un POST de 360dialog (firma
    incluida) contra el webhook con `MockLLMProvider` y `whatsapp` en mock; muestra el
    routing → agente → "envío" mock, sin red ni claves reales.
- **Casos de prueba** (mock LLM + `whatsapp` mock + TestClient):
  - `tests/api/test_webhook_whatsapp.py`: los 11 casos de §4 (challenge ok/mal, firma
    ok/mal, routing, dedup, no-texto, status callback, malformado, ventana).
  - `tests/core/test_security.py`: HMAC válido/ inválido; `compare_digest` (no
    short-circuit); firma con body alterado falla.
  - `tests/core/test_tenant_registry.py`: resuelve tenant correcto; número no registrado
    → `None`; persiste en SQLite; **aislamiento** (un número solo mapea a su tenant).
  - `tests/core/test_dedup.py`: primer `message_id` no visto → procesa; repetido →
    ignora; TTL/limpieza.
  - `tests/api/test_whatsapp_parser.py`: payload real de ejemplo (texto, imagen,
    interactive, status) → normalización correcta; campos esperados.
  - `tests/tools/test_whatsapp_send.py`: en mock, `send_message`/`send_template` arman el
    request esperado y devuelven `message_id` mock; error de red → `ok=False`.
  - Regresión: los 64 tests actuales (46 backend + 18 frontend) siguen en verde; el
    webhook interno `/webhooks/message` no se rompe.

## 10. Criterios de aceptación
- [ ] Tests en verde sin claves reales (los 11 casos de §4 + seguridad + dedup + routing)
- [ ] Ejemplo ejecutable en `examples/05_whatsapp_webhook_demo.py` (firma + mock, sin red)
- [ ] Respeta budget cap y límites del plan (el agente sigue pasando por `LimitsService`)
- [ ] Métrica de negocio medible en la traza (tenant resuelto, dedup hit/miss, si escaló,
      `message_id` real en el envío)
- [ ] **0 POST sin firma válida procesados** (caso 4) y **0 duplicados** (caso 6)
- [ ] El path mock de `whatsapp` sigue funcionando idéntico (tests previos no cambian)

---

## Dependencias abiertas (del cliente / trámite — bloquean implementar, no aprobar)
1. **Cuenta y número 360dialog** activos + `phone_number_id` → para llenar el registro.
2. **`app_secret`, `verify_token`, API key de 360dialog** → en el secret manager del deploy.
3. **Plantillas aprobadas por Meta** (para `send_template` fuera de ventana) → trámite con
   Meta, en paralelo. Sin esto, el caso 11 siempre escala (comportamiento seguro).
4. **URL pública con HTTPS** para el webhook → depende del deploy (Railway/Render, ítem
   pendiente de M1).

## Specs hermanas
- **SPEC-004 (RAG)**: el agente que este webhook alimenta. El `Message` normalizado acá
  entra al `lead-classifier` con RAG.
- El **job de reset mensual**, las **alertas 80/100%** y el **deploy** siguen pendientes
  de M1 (no grillados aún).
