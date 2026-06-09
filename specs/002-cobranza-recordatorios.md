# SPEC-002: Cobranza y recordatorios de pago

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06
- **Caso de éxito base (Playbook)**: documentación/operaciones (comunicación repetitiva
  con seguimiento) + supply chain (marca excepciones, no pausa todo).

## 1. Problema (en lenguaje del cliente)
"Tengo facturas que se atrasan porque nadie hace el seguimiento. Mandar recordatorios uno
por uno me consume horas y muchas veces se me pasan."

## 2. Métrica de negocio
- **% facturas pagadas a tiempo**: sube.
- **Días promedio de cobro (DSO)**: baja.
- **Horas de seguimiento manual**: bajan.

## 3. Alcance
- **Incluye**: revisar lista de facturas, decidir a quién recordar y por qué canal,
  redactar recordatorio cordial y personalizado, enviarlo, agendar siguiente toque,
  escalar a humano según monto/intentos/disputa.
- **NO incluye**: negociar condiciones de pago, cobranza judicial, prometer descuentos.

## 4. Comportamiento esperado (casos)

| # | Input (factura) | Comportamiento esperado | ¿Escala a humano? |
|---|-----------------|-------------------------|-------------------|
| 1 | Vence en 3 días, monto bajo | recordatorio cordial "pre-vencimiento" por canal preferido | No |
| 2 | Vencida 5 días, monto bajo | recordatorio firme pero respetuoso, agenda re-toque en 4 días | No |
| 3 | Vencida, **monto sobre umbral** (ej. > $2.000.000) | NO envía solo; prepara borrador y avisa a humano | **Sí** |
| 4 | Cliente respondió "está en disputa" | detiene secuencia, escala a humano | **Sí** |
| 5 | 3er intento sin respuesta | escala a humano para gestión personal | **Sí** |

## 5. Política Human-in-the-loop
Escala si: monto > umbral del cliente; hay disputa/queja; se alcanzó el máximo de
intentos automáticos; o el tono requerido sería intimidatorio (no permitido).

## 6. Conectores (tools)
`sheets`/`crm` (leer facturas y estado), `whatsapp` y `email` (enviar), `sheets`
(registrar gestión).

## 7. Datos y Ley 19.628
PII: nombre, contacto, factura/monto. **NUNCA** datos de tarjeta ni cuenta bancaria en
claro. Tono cordial, no intimidatorio. Minimización: solo lo necesario para el cobro.

## 8. Costo y plan
Modelo por defecto: `mini` (redacción corta). Costo por recordatorio ≈ 1 conv WhatsApp
o ~US$0 si email + LLM ~US$0,0005. Entra desde **Growth** (suele ser 2º agente).
Respeta límites y budget cap.

## 9. Plan técnico
- Archivos: `app/agents/cobranza.py`, registro en `app/agents/registry.py`.
- Prompt: dado el estado de la factura y reglas, decidir acción {recordar, esperar,
  escalar} + redactar mensaje. Salida JSON estricta.
- Pruebas: `tests/agents/test_cobranza.py` cubriendo los 5 casos de §4, incluyendo el
  umbral de monto y el límite de intentos.

## 10. Criterios de aceptación
- [x] Tests en verde sin claves reales
- [x] Ejemplo en `examples/02_cobranza_demo.py`
- [x] Nunca envía sobre el umbral sin humano
- [x] No guarda datos bancarios; tono cordial verificado en tests
