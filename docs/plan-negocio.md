# Plan de negocio — Korriente Agentes

> Documento estratégico interno. Acompaña a `docs/constitution.md` (principios) y
> `docs/roadmap.md` (fases técnicas). Aquí está el **modelo de negocio y la secuencia de
> ejecución**, escrito sin autoengaño: qué vender, a quién, cómo cobrar y en qué orden.

## 0. La verdad de partida (junio 2026)

- **Lo que sobra**: producto. Runtime Python (46 tests), workflows n8n descargables,
  sitio web, pricing definido, 5 specs.
- **Lo que falta**: clientes. **Cero** clientes pagando. WhatsApp es mock. No hay forma
  de cobrar ni de cortar el servicio si no pagan. Nada está desplegado en producción.
- **Conclusión**: el cuello de botella **no es técnico**. Es comercial y operativo. Toda
  energía en construir más producto antes del primer cliente es energía mal puesta.

## 1. Qué vendemos (y qué NO)

**Modelo: servicio gestionado (MSP), rama de la consultoría.** Korriente **instala y opera**
el agente; el cliente lo **ve** en un panel de solo-lectura, entiende su flujo, y **pide
cambios** por un canal estructurado (no edita nada él mismo). La suscripción paga mantiene
el servicio activo; si deja de pagar, se **pausa** automáticamente (no se borra). Es el
punto medio entre consultoría 100% manual (no escala) y SaaS self-serve (no existe aún).

**Vendemos**: un agente de IA que resuelve **un proceso concreto y medible** de una PyME
chilena (responder leads, cobrar facturas, agendar, triage de tickets), operando en su
WhatsApp/email, con costo bajo control y escalamiento a humano — **instalado y mantenido
por Korriente**, con portal de cliente y solicitudes de cambio.

**NO vendemos** (todavía): un SaaS self-serve donde el cliente se registra solo, arma y
**edita** su agente. Eso es Fase 2/3. Hoy el valor está en el **diagnóstico, la instalación
y los cambios**, que es trabajo humano consultivo.

### Reglas del modelo gestionado
- **Pausa, no cancela.** Impago → `suspendido` (agente off, config intacta, revive al
  pagar). Cancelar/borrar es última instancia y **manual**, cuando el cliente avisa que se va.
- **El cliente ve, no edita.** Panel solo-lectura (token por tenant). Los cambios se
  **piden** y los implementa Korriente (SPEC-009).
- **El panel es también la consola de operación de Korriente.** Misma herramienta, dos
  vistas: el cliente ve lo suyo; Korriente ve todos los tenants (pago + uso + solicitudes).
  Es lo que permite escalar de 1 a ~20 clientes sin ahogarse.
- **Cambios menores incluidos / mayores cotizados** (decisión humana, respaldada en el
  registro de solicitudes).

> **Regla del roadmap (no negociable):** no se va a SaaS self-serve antes de **5–10
> clientes del mismo molde** entregados, donde el 80% del agente sea idéntico. Antes de
> eso, cada cliente nos enseña qué estandarizar.

## 2. Modelo de ingresos

Dos componentes, alineados con `docs/pricing.md` y `backend/app/core/pricing.py`:

1. **Setup único (consultivo)** — diagnóstico, integración, configuración y pruebas.
   Starter $490.000 · Growth $990.000 · Pro $1.900.000 (CLP + IVA). Es el trabajo humano
   de poner el agente a andar; es donde está el margen inicial y la barrera de seriedad.
2. **Suscripción mensual** — operación del agente con límites del plan.
   Starter $290.000 · Growth $590.000 · Pro $1.190.000 (CLP + IVA). Recurrente, es lo que
   construye el valor del negocio en el tiempo.

**Cómo se cobra (Fase 1):** Flow.cl (ver SPEC-006). Flow maneja la recurrencia y nos
avisa por webhook; nosotros activamos/suspendemos el tenant. **No** se construye billing
self-serve ni Stripe metered hasta que haya volumen y/o clientes internacionales.

**Margen (ejemplo Starter):** ingreso ~$290.000/mes vs costo real (~US$66: WhatsApp + LLM
+ infra) + comisión Flow (~$8.400) → margen sano con headroom bajo el `budget_cap` de US$60.

## 3. A quién le vendemos primero (ICP)

PyME chilena de **10–200 empleados** que:
- Pierde plata por responder tarde (leads) o por no cobrar a tiempo (cobranza).
- Ya usa WhatsApp como canal principal con clientes.
- Tiene volumen repetitivo (decenas/cientos de conversaciones al mes) pero no tanto como
  para justificar un equipo dedicado.
- Valora el ROI medible por sobre la "tecnología".

