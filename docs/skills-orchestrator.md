# Orquestador de skills

Cómo Claude Code debe **elegir y encadenar skills** según lo que pida el proyecto. En
Claude Code las skills se auto-activan por su descripción; este documento es la capa de
routing que dice *cuál preferir en cada fase* y *en qué orden*, para que el trabajo en
este repo sea consistente.

> Para Claude Code: antes de una tarea no trivial, identifica el "tipo de pedido" en la
> tabla, activa la skill correspondiente y respeta el orden de la sección "Pipeline".

## 1. Routing por tipo de pedido

| Si el proyecto pide…                              | Skill / plugin a usar                          | Nota |
|---------------------------------------------------|------------------------------------------------|------|
| Nueva feature o agente                            | (spec-driven local) → `specs/SPEC-TEMPLATE.md` | Primero la spec, siempre |
| Diseñar arquitectura / decisión técnica           | `engineering:architecture`, `engineering:system-design` | |
| Revisar código (calidad, bugs)                    | `engineering:code-review` + `/review` (built-in) | |
| **Seguridad** / revisión de vulnerabilidades      | `/security-review` (built-in) + `engineering:code-review` | Antes de cada release |
| Estrategia de tests                               | `engineering:testing-strategy`                 | Las pruebas van antes de implementar |
| **Optimización** / performance / deuda técnica    | `engineering:tech-debt`                        | |
| **Limpiar proyecto** / refactor / orden           | `engineering:tech-debt` + `engineering:code-review` | |
| Checklist de deploy / release                     | `engineering:deploy-checklist`                 | |
| Respuesta a incidentes                            | `engineering:incident-response`                | |
| **UX/UI**, design system, copy de interfaz        | `design:design-system`, `design:ux-copy`, `design:design-critique` | Para el dashboard Next.js |
| Accesibilidad                                     | `design:accessibility-review`                  | |
| Diseño → código (componentes)                     | `figma:figma-use`, `figma:figma-code-connect`  | |
| **Gestión** / specs de producto / roadmap / sprint| `product-management:write-spec`, `:roadmap-update`, `:sprint-planning` | Rol "manager" |
| Organizar tareas del día / memoria de contexto    | `productivity:task-management`, `:memory-management` | |
| Integración WhatsApp / mensajería / OTP / Verify  | `twilio-developer-kit:*` (ej. `twilio-whatsapp-send-message`, `twilio-security-hardening`) | Directo para el conector WhatsApp real |
| Documento (.docx) / planilla (.xlsx) / .pptx / .pdf | skills `docx` / `xlsx` / `pptx` / `pdf`       | Entregables al cliente |

## 2. Pipeline por fase de una entrega (orden recomendado)

Para construir o cambiar un agente, encadena las skills en este orden:

1. **Planificar** — `product-management:write-spec` → escribe/actualiza `specs/NNN-*.md`.
2. **Arquitectura** (si aplica) — `engineering:architecture` / `system-design`.
3. **Tests primero** — `engineering:testing-strategy` → pruebas simuladas que fallan.
4. **Implementar** — código hasta que las pruebas pasen.
5. **Revisar** — `engineering:code-review` + `/review`.
6. **Seguridad** — `/security-review` (datos Ley 19.628, secrets, PII en logs).
7. **Optimizar / limpiar** — `engineering:tech-debt` (sin romper tests).
8. **UX** (si toca el dashboard) — `design:design-critique`, `design:accessibility-review`.
9. **Deploy** — `engineering:deploy-checklist`.

## 3. Reglas del orquestador

- **No saltar la spec.** Cualquier pedido de feature pasa primero por
  `product-management:write-spec` o la plantilla local.
- **Seguridad es bloqueante.** Ningún merge a `main` sin `/security-review` en verde,
  especialmente por la Ley 19.628 (PII, datos financieros).
- **UX solo en el frontend.** Las skills `design:*` y `figma:*` se activan cuando el
  pedido toca `frontend/`, no para cambios de backend.
- **Una skill por responsabilidad.** Si dos podrían aplicar, gana la más específica
  (ej. `tech-debt` sobre `code-review` para una limpieza).
- **Documentar la elección.** En el PR/commit, menciona qué skills se usaron y por qué
  (trazabilidad, igual que las trazas de los agentes).

## 4. Skills built-in que ya tienes (sin instalar)
`/init`, `/review`, `/security-review`, y las de documentos `docx`, `xlsx`, `pptx`,
`pdf`. Las demás vienen de los plugins recomendados (ver tarjetas de instalación).
