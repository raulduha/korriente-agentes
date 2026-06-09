# SPEC-NNN: <nombre del agente o feature>

> Copia este archivo a `specs/NNN-slug.md`, complétalo y apruébalo ANTES de escribir
> código. Sin spec aprobada no hay implementación (ver `CLAUDE.md`).

- **Estado**: borrador | aprobada | implementada
- **Autor**:
- **Fecha**:
- **Caso de éxito base (Playbook)**:

## 1. Problema (en lenguaje del cliente)
Qué le duele a la PyME, en sus palabras. Sin jerga técnica.

## 2. Métrica de negocio
La única métrica que define si esto sirve. Ej: "tiempo de respuesta a leads < 2 min".
Incluye línea base y meta.

## 3. Alcance
- **Incluye**:
- **NO incluye** (explícito, para no sobre-construir):

## 4. Comportamiento esperado (casos)
Lista de escenarios con input → comportamiento esperado. Estos se convierten en tests.

| # | Input | Comportamiento esperado | ¿Escala a humano? |
|---|-------|-------------------------|-------------------|
| 1 |       |                         |                   |

## 5. Política Human-in-the-loop
Cuándo el agente NO decide solo (umbral de confianza, monto, reclamo, datos sensibles).

## 6. Conectores (tools) necesarios
Lista de `app/tools/*`. Si falta alguno, primero su feature/spec.

## 7. Datos y Ley 19.628
Qué PII se toca, qué se guarda, qué NUNCA se guarda, cómo se enmascara en logs.

## 8. Costo y plan
Modelo LLM por defecto, costo estimado por corrida, en qué plan(es) entra y si
respeta los límites del plan.

## 9. Plan técnico
- Archivos a crear/tocar:
- Prompt(s):
- Casos de prueba (mock LLM + mock conectores):

## 10. Criterios de aceptación
- [ ] Tests en verde sin claves reales
- [ ] Ejemplo ejecutable en `examples/`
- [ ] Respeta budget cap y límites del plan
- [ ] Métrica de negocio medible en la traza
