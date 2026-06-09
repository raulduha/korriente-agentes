# Catálogo de agentes

Cada agente está respaldado por un caso de éxito documentado del Playbook. La idea de
la fábrica: estos son los "moldes" que reutilizas y adaptas por cliente.

## Implementados (flagship)

### 1. Clasificador y respondedor de leads WhatsApp — `lead-classifier-whatsapp`
- **Caso base**: TechFlow / Klarna (atención y leads).
- **Problema PyME**: leads de WhatsApp que se responden en horas → se pierden.
- **Qué hace**: recibe el mensaje, clasifica intención (`cotizacion`, `consulta`,
  `reclamo`, `spam`), responde lo respondible al toque, deriva a humano lo sensible,
  registra todo en CRM/Sheets.
- **Métrica de negocio**: tiempo de respuesta < 2 min; % de leads atendidos 24/7.
- **HITL**: reclamos y montos/casos sensibles → siempre a humano.
- **Spec**: `specs/001-lead-classifier-whatsapp.md`.

### 2. Cobranza y recordatorios de pago — `cobranza-recordatorios`
- **Caso base**: operaciones / cobranza (documentación repetitiva + comunicación).
- **Problema PyME**: facturas que no se cobran a tiempo por falta de seguimiento.
- **Qué hace**: revisa facturas vencidas/por vencer, redacta recordatorios cordiales,
  los envía por WhatsApp/email según preferencia, agenda el siguiente toque, escala a
  humano sobre cierto monto o tras N intentos sin respuesta.
- **Métrica de negocio**: % de facturas pagadas a tiempo; días promedio de cobro.
- **HITL**: monto sobre umbral, cliente "delicado", o disputa → humano.
- **Ley 19.628**: no guarda datos bancarios; minimiza PII; tono no intimidatorio.
- **Spec**: `specs/002-cobranza-recordatorios.md`.

## Backlog (próximos moldes, ver `tasks/tasks.md`)
- **Triage / intake** (caso salud, LangGraph): clasificación de urgencia con checkpoint
  humano obligatorio sobre umbral.
- **Generador de documentación** (notas clínicas, actas, informes): -42% tiempo doc.
- **Optimización de operaciones** (estilo supply chain): marca excepciones, no pausa
  todo el flujo.

## Anatomía de un agente (todos comparten esto)
```
AgentSpec(
  key="lead-classifier-whatsapp",
  business_metric="tiempo de respuesta a leads < 2 min",
  channels=["whatsapp"],
  tools=["whatsapp", "crm", "sheets"],
  hitl_rules=[...],         # cuándo escalar a humano
  default_model="mini",     # barato por defecto (constitución §2)
)
```
