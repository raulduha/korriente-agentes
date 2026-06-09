# SPEC-001: Clasificador y respondedor de leads WhatsApp

- **Estado**: implementada
- **Autor**: Korriente
- **Fecha**: 2026-06
- **Caso de éxito base (Playbook)**: TechFlow (respuesta 36h → 28s) / Klarna (volumen).

## 1. Problema (en lenguaje del cliente)
"Me llegan consultas por WhatsApp a toda hora. Si no contesto en minutos, el cliente se
va a la competencia. No puedo tener a alguien pegado al teléfono 24/7."

## 2. Métrica de negocio
- **Tiempo de respuesta a leads**: base 36 h → meta < 2 min.
- **Cobertura**: 100% de mensajes recibidos clasificados y atendidos o derivados 24/7.

## 3. Alcance
- **Incluye**: recibir mensaje, clasificar intención, responder consultas simples,
  registrar lead, derivar a humano lo sensible.
- **NO incluye**: cerrar ventas, cotizaciones con precios dinámicos, soporte técnico
  profundo. (Eso escala a humano.)

## 4. Comportamiento esperado (casos)

| # | Input (mensaje WhatsApp) | Comportamiento esperado | ¿Escala a humano? |
|---|--------------------------|-------------------------|-------------------|
| 1 | "Hola, cuánto cuesta el plan?" | intención=`cotizacion`, responde con info general + pide datos, crea lead prioridad alta en CRM | No (lead caliente, sigue humano) |
| 2 | "A qué hora abren?" | intención=`consulta`, responde automático con horario | No |
| 3 | "Llevo 3 días esperando y nadie responde, pésimo servicio" | intención=`reclamo`, mensaje empático + alerta a ejecutivo | **Sí** |
| 4 | "Gana plata fácil click aquí http://..." | intención=`spam`, no responde, no crea lead | No (se ignora) |
| 5 | mensaje con baja confianza del clasificador | deriva a humano con el contexto | **Sí** |

## 5. Política Human-in-the-loop
Escala a humano si: intención = `reclamo`; confianza del clasificador < 0,6; el mensaje
menciona monto/contrato/legal; o el cliente pide explícitamente hablar con una persona.

## 6. Conectores (tools)
`whatsapp` (responder), `crm` (crear/actualizar lead), `sheets` (log para reporting).

## 7. Datos y Ley 19.628
PII tocada: nombre, teléfono, texto del mensaje. Se guarda lo mínimo para seguimiento.
Teléfono se enmascara en logs (`+569****1234`). No se guardan datos bancarios.

## 8. Costo y plan
Modelo por defecto: `mini` (clasificación barata). Costo por corrida ≈ WhatsApp 1 conv
(US$0,03–0,10) + LLM ~US$0,0004. Entra en **todos los planes** (es el agente base de
Starter). Respeta `included_conversations` y `budget_cap`.

## 9. Plan técnico
- Archivos: `app/agents/lead_classifier.py`, prompt en el mismo módulo, registro en
  `app/agents/registry.py`.
- Prompt: clasificar en {cotizacion, consulta, reclamo, spam} + confianza 0–1 + draft
  de respuesta. Salida JSON estricta.
- Pruebas: `tests/agents/test_lead_classifier.py` con `MockLLMProvider` programado por
  caso de la tabla §4.

## 10. Criterios de aceptación
- [x] Tests en verde sin claves reales
- [x] Ejemplo en `examples/01_lead_classifier_demo.py`
- [x] Respeta budget cap y límites del plan
- [x] Traza incluye intención, confianza, costo y si escaló
