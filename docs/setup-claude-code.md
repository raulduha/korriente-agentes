# Configurar Claude Code para este proyecto

Korriente Agentes usa skills/plugins del marketplace **knowledge-work-plugins**. Estos
plugins se instalan a nivel de tu cuenta de Claude (no se copian dentro del repo), y el
proyecto solo **declara** cuáles usar para que tú y tu equipo tengan el mismo set.

## Plugins recomendados (y para qué)

| Plugin                  | Para qué en este repo |
|-------------------------|-----------------------|
| `engineering`           | code-review, arquitectura, testing, deuda técnica, deploy |
| `design`                | UX/UI del frontend: design system, copy, accesibilidad |
| `figma`                 | diseño → código de componentes Next.js |
| `product-management`    | specs, roadmap, sprint planning (rol manager) |
| `productivity`          | gestión de tareas y memoria de contexto |
| `twilio-developer-kit`  | WhatsApp/mensajería real + endurecimiento de seguridad |

Más built-in que ya trae Claude Code: `/init`, `/review`, `/security-review`, y las de
documentos (`docx`, `xlsx`, `pptx`, `pdf`). El routing de cuándo usar cada una está en
`docs/skills-orchestrator.md`.

## Paso 1 — Agregar el marketplace e instalar (terminal)

El marketplace es el repo público `anthropics/knowledge-work-plugins`. Usa la URL
**HTTPS** para evitar el error de SSH ("Host key verification failed").

Desde una terminal normal (no dentro del REPL):

```bash
claude plugin marketplace add https://github.com/anthropics/knowledge-work-plugins.git
claude plugin install engineering@knowledge-work-plugins
claude plugin install design@knowledge-work-plugins
claude plugin install figma@knowledge-work-plugins
claude plugin install product-management@knowledge-work-plugins
claude plugin install productivity@knowledge-work-plugins
claude plugin install twilio-developer-kit@knowledge-work-plugins
```

O dentro de Claude Code con `/plugin`: en el campo "Enter marketplace source" escribe
**solo** la URL (no pegues los comandos de install ahí):

```
https://github.com/anthropics/knowledge-work-plugins
```

y luego corre cada `/plugin install <nombre>@knowledge-work-plugins` por separado.

(Si ya los agregaste desde las tarjetas de instalación de Cowork, puede que ya estén.)

## Paso 2 — Declararlos en el proyecto (compartido)
Copia el archivo de ejemplo a la config del proyecto:

```powershell
# Windows PowerShell, desde la carpeta del repo
Copy-Item claude-settings.example.json .claude\settings.json
```

```bash
# macOS / Linux / WSL
cp claude-settings.example.json .claude/settings.json
```

`.claude/settings.json` es la config **compartida** (se commitea). Tu
`.claude/settings.local.json` es personal y va en `.gitignore`.

## Paso 3 — Reiniciar Claude Code
Cierra y reabre el proyecto en Claude Code. Las skills se activan solas por su
descripción cuando pides algo que calza (ver el orquestador). No hay que "ejecutarlas"
a mano.

## Nota
No es posible instalar plugins/skills desde una sesión de Cowork: la instalación es una
acción de tu cuenta (Configuración › Capabilities o las tarjetas de instalación). Este
repo deja todo declarado y documentado para que tu Claude Code los tenga en cuenta.
