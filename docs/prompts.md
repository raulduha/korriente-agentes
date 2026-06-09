# Biblioteca de prompts — Korriente Agentes (Claude Code)

Prompts listos para copiar/pegar. Están pensados para disparar la skill correcta y
respetar el flujo del repo (spec → tests → implementar → revisar → **seguridad** →
optimizar/limpiar → UX → deploy). Ver `docs/skills-orchestrator.md`.

> Tip: empieza pidiendo un plan ("hazme un plan, no escribas código todavía") y recién
> después "implementa". Y di siempre "no toques claves reales, usa mocks".

---

## 0. Arranque / contexto
```
Lee CLAUDE.md, docs/constitution.md y docs/skills-orchestrator.md y dime en 5 líneas
cómo vas a trabajar en este repo.
```
```
Dame un resumen del estado actual: agentes, conectores, pricing y qué falta según
tasks/tasks.md.
```

## 1. Crear un agente nuevo (flujo spec-driven completo)
```
Quiero un agente nuevo: <describe el problema de la PyME>. Primero crea la spec en
specs/ usando specs/SPEC-TEMPLATE.md. No escribas código todavía.
```
```
Revisemos la spec specs/NNN-*.md: cuestiona el alcance, la métrica de negocio y la
política Human-in-the-loop antes de aprobarla.
```
```
Con la spec aprobada, escribe primero las pruebas simuladas (mock LLM + conectores en
modo mock) que describan el comportamiento. Deben fallar primero.
```
```
Ahora implementa el agente hasta que las pruebas pasen. Hereda de runtime/agent.py:Agent,
declara su AgentSpec y respeta el budget cap.
```
```
Agrega un ejemplo ejecutable en examples/ que corra con MockLLMProvider, y corre pytest.
```

### Ejemplos concretos de agentes (backlog)
```
Crea el agente de triage/intake (caso salud): clasifica urgencia y escala a humano de
forma obligatoria sobre cierto umbral. Spec primero.
```
```
Crea el agente generador de documentación (actas/informes) que reduce el tiempo de
redacción. Spec primero, con cuidado de Ley 19.628.
```

## 2. WhatsApp real (Twilio) — usa el plugin twilio-developer-kit
```
Quiero conectar WhatsApp real con Twilio detrás del WhatsAppTool actual (hoy en mock).
Primero un plan: qué necesito (sender, plantillas aprobadas, webhook), reglas anti-baneo
y ventana de 24h. No escribas código aún.
```
```
Implementa el modo real del WhatsAppTool (app/tools/whatsapp.py) usando Twilio, dejando
el modo mock intacto para los tests. Valida la firma del webhook entrante.
```
```
Explícame el flujo de plantillas (Content API) para los recordatorios de cobranza que
inicia la empresa, y cómo respetar el opt-in.
```
```
Configura el webhook de mensajería entrante de Twilio hacia /webhooks/message y muéstrame
cómo probarlo localmente con un túnel.
```

## 3. Trazas en el panel
```
Quiero ver en el dashboard las trazas por agente (qué hizo, costo, si escaló). Plan
primero: endpoint, lectura desde el store SQLite y vista en frontend.
```
```
Implementa el endpoint y una vista en frontend/app/dashboard que liste las últimas
trazas de un tenant, con su costo y si escaló a humano. Agrega tests.
```

## 4. Alertas al 80% y 100%
```
Implementa alertas: cuando un tenant llega al 80% de conversaciones o budget, avisar; al
100%, notificar que se está derivando a humano. Spec + tests primero.
```

## 5. Seguridad (paso bloqueante — antes de cada merge)
```
/security-review
```
```
Revisa el backend buscando: secretos en código, PII sin enmascarar en logs, validación
de input en los webhooks y cumplimiento de Ley 19.628. Prioriza por riesgo.
```
```
Audita el manejo de datos de cobranza: confirma que nunca se guardan datos bancarios en
claro y que el tono de los mensajes no es intimidatorio.
```

## 6. Optimización / limpieza / deuda técnica
```
Haz una auditoría de deuda técnica del runtime y los conectores y dame un plan priorizado
sin romper los tests.
```
```
Optimiza el conteo de uso/límites para muchos tenants sin cambiar la API pública de
LimitsService. Mide antes y después.
```
```
Limpia el proyecto: imports muertos, nombres inconsistentes y duplicación entre agentes.
No cambies comportamiento; los tests deben seguir verdes.
```

## 7. UX/UI del frontend (plugins design + figma)
```
Haz una crítica de UX de la landing (frontend/app/page.tsx): jerarquía, claridad y
conversión. Dame cambios concretos.
```
```
Audita accesibilidad (contraste, foco de teclado, tamaños) de la landing y el dashboard
y corrige lo que se pueda.
```
```
Revisa el copy de la interfaz (botones, estados vacíos, errores del panel) en español de
Chile, claro y sin jerga.
```
```
Convierte este diseño de Figma <pega link> en componentes Next.js usando nuestros estilos
de globals.css.
```

## 8. Tests
```
Define la estrategia de pruebas para <feature> y escribe los casos faltantes. Backend con
pytest y mocks; frontend con Vitest sobre la lógica pura.
```
```
Corre toda la suite (backend pytest + frontend npm test) y arregla lo que falle.
```

## 9. Deploy
```
Prepárame un checklist de deploy para la Fase 1 (Railway/Render): variables de entorno,
KORRIENTE_DB, secrets, y verificación post-deploy.
```
```
Configura GitHub Actions para correr pytest y npm test en cada push.
```

## 10. Gestión (product-management + productivity)
```
Actualiza tasks/tasks.md: marca lo hecho y reprioriza el backlog de M1 según impacto.
```
```
Arma un sprint de 1 semana con lo más valioso del backlog y estima capacidad.
```
```
Escríbeme un update de avance para un stakeholder no técnico (qué se hizo, qué sigue,
riesgos).
```

## 11. Comandos slash útiles (los tecleas tú)
```
/security-review        # revisión de seguridad de los cambios
/review                 # revisión general de un PR/diff
/engineering:code-review
/engineering:tech-debt
/engineering:architecture
/design:accessibility-review
/design:design-critique
/product-management:write-spec
/product-management:sprint-planning
/productivity:task-management
```

---

### Reglas de oro al promptear aquí
1. Pide **plan antes de código** en tareas no triviales.
2. Exige **spec antes de implementar** para agentes/features nuevos.
3. Recuerda **mocks, sin claves reales** en pruebas y ejemplos.
4. **Seguridad antes de mergear** (`/security-review`), sobre todo por datos (Ley 19.628).
5. Pide que **corra los tests** al final y deje todo en verde.
