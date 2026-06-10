# Checklist de onboarding — Korriente Agentes

> Un checklist por cliente. Cópialo, rellena los datos y archívalo en el gestor de
> contraseñas junto con las credenciales del cliente.
>
> **Meta:** cliente 1 ≤ 30 días desde firma. Cliente 2 ≤ 15 días (repite lo que ya está).

---

## Datos del cliente

- **Nombre empresa**: _______________
- **Tenant ID**: `pyme-_______________` (usar slug sin espacios)
- **Plan**: starter / growth / pro
- **Proceso a automatizar**: leads / cobranza / agenda / triage
- **Canal**: WhatsApp / email / ambos
- **Contacto técnico cliente**: _______________
- **Fecha de firma contrato**: _______________
- **Fecha límite de go-live**: _______________

---

## Etapa 1 — Intake (día 0)

- [ ] Diagnóstico de 30 min realizado; ROI estimado documentado.
- [ ] Propuesta enviada por escrito con alcance exacto, plan y precio.
- [ ] Contrato firmado con cláusula de tratamiento de datos (Ley 19.628).
- [ ] **Setup cobrado por Flow ANTES de empezar** — no parte trabajo sin pago.
- [ ] Credenciales del cliente guardadas en el gestor de contraseñas.

## Etapa 2 — Configuración del sistema (días 1–3)

- [ ] Tenant provisionado: `python -m app.billing.provision --tenant-id ... --plan ...`
- [ ] Tenant asignado al plan en `LimitsService.set_plan()`.
- [ ] Token de lectura del panel generado y enviado al cliente (email cifrado o 1Password).
- [ ] Número de WhatsApp Business del cliente vinculado en 360dialog:
  - `phone_number_id`: _______________
  - Registrado en `TenantRegistry.register(...)`.
- [ ] Webhook de 360dialog apuntando a `https://TU_DOMINIO/webhooks/whatsapp`.
  - Challenge verificado: `GET /webhooks/whatsapp?hub.mode=subscribe&...` → 200.
- [ ] Webhook de Flow apuntando a `https://TU_DOMINIO/webhooks/flow`.

## Etapa 3 — Carga de información del cliente (días 2–5)

- [ ] Catálogo de productos / servicios recibido del cliente.
- [ ] Precios, horarios, políticas de atención documentados.
- [ ] Tono de comunicación definido (formal, cercano, etc.).
- [ ] Prompt del agente configurado con la información real del cliente.
  - Archivo: `backend/app/agents/lead_classifier.py` (o cobranza) → sección SYSTEM.
- [ ] Si el cliente tiene documentos largos (PDFs, catálogos extensos):
  - [ ] Evaluar si cabe en el prompt (< ~8.000 tokens) o si necesita RAG (SPEC-004).

## Etapa 4 — Sandbox: el cliente aprueba (días 5–8)

- [ ] Agente corriendo con datos reales pero **sin enviar mensajes a clientes externos**.
  - Usar `/webhooks/message` (endpoint interno) o un número de prueba en sandbox de 360dialog.
- [ ] El cliente revisa al menos 10 conversaciones de prueba.
- [ ] Comportamiento de escalamiento a humano validado.
- [ ] El cliente **aprueba por escrito** (email o WhatsApp con "aprobado").
- [ ] Cualquier ajuste solicitado aplicado y re-validado.

## Etapa 5 — Go-live (día 8–10)

- [ ] Estado del tenant cambiado a `activo` (via pago Flow o override manual con razón).
- [ ] Agente en producción: webhook de 360dialog recibiendo mensajes reales.
- [ ] Smoke test post go-live: un mensaje real entra, se procesa y se responde.
- [ ] `railway logs` monitoreado en las primeras **48 horas**.
- [ ] Alerta de 80% y 100% probada (en sandbox) antes del go-live.

## Etapa 6 — Reunión de 30 días

- [ ] Reunión de métricas agendada (día ~30 desde go-live).
- [ ] Preparar reporte del panel: conversaciones atendidas, tiempo de respuesta, % escalados, gasto real.
- [ ] Comparar con la métrica de negocio de la spec (ej: "tiempo respuesta leads < 2 min").
- [ ] Decidir si el plan actual es el correcto o conviene ajustar.
- [ ] Pedir testimonio / caso de éxito con números (para ventas del cliente 2).

## Etapa 7 — Documentar para el cliente 2

- [ ] ¿Qué pasos tardaron más de lo esperado? _______________
- [ ] ¿Qué prompt o configuración se reutilizará tal cual? _______________
- [ ] ¿Qué pregunta hizo el cliente que no estaba en la propuesta? _______________
- [ ] Actualizar este checklist con lo aprendido.

---

**Métrica de calidad del onboarding:** ¿Cuántos días tomó desde firma hasta go-live?
- Cliente 1: ___ días (meta ≤ 30)
- Cliente 2: ___ días (meta ≤ 15)
