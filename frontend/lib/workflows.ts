// Catálogo de workflows n8n descargables. Fuente de los archivos: /public/n8n/workflows.
// Cada uno es una plantilla probada que el cliente importa y adapta a su negocio.

export type Workflow = {
  key: string;
  name: string;
  cat: string;
  ico: string;
  tagline: string;
  file: string;
  extras?: { name: string; file: string }[];
  queHace: string;
  escenarios: string[];
  flujo: string[];
  conectores: string[];
  modelo: string;
  costo: string;
  hitl: string;
  featured?: boolean;
};

export const WORKFLOWS: Workflow[] = [
  {
    key: "lead-classifier",
    name: "Clasificador de leads WhatsApp",
    cat: "Atención · Ventas",
    ico: "💬",
    tagline:
      "Recibe cada mensaje de WhatsApp, entiende la intención y responde o deriva a una persona en segundos.",
    file: "/n8n/workflows/01-lead-classifier-whatsapp.json",
    queHace:
      "Un webhook recibe el mensaje entrante. Un modelo económico lo clasifica (cotización, consulta, reclamo o spam) con un nivel de confianza, redacta una respuesta y decide si lo resuelve solo o lo escala a tu equipo.",
    escenarios: [
      "«¿Cuánto cuesta el plan?» → cotización: responde con info general y marca lead caliente.",
      "«¿A qué hora abren?» → consulta: responde el horario al instante, 24/7.",
      "«Llevo 3 días esperando, pésimo servicio» → reclamo: mensaje empático y alerta a un ejecutivo.",
      "«Gana plata fácil, click aquí» → spam: lo ignora, no crea lead, no gasta.",
    ],
    flujo: [
      "WhatsApp entrante",
      "Config",
      "Extraer mensaje",
      "Clasificar (LLM)",
      "Decidir HITL",
      "¿Escala?",
      "Responder / Derivar",
    ],
    conectores: ["WhatsApp (webhook)", "LLM (Anthropic)", "CRM / Sheets (opcional)"],
    modelo: "claude-haiku-4-5 (económico)",
    costo: "≈ US$0,0004 por mensaje clasificado",
    hitl: "Reclamo, baja confianza, montos/legal o si piden una persona → humano.",
    featured: true,
  },
  {
    key: "cobranza",
    name: "Cobranza y recordatorios de pago",
    cat: "Finanzas · Operaciones",
    ico: "📄",
    tagline:
      "Revisa facturas vencidas, redacta recordatorios cordiales y los envía solo — escalando los casos delicados.",
    file: "/n8n/workflows/02-cobranza-recordatorios.json",
    queHace:
      "Cada mañana revisa tus facturas vencidas. Para cada una decide: si el monto es alto o ya hubo varios intentos, la deriva a un cobrador humano; si no, el modelo redacta un recordatorio cordial (no intimidatorio, Ley 19.628) y lo envía por WhatsApp o email.",
    escenarios: [
      "Factura de $80.000 vencida hace 5 días → recordatorio cordial automático por WhatsApp.",
      "Factura sobre el umbral ($2.000.000) → se escala a gestión humana, no se automatiza.",
      "Tercer intento sin respuesta → se marca para que una persona la tome.",
      "Cliente al día → no se le molesta (no entra al flujo).",
    ],
    flujo: [
      "Cada día 09:00",
      "Config",
      "Traer facturas",
      "¿Monto alto?",
      "Redactar (LLM)",
      "Enviar / Escalar",
    ],
    conectores: ["ERP / Sheets (facturas)", "LLM (Anthropic)", "WhatsApp o Email (envío)"],
    modelo: "claude-haiku-4-5 (económico)",
    costo: "≈ US$0,0005 por recordatorio redactado",
    hitl: "Monto sobre umbral, cliente delicado o disputa → humano.",
  },
  {
    key: "orquestador-marketing",
    name: "Orquestador de Marketing (multi-agente)",
    cat: "Marketing · Multi-agente",
    ico: "🧠",
    tagline:
      "Un agente orquestador reparte el trabajo a tres especialistas (mercado, copy, SEO) y une todo en un plan accionable.",
    file: "/n8n/workflows/03-orquestador-marketing.json",
    extras: [
      { name: "Worker · Análisis de mercado", file: "/n8n/workflows/workers/worker-analisis-mercado.json" },
      { name: "Worker · Copywriter", file: "/n8n/workflows/workers/worker-copywriter.json" },
      { name: "Worker · SEO", file: "/n8n/workflows/workers/worker-seo-keywords.json" },
    ],
    queHace:
      "Le das un objetivo (ej. «lanzar un nuevo plan contable»). El orquestador lo descompone en briefs y llama en paralelo a tres agentes trabajadores especializados. Cada uno hace su parte y un modelo más potente sintetiza todo en un plan de campaña ordenado. Es el patrón base para armar tu propio equipo de agentes: agregas o cambias workers según el negocio.",
    escenarios: [
      "Lanzamiento de producto → mercado da segmentos, copy da titulares, SEO da keywords → plan unificado.",
      "Campaña de temporada → cambias el objetivo y los tres workers se reusan tal cual.",
      "Tu propio equipo → duplicas un worker y creas «análisis financiero» o «soporte» con su propio prompt.",
    ],
    flujo: [
      "Objetivo",
      "Router (reparte)",
      "Worker Mercado",
      "Worker Copy",
      "Worker SEO",
      "Consolidar",
      "Sintetizar plan",
    ],
    conectores: ["LLM (Anthropic)", "3 sub-workflows (workers)", "Tu fuente de datos (opcional)"],
    modelo: "Router/workers: haiku · Síntesis: sonnet",
    costo: "≈ US$0,01–0,03 por plan completo (4 llamadas)",
    hitl: "Revisión humana del plan antes de ejecutar la campaña.",
    featured: true,
  },
];

