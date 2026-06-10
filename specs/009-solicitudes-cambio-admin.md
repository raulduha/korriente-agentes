# SPEC-009: Solicitudes de cambio + vista de admin (modelo servicio gestionado)

- **Estado**: borrador
- **Autor**: Korriente
- **Fecha**: 2026-06-10
- **Caso de éxito base (Playbook)**: el cliente entra a su panel de solo-lectura, entiende
  qué hace su agente, y cuando quiere ajustar algo ("que también responda por horarios de
  despacho") lo **pide desde el panel**. Queda registrado con fecha y estado. Korriente lo
  ve en su **vista de admin** junto a todos los tenants, lo gestiona (menor incluido /
  mayor se cotiza), lo implementa y lo marca resuelto. Nada se pierde por WhatsApp.

> **Esta spec define la pieza que faltaba del modelo de negocio.** Korriente Agentes es una
> **rama de consultoría operada como servicio gestionado (MSP)**, no un SaaS self-serve:
> Korriente instala y opera, el cliente ve (solo lectura) y pide cambios por un canal
> estructurado. El panel es, a la vez, el portal del cliente y la **consola de operación**
> de Korriente. Ver `docs/plan-negocio.md`.

## 1. Problema (en lenguaje del cliente)
"Entiendo lo que instalaron y lo veo funcionando, pero quiero pedir un ajuste sin tener
que cazarte por WhatsApp y sin que se te pierda. Quiero saber en qué estado va mi pedido."
*(Y el problema interno: sin un registro, a 10 clientes los cambios se desordenan, no hay
historial de qué se pidió/entregó, y no hay forma de cobrar los cambios mayores con respaldo.)*

## 2. Métrica de negocio
- **Cambios gestionados con trazabilidad**: base 0% (hoy serían WhatsApp sueltos) → meta
  **100% de las solicitudes con fecha, estado e historial**.
- **Tiempo de respuesta a una solicitud** (creada → primera respuesta de Korriente): meta
  **< 2 días hábiles**, visible para el cliente.
- **Capacidad de operar muchos tenants a la vez**: Korriente ve en **una vista** el estado
  de pago, uso y solicitudes de todos los clientes. (Habilita escalar de 1 a ~20 sin ahogarse.)

## 3. Alcance
- **Incluye**:
  - **Solicitud de cambio** creada por el cliente desde su panel (título, descripción,
    categoría: `ajuste_prompt | nuevo_flujo | conexion | reporte | otro`), scopeada a su tenant.
  - **Estados** de la solicitud: `recibida → en_revision → cotizada → aprobada →
    implementando → resuelta` (+ `rechazada`/`cancelada`). El cliente ve el estado; no lo edita.
  - **Vista de admin (Korriente)**: lista de **todos** los tenants con estado de pago
    (de SPEC-006), uso (de SPEC-008) y solicitudes abiertas; poder cambiar estado de una
    solicitud, dejar nota y (opcional) un monto cotizado en CLP.
  - **Notificaciones**: al crear una solicitud, aviso a Korriente; al cambiar de estado,
    aviso al cliente. (Canal email/WhatsApp ya existente.)
  - Distinción **cambio menor (incluido)** vs **cambio mayor (cotizado)** como campo de la
    solicitud, no como lógica automática (lo decide el humano).
- **NO incluye** (explícito):
  - **Que el cliente edite el agente** (prompts, flujos, config) → NO. El modelo es
    Korriente-opera; el cliente solo **pide**. (Self-serve de edición es Fase 2+.)
  - **Cobro automático del cambio mayor** → se factura por el flujo normal (Flow/manual),
    no se cobra dentro de la solicitud.
  - **Chat en tiempo real / mensajería bidireccional rica** → basta crear solicitud +
    notas de estado. Conversación fina sigue por WhatsApp si hace falta.
  - **Roles/múltiples usuarios por cliente** → un token de acceso por tenant (de SPEC-008).
  - **SLA contractual formal** → se muestra el tiempo de respuesta objetivo, no se garantiza por contrato aún.

## 4. Comportamiento esperado (casos)

| # | Input (situación) | Comportamiento esperado | ¿Escala a humano? |
|---|-------------------|-------------------------|-------------------|
| 1 | Cliente crea solicitud desde su panel | queda `recibida` con fecha, tenant, categoría; aviso a Korriente; visible solo para ese tenant | Sí (Korriente la toma) |
| 2 | Korriente la marca `cotizada` con monto CLP | el cliente ve estado `cotizada` + monto; recibe aviso | No |
| 3 | Cliente intenta ver/editar solicitud de OTRO tenant | bloqueado: el token solo da acceso a lo suyo | No (seguridad) |
| 4 | Cliente intenta **editar el estado** | no puede: el panel del cliente es solo-lectura sobre el estado | No |
| 5 | Korriente abre la vista de admin | ve todos los tenants con estado de pago, uso y solicitudes abiertas, ordenables por antigüedad | No |
| 6 | Tenant `suspendido` por impago (SPEC-006) crea solicitud | se permite crearla, pero el panel indica que la operación está en pausa hasta regularizar el pago | No (deriva a billing) |
| 7 | Korriente marca `resuelta` y deja nota | el cliente ve `resuelta` + nota + fecha; queda en historial | No |
| 8 | Acceso sin token / token inválido | no se ve ni se crea nada | No (seguridad) |

## 5. Política Human-in-the-loop
- **Toda** solicitud la resuelve un humano de Korriente. El sistema solo registra, enruta y
  notifica. No hay automatización que apruebe o implemente cambios sola (es consultoría).
- La decisión menor-incluido vs mayor-cotizado es **siempre** humana, con su criterio y el contrato.

## 6. Conectores (tools) necesarios
- Reusa `app/tools/whatsapp.py` / `email` para notificaciones (sin tools nuevos).
- Lee `Tenant` (SPEC-006) y `Usage`/`traces` (SPEC-008) para la vista de admin.
- No toca `app/llm/*`.

## 7. Datos y Ley 19.628
- La descripción de la solicitud puede traer datos del negocio; se aplica `mask()` a
  cualquier PII en notas/logs. El cliente no debe pegar datos bancarios; el placeholder del
  formulario lo advierte.
- **Aislamiento estricto por tenant**: una solicitud nunca es visible para otro cliente.
  La vista de admin (todos los tenants) está detrás de un acceso de **admin** separado del
  token de cliente.
- Minimización: se guarda la solicitud, su estado y notas; no más.

## 8. Costo y plan
- Las notificaciones usan canales ya contabilizados; costo marginal, **no** consume cuota
  del cliente (es operación de Korriente).
- **Cambios menores incluidos** vs **mayores cotizados** es política comercial, no afecta
  `budget_cap` ni límites de plan. Sugerencia (no vinculante): N cambios menores/mes según
  plan (Starter 1, Growth 3, Pro ilimitado-razonable), a definir en `docs/pricing.md`.
- No cambia los números de `backend/app/core/pricing.py`.

## 9. Plan técnico
- **Archivos a crear/tocar**:
  - `app/core/storage.py`: agregar `ChangeRequest` (id, tenant_id, titulo, descripcion,
    categoria, estado, monto_clp opcional, notas[], created_at, updated_at) y métodos
    `create_request/get_request/list_requests(tenant_id)/list_all_requests()/update_request`.
    Tabla SQLite espejando el patrón de `traces`.
  - `app/api/dashboard.py`: endpoints de cliente `POST /requests` y `GET /requests`
    (token de tenant, solo lo suyo); endpoints de admin `GET /admin/overview` (todos los
    tenants: pago+uso+solicitudes) y `PATCH /admin/requests/{id}` (cambiar estado/nota/monto),
    detrás de acceso admin separado.
  - `app/alerts/service.py` (de SPEC-008): reusar para avisos de creación/cambio de estado.
  - `frontend/app/dashboard/page.tsx`: sección **"Mis solicitudes"** (lista solo-lectura
    del estado + form para crear) en el panel de cliente.
  - `frontend/app/admin/page.tsx` (NUEVO): consola de operación de Korriente — tabla de
    tenants (estado de pago, uso, solicitudes abiertas) + gestión de solicitudes.
  - `frontend/lib/api.ts`: métodos `createRequest`, `listRequests`, `adminOverview`,
    `updateRequest`.
  - `examples/07_change_request_demo.py` (NUEVO): crea solicitud → admin la cotiza →
    resuelve, todo con storage en memoria y notificaciones mock.
- **Casos de prueba** (mocks):
  - `tests/api/test_change_requests.py`: crear/listar scopeado por tenant; aislamiento
    (§4.1, §4.3); cliente no edita estado (§4.4); token inválido no ve nada (§4.8).
  - `tests/api/test_admin_overview.py`: admin ve todos los tenants; cliente no accede a admin.
  - `tests/core/test_change_request_store.py`: persistencia y transiciones de estado.
  - Regresión: tests actuales en verde.

## 10. Criterios de aceptación
- [ ] Cliente crea y ve **solo** sus solicitudes; nunca las de otro tenant
- [ ] El panel de cliente es solo-lectura sobre el **estado** (no lo edita)
- [ ] Korriente gestiona estados/notas/monto desde la vista de admin (acceso separado)
- [ ] La vista de admin lista todos los tenants con pago + uso + solicitudes
- [ ] Notificación al crear y al cambiar de estado (mock en tests)
- [ ] Ejemplo ejecutable `examples/07_change_request_demo.py`
- [ ] Aislamiento por tenant verificado en tests (seguridad)

---

## Dependencias abiertas (del negocio, no de diseño)
1. **Política comercial** de cambios menores incluidos por plan (para `docs/pricing.md`).
2. **Acceso admin** de Korriente: definir el mecanismo (clave admin única en Fase 1; auth
   real en Fase 2). No mezclar con el token de cliente.
3. Categorías finales del formulario de solicitud (validar con los primeros clientes).

## Specs hermanas
- SPEC-006 (estado de pago del tenant), SPEC-008 (panel solo-lectura + token + uso/trazas),
  SPEC-007 (deploy donde corre el panel).
