# Catálogo de agentes y multi-agente (n8n)

Mapa de los "moldes" descargables de Korriente: agentes individuales y equipos
multi-agente para PyMEs chilenas. Lo que ya está construido vive en
`frontend/public/n8n/workflows/`; el resto es backlog priorizado en
`tasks/n8n-workflows.md`.

> Principio (constitución §2): **modelo barato por defecto** (haiku/mini para
> clasificar/extraer), modelo potente (sonnet) solo en síntesis/razonamiento. Cada agente
> declara su **métrica de negocio** y sus reglas **HITL** (cuándo escala a humano).

Leyenda de estado: ✅ construido · 🟡 prioridad alta · ⚪ backlog.

---

## 1. Agentes individuales por área

### Atención y ventas
| Agente | Qué hace | Métrica | Modelo | Estado |
|--------|----------|---------|--------|--------|
| **Clasificador de leads WhatsApp** | Clasifica intención, responde o escala. | Respuesta < 2 min | haiku | ✅ |
| **Agendador de citas** | Ofrece horarios, agenda en calendario, confirma y recuerda. | % citas auto-agendadas | haiku | ✅ |
| **FAQ con RAG** | Responde desde tu catálogo/políticas reales, se abstiene si no sabe. | % consultas resueltas sin humano | haiku + embeddings | 🟡 |
| **Recuperador de carritos** | Detecta carrito/cotización abandonada y reengancha por WhatsApp. | % recuperación | haiku | ⚪ |
| **Scoring de leads** | Puntúa el lead (0–100) por intención y datos, prioriza al equipo. | Conversión de leads calientes | haiku | ⚪ |

### Finanzas y operaciones
| Agente | Qué hace | Métrica | Modelo | Estado |
|--------|----------|---------|--------|--------|
| **Cobranza y recordatorios** | Recordatorios cordiales, escala montos altos. | % pagado a tiempo | haiku | ✅ |
| **Conciliador de pagos** | Cruza pagos recibidos con facturas, marca diferencias. | Horas de conciliación ahorradas | haiku | ⚪ |
| **Generador de cotizaciones** | Arma cotización desde una conversación + lista de precios. | Tiempo por cotización | sonnet | ✅ |
| **Seguimiento de despacho** | Notifica estado de pedido/orden y resuelve dudas de tracking. | Tickets de "¿dónde está mi pedido?" | haiku | ⚪ |
| **Alertas de stock** | Avisa quiebres/sobre-stock y sugiere reposición. | Quiebres evitados | mini | ⚪ |

### Soporte y posventa
| Agente | Qué hace | Métrica | Modelo | Estado |
|--------|----------|---------|--------|--------|
| **Triage de tickets** | Clasifica urgencia y área, enruta o escala. | Tiempo de primera respuesta | haiku | ✅ |
| **Soporte N1 con RAG** | Resuelve dudas comunes desde la base de conocimiento. | % autoservicio | haiku + embeddings | ⚪ |
| **Encuestas NPS** | Pide feedback post-atención y resume el sentimiento. | Respuesta a encuestas | mini | ⚪ |

### RRHH y administración
| Agente | Qué hace | Métrica | Modelo | Estado |
|--------|----------|---------|--------|--------|
| **Screening de CVs** | Filtra postulantes contra criterios del cargo (con HITL). | Horas de filtro ahorradas | haiku | ⚪ |
| **Onboarding interno** | Responde dudas de nuevos (vacaciones, beneficios, accesos). | Tickets a RRHH | haiku + RAG | ⚪ |

### Marketing y contenido
| Agente | Qué hace | Métrica | Modelo | Estado |
|--------|----------|---------|--------|--------|
| **Análisis de mercado** (worker) | Segmentos, competidores, tendencias, oportunidades. | — | haiku | ✅ |
| **Copywriter** (worker) | Titulares, posts, asunto de email, CTA. | — | haiku | ✅ |
| **SEO / keywords** (worker) | Keywords, meta tags, ideas de contenido. | — | haiku | ✅ |
| **Estratega de medios** (worker) | Canales recomendados, distribución de presupuesto, métricas clave. | — | haiku | ✅ |
| **Diseñador de brief** (worker) | Concepto creativo, paleta, brief para el diseñador. | — | haiku | ✅ |
| **Calendario de redes** | Programa publicaciones de la semana por canal. | Consistencia de publicación | haiku | ⚪ |
| **Analista de métricas** | Lee métricas y entrega un resumen accionable. | Tiempo de reporte | sonnet | ⚪ |

### Legal y cumplimiento
| Agente | Qué hace | Métrica | Modelo | Estado |
|--------|----------|---------|--------|--------|
| **Generador de documentos** | Arma contratos/actas desde plantilla + datos. | Tiempo de redacción | sonnet | ⚪ |
| **Revisor de cumplimiento** | Chequea un texto contra una checklist (Ley 19.628, etc.). | Errores detectados | sonnet | ⚪ |

---

## 2. Equipos multi-agente

Un **orquestador** coordina; cada **worker** es experto en una tarea. Esto escala
construyendo equipos por departamento.

