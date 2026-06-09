# SPEC-004: RAG — respuestas del agente desde los documentos del cliente

- **Estado**: borrador
- **Autor**: Korriente
- **Fecha**: 2026-06
- **Caso de éxito base (Playbook)**: primer cliente real de M1 (agente
  `lead-classifier-whatsapp`). El cliente necesita que el agente responda consultas
  usando SU catálogo/FAQ, no respuestas genéricas. Adelanta la capacidad RAG de Fase 2
  (M2) a esta primera entrega.

> Diseño acordado en sesión `grill-me` (13 decisiones, ver §9). Esta spec NO implementa
> Qdrant ni RAG "agéntico"; usa el camino lean comprobado para 1–3 clientes.

## 1. Problema (en lenguaje del cliente)
"Mi agente responde bien el saludo, pero cuando el cliente pregunta '¿cuánto cuesta el
plan pro?' o '¿hacen despacho a regiones?', contesta genérico o lo deriva. Yo tengo todo
eso escrito en mi catálogo y mis políticas. Quiero que el agente conteste con MI
información, sin inventar, y que si no la sabe, lo pase a una persona en vez de mentir."

## 2. Métrica de negocio
- **Cobertura de respuestas correctas a consultas de info**: base ~0% (hoy responde
  genérico) → meta **≥70% de consultas respondidas correctamente desde los docs**,
  con **0 respuestas inventadas** (cero alucinación de precios/políticas).
- Se mide con el set dorado de evals (§9) y en las trazas (intención, si usó RAG, si
  escaló por falta de info).

## 3. Alcance
- **Incluye**: ingestar documentos del cliente (chunk + embed + guardar por tenant);
  un tool `knowledge` de retrieval; integrar retrieve-then-generate al
  `lead-classifier` **solo** en intenciones `consulta`/`cotizacion`; abstención +
  escalamiento cuando no hay info relevante; memoria conversacional multi-turno con
  condensación de query; set de evals dorado.
- **NO incluye** (explícito):
  - **Qdrant / DB vectorial dedicada** → el store es SQLite brute-force; Qdrant es M2.
  - **RAG agéntico** (LLM decide llamar tools en un loop) → el agente sigue siendo
    pipeline determinista.
  - **Ingesta self-service** (endpoint API / carpeta watch) → es M2/SaaS. Acá script
    offline en onboarding.
  - **Reranker / embeddings multimodales** → innecesario para FAQ/catálogo (≤~200 chunks).
  - **Persistencia del historial conversacional** → queda in-memory (límite de Fase 1).

## 4. Comportamiento esperado (casos)

| # | Input (mensaje WhatsApp) | Comportamiento esperado | ¿Escala a humano? |
|---|--------------------------|-------------------------|-------------------|
| 1 | "¿Cuánto cuesta el plan pro?" (existe en docs) | intención=`cotizacion` → `knowledge.search` → respuesta **fundamentada en el chunk** (precio real), crea lead prioridad alta | No |
| 2 | "¿A qué hora abren?" (existe en docs) | intención=`consulta` → retrieval → responde con el horario del documento | No |
| 3 | "¿Hacen envíos a la Antártica?" (NO está en docs) | intención=`consulta` → top-similarity < umbral → **abstención**: holding + escala con razón `rag_sin_match` | **Sí** |
| 4 | "¿Cuánto cuesta el plan pro?" … luego "¿y ese incluye delivery?" | seguimiento → **condensa** query con historial → `knowledge.search("¿el plan pro incluye delivery?")` → responde fundamentado | No |
| 5 | "Gana plata fácil, click aquí http://…" | intención=`spam` → **NO** toca RAG (no embedding, no 2ª llamada) | No |
| 6 | "Llevo 3 días esperando, pésimo servicio" | intención=`reclamo` → **NO** toca RAG → escala (regla existente) | **Sí** |
| 7 | consulta con chunks recuperados pero débiles/parciales | la 2ª llamada **solo** usa el CONTEXTO; si la respuesta no está, lo dice y escala, no rellena con conocimiento general | **Sí** (si no está) |

