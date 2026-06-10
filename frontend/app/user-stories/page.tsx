import Link from "next/link";

export const metadata = {
  title: "User Journeys & Stories — Korriente (interno)",
  description: "Borrador interno. Eliminar antes del deploy.",
};

/* ─── tipos ─────────────────────────────────────────────────────────────── */
interface Persona {
  id: string;
  rol: string;
  empresa: string;
  tamano: string;
  proceso: string;
  icono: string;
  dolor: string;
  metrica_antes: string;
  metrica_despues: string;
}

interface JourneyStep {
  actor: "cliente" | "agente" | "humano" | "sistema";
  accion: string;
  detalle?: string;
}

interface Journey {
  persona_id: string;
  titulo: string;
  antes: string[];
  steps: JourneyStep[];
  resultado: string;
  hitl: string;
}

interface Story {
  id: string;
  rol: string;
  quiero: string;
  para: string;
  criterios: string[];
  prioridad: "must" | "should" | "could";
  relacionada_con?: string;
}

/* ─── datos ──────────────────────────────────────────────────────────────── */
const PERSONAS: Persona[] = [
  {
    id: "constanza",
    rol: "Dueña de inmobiliaria",
    empresa: "Inmobiliaria Pacífico",
    tamano: "8 empleados",
    proceso: "Clasificador de leads WhatsApp",
    icono: "🏠",
    dolor:
      "Constanza pierde leads todos los días porque los mensajes de WhatsApp llegan de noche y a las 9 AM ya alguien más vendió. Su agente comercial responde lo mismo 40 veces al día.",
    metrica_antes: "Tiempo de respuesta: 8–14 horas. 30–40% leads sin respuesta el mismo día.",
    metrica_despues: "Tiempo de respuesta: < 2 minutos, 24/7. 0 leads sin acusar recibo.",
  },
  {
    id: "roberto",
    rol: "Gerente de empresa de servicios",
    empresa: "Soluciones Técnicas del Sur",
    tamano: "45 empleados",
    proceso: "Cobranza y recordatorios de pago",
    icono: "💼",
    dolor:
      "Roberto tiene 120 facturas abiertas. Su admin las cobra por teléfono, olvidando el seguimiento. Los clientes no pagan hasta que alguien los llama, y eso tarda días.",
    metrica_antes: "DSO promedio: 45 días. 25% de facturas llegan con más de 15 días de retraso.",
    metrica_despues: "DSO objetivo: < 28 días. Recordatorios automáticos, escala los montos altos a humano.",
  },
  {
    id: "ana",
    rol: "Directora de clínica dental",
    empresa: "Clínica Dental Bello",
    tamano: "12 personas",
    proceso: "Agendamiento y confirmación de citas",
    icono: "🦷",
    dolor:
      "La recepcionista pasa el 35% del día confirmando y reagendando. Las inasistencias le cuestan $80.000 por box vacío. No puede contratar a otra persona solo para esto.",
    metrica_antes: "Inasistencias: 22%. Confirmaciones: 100% manual, 2–3 h diarias.",
    metrica_despues: "Inasistencias objetivo: < 8%. Confirmaciones: automáticas, humano solo en casos de reagendo.",
  },
  {
    id: "diego",
    rol: "Jefe de soporte TI",
    empresa: "Software Empresa Ltda.",
    tamano: "18 personas",
    proceso: "Triage y toma de tickets",
    icono: "🖥️",
    dolor:
      "Diego recibe 80 tickets al día. Los urgentes (caída de sistema) se pierden entre solicitudes de reset de clave. Tardan 45 minutos en enterarse de una caída real.",
    metrica_antes: "MTTR urgente: 45 min. Resolución de tickets simples: 2 días.",
    metrica_despues: "MTTR urgente: < 8 min (escala al instante). Tickets simples resueltos en el mismo mensaje.",
  },
];

