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
  paraQuien: string[];
  escenarios: string[];
  flujo: string[];
  conectores: string[];
  modelo: string;
  costo: string;
  hitl: string;
  comoEmpezar: string[];
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
    paraQuien: [
      "Tiendas online y servicios que reciben más de 20 mensajes diarios por WhatsApp.",
      "Equipos de ventas que no pueden estar disponibles 24/7 para responder.",
      "Cualquier PyME donde el primer contacto marca la diferencia y el tiempo de respuesta importa.",
    ],
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
    comoEmpezar: [
      "Ajusta `umbral_confianza` en el nodo Config (default 0.6 — súbelo si hay muchos falsos positivos).",
      "Conecta tu webhook de WhatsApp Business (Twilio, Meta Cloud API o 360dialog) al nodo de entrada.",
      "Crea la credencial Anthropic en n8n → Credentials → Header Auth y asígnala al nodo LLM.",
      "Prueba enviando un mensaje real. Revisa la salida del nodo «Parsear + HITL» para ver la clasificación.",
      "Conecta la rama «Escalar» a tu Slack o email y la rama «Responder» al conector de envío de WhatsApp.",
    ],
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
    paraQuien: [
      "Empresas con cartera de más de 30 facturas mensuales que se cobran manualmente.",
      "Negocios con clientes que pagan a plazos (arriendos, suscripciones, servicios recurrentes).",
      "Administraciones de condominios, colegios o servicios donde la cobranza es sensible.",
    ],
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
    comoEmpezar: [
      "En Config, ajusta `monto_umbral_clp` (default $2.000.000) según tu criterio de escalamiento.",
      "Reemplaza el nodo «Traer facturas vencidas» con tu fuente real: Google Sheets, Bsale, o tu ERP.",
      "Conecta la credencial Anthropic al nodo LLM.",
      "Prueba el flujo manualmente con una factura de ejemplo usando el trigger manual.",
      "Cuando esté OK, activa el trigger cron para que corra automáticamente cada día a las 09:00.",
    ],
  },
  {
    key: "triage-tickets",
    name: "Triage de tickets de soporte",
    cat: "Soporte · Operaciones",
    ico: "🎫",
    tagline:
      "Clasifica cada ticket por urgencia y área, responde al instante y alerta a tu equipo solo cuando realmente lo necesita.",
    file: "/n8n/workflows/06-triage-tickets.json",
    queHace:
      "Recibe el ticket (por webhook, email o formulario), clasifica urgencia (alta/media/baja), área (técnico, facturación, ventas, posventa) y sentimiento del cliente. Si el caso es urgente o el cliente está molesto, alerta a un humano de inmediato; si no, responde con un acuse automático y el tiempo de respuesta estimado. Todo en menos de 2 segundos.",
    paraQuien: [
      "Empresas con mesa de ayuda propia que recibe más de 15 tickets al día.",
      "SaaS o servicios digitales con usuarios activos que reportan problemas.",
      "Tiendas con posventa frecuente donde el tiempo de primera respuesta impacta la retención.",
    ],
    escenarios: [
      "«El sistema no carga desde ayer» → urgencia alta → alerta inmediata al equipo técnico.",
      "«¿Cómo cambio mi plan?» → urgencia baja, área ventas → acuse automático, respuesta en 24 hrs.",
      "«¡Estoy harto de esperar!» → sentimiento furioso → escala a humano sin importar la urgencia.",
      "Ticket ambiguo → confianza baja → deriva a humano para que clasifique manualmente.",
    ],
    flujo: [
      "Ticket entrante",
      "Config",
      "Extraer datos",
      "Clasificar (LLM)",
      "Parsear + HITL",
      "¿Escalar?",
      "Alerta humano / Respuesta automática",
    ],
    conectores: ["Webhook / Formulario / Email", "LLM (Anthropic)", "Slack / Email (alertas)"],
    modelo: "claude-haiku-4-5 (económico)",
    costo: "≈ US$0,0003 por ticket clasificado",
    hitl: "Urgencia alta, sentimiento furioso o confianza baja → humano.",
    comoEmpezar: [
      "En Config, ajusta el `system_prompt` con las áreas de tu empresa (reemplaza «ventas/posventa» por las tuyas).",
      "Conecta el webhook al canal donde llegan tickets: formulario, email parseado o chat.",
      "Conecta la credencial Anthropic.",
      "Prueba con 3 tickets: uno urgente, uno de consulta simple y uno con texto molesto.",
      "Conecta «Escalar a humano» a tu Slack/email de soporte y «Respuesta automática» al canal de respuesta.",
    ],
  },
  {
    key: "generador-cotizaciones",
    name: "Generador de cotizaciones",
    cat: "Ventas · Finanzas",
    ico: "💰",
    tagline:
      "Entiende lo que pide el cliente, mapea los productos a tu lista de precios y arma una cotización estructurada lista para enviar.",
    file: "/n8n/workflows/07-generador-cotizaciones.json",
    queHace:
      "Recibe la solicitud del cliente, un modelo más potente interpreta qué productos o servicios necesita y construye la cotización con precios desde tu lista configurada. Si algún ítem no está en la lista, lo marca con [PRECIO A CONFIRMAR] y alerta a un ejecutivo para que complete los precios antes de enviar. El precio final siempre lo aprueba una persona.",
    paraQuien: [
      "Empresas de servicios que emiten más de 10 cotizaciones por semana y siempre es lo mismo.",
      "Distribuidores o proveedores con catálogo definido donde solo cambia la combinación de ítems.",
      "Equipos comerciales que pierden 20-30 min por cotización en tareas repetitivas.",
    ],
    escenarios: [
      "«Quiero el Plan Growth más implementación» → mapea ambos, calcula total → cotización lista.",
      "«Necesito algo personalizado para 50 usuarios» → ítem no en lista → HITL para completar precio.",
      "«¿Cuánto cuesta el soporte premium?» → devuelve cotización de ese plan en segundos.",
      "Solicitud vaga → LLM interpreta y lista todos los ítems posibles, marcando los inciertos.",
    ],
    flujo: [
      "Solicitud entrante",
      "Config (lista precios)",
      "Extraer datos",
      "Generar cotización (LLM)",
      "Parsear",
      "¿Precios completos?",
      "Cotización lista / HITL",
    ],
    conectores: ["Webhook / WhatsApp / Formulario", "LLM (Anthropic)", "Email / CRM (envío)"],
    modelo: "claude-sonnet-4-6 (mejor estructuración)",
    costo: "≈ US$0,003–0,008 por cotización generada",
    hitl: "Ítems sin precio en lista o montos especiales → siempre un humano revisa antes de enviar.",
    comoEmpezar: [
      "En Config, reemplaza `lista_precios_json` con tus precios reales en formato JSON (sigue la estructura del ejemplo).",
      "Ajusta `vigencia_dias` según tu política comercial (default: 10 días).",
      "Conecta la credencial Anthropic al nodo LLM.",
      "Prueba enviando: `{\"nombre_cliente\": \"Empresa X\", \"mensaje_solicitud\": \"Quiero el plan growth más implementación\"}`.",
      "Si los ítems no se mapean bien, agrega ejemplos al `system_prompt` del nodo Config.",
    ],
  },
  {
    key: "orquestador-marketing",
    name: "Orquestador de Marketing (multi-agente)",
    cat: "Marketing · Multi-agente",
    ico: "🧠",
    tagline:
      "Cinco especialistas en paralelo: mercado, copy, SEO, estrategia de medios y brief creativo — unidos en un plan de campaña accionable.",
    file: "/n8n/workflows/03-orquestador-marketing.json",
    extras: [
      { name: "Worker · Análisis de mercado", file: "/n8n/workflows/workers/worker-analisis-mercado.json" },
      { name: "Worker · Copywriter", file: "/n8n/workflows/workers/worker-copywriter.json" },
      { name: "Worker · SEO", file: "/n8n/workflows/workers/worker-seo-keywords.json" },
      { name: "Worker · Estratega de medios", file: "/n8n/workflows/workers/worker-estratega-medios.json" },
      { name: "Worker · Diseñador de brief", file: "/n8n/workflows/workers/worker-disenador-brief.json" },
    ],
    queHace:
      "Le das un objetivo (ej. «lanzar un nuevo plan contable»). El orquestador genera briefs personalizados para cada especialista y los lanza en paralelo: análisis de mercado, copy, SEO, estrategia de canales/presupuesto y brief visual. Un modelo más potente sintetiza las 5 salidas en un plan completo. Es el patrón base del equipo de marketing: agregas o reemplazas workers según el negocio.",
    paraQuien: [
      "Equipos de marketing de 1-3 personas que producen campañas sin tiempo para investigar todo.",
      "Agencias que atienden múltiples clientes y necesitan un primer borrador rápido y estructurado.",
      "Empresas que lanzan productos nuevos y necesitan alinear mensaje, canales y creatividad en un solo paso.",
    ],
    escenarios: [
      "Lanzamiento de producto → segmentos + titulares + keywords + canales recomendados + brief para el diseñador → plan unificado.",
      "Campaña de temporada → cambias el objetivo y los 5 workers se reusan tal cual.",
      "Tu propio equipo → duplicas un worker, cambias el prompt y creas «análisis financiero» o «soporte».",
    ],
    flujo: [
      "Objetivo",
      "Router (5 briefs)",
      "Mercado · Copy · SEO · Estrategia · Brief",
      "Consolidar",
      "Sintetizar plan",
    ],
    conectores: ["LLM (Anthropic)", "5 sub-workflows (workers)", "Tu fuente de datos (opcional)"],
    modelo: "Router/workers: haiku · Síntesis: sonnet",
    costo: "≈ US$0,015–0,04 por plan completo (6 llamadas LLM)",
    hitl: "Revisión humana del plan antes de ejecutar la campaña.",
    comoEmpezar: [
      "Importa también los 5 workers desde la carpeta /workers (son archivos separados).",
      "En n8n, abre cada nodo «Llamar worker: X» y reasigna el workflow al worker correspondiente (dropdown de selección).",
      "Conecta la credencial Anthropic a todos los nodos LLM (usa «Apply to all credentials» si aparece).",
      "En el nodo «Entrada (objetivo)», reemplaza el texto de ejemplo por tu objetivo real.",
      "Corre el flujo con el trigger manual y revisa el campo `plan_markdown` al final.",
    ],
    featured: true,
  },
  {
    key: "agendador-citas",
    name: "Agendador de citas",
    cat: "Atención · Agenda",
    ico: "📅",
    tagline:
      "Entiende cuándo quiere reunirse el cliente, revisa tu agenda y agenda (o propone alternativas) solo.",
    file: "/n8n/workflows/04-agendador-citas.json",
    queHace:
      "Recibe el mensaje del cliente, un modelo extrae la fecha y hora que pide, consulta la disponibilidad en tu calendario y, si hay cupo, crea el evento y confirma. Si no hay, ofrece alternativas. Todo respetando tu horario de atención.",
    paraQuien: [
      "Clínicas, consultorios, estudios y servicios que coordinan por hora (coaching, asesorías, etc.).",
      "Vendedores B2B con muchas reuniones que pierden tiempo coordinando por WhatsApp.",
      "Servicios de instalación o visita en terreno donde la disponibilidad depende de la agenda del técnico.",
    ],
    escenarios: [
      "«¿Pueden el martes a las 10?» → revisa agenda, crea la cita y confirma al instante.",
      "«Quiero reunirme esta semana» → propone los horarios libres disponibles.",
      "Horario ocupado → ofrece las alternativas más cercanas, sin doble-reserva.",
      "Pedido especial o fuera de horario → deriva a una persona.",
    ],
    flujo: [
      "Mensaje entrante",
      "Config",
      "Entender solicitud (LLM)",
      "Consultar disponibilidad",
      "¿Hay cupo?",
      "Crear evento / Alternativas",
    ],
    conectores: ["WhatsApp (webhook)", "LLM (Anthropic)", "Google Calendar / Cal.com"],
    modelo: "claude-haiku-4-5 (económico)",
    costo: "≈ US$0,0004 por solicitud",
    hitl: "Solicitud especial, fuera de horario o sin cupo → humano.",
    comoEmpezar: [
      "En Config, actualiza `horario_atencion` con tus días y horas reales y `duracion_min` (duración por cita).",
      "Conecta el webhook al canal de entrada (WhatsApp Business o formulario web).",
      "Reemplaza el nodo «Consultar disponibilidad» con tu sistema real: Google Calendar API o Cal.com.",
      "Conecta la credencial Anthropic al nodo LLM.",
      "Prueba enviando «¿Tienen el jueves a las 3?» y verifica que el LLM extrae bien la fecha.",
    ],
  },
  {
    key: "orquestador-ventas",
    name: "Orquestador de Ventas SDR (multi-agente)",
    cat: "Ventas · Multi-agente",
    ico: "🤝",
    tagline:
      "Un pipeline de agentes que prospecta, califica y, si el lead vale, redacta la propuesta y la pasa a un humano para cerrar.",
    file: "/n8n/workflows/05-orquestador-ventas.json",
    extras: [
      { name: "Worker · Prospectador", file: "/n8n/workflows/workers/worker-prospectador.json" },
      { name: "Worker · Calificador de leads", file: "/n8n/workflows/workers/worker-calificador-leads.json" },
      { name: "Worker · Redactor de propuesta", file: "/n8n/workflows/workers/worker-redactor-propuesta.json" },
    ],
    queHace:
      "Llega un lead. El orquestador encadena tres especialistas en secuencia: el prospectador enriquece el contexto, el calificador le pone un puntaje (0–100) y, solo si supera el umbral, el redactor arma una propuesta. El cierre y el precio final siempre quedan en manos de una persona. Es el molde del patrón secuencial: cada agente trabaja sobre la salida del anterior.",
    paraQuien: [
      "Equipos de ventas con más de 50 leads al mes que no pueden trabajarlos todos con la misma energía.",
      "Empresas con ciclo de venta largo donde priorizar bien el tiempo marca la diferencia.",
      "Cualquier PyME que quiera saber cuáles leads trabajar primero y tener una propuesta lista antes de llamar.",
    ],
    escenarios: [
      "Lead con necesidad clara → score alto → propuesta lista y handoff a un ejecutivo.",
      "Lead tibio o con datos faltantes → score bajo → entra a una secuencia de nurturing.",
      "Tu propio equipo → agregas un worker «negociador» o conectas tu CRM en cualquier paso.",
    ],
    flujo: [
      "Lead",
      "Prospectar",
      "+ contexto",
      "Calificar",
      "¿Calificado?",
      "Propuesta + Handoff / Nurturing",
    ],
    conectores: ["LLM (Anthropic)", "3 sub-workflows (workers)", "CRM (opcional)"],
    modelo: "Prospectar/calificar: haiku · Propuesta: sonnet",
    costo: "≈ US$0,004–0,012 por lead procesado",
    hitl: "Cierre y precios finales → siempre un humano.",
    comoEmpezar: [
      "Importa los 3 workers desde /workers y reasígnalos en los nodos «Llamar worker» del orquestador.",
      "En Config, ajusta `umbral_score` (default 60): los leads sobre ese puntaje reciben propuesta.",
      "Envía un lead de prueba por el trigger manual: `{\"nombre\": \"...\", \"empresa\": \"...\", \"mensaje\": \"...\"}`.",
      "Revisa la salida de cada worker en el panel de ejecución para calibrar los prompts si es necesario.",
      "Cuando esté OK, activa el webhook y conecta tu CRM o formulario de captación como entrada.",
    ],
    featured: true,
  },
];