### 2.1 Equipo de Marketing ✅ (5 workers)
Construido: mercado + copy + SEO + estrategia de medios + brief visual, síntesis con sonnet.
```
                 ┌─────────────────────────┐
   Objetivo ───▶ │   Orquestador Marketing │  v1.1
                 └───────────┬─────────────┘
        ┌──────────┬─────────┼──────────┬───────────┐
        ▼          ▼         ▼          ▼           ▼
   Análisis    Copywriter   SEO     Estratega   Diseñador
   de mercado     ✅         ✅      de medios    de brief
      ✅                               ✅           ✅
        └──────────┴─────────┴──────────┴───────────┘
                            ▼
                   Síntesis → Plan ✅
```

### 2.2 Equipo de Ventas (SDR) ✅
```
Lead ▶ Orquestador ▶ [Prospectador] ▶ [Calificador/Scoring]
                  ▶ ¿calificado? ─sí▶ [Redactor de propuesta] ▶ handoff humano
                                 └no▶ secuencia de nurturing
```
Construido (patrón secuencial): `05-orquestador-ventas.json` + 3 workers.
Métrica: leads calientes con propuesta lista. HITL: cierre y precios → humano.
Pendiente: enganchar el paso de agendar al workflow `04-agendador-citas`.

### 2.3 Equipo de Soporte ⚪
```
Ticket ▶ Orquestador ▶ [Triage urgencia/área]
                    ▶ [Especialista RAG por área]
                    ▶ [Escalador si baja confianza]
                    ▶ [QA/Encuesta post-cierre]
```
Métrica: % autoservicio + CSAT. HITL: enojo/reclamo o baja confianza.

### 2.4 Equipo de Cobranza inteligente ⚪
```
Cartera ▶ Orquestador ▶ [Segmentador de deudores]
                     ▶ [Redactor por perfil] (cordial/firme/plan de pago)
                     ▶ [Agendador de próximo toque]
                     ▶ Reporte de gestión
```
Métrica: recuperación por segmento. HITL: monto alto, disputa, cliente delicado.

### 2.5 Equipo de Contenido ⚪
```
Tema ▶ Orquestador ▶ [Investigador] ▶ [Escritor] ▶ [Editor/SEO] ▶ [Publicador]
```
Patrón secuencial con loop de revisión (ver §3.5). Métrica: piezas publicadas/semana.

---

## 3. Patrones de arquitectura multi-agente

Elige el patrón según el problema. Todos se arman en n8n con `Execute Workflow` + nodos LLM.

### 3.1 Paralelo + síntesis ✅ (el que ya usamos)
El orquestador reparte briefs, los workers corren **en paralelo**, un sintetizador une.
Mejor para: tareas independientes (mercado, copy, SEO). Rápido y barato.

### 3.2 Secuencial (pipeline de especialistas) ⚪
Cada agente recibe la salida del anterior: investigar → escribir → editar → publicar.
Mejor para: trabajo que se construye por capas (contenido, documentos).

### 3.3 Supervisor / jerárquico ⚪
Un supervisor delega, **revisa** el resultado y puede reasignar. Loop de control.
Mejor para: calidad crítica donde conviene un "jefe" que aprueba. Más caro (más llamadas).
```
Supervisor ─▶ Worker ─▶ Supervisor (¿ok?) ─no─▶ Worker (reintenta)
                                    │sí
                                    ▼  entrega
```

### 3.4 Router / despacho condicional ⚪
El orquestador decide **a quién** llamar (no a todos). Ahorra costo cuando no todos los
workers aplican. En n8n: `Switch` o `IF` por flag del router.

### 3.5 Generador + crítico (debate) ⚪
Un agente produce, otro **critica** y pide mejoras; iteran N veces. Sube calidad de copys,
propuestas, documentos. Tope de iteraciones para acotar costo.

### Transversal a todos los patrones
- **HITL checkpoints**: insertar un paso de aprobación humana antes de ejecutar (enviar
  campaña, mandar cobranza sobre umbral, publicar).
- **Memoria compartida**: pasar un objeto de contexto entre workers (o una tabla/Sheet)
  para que no se repitan ni se contradigan.
- **Tope de costo**: contar llamadas por corrida; cortar y escalar a humano si se excede.
- **Trazabilidad**: cada worker devuelve `{ worker, resultado }` para auditar quién hizo qué.

---

## 4. Mapeo a planes Korriente

| Plan | Encaja con |
|------|-----------|
| **Starter** | 1 agente individual (lead-classifier o cobranza). |
| **Growth** | 2–3 agentes individuales, o 1 equipo multi-agente simple. |
| **Pro** | Varios agentes + 1–2 equipos multi-agente (marketing, ventas). |
| **Enterprise** | Equipos con supervisor, HITL formal, RAG por área, SLA. |

Recordatorio: el **budget cap** del plan aplica igual a multi-agente. Un equipo cuesta más
por corrida (varias llamadas), así que se reserva para procesos de mayor valor.

---

## 5. De catálogo a entrega
1. Elegir el molde (este doc) y crear/actualizar la **spec** en `specs/` (CLAUDE.md).
2. Construir el workflow en `frontend/public/n8n/workflows/` (validar JSON).
3. Documentarlo en la página `/workflows` (`lib/workflows.ts`).
4. Marcar el avance en `tasks/n8n-workflows.md`.