// Pasos para instalar cualquiera de los workflows.
export const INSTALL_STEPS = [
  {
    n: 1,
    t: "Descarga el .json",
    d: "Toca «Descargar» en el workflow que quieras. Es un archivo de texto abierto — lo puedes leer y revisar antes de importarlo.",
  },
  {
    n: 2,
    t: "Impórtalo en n8n",
    d: "En tu n8n: menú ⋯ → Import from File → elige el .json. Aparece el flujo completo con sus nodos, listo para revisar.",
  },
  {
    n: 3,
    t: "Conecta tu API key",
    d: "Crea una credencial «Header Auth» (nombre x-api-key, valor tu llave del proveedor de IA) y asígnala a los nodos LLM. La llave queda guardada y cifrada en n8n, nunca dentro del archivo.",
  },
  {
    n: 4,
    t: "Prueba y conecta tus canales",
    d: "Corre el flujo con un dato de ejemplo. Luego reemplaza las URLs de ejemplo por tu WhatsApp, ERP o planilla. Cuando esté ok, actívalo.",
  },
];

// Por qué un cliente puede confiar en estas plantillas.
export const TRUST = [
  {
    t: "Abiertos y auditables",
    d: "Son archivos JSON que puedes leer entero antes de importar. Nada oculto, sin código compilado ni cajas negras.",
  },
  {
    t: "Tus llaves, cifradas",
    d: "Las API keys se cargan como credenciales de n8n (cifradas), nunca van escritas dentro del workflow que descargas.",
  },
  {
    t: "Costo bajo control",
    d: "Usan modelos económicos por defecto. Combínalos con el tope de gasto de tu plan para no recibir facturas sorpresa.",
  },
  {
    t: "Humano cuando importa",
    d: "Cada flujo tiene reglas explícitas de escalamiento (HITL): lo sensible siempre pasa a una persona.",
  },
  {
    t: "Tú eres el dueño",
    d: "Corren en tu propia instancia de n8n (cloud o self-hosted). Los datos y la lógica son tuyos, no quedan atrapados con nadie.",
  },
  {
    t: "Ley 19.628 por diseño",
    d: "Enmascaran datos personales en los registros, no guardan datos bancarios y usan tono respetuoso.",
  },
];

// Guía de pricing de LLM, en simple.
export const PRICING_LLM = [
  {
    tarea: "Clasificar / extraer (la mayoría)",
    modelo: "Haiku / mini",
    costo: "≈ US$0,0002 – 0,0005",
    cuando: "Decisiones simples y de alto volumen: intención, urgencia, etiquetar.",
  },
  {
    tarea: "Redactar mensajes cortos",
    modelo: "Haiku / mini",
    costo: "≈ US$0,0005 – 0,001",
    cuando: "Recordatorios, respuestas tipo, resúmenes breves.",
  },
  {
    tarea: "Razonar / sintetizar",
    modelo: "Sonnet",
    costo: "≈ US$0,003 – 0,01",
    cuando: "Unir varias fuentes, planes, análisis. Úsalo solo cuando aporta.",
  },
];
