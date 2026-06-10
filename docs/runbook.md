# Runbook operativo — Korriente Agentes

> Para el operador (Raúl). No contiene secretos. Los valores reales viven
> en el panel de Railway/Render como variables de entorno.

## 1. Deploy inicial (Railway)

```bash
# Desde la raíz del repo
railway login
railway init          # asocia el proyecto
railway up            # despliega backend/

# Variables a configurar en el panel de Railway (Settings > Variables):
# Ver .env.example para la lista completa de nombres.
```

Requisitos previos:
- Cuenta Railway con método de pago.
- Volumen persistente montado en `/data` para el SQLite.
- Dominio configurado con HTTPS estable (360dialog y Flow necesitan URL fija).

## 2. Healthcheck post-deploy

```bash
curl https://TU_DOMINIO/health
# Esperado: {"status":"ok","service":"korriente-agentes"}
```

## 3. Smoke test post-deploy

```bash
cd backend
KORRIENTE_LLM_PROVIDER=mock python scripts/smoke_test.py https://TU_DOMINIO
# Debe dejar una traza en la DB y terminar con "smoke test OK".
```

## 4. Onboarding de un cliente nuevo

```bash
# 1. Registra el tenant en el sistema
cd backend
KORRIENTE_DB=/data/korriente.db python -m app.billing.provision \
  --tenant-id pyme-cliente-1 \
  --plan starter

# 2. Registra el phone_number_id de 360dialog
python -c "
from app.core.tenant_registry import TenantRegistry
r = TenantRegistry('/data/korriente.db')
r.register('<PHONE_NUMBER_ID>', 'pyme-cliente-1', 'lead-classifier-whatsapp', 'starter')
print('Registrado OK')
"

# 3. Genera un token de lectura para el panel del cliente
python -c "
import secrets
from app.core.tenant_registry import TenantRegistry
token = secrets.token_urlsafe(32)
r = TenantRegistry('/data/korriente.db')
r.register_token('pyme-cliente-1', token)
print('Token del cliente:', token)
"
# Guarda el token en tu gestor de contraseñas y envíaselo al cliente.

# 4. Configura el webhook de 360dialog apuntando a:
#    https://TU_DOMINIO/webhooks/whatsapp
# 5. Configura el webhook de Flow apuntando a:
#    https://TU_DOMINIO/webhooks/flow
```

## 5. Rotar una clave filtrada

1. Genera la nueva clave en el panel del proveedor (360dialog, Anthropic, etc.).
2. Actualiza la variable de entorno en Railway (Settings > Variables).
3. Haz click en "Redeploy" (Railway reinicia el servicio; la DB en el volumen persiste).
4. Verifica healthcheck.
5. El secreto antiguo queda revocado desde el paso 1 — nunca toca el repo.

## 6. Suspender / reactivar un tenant manualmente

```bash
# Suspender
KORRIENTE_DB=/data/korriente.db python -c "
from app.billing.service import BillingService
from app.core.storage import SQLiteUsageStore
svc = BillingService(store=SQLiteUsageStore('/data/korriente.db'))
# Carga los tenants existentes y suspende
svc._tenants  # TODO Fase 2: persistir Tenant en DB; por ahora se hace reiniciando el job
"
# En Fase 1 (InMemory) la suspensión se gestiona manualmente con el job de dunning.
# El estado se perderá al reiniciar — en Fase 2 se persiste en PostgreSQL.
```

## 7. Ver logs en Railway

```bash
railway logs --tail 100
# Filtrar errores:
railway logs | grep ERROR
```

## 8. Qué hacer si el webhook de WhatsApp deja de recibir mensajes

1. Verificar que la URL del webhook en 360dialog apunta al dominio correcto con HTTPS.
2. `curl https://TU_DOMINIO/health` — debe responder 200.
3. Revisar logs: `railway logs | grep wa_inbound`.
4. Verificar que `KORRIENTE_WA_APP_SECRET` y `KORRIENTE_WA_VERIFY_TOKEN` son los mismos
   configurados en 360dialog.
5. Si el dominio cambió: actualizar en el panel de 360dialog y re-verificar el challenge
   con `GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=...`.

## 9. Reset mensual de cuotas (job manual hasta Fase 2)

```bash
KORRIENTE_DB=/data/korriente.db python -c "
from app.core.limits import LimitsService
from app.alerts.service import AlertService
from app.core.storage import SQLiteUsageStore
from app.jobs.monthly_reset import run_monthly_reset

store = SQLiteUsageStore('/data/korriente.db')
limits = LimitsService(store=store)
alerts = AlertService(store=store)
tenants = store.all_tenants()
run_monthly_reset(limits, alerts, tenants)
print(f'Reset mensual para {len(tenants)} tenant(s): OK')
"
```

Programar con cron en Railway o ejecutar manualmente el primer día de cada mes.

## 10. Acciones destructivas (requieren confirmación)

- Borrar un tenant: **manual y explícito**. Avisar al cliente, exportar sus datos primero.
- Bajar a una versión anterior del deploy: `railway rollback` — confirmar que la DB es compatible.
- Resetear datos de un tenant: solo si el cliente lo solicita por escrito.