## 5. Política Human-in-the-loop
Se mantienen las reglas de SPEC-001 (`reclamo`, confianza < 0,6, tema sensible, pide
humano) y se **agrega una nueva `HitlRule`**:
- **`rag_sin_match`**: en `consulta`/`cotizacion`, si la similitud del mejor chunk queda
  bajo el umbral calibrado, el agente NO genera desde docs: manda holding ("un ejecutivo
  te responde a la brevedad") y escala. Cero alucinación de cara al cliente.

## 6. Conectores (tools) necesarios
- **NUEVO** `app/tools/knowledge.py` (hereda de `Tool`, con modo `mock`):
  - `search(query, tenant_id, top_k=4)` → chunks relevantes + similitud, **scopeado por
    `tenant_id`** (un tenant nunca ve chunks de otro).
  - En `mock`: devuelve chunks deterministas programados (para tests/demos).
- Reusa `whatsapp`, `crm`, `sheets` (sin cambios).

## 7. Datos y Ley 19.628
- **Contenido embebido**: catálogo/FAQ del **negocio** (precios, horarios, productos,
  políticas) → **no es dato personal**; el peso legal del embedding es bajo.
- **Filtro de PII en la ingesta**: se reusa `mask()` de `tools/base.py`; nunca se
  embeben RUT, teléfonos ni datos bancarios. Si un doc los trae, se enmascaran/omiten.
- **Transferencia internacional** (embeddings vía OpenAI): se usa la **API** (no entrena
  con los datos) + **DPA firmado** + retención cero. Cumple Ley 19.628 (minimización) y
  anticipa **Ley 21.719** (cláusulas contractuales tipo para transferencia).
- **Red de seguridad**: el método `embed()` es provider-agnóstico → si un cliente futuro
  trae documentos sensibles (salud, finanzas), se cambia a **embeddings locales** sin
  tocar el agente.
- La DB vectorial (SQLite) es local y queda fuera de control de versiones (`.gitignore`
  ya cubre `*.sqlite3`/`*.db`).

## 8. Costo y plan
- **Embeddings**: OpenAI `text-embedding-3-small` (~US$0,02 / 1M tokens). Query ≈ 50
  tokens → costo despreciable. Ingesta (una vez, en onboarding) ≈ centavos por cliente;
  se registra **aparte**, NO contra la cuota mensual del cliente.
- **Acciones LLM por conversación** (todas `mini`, todas cuentan como acción):
  - spam/reclamo/escala: 1 (igual que hoy).
  - consulta/cotización primera: 2 (clasificar + generar).
  - seguimiento: 3 (clasificar + condensar + generar).
- **Cabe en plan Starter** (peor caso): 800 conv × 3 = 2.400 acciones < 3.000 incluidas;
  costo APIs ≈ WhatsApp $40 + LLM $0,40 + embeddings ≈ $0 = **~$40,4 < $60 budget_cap**.
- Nota de monitoreo: RAG sube ~3x las acciones/conversación; vigilar tenants muy
  conversadores que puedan presionar `included_llm_actions` antes que las conversaciones.

## 9. Plan técnico

**Decisiones (sesión grill-me):** (1) cliente real → lead-classifier · (2) WhatsApp vía
360dialog · (3) RAG en M1 · (4) vector store SQLite brute-force · (5) embeddings OpenAI
tras `embed()` · (6) tool `knowledge` + retrieve-then-generate gated por intención ·
(7) ingesta script offline por tenant · (8) `VectorStore` scopeado por `tenant_id` ·
(9) sin match → abstener+escalar · (10) grounding estricto · (11) historial + condensar
query · (12) set dorado 20-30 Q&A · (13) cada llamada = 1 acción.

- **Archivos a crear/tocar**:
  - `app/llm/base.py`: agregar `embed(texts: list[str]) -> list[list[float]]` al
    contrato `LLMProvider` (provider-agnóstico, constitución §5).
  - `app/llm/providers/openai_provider.py`: implementar `embed()` con
    `text-embedding-3-small`. `mock.py`: `embed()` determinista (hash → vector) para tests.
  - `app/rag/store.py` (NUEVO): `VectorStore` (ABC), `InMemoryVectorStore`,
    `SQLiteVectorStore` (coseno brute-force, **filtrado por `tenant_id`**). Espeja el
    patrón de `app/core/storage.py` (SPEC-003).
  - `app/rag/ingest.py` (NUEVO): chunking (~500–800 tokens, overlap ~10–15%, split por
    sección/párrafo) + filtro PII + `embed` + `store`. Ejecutable:
    `python -m app.rag.ingest --tenant <id> <archivo...>`.
  - `app/tools/knowledge.py` (NUEVO): tool `search` sobre el `VectorStore` (modo mock).
  - `app/agents/lead_classifier.py`: separar clasificación de generación; en
    `consulta`/`cotizacion` → (condensar query si hay historial) → `knowledge.search` →
    si bajo umbral escalar (`rag_sin_match`), si no, 2ª llamada con grounding estricto.
    Cablear `Memory.append_turn`/`history` (hoy NO se usan).
  - `app/runtime/agent.py` / `registry.py`: inyectar el tool `knowledge` y el umbral en
    el `AgentSpec` si corresponde.
  - `examples/04_rag_demo.py` (NUEVO): demo con `MockLLMProvider` + `knowledge` mock.
- **Prompts**:
  - *Condensar*: "Dado el historial y el último mensaje, reescribe una pregunta
    auto-contenida para buscar en la base de conocimiento. Devuelve solo la pregunta."
  - *Generar (grounding estricto)*: "Responde SOLO con la información del CONTEXTO. Si la
    respuesta no está en el CONTEXTO, di que no tienes ese dato y que un ejecutivo
    seguirá. No inventes precios, plazos ni políticas. Español de Chile, breve y cordial."
- **Casos de prueba** (mock LLM + `knowledge` mock):
  - `tests/tools/test_knowledge.py`: search devuelve chunks del tenant correcto; **no**
    filtra chunks de otro tenant (aislamiento).
  - `tests/rag/test_store.py`: coseno ordena por similitud; SQLite persiste; scope por tenant.
  - `tests/agents/test_lead_classifier_rag.py`: los 7 casos de §4 (incluye abstención,
    condensación de seguimiento, y que spam/reclamo NO tocan RAG).
  - `tests/rag/test_evals_golden.py`: corre el **set dorado (20-30 Q&A)** contra el RAG
    con docs mock; mide aciertos/alucinaciones y **calibra el umbral**. Corre en CI con mocks.
  - Regresión: los 64 tests actuales (46 backend + 18 frontend) siguen en verde.

## 10. Criterios de aceptación
- [ ] Tests en verde sin claves reales (incluye aislamiento por `tenant_id` y los 7 casos)
- [ ] Ejemplo ejecutable en `examples/04_rag_demo.py` (con `MockLLMProvider`)
- [ ] Respeta budget cap y límites del plan (cabe en Starter: 2.400 < 3.000 acciones)
- [ ] Métrica de negocio medible en la traza (intención, usó_RAG, similitud, si escaló)
- [ ] **0 respuestas inventadas** ante consultas sin info en docs (caso §4.3 y §4.7)
- [ ] Set dorado calibra el umbral y queda versionado para futuras regresiones

---

## Dependencias abiertas (del cliente, no de diseño — bloquean implementar, no aprobar)
1. **Documentos reales** (formato/volumen) → confirma si hay PDF/Sheets y cuántos
   (decide si el ingestor parsea PDF o solo texto/markdown al inicio).
2. **Cuenta 360dialog** (número + plantillas aprobadas) → trámite con Meta, en paralelo.
3. **Las 20-30 Q&A doradas** → se arman *con* el cliente en el onboarding.

## Specs hermanas
- El **webhook real de 360dialog** (firma HMAC + challenge, routing
  `phone_number_id → tenant`, 200 inmediato + BackgroundTask + dedup por `message_id`)
  también se grilló y va en **SPEC-005** (pendiente de escribir).
