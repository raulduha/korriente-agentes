# Pricing y límites (PyME-first)

Objetivo: que el cliente **nunca reciba una factura que no esperaba**. Cada plan tiene
límites de uso explícitos y un tope de gasto interno (`budget_cap`). Por defecto el
límite es **duro** (se bloquea y se avisa); el "overage" es opcional y se activa solo
con consentimiento del cliente.

> Fuente de verdad: `backend/app/core/pricing.py`. Esta tabla y ese archivo deben
> coincidir. Si cambias precios, cámbialos en ambos y corre los tests.

## Suscripción (cliente PyME final)

| Plan       | Setup (1 vez) | Mensual    | Agentes | Canales | Integr. | Conversaciones/mes | Acciones LLM/mes | Tope gasto interno |
|------------|---------------|------------|---------|---------|---------|--------------------|------------------|--------------------|
| Starter    | $490.000 CLP  | $290.000   | 1       | 1       | 2       | 800                | 3.000            | US$ 60             |
| Growth     | $990.000 CLP  | $590.000   | 3       | 2       | 5       | 2.500              | 10.000           | US$ 180            |
| Pro        | $1.900.000 CLP| $1.190.000 | 6       | 4       | ∞       | 8.000              | 30.000           | US$ 500            |
| Enterprise | a medida      | desde $3.500.000 | ∞ | ∞     | ∞       | a medida           | a medida         | a medida           |

Precios en CLP, + IVA 19%. Tipo de cambio referencial ~$950 CLP/US$ (junio 2026).

### A quién apunta cada plan
- **Starter** — PyME 10–50 empleados, primer contacto con IA. Un proceso, un canal.
  Pensado para validar ROI rápido y barato.
- **Growth** — Empresa 50–200, un proceso crítico + soporte multicanal.
- **Pro** — Varios procesos automatizados, multicanal.
- **Enterprise** — Custom, SLA 99.9%, compliance. (Va por el flujo consultivo del
  Playbook, no por autoservicio.)

## Cómo se protege al cliente de sobrepasarse

1. **Límite duro por defecto.** Al llegar al 100% de conversaciones o del `budget_cap`,
   el runtime deja de hacer llamadas pagadas y notifica. Los mensajes entrantes se
   encolan o se derivan a humano; no se pierde el lead, pero no se gasta de más.
2. **Alerta al 80%.** Se avisa al cliente y a Korriente antes de llegar al tope.
3. **Overage opcional y acotado.** Si el cliente lo activa por escrito, se permite
   exceder con un precio por conversación fijo y conocido (Starter $350, Growth $300,
   Pro $250 CLP por conversación extra), también con un tope máximo.
4. **Budget cap en USD** sobre el costo real de APIs (WhatsApp + LLM). Aunque el conteo
   de conversaciones no se haya agotado, si el costo real se dispara, se frena.

## De dónde salen los costos (para fijar márgenes)

| Componente            | Costo aprox.                          |
|-----------------------|---------------------------------------|
| WhatsApp Business API | US$ 0,03–0,10 por conversación        |
| LLM (clasificar/extraer, modelo "mini/haiku") | US$ 0,0002–0,0005 por acción |
| LLM (razonamiento complejo)                   | US$ 0,003–0,01 por acción   |
| Infra (VPS + DB)      | US$ 10–30 / mes por tenant (Fase 1)   |

Ejemplo Starter: 800 conv × US$0,06 ≈ US$48 + LLM ~US$3 + infra ~US$15 = **~US$66 de
costo** vs. ~US$305 de ingreso → margen sano y headroom para el `budget_cap` de US$60.

## Relación con el Playbook (tiers consultivos)
El Playbook define tiers de **implementación consultiva** (Pilot/Core/Enterprise). Este
documento define la **suscripción del producto**, que es más barata de operar porque la
fábrica reduce el trabajo manual. Un cliente típico: setup consultivo (una vez) +
suscripción mensual del plan que corresponda.
