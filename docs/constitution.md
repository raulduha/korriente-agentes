# Constitución de Korriente Agentes

Principios no negociables. Cuando una decisión técnica entra en conflicto con un
principio, gana el principio. Toda spec y todo PR debe poder citar qué principios
respeta.

## 1. Vendemos resultados, no tecnología
Cada agente declara una **métrica de negocio** (ej: "tiempo de respuesta a leads
< 2 min", "% de facturas pagadas a tiempo"). Si un agente no mueve una métrica que
el cliente entiende, no se construye. El cliente no compra "RAG con memoria
vectorial"; compra que sus leads se respondan solos las 24 horas.

## 2. El costo siempre está bajo control
- Cada plan tiene un `budget_cap` mensual (USD). El runtime **bloquea** llamadas
  pagadas al superarlo y avisa al 80%.
- Por defecto usamos el modelo **más barato que cumple** la tarea (clasificar/extraer
  con modelos "mini/haiku"; razonamiento complejo solo cuando se justifica).
- Cada llamada al LLM se contabiliza (tokens + costo estimado). Sin medición, no hay
  producto: hay sorpresa en la factura del cliente.

## 3. PyME-first: nunca cobramos más de lo que la PyME puede pagar
El pricing tiene límites de uso explícitos para que el cliente no se exceda sin
querer. Preferimos un cliente que crece de plan a un cliente con una factura que no
esperaba. Ver `docs/pricing.md`.

## 4. Human-in-the-loop por diseño
Todo agente define **cuándo escala a un humano** (umbral de confianza, tipo de caso,
monto, reclamo, datos sensibles). El agente maneja volumen; el humano maneja sutileza.
Nunca dejamos que el agente decida solo en casos emocionales, legales o de alto monto.

## 5. Provider-agnóstico
El LLM se accede únicamente vía `app/llm/base.py:LLMProvider`. Ningún SDK de proveedor
se importa fuera de `app/llm/providers/`. Cambiar de OpenAI a Anthropic/Gemini/modelo
local debe ser un cambio de configuración, no de código de agentes.

## 6. Datos chilenos con cuidado (Ley 19.628)
- **Minimización**: se guarda lo mínimo necesario.
- **Nunca** datos de tarjetas ni cuentas bancarias en claro.
- Política de privacidad visible y cláusula de tratamiento de datos en cada contrato
  (Korriente = encargado del tratamiento; el cliente = responsable).
- PII se enmascara en logs.

## 7. Spec antes que código; pruebas antes que implementación
Ningún agente o feature se programa sin spec aprobada en `specs/`. Las pruebas
simuladas (mock LLM + mock conectores) se escriben primero y deben correr sin claves
reales ni costo. Un agente sin pruebas no entra a producción.

## 8. Plantillas reutilizables, entrega más rápida cada vez
Cada agente entregado debe dejar componentes reutilizables (prompts, conectores,
checklists). Un agente nuevo del mismo tipo debe tomar ≥50% menos tiempo que el
anterior. La fábrica mejora con cada cliente.

## 9. Observabilidad
Cada corrida de agente deja una traza: input, decisiones, herramientas usadas, costo,
y si escaló a humano. Sin traza no se puede depurar ni mostrar ROI al cliente.

## 10. Español de Chile de cara al usuario
Todo texto que ve el cliente final o el usuario PyME está en español chileno, claro y
sin jerga técnica.
