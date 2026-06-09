# SPEC-003: Persistencia (SQLite) de tenants, uso y trazas

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06
- **Caso de éxito base**: requisito de Fase 1 (M1) — el panel debe mostrar datos reales
  y el conteo de uso/budget no puede perderse al reiniciar el backend.

## 1. Problema (en lenguaje del cliente)
"Si el sistema se reinicia, no quiero que se borre cuánto se ha usado este mes ni qué
plan tiene cada cliente. La facturación y los topes dependen de eso."

## 2. Métrica de negocio
Exactitud del conteo de uso/budget tras reinicios (cero pérdida) y trazabilidad
histórica visible en el panel.

## 3. Alcance
- **Incluye**: persistir plan por tenant, uso mensual (conversaciones, acciones LLM,
  costo) y trazas de corridas. Backend intercambiable: memoria (default) o SQLite.
- **NO incluye**: PostgreSQL, migraciones, multi-proceso/locks avanzados (eso es Fase 2).

## 4. Comportamiento esperado (casos)

| # | Acción | Esperado |
|---|--------|----------|
| 1 | set_plan + record, cerrar y reabrir con misma DB | el uso persiste |
| 2 | snapshot tras reabrir | refleja el uso guardado |
| 3 | guardar trazas, reabrir | las trazas siguen ahí, ordenadas |
| 4 | store en memoria (default) | comportamiento idéntico al actual (tests previos en verde) |
| 5 | reset_month | pone el uso del tenant en cero (y persiste) |

## 5. Política Human-in-the-loop
N/A (infraestructura). No cambia las reglas de escalamiento de los agentes.

## 6. Conectores (tools)
Ninguno nuevo.

## 7. Datos y Ley 19.628
Las trazas guardan texto de entrada/salida; se mantiene el enmascarado de PII de los
tools. No se agregan datos sensibles nuevos. La DB local debe estar fuera del control de
versiones (.gitignore ya cubre *.sqlite3/*.db).

## 8. Costo y plan
Sin costo de API. SQLite es local. No afecta budget cap.

## 9. Plan técnico
- `app/core/storage.py`: `Usage`, `UsageStore` (ABC), `InMemoryUsageStore`,
  `SQLiteUsageStore` (+ trazas).
- `app/core/limits.py`: `LimitsService` usa un `UsageStore` (default memoria). API
  pública intacta (`set_plan`, `get_usage`, `check`, `record`, `reset_month`, `snapshot`).
- `app/runtime/memory.py`: `Memory` acepta un store opcional para persistir trazas.
- `app/api/deps.py`: si `KORRIENTE_DB` está seteado, usa SQLite; si no, memoria.
- Tests: `tests/core/test_storage.py` (casos §4) usando un archivo temporal.

## 10. Criterios de aceptación
- [x] Los 37 tests previos siguen en verde (default en memoria)
- [x] SQLite persiste plan, uso y trazas entre instancias
- [x] `KORRIENTE_DB` activa SQLite sin tocar código de agentes
