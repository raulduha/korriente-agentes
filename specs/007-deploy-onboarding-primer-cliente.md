# SPEC-007: Deploy + onboarding del primer cliente real

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06-10
- **Caso de éxito base (Playbook)**: tomar UN cliente desde "contrato firmado" hasta
  "agente respondiendo su WhatsApp real en producción" en **≤ 30 días**, de forma
  repetible (que el 2º cliente tarde la mitad).

> **Esta spec es operativa, no de un agente.** Es el puente entre tener la fábrica y
> tener un cliente vivo. Sin esto, todo lo demás es código que corre solo en tu notebook.
> Es el verdadero cuello de botella del proyecto hoy.

## 1. Problema (en lenguaje del cliente)
"Firmé. ¿Ahora qué? ¿Cuándo empieza a funcionar mi agente, en mi WhatsApp, con mi
información, y cómo sé que está andando?"
*(Y el problema interno: hoy no existe un proceso ni un entorno desplegado; el agente
corre con mocks en local.)*

## 2. Métrica de negocio
- **Lead-time de onboarding** (firma → agente en producción): base ~∞ (no existe) →
  meta **≤ 30 días** el primer cliente, **≤ 15** el segundo.
- **Pasos manuales del onboarding**: que queden **documentados en un checklist** y que
  cada entrega reduzca al menos uno (constitución §8).
- **Uptime del entorno** en el primer mes: meta **≥ 99%** (Railway/Render básico basta).

## 3. Alcance
- **Incluye**:
  - Deploy del backend FastAPI + frontend Next.js en Railway (o Render) con
    **variables de entorno y secretos** (claves LLM, 360dialog, Flow) fuera del código.
  - Persistencia **SQLite en volumen** (Fase 1) con respaldo simple; ruta a Postgres
    documentada para M2 (no se implementa aquí).
  - **Checklist de onboarding** reproducible (form de intake → config base del agente
    del cliente: tenant, plan, prompts, docs para RAG, plantillas WhatsApp).
  - **Runbook** mínimo: cómo desplegar, cómo rotar una clave, cómo ver logs, cómo
    suspender/reactivar un tenant, qué hacer si el webhook se cae.
  - Healthcheck (`GET /health`) y verificación post-deploy (smoke test).
- **NO incluye** (explícito):
  - **Kubernetes / contenedores orquestados / multi-región** → Fase 3.
  - **CI/CD completo con gates** → su propia spec (puede venir después; deploy manual
    documentado es suficiente para 1–3 clientes).
  - **Postgres + colas** → M2 (la interfaz `UsageStore` ya permite el cambio sin tocar
    agentes).
  - **Panel self-service de onboarding** → SaaS, M2+.

## 4. Comportamiento esperado (casos)

| # | Input (situación) | Comportamiento esperado | ¿Escala a humano? |
|---|-------------------|-------------------------|-------------------|
| 1 | Deploy a Railway con env vars correctas | `GET /health` responde 200; webhooks accesibles por HTTPS | No |
| 2 | Falta una variable de entorno crítica (ej: clave LLM) | el servicio **falla rápido y claro** al arrancar (no arranca silenciosamente roto) | Sí (alerta deploy) |
| 3 | Onboarding de un cliente nuevo siguiendo el checklist | queda un tenant `trial/activo` con su plan, prompts y docs, sin tocar otros tenants | No |
| 4 | Rotación de una clave filtrada | se cambia el secreto en el panel de Railway y se reinicia; sin redeploy de código ni cambios en repo | Sí (operación) |
| 5 | Reinicio del servicio | el estado (tenants, uso, trazas) **persiste** (volumen SQLite), no se pierde | No |
| 6 | Smoke test post-deploy | un mensaje de prueba al webhook recorre el pipeline y deja traza, sin gastar de más | No |

## 5. Política Human-in-the-loop
- El onboarding es **humano-conducido** por diseño en Fase 1 (es donde está el valor:
  diagnóstico + adaptación). El checklist lo hace repetible, no lo automatiza.
