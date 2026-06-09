# Workflows n8n — Korriente Agentes

Plantillas de automatización listas para importar en [n8n](https://n8n.io). Las descargas,
las importas en tu propia instancia y las adaptas a cada empresa. Son archivos JSON
abiertos: puedes leerlos enteros antes de usarlos.

> Versión bonita y documentada: la página `/workflows` del sitio.

## Qué incluye

| Archivo | Qué hace |
|---------|----------|
| `workflows/01-lead-classifier-whatsapp.json` | Clasifica leads de WhatsApp (cotización/consulta/reclamo/spam), responde o escala a humano. |
| `workflows/02-cobranza-recordatorios.json` | Revisa facturas vencidas, redacta recordatorios cordiales y los envía; escala montos altos. |
| `workflows/03-orquestador-marketing.json` | Orquestador multi-agente: reparte el trabajo a 3 workers y sintetiza un plan. |
| `workflows/workers/worker-analisis-mercado.json` | Worker: análisis de mercado. |
| `workflows/workers/worker-copywriter.json` | Worker: copywriting publicitario. |
| `workflows/workers/worker-seo-keywords.json` | Worker: keywords y SEO. |

## Instalación (4 pasos)

1. **Descarga** el `.json` que quieras.
2. **Impórtalo** en n8n: menú `⋯` → *Import from File* → elige el archivo.
3. **Conecta tu API key**: crea una credencial *Header Auth* con
   `Name: x-api-key` y `Value: <tu llave>`, y asígnala a cada nodo **LLM**.
4. **Prueba y conecta tus canales**: corre el flujo con datos de ejemplo, reemplaza las URLs
   de ejemplo (ERP, WhatsApp, email) por las tuyas, y actívalo.

### Orquestador multi-agente
Importa también los 3 workers de `workflows/workers/`. Luego, en el orquestador, reasigna
cada nodo **«Llamar worker»** al workflow correspondiente (campo *Workflow*). Para sumar un
especialista nuevo, duplica un worker, cámbiale el prompt del nodo *Config* y engánchalo.

## Modelo de IA y costo

Todos usan **Anthropic** por defecto (`claude-haiku-4-5`, económico) vía un nodo
`HTTP Request` a `https://api.anthropic.com/v1/messages`. Para cambiar de modelo, edita el
nodo **Config** de cada flujo. Para cambiar de proveedor, ajusta URL, headers y el parseo de
la respuesta en el nodo LLM.

Costo referencial (junio 2026):
- Clasificar / extraer (haiku): ≈ US$0,0002–0,0005 por acción.
- Razonar / sintetizar (sonnet): ≈ US$0,003–0,01 por acción.
- WhatsApp/email va aparte: ≈ US$0,03–0,10 por conversación.

> Estima tu costo mensual: `acciones/mes × costo por acción`. Fija un tope de gasto en el
> panel de tu proveedor de IA para no tener sorpresas.

## Seguridad

- La API key **nunca** va dentro del `.json`: se guarda como credencial cifrada en n8n.
- Una llave por entorno (prueba/producción), permisos mínimos, rótala si se filtra.
- **Ley 19.628**: los flujos enmascaran datos personales en logs (ej. `+569****1234`), no
  guardan datos bancarios y usan tono respetuoso (sin amenazas en cobranza).

## Adaptar a un cliente

- Edita el nodo **Config** (modelo, umbrales, prompts) — es el único lugar que toca el negocio.
- Reemplaza las URLs `https://TU-...` por tu ERP, planilla o proveedor de mensajería.
- Borra ramas que no uses (ej. un worker que no apliques) sin romper el resto.
