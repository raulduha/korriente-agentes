# SPEC-010: Página pública "Modelo de negocio"

- **Estado**: aprobada
- **Autor**: Raúl + Claude
- **Fecha**: 2026-06-10
- **Caso de éxito base (Playbook)**: transparencia radical como argumento de venta
  (mismo espíritu de `/como-funciona`: "sin letra chica").

## 1. Problema (en lenguaje del cliente)
"Entiendo qué hace el agente, pero no entiendo qué estoy comprando exactamente:
¿es un software?, ¿una consultoría?, ¿quedo amarrado?, ¿quién opera esto?,
¿por qué cobran un setup y además una mensualidad?". La falta de claridad sobre el
**modelo comercial** frena la decisión de compra tanto como las dudas técnicas.

## 2. Métrica de negocio
Que ningún prospecto llegue a la reunión de diagnóstico sin entender el modelo
(servicio gestionado: setup + suscripción, pausa-no-cancela, cambios por solicitud).
Proxy medible: menos preguntas comerciales repetidas en el diagnóstico; la página se
usa como material de venta enviable por WhatsApp.

## 3. Alcance
- **Incluye**: página estática `/modelo-negocio` en el frontend, en español de Chile,
  con: qué compras (servicio gestionado, no software), los dos componentes de cobro
  (setup único + suscripción) con los precios reales de `lib/plans.ts`, las 4 reglas
  del modelo (pausa-no-cancela, ves-no-editas, cambios menores incluidos/mayores
  cotizados, tope de gasto), comparación honesta contra las 3 alternativas (contratar
  una persona, agencia tradicional, armarlo uno mismo), incentivos alineados, FAQ y CTA.
  Link en la navegación principal.
- **NO incluye**: contenido interno del plan estratégico (`docs/plan-negocio.md`:
  estado de clientes, márgenes internos, secuencia de specs). Nada de backend ni
  lógica nueva; los precios se importan de `PLANS_FALLBACK` para no duplicar fuentes.

## 4. Comportamiento esperado (casos)
Página estática: no hay casos input→output. Criterio editorial: cada afirmación de la
página debe ser consistente con `docs/plan-negocio.md`, `docs/pricing.md` y
`/como-funciona` (mismos precios, mismas reglas de pausa/tope/cambio de plan).

## 5. Política Human-in-the-loop
N/A (contenido estático). La página declara explícitamente que los cambios al agente
los implementa un humano de Korriente (SPEC-009).

## 6. Conectores (tools) necesarios
Ninguno.

## 7. Datos y Ley 19.628
No captura datos. Solo menciona el tratamiento de datos como parte de la promesa.

## 8. Costo y plan
Sin costo de LLM. Los precios mostrados provienen de `frontend/lib/plans.ts`
(única fuente de verdad del frontend, alineada con `backend/app/core/pricing.py`).

## 9. Plan técnico
- Archivos a crear/tocar:
  - `frontend/app/modelo-negocio/page.tsx` (nueva, server component, sin JS cliente)
  - `frontend/app/layout.tsx` (link "Modelo" en la nav)
- Prompt(s): N/A
- Casos de prueba: N/A (el frontend no tiene suite de tests; verificación manual
  con `npm run dev` + revisión de consistencia de precios).

## 10. Criterios de aceptación
- [x] Precios renderizados desde `PLANS_FALLBACK` (sin números duplicados a mano)
- [x] Reglas del modelo idénticas a las de `docs/plan-negocio.md` §1
- [x] Cero información interna sensible (márgenes, estado de clientes, roadmap interno)
- [x] Link visible en la navegación y CTA hacia diagnóstico