- Cualquier acción destructiva (borrar tenant, reset de datos) requiere confirmación
  humana y queda en el runbook como paso explícito.

## 6. Conectores (tools) necesarios
- No agrega tools de agente. Toca **infra y config**:
  - `app/core/config.py`: lectura estricta de env vars (fail-fast si falta una crítica).
  - Healthcheck en `app/main.py` (si no existe).
- Depende de SPEC-005 (WhatsApp real) y SPEC-006 (estado del tenant) para un onboarding
  completo, pero el deploy y el checklist se pueden dejar listos antes.

## 7. Datos y Ley 19.628
- **Secretos**: todas las claves viven como variables de entorno/secretos del proveedor
  de hosting, **nunca** en el repo ni en el `.json` de workflows. `.env.example` solo
  documenta nombres, no valores.
- **Respaldo del SQLite**: contiene PII mínima (tenants, trazas con datos enmascarados).
  El respaldo se cifra/restringe; retención acotada; documentar dónde vive y quién accede.
- **Región de datos**: documentar dónde queda alojado el volumen (Railway/Render región)
  para la cláusula de tratamiento y la futura Ley 21.719.

## 8. Costo y plan
- **Infra Fase 1**: Railway/Render ≈ **US$10–30/mes** para los primeros tenants
  (coincide con `docs/pricing.md`, línea "Infra US$10–30/mes por tenant").
- Es **costo de Korriente**, no del cliente; entra en el margen, no en el `budget_cap`.
- No cambia ningún plan.

## 9. Plan técnico
- **Archivos a crear/tocar**:
  - `docs/runbook.md` (NUEVO): deploy, rotación de claves, logs, suspender/reactivar
    tenant, recuperación ante caída del webhook.
  - `docs/onboarding-checklist.md` (NUEVO): pasos del intake → config del agente
    (tenant, plan, prompts, docs RAG, plantillas WhatsApp 360dialog, prueba en sandbox,
    go-live, monitoreo 48h, reunión a 30 días). Espeja el flujo de `PricingTabs` del sitio.
  - `app/core/config.py`: validación fail-fast de env vars críticas.
  - `app/main.py`: `GET /health` (si falta) + verificación de dependencias mínimas.
  - `frontend/` y `backend/`: archivos de deploy (`railway.json`/`render.yaml`,
    `Procfile` o `Dockerfile` mínimo) + documentación del volumen SQLite.
  - `scripts/smoke_test.py` (NUEVO): post-deploy, golpea `/health` y un mensaje de
    prueba al webhook con un tenant de sandbox.
- **Casos de prueba**:
  - `tests/core/test_config.py`: fail-fast si falta una env var crítica (§4.2).
  - El smoke test corre contra el deploy real (no en CI con mocks); el resto del suite
    sigue corriendo con mocks.
  - Regresión: los tests actuales siguen en verde.

## 10. Criterios de aceptación
- [ ] Backend + frontend desplegados, `GET /health` = 200 por HTTPS
- [ ] Arranque **falla claro** si falta una clave crítica (no arranca roto)
- [ ] Estado persiste tras reinicio (volumen SQLite)
- [ ] `docs/runbook.md` y `docs/onboarding-checklist.md` completos y seguidos al menos una vez
- [ ] Smoke test post-deploy recorre el pipeline y deja traza
- [ ] Secretos solo en el proveedor de hosting; cero claves en el repo

---

## Dependencias abiertas (del negocio, no de diseño)
1. **Cuenta de hosting** (Railway o Render) a nombre de Korriente + método de pago.
2. **Dominio** para el webhook (HTTPS estable; 360dialog y Flow necesitan URL fija).
3. **El primer cliente firmado** con sus documentos y su número de WhatsApp Business.

## Specs hermanas
- SPEC-005 (WhatsApp real), SPEC-006 (cobro/estado), SPEC-008 (panel/alertas).