**Beachhead recomendado**: elegir **un solo vertical** para los primeros 3–5 clientes (ej:
inmobiliarias chicas, clínicas dentales, retailers con despacho). Mismo molde = la fábrica
mejora rápido y el boca a boca es más fuerte.

## 4. Secuencia de ejecución (lo que de verdad mueve la aguja)

### Etapa A — Primer cliente pagado (próximos 30–45 días)
El objetivo es **uno**, real, pagando, con ROI medible. Orden:
1. **SPEC-005** — WhatsApp real (360dialog). Sin esto no hay producto entregable.
2. **SPEC-007** — Deploy + checklist de onboarding. Sin esto no hay dónde correrlo.
3. **SPEC-006** — Cobro Flow + activación/suspensión. Sin esto no hay negocio.
4. **SPEC-008** — Panel con trazas + alertas. Sin esto no hay cómo mostrar ROI.
5. **SPEC-004** — RAG, solo si el primer cliente lo necesita (responder desde sus docs).

> Mientras tanto: **vender**. El sitio ya convierte. Falta que el botón "Agendar
> diagnóstico" haga algo real (formulario → correo/WhatsApp de Korriente). Es media hora
> de trabajo y desbloquea pipeline. **Hazlo antes que cualquier feature de agente.**

### Etapa B — Repetir el molde (clientes 2 a 5)
- Cada onboarding debe tardar **la mitad** que el anterior (constitución §8).
- Documentar qué se repitió y convertirlo en plantilla.
- Recién aquí se evalúa si un vertical justifica un agente "de catálogo".

### Etapa C — Productizar (5+ clientes del mismo molde) → Fase 2
- PostgreSQL + colas, memoria vectorial (Qdrant), observabilidad (LangFuse).
- **Aquí, y solo aquí**, se evalúa SaaS self-serve y frameworks agénticos (LangGraph/
  CrewAI) para los casos que de verdad necesitan razonamiento dinámico.

## 5. Dónde se aloja todo (infraestructura)

| Fase | Hosting | DB | Por qué |
|------|---------|----|---------|
| **1 (0–5 clientes)** | Railway o Render | SQLite en volumen | Barato (US$10–30/mes), simple, deploy en minutos. Suficiente para el volumen real. |
| **2 (5–20)** | Railway/Render o VPS | PostgreSQL gestionado | Multi-tenant serio, reintentos, colas. La interfaz `UsageStore` ya permite el cambio sin tocar agentes. |
| **3 (20+ / enterprise)** | AWS/GCP + contenedores | Postgres + Qdrant | SLA, VPC, compliance por vertical. |

- **LLM**: Anthropic/OpenAI vía API (provider-agnóstico, constitución §5). Tope de gasto
  en el panel del proveedor + `budget_cap` por plan.
- **Pagos**: Flow.cl (Chile). Stripe solo si entra cliente internacional.
- **WhatsApp**: 360dialog (BSP oficial de Meta).
- **Secretos**: variables de entorno del hosting. Nunca en el repo ni en los JSON de n8n.

## 6. Riesgos y cómo se mitigan

| Riesgo | Mitigación |
|--------|-----------|
| Construir producto en vez de vender | Esta es la trampa principal. Métrica de salud: *¿avancé hacia el primer cliente esta semana?* Si la respuesta es "escribí más código", alerta roja. |
| Factura sorpresa al cliente | `budget_cap` duro + alertas 80/100% (SPEC-008). Es el pilar de confianza. |
| Dependencia de un proveedor (lock-in) | LLM provider-agnóstico; `UsageStore` intercambiable; workflows n8n son la capa de presentación, no el runtime. |
| Ley 19.628 / 21.719 | Minimización, PII enmascarada, DPA con sub-encargados (Flow, 360dialog, LLM), revisión con abogado antes de escalar. |
| Cliente pide algo fuera del molde | Se cotiza como Enterprise consultivo, no se mete al producto estándar hasta que se repita. |

## 7. Métricas que importan (y las que no)

**Importan:** clientes pagando, lead-time de onboarding, MRR, margen por tenant, ROI
demostrable en la traza del cliente, % del agente que se reutiliza entre clientes.

**No importan todavía:** elegancia del framework agéntico, cantidad de workflows en el
catálogo, features sin cliente que las pida. Son vanidad hasta que haya negocio.

---

## Resumen en una frase
**El proyecto no necesita más agentes; necesita el primer cliente pagando.** Las specs
006–008 (cobro, deploy, panel) más la 005 (WhatsApp real) son el camino. El SaaS
self-serve y los frameworks agénticos son una recompensa de la Fase 2, no una tarea de hoy.
