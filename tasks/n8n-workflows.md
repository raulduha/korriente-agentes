# Backlog — Workflows n8n descargables

Tareas para completar el catálogo de plantillas n8n. Detalle de cada molde en
`docs/n8n-agentes-catalogo.md`. Convención: cada workflow nuevo nace de una spec
(`CLAUDE.md`), se construye en `frontend/public/n8n/workflows/`, se documenta en
`lib/workflows.ts` (página `/workflows`) y se valida (JSON parseable).

Prioridad: 🟡 alta · ⚪ backlog. Marca `[x]` al terminar.

## ✅ Hecho
- [x] `01-lead-classifier-whatsapp.json` — clasificador de leads
- [x] `02-cobranza-recordatorios.json` — cobranza y recordatorios
- [x] `03-orquestador-marketing.json` — orquestador multi-agente
- [x] `workers/worker-analisis-mercado.json`
- [x] `workers/worker-copywriter.json`
- [x] `workers/worker-seo-keywords.json`
- [x] Página `/workflows` con documentación, instalación, seguridad y pricing
- [x] README en `frontend/public/n8n/README.md`
- [x] n8n-mcp instalado y registrado (modo documentación)

## 🟡 Agentes individuales — prioridad alta
- [ ] **Agendador de citas** — ofrece horarios, agenda en calendario, confirma y recuerda.
  - Nodos: webhook → Config → leer disponibilidad (Google Calendar/Cal.com) → LLM proponer → crear evento → confirmar.
  - HITL: choque de horarios o solicitud especial → humano.
- [ ] **FAQ con RAG** — responde desde catálogo/políticas reales, se abstiene si no sabe.
  - Nodos: webhook → embeddings de la pregunta → vector store (Qdrant/PGVector/n8n) → LLM con contexto → responder/abstenerse.
  - Requiere paso de ingestión de documentos (workflow aparte).
- [ ] **Triage de tickets** — clasifica urgencia/área y enruta o escala.
- [ ] **Generador de cotizaciones** — arma cotización desde conversación + lista de precios (modelo sonnet).

## ⚪ Agentes individuales — backlog
- [ ] Recuperador de carritos abandonados
- [ ] Scoring de leads (0–100)
- [ ] Conciliador de pagos
- [ ] Seguimiento de despacho/tracking
- [ ] Alertas de stock
- [ ] Soporte N1 con RAG
- [ ] Encuestas NPS post-atención
- [ ] Screening de CVs (con HITL)
- [ ] Onboarding interno (RRHH + RAG)
- [ ] Calendario de redes sociales
- [ ] Analista de métricas
- [ ] Generador de documentos (contratos/actas)
- [ ] Revisor de cumplimiento (checklist Ley 19.628)

## 🟡 Equipos multi-agente
- [ ] **Ampliar equipo de Marketing**: sumar workers `estratega-de-medios` y `disenador-de-brief`; conectar al orquestador.
- [ ] **Equipo de Ventas (SDR)**: prospectador → calificador → redactor de propuesta → agendador.
- [ ] **Equipo de Soporte**: triage → especialista RAG por área → escalador → QA/encuesta.

## ⚪ Equipos multi-agente — backlog
- [ ] Equipo de Cobranza inteligente (segmentador → redactor por perfil → agendador → reporte)
- [ ] Equipo de Contenido (investigador → escritor → editor/SEO → publicador, patrón secuencial)

## 🟡 Patrones de arquitectura (plantillas reutilizables)
- [ ] **Plantilla "supervisor/jerárquico"** — supervisor que delega, revisa y reasigna (loop).
- [ ] **Plantilla "router condicional"** — Switch/IF para llamar solo a los workers que aplican.
- [ ] **Plantilla "generador + crítico"** — iterar con tope de iteraciones.
- [ ] **Plantilla "HITL checkpoint"** — paso de aprobación humana antes de ejecutar (Wait/Webhook).

## ⚪ Infra, calidad y confianza
- [ ] Listar workflows en `/workflows` desde el filesystem (leer `/public/n8n/workflows`) en vez de hardcodear en `lib/workflows.ts`.
- [ ] Script de validación de JSON (`scripts/validate-n8n.*`) en CI: parsea cada workflow y chequea nodos LLM, credencial placeholder y meta `korriente`.
- [ ] Variante **OpenAI** de cada plantilla (o un nodo Config que cambie proveedor) — provider-agnóstico.
- [ ] Workflow de **ingestión de documentos** para RAG (cargar PDF/Sheets → embeddings → vector store).
- [ ] Botón "Descargar todo" (zip) en la página `/workflows`.
- [ ] Capturas/diagrama de cada flujo en la página (imagen del canvas n8n) para que se vea de fiar.
- [ ] Nota legal/disclaimer: las plantillas son punto de partida, requieren revisión por cliente.

## Relación con el backlog general
Estos moldes alimentan M2 del backlog principal (`tasks/tasks.md`): "Exportador opcional a
workflow n8n". RAG aquí depende de la misma decisión de vector store que M2.