const JOURNEYS: Journey[] = [
  {
    persona_id: "constanza",
    titulo: "Un lead llega a las 11 PM",
    antes: [
      "Cliente escribe por WhatsApp preguntando por precio de un departamento.",
      "El mensaje queda sin respuesta hasta el día siguiente.",
      "Constanza lo ve a las 9 AM y responde. El cliente ya compró con la competencia.",
      "Constanza ni sabe cuántos leads perdió este mes.",
    ],
    steps: [
      { actor: "cliente", accion: "Escribe por WhatsApp", detalle: '"Hola, ¿tienen deptos de 2D en Ñuñoa? ¿Cuánto sale?"' },
      { actor: "sistema", accion: "Webhook recibe el mensaje", detalle: "360dialog → /webhooks/whatsapp → HMAC verificado, dedup OK" },
      { actor: "agente", accion: "Clasifica la intención", detalle: 'intent: "cotizacion" | confidence: 0.94' },
      { actor: "agente", accion: "Registra el lead", detalle: "CRM: lead creado, prioridad alta. Sheets: fila añadida." },
      { actor: "agente", accion: "Responde en < 2 min", detalle: '"¡Hola! Tenemos disponibilidad en Ñuñoa. Te paso con uno de nuestros ejecutivos ahora mismo para mostrarte las opciones. ¿Cuál es tu nombre?"' },
      { actor: "humano", accion: "Recibe notificación al día siguiente", detalle: "Lead calificado esperando. Constanza retoma a las 9 AM con contexto completo." },
    ],
    resultado:
      "El cliente no pierde el hilo. Aunque el cierre lo hace un humano, el lead está calificado, registrado y con contexto. Constanza ve en su panel cuántos leads entraron, cuáles escalaron y el tiempo de respuesta promedio.",
    hitl: "Si el cliente escribe 'quiero hablar con alguien' o menciona 'contrato', 'reclamo' o el clasificador tiene confianza < 0.6, el agente envía un mensaje de holding y escala inmediatamente. El humano decide el siguiente paso.",
  },
  {
    persona_id: "roberto",
    titulo: "Factura vencida hace 5 días, monto normal",
    antes: [
      "La admin revisa el Excel de facturas cada lunes.",
      "Llama por teléfono. A veces contestan, a veces no.",
      "Si no contestan, anota 'llamar de nuevo'. Se le olvida.",
      "La factura aparece impaga a los 45 días. Roberto la descubre en el cierre del mes.",
    ],
    steps: [
      { actor: "sistema", accion: "Job de cobranza detecta factura vencida", detalle: "Factura F-4821 | $480.000 CLP | 5 días vencida | 0 intentos previos" },
      { actor: "agente", accion: "Verifica reglas de seguridad", detalle: "Estado: pending ✓ | Monto: $480K < umbral $2M ✓ | Intentos: 0 < 3 ✓" },
      { actor: "agente", accion: "Redacta recordatorio con LLM", detalle: "Modelo mini. Tono: cordial, profesional. Sin amenazas, sin datos bancarios." },
      { actor: "agente", accion: "Envía por WhatsApp", detalle: '"Hola Transportes López, te escribimos de Soluciones Técnicas. Tenemos pendiente la factura F-4821 por $480.000 del 3 de junio. ¿Podemos ayudarte a coordinar el pago?"' },
      { actor: "sistema", accion: "Registra el intento", detalle: "Sheets: factura F-4821, acción: recordatorio_enviado, próximo contacto: +4 días" },
    ],
    resultado:
      "La secuencia corre sola. Si el cliente paga, el estado se actualiza. Si no paga y se llega a 3 intentos o el monto supera $2M, el agente escala al humano con el historial completo.",
    hitl: "Monto > $2.000.000 CLP: el LLM prepara un borrador pero NO lo envía. Va a Roberto para revisión y envío manual. Facturas 'en disputa': la secuencia se detiene completamente hasta que un humano la retome.",
  },
  {
    persona_id: "ana",
    titulo: "Paciente quiere agendar una cita de urgencia",
    antes: [
      "Paciente escribe por WhatsApp a las 8 PM.",
      "La recepcionista no está. El mensaje queda sin respuesta.",
      "Al día siguiente, la recepcionista lee 15 mensajes de WhatsApp, llamadas perdidas, y el sistema de citas.",
      "Pierde 1.5 horas confirmando y coordinando. La inasistencia llega igual porque no hubo recordatorio.",
    ],
    steps: [
      { actor: "cliente", accion: "Escribe por WhatsApp", detalle: '"Hola, me duele una muela, ¿tienen hora disponible esta semana?"' },
      { actor: "agente", accion: "Identifica urgencia y consulta disponibilidad", detalle: "Conectado al calendario de la clínica vía API. Urgencia detectada." },
      { actor: "agente", accion: "Ofrece horarios disponibles", detalle: '"Hola, lamentamos el dolor. Tenemos disponibilidad mañana 9:00 o 15:30, y el jueves 11:00. ¿Cuál te acomoda?"' },
      { actor: "cliente", accion: "Elige horario", detalle: '"El de mañana a las 9 está perfecto."' },
      { actor: "agente", accion: "Confirma y agenda", detalle: "Cita creada en el sistema. Confirmación enviada al paciente con dirección y nombre del dentista." },
      { actor: "agente", accion: "Envía recordatorio 24 h antes", detalle: '"Hola, te recordamos tu cita mañana a las 9:00 en Clínica Dental Bello. ¿Confirmas asistencia?"' },
      { actor: "cliente", accion: "Confirma", detalle: '"Sí, ahí estaré."' },
    ],
    resultado:
      "La cita se agenda sola, el recordatorio sale automático y la recepcionista solo ve la agenda ya organizada. Inasistencias bajan porque todos confirman con anticipación.",
    hitl: "Si el paciente describe síntomas graves (dolor insoportable, hinchazón severa, fiebre), el agente escala a la dentista de turno en lugar de ofrecer horarios. Si el paciente pide cancelar con menos de 2h de anticipación, notifica a la clínica para intentar reubicar el slot.",
  },
  {
    persona_id: "diego",
    titulo: "Caída de sistema reportada entre tickets normales",
    antes: [
      "Un usuario escribe 'el sistema está caído' en el mismo canal donde otros piden reset de clave.",
      "El ticket entra como P3 (normal) al sistema.",
      "Diego lo ve 45 minutos después durante su revisión habitual.",
      "Ya hay 12 usuarios sin trabajar.",
    ],
    steps: [
      { actor: "cliente", accion: "Escribe al canal de soporte", detalle: '"No puedo entrar al ERP. Dice error de conexión y no carga."' },
      { actor: "agente", accion: "Clasifica por palabras clave + contexto LLM", detalle: "intent: caida_sistema | prioridad: CRITICA | confianza: 0.97" },
      { actor: "agente", accion: "Escala INMEDIATAMENTE", detalle: "Notificación a Diego + al oncall técnico. Canal de Slack #alertas-produccion." },
      { actor: "agente", accion: "Acusa recibo al usuario", detalle: '"Recibimos tu reporte. Esto es una incidencia crítica — el equipo técnico ya está revisando. Te actualizamos en máximo 10 minutos."' },
      { actor: "humano", accion: "Diego toma el caso en < 3 min", detalle: "Contexto completo: quién reportó, hora exacta, texto original, clasificación del agente." },
      { actor: "agente", accion: "Para tickets de baja complejidad del mismo período", detalle: '"Hola, para resetear tu clave sigue estos pasos: [link]. Si el problema persiste, te contamos en 1 h."' },
    ],
    resultado:
      "La caída llega a Diego en 3 minutos, no 45. Los tickets simples se auto-resuelven mientras él atiende lo urgente. El panel muestra el ratio de escalamientos y el tiempo de resolución por tipo.",
    hitl: "Cualquier ticket clasificado como 'caída de sistema', 'datos perdidos' o 'falla de seguridad' escala sin excepción, sin importar la confianza del clasificador. Diego puede ajustar las palabras clave de escalamiento desde el canal de solicitudes de cambio.",
  },
];