// Plantillas de arquitectura multi-agente (patrones reutilizables).
export const PATTERNS: Workflow[] = [
  {
    key: "patron-supervisor",
    name: "Patrón: Supervisor / Jerárquico",
    cat: "Patrón · Arquitectura",
    ico: "🏛",
    tagline:
      "Un supervisor delega la tarea a un worker, revisa el resultado y pide mejoras — hasta que aprueba o se escala.",
    file: "/n8n/workflows/patrones/patron-supervisor-jerarquico.json",
    queHace:
      "El supervisor (modelo potente) divide la tarea y da instrucciones precisas al worker (modelo económico). El worker ejecuta. El supervisor revisa: si aprueba, entrega; si no, pide mejoras con feedback específico. Se repite hasta 2 veces. Si ninguna versión pasa, escala a humano. Ideal cuando la calidad del output es crítica y quieres un «jefe» interno que apruebe antes de entregar.",
    paraQuien: [
      "Redacción de propuestas, contratos o copys donde la calidad afecta el negocio directamente.",
      "Equipos sin editor humano disponible, pero donde el primer draft nunca es suficiente.",
      "Cualquier proceso de «generar → aprobar internamente» que hoy requiere que un humano revise cada vez.",
    ],
    escenarios: [
      "Redactar email de bienvenida → versión 1 muy genérica → supervisor pide más personalización → versión 2 aprobada.",
      "Generar resumen ejecutivo → supervisor detecta datos faltantes → worker los agrega → aprobado.",
      "Dos rondas sin pasar el criterio → mejor versión disponible → escala a humano para revisión.",
    ],
    flujo: [
      "Tarea",
      "Supervisor: Delegar",
      "Worker: Ejecutar",
      "Supervisor: Revisar",
      "¿Aprobado?",
      "Reintentar / Resultado final / HITL",
    ],
    conectores: ["LLM (Anthropic × 4 nodos)"],
    modelo: "Supervisor: sonnet · Worker: haiku",
    costo: "≈ US$0,005–0,015 por tarea (2-4 llamadas LLM)",
    hitl: "Si ninguna iteración es aprobada → escala con la mejor versión disponible.",
    comoEmpezar: [
      "En Config, reemplaza `tarea` con la tarea concreta (ej: «Redactar email de bienvenida para cliente nuevo»).",
      "Reemplaza `criterio_exito` con el estándar a cumplir (ej: «Tono cercano, máx 150 palabras, incluir CTA»).",
      "Conecta la credencial Anthropic a los 4 nodos LLM del flujo.",
      "Corre el trigger manual y observa cuántas iteraciones toma llegar al resultado aprobado.",
      "Si el supervisor es muy estricto/laxo, ajusta el prompt del nodo «Supervisor: Revisar».",
    ],
  },
  {
    key: "patron-router",
    name: "Patrón: Router Condicional",
    cat: "Patrón · Arquitectura",
    ico: "🔀",
    tagline:
      "Clasifica la solicitud y llama SOLO al handler que corresponde — sin ejecutar workers innecesarios.",
    file: "/n8n/workflows/patrones/patron-router-condicional.json",
    queHace:
      "Un router LLM económico clasifica la solicitud en un tipo (soporte técnico, consulta comercial, reclamo u otro). Un nodo Switch la dirige al handler especializado correspondiente, que ejecuta con un prompt diseñado para ese caso. Los handlers no usados no corren. Ahorra costo y da respuestas más precisas que un prompt genérico que intenta cubrirlo todo.",
    paraQuien: [
      "Empresas con múltiples tipos de solicitudes que necesitan respuestas distintas y especializadas.",
      "Soporte técnico con áreas diferenciadas: técnico, comercial, posventa — cada una con su propio experto.",
      "Cualquier flujo donde llamar a «todos los workers siempre» sería caro o daría respuestas poco precisas.",
    ],
    escenarios: [
      "Ticket de falla técnica → Handler soporte técnico → respuesta con pasos de diagnóstico.",
      "Consulta sobre precio de plan → Handler comercial → respuesta orientada a cierre.",
      "Cliente enojado → Handler reclamo → respuesta empática y solución concreta.",
    ],
    flujo: [
      "Solicitud",
      "Router: Clasificar",
      "Parsear tipo",
      "Switch",
      "Handler específico",
      "Respuesta",
    ],
    conectores: ["Webhook", "LLM (Anthropic × 1 router + N handlers)"],
    modelo: "Router: haiku · Handlers: haiku (configurable)",
    costo: "≈ US$0,0006–0,001 por solicitud (2 llamadas LLM)",
    hitl: "Tipo «otro» o sin clasificación → HITL.",
    comoEmpezar: [
      "En Config, actualiza `tipos_disponibles` con los tipos de tu negocio y `descripcion_tipos` con sus definiciones.",
      "En el nodo Switch, ajusta las reglas para que coincidan con tus tipos configurados.",
      "Reemplaza el `system_prompt` de cada Handler con el contexto específico de tu empresa.",
      "Conecta la credencial Anthropic a todos los nodos Handler.",
      "Prueba con al menos un mensaje por tipo y verifica que el router clasifica correctamente.",
    ],
  },
  {
    key: "patron-generador-critico",
    name: "Patrón: Generador + Crítico",
    cat: "Patrón · Arquitectura",
    ico: "✍",
    tagline:
      "Un agente genera contenido, otro lo critica con criterios concretos — y el generador mejora hasta aprobar.",
    file: "/n8n/workflows/patrones/patron-generador-critico.json",
    queHace:
      "El generador (modelo económico) produce el contenido según el brief. El crítico (modelo potente) lo evalúa contra los criterios y le da un puntaje y feedback específico. Si no alcanza el mínimo, el generador lo reescribe incorporando las mejoras. Hasta 2 iteraciones. Si no aprueba en la segunda, entrega la mejor versión disponible. El tope de iteraciones controla el costo.",
    paraQuien: [
      "Equipos de marketing que producen volumen de contenido (posts, emails, copies) sin editor dedicado.",
      "Empresas donde la coherencia de marca en el copy es crítica y el primer draft nunca está listo.",
      "Cualquier proceso de «generar → revisar → mejorar» que hoy se hace manualmente entre dos personas.",
    ],
    escenarios: [
      "Brief de email de lanzamiento → v1 muy larga → crítico pide más brevedad y CTA claro → v2 aprobada.",
      "Post de LinkedIn → v1 demasiado formal → crítico detecta tono incorrecto → v2 más cercana → aprobada.",
      "Descripción de producto → 2 iteraciones sin llegar al puntaje → entrega mejor versión + nota para editor.",
    ],
    flujo: [
      "Brief",
      "Generar v1",
      "Crítico evalúa",
      "¿Aprobado?",
      "Generar v2 con feedback",
      "Crítico evalúa",
      "Mejor versión / Aprobado",
    ],
    conectores: ["LLM (Anthropic × 4 nodos: 2 generador + 2 crítico)"],
    modelo: "Generador: haiku · Crítico: sonnet",
    costo: "≈ US$0,004–0,012 por contenido (2-4 llamadas LLM)",
    hitl: "Si no aprueba en 2ª iteración, entrega mejor versión con nota para revisión humana.",
    comoEmpezar: [
      "En Config, reemplaza `brief` con lo que quieres generar y `criterios_calidad` con los estándares a cumplir.",
      "Ajusta `puntaje_minimo` (default 7/10) — súbelo a 8+ si necesitas calidad más alta.",
      "Conecta la credencial Anthropic a los 4 nodos LLM del flujo.",
      "Corre el trigger manual y revisa si el crítico da feedback constructivo y el generador lo incorpora.",
      "Si las iteraciones no mejoran, afina el prompt del crítico para que sea más específico en el feedback.",
    ],
  },
  {
    key: "patron-hitl",
    name: "Patrón: HITL Checkpoint",
    cat: "Patrón · Arquitectura",
    ico: "🛑",
    tagline:
      "El agente prepara y resume la acción — y se detiene hasta que un humano la aprueba o rechaza explícitamente.",
    file: "/n8n/workflows/patrones/patron-hitl-checkpoint.json",
    queHace:
      "El flujo ejecuta la tarea preparatoria, genera un resumen claro para el responsable (qué se hará, impacto esperado, qué no se puede deshacer) y luego se pausa con el nodo Wait de n8n. Envía el resumen al responsable con la URL de reanudación. Cuando el responsable responde «aprobar» o «rechazar» vía webhook, el flujo continúa o aborta. Diseñado para acciones irreversibles.",
    paraQuien: [
      "Empresas que envían campañas masivas, cobros o comunicaciones que no se pueden deshacer.",
      "Operaciones donde el cumplimiento o la ley requiere aprobación explícita antes de ejecutar.",
      "Cualquier proceso donde «el humano aprueba antes de ejecutar» es un requisito de negocio o legal.",
    ],
    escenarios: [
      "Campaña de cobranza lista → resumen enviado al gerente → aprueba → se envían los 150 mensajes.",
      "Publicación programada → resumen al community manager → rechaza con motivo → no se publica.",
      "Descuento masivo en ERP → resumen con impacto estimado → aprobación → se aplica.",
    ],
    flujo: [
      "Proceso preparatorio",
      "Resumen para humano (LLM)",
      "Notificar responsable",
      "⏸ Esperar decisión",
      "¿Aprobado?",
      "Ejecutar / Abortar",
    ],
    conectores: ["LLM (Anthropic)", "Email / Slack (notificación)", "Webhook (reanudación)"],
    modelo: "claude-haiku-4-5 (resumen)",
    costo: "≈ US$0,0003 por checkpoint (1 llamada LLM)",
    hitl: "Este patrón ES el checkpoint HITL — toda la acción real es bloqueada por diseño.",
    comoEmpezar: [
      "En Config, reemplaza `accion_descripcion` con la descripción de tu proceso y `responsable_email` con el destinatario.",
      "Después del nodo «Notificar a responsable», conecta un nodo Email o Slack para enviar la URL de reanudación del nodo Wait.",
      "Conecta la credencial Anthropic al nodo LLM de preparación de resumen.",
      "Después de «Ejecutar acción (APROBADO)», conecta los nodos reales del proceso (enviar, publicar, ejecutar cobro).",
      "Prueba: activa el flujo, recibe la notificación con la URL de reanudación y llámala con `{\"accion\": \"aprobar\"}`.",
    ],
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
    t: "Configura y prueba",
    d: "Abre el nodo Config y ajusta los parámetros de tu negocio. Corre el flujo con un dato de ejemplo antes de activarlo.",
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