const STORIES: Story[] = [
  // ── Dueño / Operador de la PyME ──
  {
    id: "US-01",
    rol: "Dueño de PyME",
    quiero: "que mi agente responda leads por WhatsApp 24/7, aunque sea de noche",
    para: "no perder clientes que escriben fuera del horario laboral",
    criterios: [
      "El agente acusa recibo en < 2 minutos para cualquier mensaje de texto.",
      "Clasifica la intención (cotización, consulta, reclamo, spam) con confianza visible en la traza.",
      "Los reclamos siempre escalan a un humano — el agente no intenta resolverlos solo.",
      "El lead queda registrado en el CRM con intent y prioridad antes de que yo llegue al trabajo.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-001",
  },
  {
    id: "US-02",
    rol: "Dueño de PyME",
    quiero: "que el agente no responda si no está seguro de lo que dice",
    para: "que mis clientes no reciban información incorrecta que dañe la relación",
    criterios: [
      "Si la confianza del clasificador < 0.6, el agente envía un holding y escala en lugar de responder.",
      "Si el cliente menciona palabras sensibles (contrato, legal, demanda, abogado), siempre escala.",
      "El holding es en español de Chile, cordial y sin prometer tiempos que no se pueden cumplir.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-001",
  },
  {
    id: "US-03",
    rol: "Dueño de PyME",
    quiero: "recibir un aviso ANTES de que el agente llegue al tope de gasto, no después",
    para: "no llevarme una sorpresa en la factura y poder tomar una decisión a tiempo",
    criterios: [
      "Alerta por email y/o WhatsApp al llegar al 80% del budget cap del plan.",
      "Segunda alerta al 100%. El agente deja de gastar solo (hard limit) y deriva a humano.",
      "La misma alerta no se repite más de una vez por umbral en el mes.",
      "El panel muestra el porcentaje de uso en tiempo real.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-008",
  },
  {
    id: "US-04",
    rol: "Dueño de PyME",
    quiero: "ver en mi panel qué hizo el agente hoy, sin necesitar que me expliquen",
    para: "entender el valor del servicio que estoy pagando cada mes",
    criterios: [
      "Lista de conversaciones del día: intent, si escaló, costo, hora.",
      "Texto de los mensajes con PII enmascarada (últimos 4 dígitos del teléfono).",
      "El panel se accede con un token de lectura — no necesito contraseña especial ni VPN.",
      "Lo que veo es solo lo mío: no puedo ver datos de otro cliente de Korriente.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-008",
  },
  {
    id: "US-05",
    rol: "Dueño de PyME",
    quiero: "que si no pago un mes, el agente se pause y no se borre",
    para: "poder retomarlo sin perder toda la configuración que costó armar",
    criterios: [
      "Impago → estado 'moroso'. El agente sigue activo durante 5 días de gracia.",
      "Pasada la gracia → estado 'suspendido'. El agente responde un mensaje de cortesía y no gasta.",
      "Al pagar, el agente vuelve activo en minutos sin configuración adicional.",
      "Korriente recibe una alerta al momento del impago para poder contactarme antes del corte.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-006",
  },
  {
    id: "US-06",
    rol: "Dueño de PyME",
    quiero: "poder pedir un cambio al agente sin tener que saber de tecnología",
    para: "no depender de que alguien técnico esté disponible cada vez que algo cambia",
    criterios: [
      "Canal de solicitudes: enviar mensaje/formulario con la descripción del cambio.",
      "El cambio queda registrado por escrito (quién pidió, cuándo, qué).",
      "Korriente confirma si es cambio menor (incluido) o mayor (cotizado).",
      "El cambio menor se aplica en 48 h hábiles.",
    ],
    prioridad: "should",
    relacionada_con: "SPEC-009",
  },
  // ── Operador de Korriente ──
  {
    id: "US-07",
    rol: "Operador de Korriente (Raúl)",
    quiero: "que activar el agente de un cliente nuevo tome menos de 30 minutos técnicos",
    para: "que el onboarding sea repetible y no dependa de mi memoria",
    criterios: [
      "CLI de provisioning: `python -m app.billing.provision --tenant-id X --plan starter`",
      "Registro del phone_number_id en TenantRegistry con un solo comando.",
      "Checklist en `docs/onboarding-checklist.md` con todos los pasos sin ambigüedad.",
      "Smoke test post-deploy verifica que el pipeline completo funciona antes del go-live.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-007",
  },
  {
    id: "US-08",
    rol: "Operador de Korriente (Raúl)",
    quiero: "ver en un solo lugar el estado de todos mis clientes (pago, uso, alertas)",
    para: "operar 10+ clientes sin necesitar revisar cada panel por separado",
    criterios: [
      "Vista admin (distinta a la del cliente): todos los tenants, estado de billing, uso del mes.",
      "Alertas de 80/100% también llegan a Korriente, no solo al cliente.",
      "Si un webhook de WhatsApp deja de recibir mensajes, aparece una alerta operativa.",
      "Desde el panel admin puedo hacer override manual de estado con registro de auditoría.",
    ],
    prioridad: "should",
    relacionada_con: "SPEC-008, SPEC-006",
  },
  {
    id: "US-09",
    rol: "Operador de Korriente (Raúl)",
    quiero: "que un pago de Flow active el agente automáticamente, sin intervención manual",
    para: "no tener que revisar correos de Flow todos los días para activar clientes",
    criterios: [
      "Webhook Flow recibe el evento, valida la firma HMAC y cambia el estado del tenant.",
      "El webhook es idempotente: el mismo payment_id no activa dos veces.",
      "Un evento de pago del cliente A nunca toca al cliente B.",
      "Firma inválida → 403, no cambia nada, queda en el log de seguridad.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-006",
  },
  {
    id: "US-10",
    rol: "Operador de Korriente (Raúl)",
    quiero: "poder rotar una clave comprometida en 5 minutos sin tocar el código",
    para: "no tener que hacer un redeploy de código cuando hay un incidente de seguridad",
    criterios: [
      "Todas las claves (360dialog, Flow, LLM) viven como variables de entorno en Railway.",
      "Cambiar la variable + Redeploy en Railway es suficiente — sin cambios en el repo.",
      "El .env.example documenta los nombres, nunca los valores.",
      "Ninguna clave aparece en logs, trazas ni en el panel del cliente.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-007",
  },
  // ── Cliente final (quien escribe al WhatsApp del PyME) ──
  {
    id: "US-11",
    rol: "Cliente final (escribe al WhatsApp del PyME)",
    quiero: "recibir una respuesta rápida aunque sea de noche",
    para: "no tener que esperar al día siguiente para saber si me pueden ayudar",
    criterios: [
      "Respuesta o acuse de recibo en < 2 minutos para mensajes de texto.",
      "La respuesta tiene información real del negocio (no 'pronto te contactaremos' genérico).",
      "Si mi pregunta es compleja o es un reclamo, me dicen que un humano me va a escribir (no me ignoran).",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-001",
  },
  {
    id: "US-12",
    rol: "Cliente final (escribe al WhatsApp del PyME)",
    quiero: "que si envío una foto o audio, el agente me diga qué pasa y no me deje en silencio",
    para: "saber que el sistema recibió mi mensaje aunque no lo procese automáticamente",
    criterios: [
      "Si el mensaje es imagen, audio, botón o sticker, el agente responde un holding claro.",
      "El holding indica que un ejecutivo lo revisará — no es un error.",
      "El mensaje no-texto escala a un humano para que lo revise.",
    ],
    prioridad: "should",
    relacionada_con: "SPEC-005",
  },
  {
    id: "US-13",
    rol: "Cliente final (escribe al WhatsApp del PyME)",
    quiero: "que si le debo plata a la empresa, me recuerden de forma amable y no intimidante",
    para: "no sentirme amenazado y poder regularizar sin fricción",
    criterios: [
      "El recordatorio de cobranza es cordial, en español de Chile, sin amenazas ni referencias legales.",
      "No incluye datos bancarios en el mensaje.",
      "Si el monto es alto, el mensaje lo redacta un humano (no el agente automático).",
      "Si tengo una disputa, la secuencia se detiene y un humano me contacta.",
    ],
    prioridad: "must",
    relacionada_con: "SPEC-002",
  },
];

/* ─── helpers de render ──────────────────────────────────────────────────── */
const ACTOR_STYLE: Record<JourneyStep["actor"], { bg: string; label: string }> = {
  cliente: { bg: "#e7efff", label: "Cliente" },
  agente:  { bg: "#e6f7f0", label: "Agente IA" },
  humano:  { bg: "#fff3e0", label: "Humano" },
  sistema: { bg: "#f4f7fb", label: "Sistema" },
};

const PRIORIDAD_STYLE: Record<Story["prioridad"], { bg: string; color: string; label: string }> = {
  must:   { bg: "#fdeaea", color: "#991b1b", label: "Must have" },
  should: { bg: "#fff3e0", color: "#92400e", label: "Should have" },
  could:  { bg: "#f4f7fb", color: "#374151", label: "Could have" },
};

/* ─── componente ─────────────────────────────────────────────────────────── */
export default function UserStories() {
  return (
    <>
      {/* BANNER DE BORRADOR */}
      <div style={{
        background: "#7c3aed", color: "#fff", textAlign: "center",
        padding: "10px 16px", fontSize: 13, fontWeight: 700, letterSpacing: .3,
      }}>
        ⚠️ BORRADOR INTERNO — SOLO PARA REVISIÓN — ELIMINAR ANTES DEL DEPLOY ⚠️
      </div>

      {/* HERO */}
      <header className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <span className="eyebrow">User Journeys & Stories · Interno</span>
          <h1>Cómo los usuarios <span className="grad">viven el producto</span></h1>
          <p className="lead doc-lead">
            4 personas reales, sus journeys antes y después del agente, y las 13 user stories
            que definen el comportamiento esperado. Basado en los agentes implementados
            (SPEC-001, 002, 005–008).
          </p>
          <div className="hero-cta">
            <a href="#personas" className="btn btn-primary">Ver personas</a>
            <a href="#stories" className="btn btn-ghost">Ver user stories</a>
          </div>
        </div>
      </header>

      {/* ── PERSONAS ────────────────────────────────────────────────────── */}
      <section id="personas" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Personas</div>
            <h2>Los 4 usuarios que guían el diseño</h2>
            <p>Personas del ICP real: PyMEs chilenas de 10–50 personas, con un proceso repetitivo que hoy se hace a mano.</p>
          </div>
          <div className="feature-grid">
            {PERSONAS.map((p) => (
              <div className="feature" key={p.id}>
                <h3>
                  <span>{p.icono}</span>
                  <span>{p.rol}</span>
                  <span className="status ready" style={{ marginLeft: "auto", fontSize: 11 }}>{p.proceso.split(" ")[0]}</span>
                </h3>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: "var(--ink)" }}>{p.empresa}</strong> · {p.tamano}
                </p>
                <p>{p.dolor}</p>
                <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                  <div style={{ background: "#fdeaea", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                    <strong style={{ color: "#991b1b", display: "block", marginBottom: 4 }}>Antes</strong>
                    <span style={{ color: "#7f1d1d" }}>{p.metrica_antes}</span>
                  </div>
                  <div style={{ background: "var(--brand-soft)", border: "1px solid #cdeede", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                    <strong style={{ color: "var(--brand-ink)", display: "block", marginBottom: 4 }}>Con el agente</strong>
                    <span style={{ color: "var(--brand-ink)" }}>{p.metrica_despues}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEYS ─────────────────────────────────────────────────────── */}
      <section id="journeys">
        <div className="container">
          <div className="section-head">
            <div className="kicker">User Journeys</div>
            <h2>El flujo completo, paso a paso</h2>
            <p>Cada journey muestra la secuencia real que corre en el backend — con los actores, las acciones técnicas y dónde interviene un humano.</p>
          </div>

          {JOURNEYS.map((j) => {
            const persona = PERSONAS.find((p) => p.id === j.persona_id)!;
            return (
              <div key={j.persona_id} style={{
                background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18,
                padding: 28, marginBottom: 24, boxShadow: "var(--shadow)",
              }}>
                {/* Header del journey */}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {persona.icono}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>
                      {persona.rol} · {persona.proceso}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 20 }}>{j.titulo}</h3>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Antes */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
                      Sin el agente
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {j.antes.map((paso, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fdeaea", color: "#991b1b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                            {i + 1}
                          </div>
                          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>{paso}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Con el agente */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
                      Con el agente
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {j.steps.map((step, i) => {
                        const s = ACTOR_STYLE[step.actor];
                        return (
                          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                            <div style={{ background: s.bg, borderRadius: 8, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-start", marginTop: 2 }}>
                              {s.label}
                            </div>
                            <div>
                              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{step.accion}</p>
                              {step.detalle && (
                                <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted)", fontFamily: "ui-monospace, monospace" }}>{step.detalle}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resultado y HITL */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
                  <div style={{ background: "var(--brand-soft)", border: "1px solid #cdeede", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
                      Resultado
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#1a5e45", lineHeight: 1.6 }}>{j.resultado}</p>
                  </div>
                  <div style={{ background: "#fff3e0", border: "1px solid #fcd34d", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
                      Human-in-the-loop
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: "#78350f", lineHeight: 1.6 }}>{j.hitl}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── USER STORIES ─────────────────────────────────────────────────── */}
      <section id="stories" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">User Stories</div>
            <h2>13 historias, 3 roles</h2>
            <p>En formato "Como [rol], quiero [feature], para [beneficio]". Los criterios de aceptación son los que definen si la historia está hecha.</p>
          </div>

          {/* Tabla de resumen */}
          <div style={{ overflowX: "auto", marginBottom: 40 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                  {["ID", "Rol", "Historia (resumen)", "Prioridad", "Spec"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11.5, textTransform: "uppercase", letterSpacing: .3, color: "var(--muted)", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STORIES.map((s) => {
                  const ps = PRIORIDAD_STYLE[s.prioridad];
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--brand-ink)" }}>
                        <a href={`#${s.id}`} style={{ color: "inherit" }}>{s.id}</a>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 13 }}>{s.rol}</td>
                      <td style={{ padding: "10px 14px" }}>quiero {s.quiero}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: ps.bg, color: ps.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
                          {ps.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12.5, fontFamily: "monospace" }}>{s.relacionada_con}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detalle por historia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STORIES.map((s) => {
              const ps = PRIORIDAD_STYLE[s.prioridad];
              return (
                <div id={s.id} key={s.id} style={{
                  background: "var(--surface)", border: "1px solid var(--line)",
                  borderRadius: 14, padding: 22, boxShadow: "var(--shadow)",
                  scrollMarginTop: 80,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                    <span style={{ fontWeight: 800, color: "var(--brand-ink)", fontSize: 15 }}>{s.id}</span>
                    <span style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "var(--muted)" }}>{s.rol}</span>
                    <span style={{ background: ps.bg, color: ps.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>{ps.label}</span>
                    {s.relacionada_con && (
                      <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--muted)", fontFamily: "monospace" }}>{s.relacionada_con}</span>
                    )}
                  </div>

                  <p style={{ margin: "0 0 6px", fontSize: 15.5, fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}>Como </span>
                    {s.rol.toLowerCase()},
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: 15.5, fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}>quiero </span>
                    {s.quiero},
                  </p>
                  <p style={{ margin: "0 0 18px", fontSize: 15.5, fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}>para </span>
                    {s.para}.
                  </p>

                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>
                    Criterios de aceptación
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {s.criterios.map((c, i) => (
                      <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--muted)", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--brand)", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NOTAS DE DISEÑO */}
      <section>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Notas de diseño</div>
            <h2>Decisiones importantes que no están en el código</h2>
          </div>
          <div className="faq" style={{ maxWidth: "100%" }}>
            {[
              {
                q: "¿Por qué el agente responde siempre aunque no pueda procesar el mensaje?",
                a: "Silencio = abandono percibido. Aunque no pueda resolver la consulta, el agente siempre acusa recibo (holding) y escala. Esto protege la relación del PyME con su cliente y evita que el cliente pruebe con la competencia.",
              },
              {
                q: "¿Por qué el límite de confianza del clasificador es 0.6 y no más alto?",
                a: "Con 0.6 se captura suficiente ambigüedad real (mensajes cortos, typos) sin escalar demasiado. Un umbral más alto haría que el agente derive casi todo a humano, negando el valor del servicio. Uno más bajo respondería con demasiada confianza a mensajes ambiguos. El umbral es ajustable por cliente.",
              },
              {
                q: "¿Por qué los montos de cobranza sobre $2M siempre van a humano?",
                a: "La relación entre el PyME y sus clientes grandes es más frágil. Un mensaje automático mal redactado puede dañar una relación que vale meses de facturación. El LLM prepara un borrador para ahorrar tiempo al humano, pero la decisión de enviar es siempre del humano.",
              },
              {
                q: "¿Por qué el token del panel del cliente es de solo lectura y no tiene login?",
                a: "En Fase 1 el panel es una herramienta de transparencia, no un punto de administración. El cliente ve resultados; los cambios se piden por el canal de solicitudes. Un sistema de login completo (OAuth, MFA) tiene un costo de UX y mantenimiento que no se justifica hasta Fase 2.",
              },
              {
                q: "¿Por qué la pausa de un tenant no borra nada?",
                a: "El churn real en servicios gestionados casi siempre pasa por un período de impago o incertidumbre, no por una decisión firme. Pausa sin borrar reduce dramáticamente el churn: el cliente puede volver sin perder lo que costó configurar. Borrar es siempre una acción manual y explícita.",
              },
            ].map((n) => (
              <details key={n.q}>
                <summary>{n.q}</summary>
                <p>{n.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER INTERNO */}
      <section style={{ background: "#7c3aed" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ color: "#e9d5ff", fontWeight: 700, margin: 0 }}>
            ⚠️ Esta página es solo para revisión interna. Eliminarla antes del primer deploy público.<br />
            <span style={{ fontWeight: 400, fontSize: 13 }}>
              Para eliminar: borrar <code style={{ background: "rgba(255,255,255,.15)", padding: "2px 6px", borderRadius: 4 }}>frontend/app/user-stories/</code> y el link en el nav si lo agregaste.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
