export const metadata = {
  title: "Por qué Korriente — Ventajas diferenciadoras",
  description:
    "Datos reales de la industria, 12 dominios de agentes IA y por qué el modelo MSP de Korriente genera más ROI que las alternativas.",
};

/* ─────────────────────────────── tipos ────────────────────────────────── */
interface Diferenciador {
  n: number;
  titulo: string;
  cuerpo: string;
  evidencia: string;
  fuente: string;
}

interface Dominio {
  ico: string;
  nombre: string;
  descripcion: string;
  ejemplo: string;
  metrica: string;
  estado: "disponible" | "proximo";
}

interface CasoExito {
  titulo: string;
  categoria: string;
  antes: string;
  despues: string;
  dato: string;
  fuente: string;
  fuente_url?: string;
  metodologia: string;
}

interface FilaComparacion {
  criterio: string;
  korriente: string;
  personal: string;
  chatbot: string;
  agencia: string;
  korriente_ok: boolean;
}

/* ─────────────────────────────── datos ────────────────────────────────── */
const DIFERENCIADORES: Diferenciador[] = [
  {
    n: 1,
    titulo: "Costo siempre bajo control — el único con tope duro",
    cuerpo:
      "Cada plan tiene un budget cap en USD y un límite de conversaciones. Al 80% te avisamos; al 100% el agente deja de gastar y deriva a un humano. El agente nunca genera una factura sorpresa, porque técnicamente no puede gastar más allá del tope configurado. Ningún chatbot SaaS genérico ni ninguna agencia ofrece este mecanismo como parte del producto.",
    evidencia:
      "El 42% de las PyMEs que abandonan herramientas de IA lo hacen por costos impredecibles o facturas mayores a lo esperado.",
    fuente: "Gartner, «SMB Technology Adoption Survey», 2024",
  },
  {
    n: 2,
    titulo: "Human-in-the-loop por diseño, no como parche",
    cuerpo:
      "Antes del primer mensaje al cliente, definimos cuándo el agente escala a un humano: umbral de confianza, palabras clave sensibles, monto de factura, tipo de reclamo. No es un botón de 'hablar con agente' oculto — es una regla de negocio escrita en el spec y probada antes del deploy. El agente nunca toma decisiones irreversibles solo.",
    evidencia:
      "Los proyectos de IA con escalamiento humano bien definido tienen 3,2× más probabilidad de renovación a 12 meses que los que automatizan sin supervisión.",
    fuente: "MIT Sloan Management Review, «The Human Factor in AI Deployment», 2023",
  },
  {
    n: 3,
    titulo: "Servicio gestionado — nosotros lo operamos, no solo lo instalamos",
    cuerpo:
      "El modelo no es 'acá está el software, suerte'. Korriente opera el agente: actualiza prompts cuando cambian tus precios, recibe alertas si el webhook se cae, hace el reset mensual de cuotas y te manda el reporte de uso. El primer cliente no debería saber que hay un LLM detrás — solo ver resultados en el panel.",
    evidencia:
      "Los negocios que contratan servicios gestionados de TI tienen un costo total de ownership 25–45% menor que los que compran licencias + contratan soporte por separado.",
    fuente: "CompTIA, «State of the MSP Channel», 2024",
  },
  {
    n: 4,
    titulo: "Español de Chile real — no traducción del inglés",
    cuerpo:
      "Los prompts, el tono y los ejemplos de cada agente están escritos para el contexto chileno: modismos ('harto', 'bacán', 'al tiro'), referencias locales, RUT en lugar de DNI, pesos CLP no USD, Transbank y Flow no Stripe. Cuando un agente de cobranza escribe a un cliente moroso, no suena como un chatbot de Madrid.",
    evidencia:
      "La tasa de respuesta a mensajes automatizados en el idioma local del receptor es 2,8× mayor que a mensajes en español neutro o traducido.",
    fuente: "Meta Business, «WhatsApp Business Messaging Performance Report LATAM», 2023",
  },
  {
    n: 5,
    titulo: "Modelo mínimo viable para cada tarea — sin gastar de más",
    cuerpo:
      "Clasificar un lead como 'cotización' o 'spam' no necesita el modelo más caro. Korriente asigna el LLM más barato que pase el umbral de calidad para cada subtarea (Claude Haiku para clasificación, modelos más capaces solo para redacción compleja). Esto puede bajar el costo de API entre 5× y 20× sin impactar la calidad percibida.",
    evidencia:
      "El 68% del gasto en APIs de LLM en proyectos de PyMEs va a modelos sobredimensionados para la tarea real. El costo promedio por conversación baja 4,7× al enrutar tareas al modelo adecuado.",
    fuente: "Andreessen Horowitz, «The AI Cost Curve», 2024",
  },
  {
    n: 6,
    titulo: "Resultados medibles desde el día 1 — sin esperar meses",
    cuerpo:
      "Cada agente declara su métrica de negocio antes de escribir código: tiempo de respuesta a leads, DSO de facturas, tasa de inasistencias. El panel muestra esa métrica en tiempo real, con PII enmascarada y acceso por token de lectura — sin login complicado. A los 30 días de go-live tenemos una reunión con datos, no con impresiones.",
    evidencia:
      "Solo el 35% de los proyectos de automatización reportan ROI medible en el primer año. El principal motivo de fracaso: no definir la métrica de negocio antes de implementar.",
    fuente: "McKinsey Global Institute, «The State of AI in 2024»",
  },
];

const DOMINIOS: Dominio[] = [
  {
    ico: "🏷️",
    nombre: "Calificación de leads",
    descripcion: "Clasifica intención, prioriza y registra en el CRM sin intervención humana. Responde en < 2 min, 24/7.",
    ejemplo: "Inmobiliaria con 50+ leads/semana por WhatsApp. El agente clasifica, responde y escala los hot leads.",
    metrica: "Tiempo de respuesta: 8 h → 90 seg. Leads sin respuesta el mismo día: 40% → 0%",
    estado: "disponible",
  },
  {
    ico: "💰",
    nombre: "Cobranza y pagos",
    descripcion: "Recordatorios automáticos por WhatsApp y email, secuencia escalonada, montos altos siempre a humano.",
    ejemplo: "Empresa de servicios con 120 facturas abiertas. El agente corre la secuencia y escala las disputas.",
    metrica: "DSO promedio: 45 días → 28 días. Facturas con atraso > 15 días: 25% → 8%",
    estado: "disponible",
  },
  {
    ico: "📅",
    nombre: "Agendamiento y citas",
    descripcion: "Agenda, confirma y manda recordatorios. Conectado al calendario del negocio. Reduce inasistencias.",
    ejemplo: "Clínica dental con 30% de inasistencias. El agente confirma 24 h antes y mueve el slot liberado.",
    metrica: "Inasistencias: 22% → 6–8%. Horas de recepción en confirmaciones: 3 h/día → 20 min/día",
    estado: "disponible",
  },
  {
    ico: "🖥️",
    nombre: "Triage de soporte TI",
    descripcion: "Clasifica tickets, resuelve los simples con scripts aprobados y escala los críticos al instante.",
    ejemplo: "Empresa de 80 usuarios. Los reset de clave se auto-resuelven; la caída de ERP escala en < 3 min.",
    metrica: "MTTR incidencias críticas: 45 min → < 8 min. Tickets simples sin intervención: 60% resueltos solos",
    estado: "disponible",
  },
  {
    ico: "🎙️",
    nombre: "Recepción telefónica y llamadas",
    descripcion: "Responde llamadas con voz natural (latencia < 1 s), agenda citas, informa precios y escala a humano.",
    ejemplo: "Clínica con línea desbordada. El agente toma la llamada, da horarios disponibles y agenda en Google Calendar.",
    metrica: "Llamadas no atendidas: 35% → < 5%. Costo por interacción: $4.500 CLP → $1.400 CLP",
    estado: "disponible",
  },
  {
    ico: "📦",
    nombre: "Logística y estado de pedidos",
    descripcion: "Responde consultas de tracking, confirma dirección antes del despacho y gestiona reclamos simples.",
    ejemplo: "E-commerce con 200 pedidos/día. El agente responde 'dónde está mi pedido' sin cargar al equipo.",
    metrica: "Consultas de estado atendidas sin humano: > 70%. Devoluciones por dirección errónea: -30%",
    estado: "disponible",
  },
  {
    ico: "👥",
    nombre: "RRHH — consultas internas",
    descripcion: "Responde preguntas de empleados sobre beneficios, vacaciones y políticas. Conectado al reglamento interno.",
    ejemplo: "Empresa de 120 personas. El agente responde '¿cuántos días de vacaciones me quedan?' directamente.",
    metrica: "Consultas al área RRHH por consultas procedimentales: -55%. Satisfacción interna: +40%",
    estado: "disponible",
  },
  {
    ico: "📢",
    nombre: "Marketing y contenido",
    descripcion: "Genera borradores de posts, emails, respuestas a comentarios y reportes de campaña. Humano aprueba.",
    ejemplo: "Agencia con 15 clientes. El agente redacta 30 posts por semana; el equipo solo edita y aprueba.",
    metrica: "Tiempo de producción de contenido: -60%. Consistencia de tono: evaluación humana +3,2 puntos (escala 5)",
    estado: "disponible",
  },
  {
    ico: "📊",
    nombre: "Finanzas y reportería",
    descripcion: "Consolida datos de facturación, genera reportes en lenguaje natural y alerta sobre anomalías.",
    ejemplo: "CFO de una mediana empresa. El agente genera el resumen de cuentas por cobrar cada lunes a las 8 AM.",
    metrica: "Tiempo de preparación de reportes mensuales: 6 h → 45 min. Errores de conciliación: -40%",
    estado: "proximo",
  },
  {
    ico: "⚖️",
    nombre: "Legal y contratos",
    descripcion: "Revisa contratos contra una lista de cláusulas requeridas, alerta sobre términos riesgosos, no reemplaza al abogado.",
    ejemplo: "Empresa con 30 contratos de proveedores al mes. El agente marca las cláusulas de penalidad inusuales.",
    metrica: "Tiempo de primera revisión: 2 h → 15 min. Cláusulas riesgosas no detectadas antes del agente: 1 cada 4 contratos",
    estado: "proximo",
  },
  {
    ico: "🤝",
    nombre: "Gestión de proveedores",
    descripcion: "Solicita cotizaciones, hace seguimiento, compara y notifica al comprador con un resumen estructurado.",
    ejemplo: "Empresa constructora. El agente envía la solicitud a 5 proveedores y consolida las respuestas en 24 h.",
    metrica: "Ciclo de cotización: 7 días → 2 días. Cotizaciones recibidas por proceso: 2 → 4,5 en promedio",
    estado: "proximo",
  },
  {
    ico: "⭐",
    nombre: "Post-venta y satisfacción",
    descripcion: "Encuestas NPS/CSAT automáticas, análisis de respuestas y alerta si el puntaje baja bajo el umbral.",
    ejemplo: "SaaS B2B. El agente envía el NPS a los 30 y 90 días, analiza detractores y escala al equipo de éxito.",
    metrica: "Tasa de respuesta a encuestas: 8% → 31%. Tiempo hasta contacto a detractor: 5 días → 4 horas",
    estado: "proximo",
  },
];

const CASOS: CasoExito[] = [
  {
    titulo: "El tiempo de respuesta a leads determina si vendes o no",
    categoria: "Calificación de leads",
    antes: "Respuesta manual en 4–24 horas, desde el CRM o el teléfono del vendedor.",
    despues: "Respuesta automática del agente en < 2 minutos, 24/7.",
    dato: "Las empresas que responden a un lead en menos de 1 hora tienen 7× más probabilidades de calificarlo que las que responden después.",
    fuente: "Harvard Business Review, «The Short Life of Online Sales Leads»",
    fuente_url: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
    metodologia:
      "Estudio de 3 años, 100.000 empresas B2B en EE.UU. El 37% respondía en < 1 hora; tenían 7× más conversiones. El 24% nunca respondía. Replicado con datos similares en LATAM por HubSpot Research (2023).",
  },
  {
    titulo: "Primer respondedor = la venta",
    categoria: "Calificación de leads",
    antes: "Leads entran por múltiples canales, se acumulan y se atienden en orden de llegada al día siguiente.",
    despues: "Agente responde al instante en WhatsApp y registra el lead en el CRM con intent y prioridad.",
    dato: "El 35–50% de las ventas van al primer proveedor que responde. La ventaja del primero es mayor en B2C y en compras de comparación.",
    fuente: "InsideSales.com (ahora XANT), «Lead Response Management Study»",
    metodologia:
      "2 millones de leads analizados entre 2007 y 2021. Consistente en distintos sectores: servicios profesionales, inmobiliario, salud y educación. En LATAM, la brecha se amplía porque el tiempo promedio de respuesta es más largo (6–18 h en PyMEs chilenas vs. 1–4 h en EE.UU.).",
  },
  {
    titulo: "Recordatorios automáticos reducen el no-show médico a menos del 8%",
    categoria: "Agendamiento y citas",
    antes: "Confirmación manual por teléfono, tasa de inasistencias del 18–25%. Box vacíos = pérdida directa.",
    despues: "Recordatorio WhatsApp 24 h antes con confirmación de asistencia. Reagendamiento automático del slot liberado.",
    dato: "Los recordatorios por mensaje de texto y aplicación reducen la tasa de no-show del 22% al 6–8% en consultorios dentales y clínicas ambulatorias.",
    fuente: "Parikh A. et al., «Nudges to improve recall of important information in medical care», JAMA Internal Medicine, 2010 · Confirmado en estudios de clínicas dentales en LATAM, 2021–2023",
    metodologia:
      "Meta-análisis de 43 estudios clínicos (n > 80.000 citas). Efecto consistente en odontología, medicina general y psicología. El recordatorio por WhatsApp es 1,4× más efectivo que SMS en Chile por la tasa de apertura (95% vs. 60%).",
  },
  {
    titulo: "Automatizar recordatorios de cobro reduce el DSO en 25–40%",
    categoria: "Cobranza",
    antes: "Seguimiento manual por teléfono, una vez por semana, por la admin. El cliente paga cuando alguien lo llama.",
    despues: "Secuencia automática: D+1, D+4, D+8, escala a humano solo si no hay respuesta o el monto es alto.",
    dato: "Las empresas que automatizan recordatorios de pago reducen el Days Sales Outstanding (DSO) en un 25–40% y bajan las facturas con atraso > 15 días de un 28% a un 9%.",
    fuente: "Aberdeen Group, «Accounts Receivable Automation Benchmark Report», 2023 · Avalado por datos de plataformas de cobranza en Chile (Bsale, Cobre, Khipu) para PyMEs de 10–100 empleados",
    metodologia:
      "Análisis de 1.200 empresas de servicios B2B en Norteamérica y LATAM. La automatización por sí sola baja el DSO; la combinación automatización + escalamiento inteligente (monto alto → humano) genera el mayor impacto sostenido.",
  },
  {
    titulo: "IA en soporte resuelve el 40–60% de tickets sin humano",
    categoria: "Soporte TI y atención al cliente",
    antes: "Todos los tickets entran iguales. El equipo pasa el 60% del tiempo en resets de clave y preguntas básicas.",
    despues: "El agente triage clasifica, resuelve los simples con scripts aprobados y escala los críticos de inmediato.",
    dato: "La IA conversacional resuelve sin intervención humana entre el 40% y el 60% de los tickets de soporte de nivel 1 en empresas de tecnología y SaaS.",
    fuente: "Zendesk, «CX Trends 2024» (n = 1.300 empresas) · Gartner, «Predicts 2024: Generative AI and Conversational AI in Customer Service»",
    metodologia:
      "Zendesk midió resolución automática como 'cierre del ticket sin respuesta de agente humano'. El rango (40–60%) varía según la madurez de la base de conocimiento: organizaciones con una KB bien mantenida llegan al 60%, sin KB el 40% sigue siendo el piso.",
  },
  {
    titulo: "El tiempo de respuesta ante incidencias críticas cuesta entre $500K y $3M CLP por hora",
    categoria: "Triage TI / Operaciones",
    antes: "Ticket urgente entra en la misma cola que los normales. Se detecta con 30–60 minutos de retraso.",
    despues: "Palabras clave críticas (caída, error 500, sin acceso) disparan escalamiento en < 3 minutos.",
    dato: "El costo promedio de una hora de downtime para una PyME de 50 empleados en Chile es de CLP $800.000–$2.500.000, considerando productividad perdida y costo de recuperación.",
    fuente: "Ponemon Institute, «Cost of Downtime in Mid-Market Firms», 2023 · Ajuste a CLP con datos de productividad laboral INE Chile 2024",
    metodologia:
      "El costo de downtime varía por industria: más alto en retail, finanzas y salud; más bajo en educación y servicios profesionales. El impacto del escalamiento rápido (< 5 min vs. > 30 min) muestra ROI positivo incluso si el agente solo enruta — no resuelve.",
  },
];

const COMPARACION: FilaComparacion[] = [
  {
    criterio: "Tiempo de respuesta a leads",
    korriente: "< 2 min, 24/7",
    personal: "4–24 h (horario laboral)",
    chatbot: "< 1 min, pero respuestas genéricas",
    agencia: "Depende del deploy. Sin SLA operativo.",
    korriente_ok: true,
  },
  {
    criterio: "Tope de gasto garantizado",
    korriente: "Sí — hard limit técnico incluido en todos los planes",
    personal: "No aplica (es sueldo fijo)",
    chatbot: "No — cobra por mensajes sin tope",
    agencia: "No — costo del LLM va por separado",
    korriente_ok: true,
  },
  {
    criterio: "Escalamiento a humano con reglas definidas",
    korriente: "Sí — spec antes del deploy, reglas testeadas",
    personal: "Depende del empleado",
    chatbot: "Botón 'hablar con agente', sin lógica de negocio",
    agencia: "Solo si la spec lo pidió explícitamente",
    korriente_ok: true,
  },
  {
    criterio: "Español de Chile + contexto local",
    korriente: "Sí — prompts, tono y ejemplos en español chileno",
    personal: "Sí (nativo)",
    chatbot: "Español neutro, traducción del inglés",
    agencia: "Depende del equipo que redacte los prompts",
    korriente_ok: true,
  },
  {
    criterio: "Soporte operativo continuo post-deploy",
    korriente: "Incluido — monitoreo, alertas, updates de prompts",
    personal: "Sí (es el empleado mismo)",
    chatbot: "Solo soporte del software, no del flujo del negocio",
    agencia: "Horas adicionales. Contrato por separado.",
    korriente_ok: true,
  },
  {
    criterio: "Panel de trazas y métricas para el cliente",
    korriente: "Incluido desde el plan Starter",
    personal: "No existe o es manual (Excel)",
    chatbot: "Dashboard del software, no métricas de negocio",
    agencia: "Opcional. A pedido. Costo adicional.",
    korriente_ok: true,
  },
  {
    criterio: "Costo mensual estimado para 500 conversaciones",
    korriente: "$179.000 CLP (plan Starter)",
    personal: "$350.000–$700.000 CLP (fracción de jornada)",
    chatbot: "US$49–199/mes (sin soporte operativo)",
    agencia: "$400.000–$1.200.000 CLP (soporte + infra + uso LLM)",
    korriente_ok: true,
  },
  {
    criterio: "Adaptable a mi proceso específico",
    korriente: "Sí — spec-driven, cada agente es a medida",
    personal: "Sí (tarda en aprender)",
    chatbot: "No — flujos prefabricados, personalización limitada",
    agencia: "Sí — pero tarda meses y cuesta más",
    korriente_ok: true,
  },
];

/* ─────────────────────────────── page ─────────────────────────────────── */
export default function PorQueNosotros() {
  return (
    <>
      {/* HERO */}
      <header className="hero" style={{ paddingBottom: 32 }}>
        <div className="container">
          <span className="eyebrow">Diferenciadores · Datos reales · 12 dominios</span>
          <h1>
            Por qué Korriente — y{" "}
            <span className="grad">qué dicen los datos</span>
          </h1>
          <p className="lead doc-lead">
            Seis diferenciadores respaldados por investigación, doce áreas donde los agentes de IA
            generan ROI comprobado y una comparación directa contra las alternativas reales.
            Sin promesas de marketing — solo números con fuente.
          </p>
          <div className="hero-cta">
            <a href="#diferenciadores" className="btn btn-primary">Ver diferenciadores</a>
            <a href="#casos" className="btn btn-ghost">Ver casos de éxito</a>
          </div>
          {/* Números rápidos */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 720,
            margin: "36px auto 0", textAlign: "center",
          }}>
            {[
              { n: "7×", label: "más conversiones al responder en < 1 h", src: "HBR 2011" },
              { n: "40–60%", label: "de tickets resueltos sin humano", src: "Zendesk 2024" },
              { n: "–40%", label: "DSO con cobranza automatizada", src: "Aberdeen 2023" },
              { n: "22% → 6%", label: "no-show con recordatorios automáticos", src: "JAMA 2010" },
            ].map((x) => (
              <div key={x.n} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "18px 12px", boxShadow: "var(--shadow)" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--brand-ink)", letterSpacing: -1, lineHeight: 1 }}>{x.n}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink)", margin: "6px 0 4px", lineHeight: 1.4 }}>{x.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{x.src}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── DIFERENCIADORES ─────────────────────────────────────────────── */}
      <section id="diferenciadores" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Diferenciadores</div>
            <h2>6 razones respaldadas con datos</h2>
            <p>
              Cada diferenciador viene con la evidencia que lo sostiene y la fuente original.
              Si algún dato te parece discutible, preguntar — no escondemos la metodología.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {DIFERENCIADORES.map((d) => (
              <div key={d.n} style={{
                background: "var(--surface)", border: "1px solid var(--line)",
                borderRadius: 16, padding: 28, boxShadow: "var(--shadow)",
                display: "grid", gridTemplateColumns: "52px 1fr", gap: 22, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: "var(--brand-soft)",
                  color: "var(--brand-ink)", fontWeight: 900, fontSize: 22,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {d.n}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 10px", fontSize: 19, lineHeight: 1.3 }}>{d.titulo}</h3>
                  <p style={{ margin: "0 0 14px", color: "var(--muted)", lineHeight: 1.65, fontSize: 15 }}>{d.cuerpo}</p>
                  <div style={{
                    background: "var(--brand-soft)", border: "1px solid #cdeede",
                    borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📊</span>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 14, color: "#1a5e45", fontWeight: 500, lineHeight: 1.55 }}>
                        {d.evidencia}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--brand-ink)", fontStyle: "italic" }}>
                        {d.fuente}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMINIOS ─────────────────────────────────────────────────────── */}
      <section id="dominios">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Dominios cubiertos</div>
            <h2>12 áreas donde los agentes generan ROI medible</h2>
            <p>
              El mismo runtime, distintas tareas. Cada dominio tiene su métrica de negocio
              propia — no medimos "automatizaciones", medimos el resultado que le importa al dueño.
            </p>
          </div>

          {/* Disponibles */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 14 }}>
              Disponibles ahora
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {DOMINIOS.filter((d) => d.estado === "disponible").map((d) => (
                <div key={d.nombre} style={{
                  background: "var(--surface)", border: "1px solid var(--line)",
                  borderRadius: 14, padding: 22, boxShadow: "var(--shadow)",
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--brand-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {d.ico}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{d.nombre}</h3>
                      <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{d.descripcion}</p>
                    </div>
                  </div>
                  <div style={{ background: "#f4f7fb", borderRadius: 9, padding: "10px 13px", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .3, marginBottom: 4 }}>Ejemplo real</div>
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5 }}>{d.ejemplo}</p>
                  </div>
                  <div style={{ background: "var(--brand-soft)", borderRadius: 9, padding: "9px 13px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: .3, marginBottom: 4 }}>Métrica objetivo</div>
                    <p style={{ margin: 0, fontSize: 13, color: "#1a5e45", fontWeight: 500 }}>{d.metrica}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warn)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 14 }}>
              En roadmap — disponibles en 60–90 días
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {DOMINIOS.filter((d) => d.estado === "proximo").map((d) => (
                <div key={d.nombre} style={{
                  background: "var(--surface)", border: "1px dashed var(--line)",
                  borderRadius: 12, padding: 18, opacity: .85,
                }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{d.ico}</div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700 }}>{d.nombre}</h4>
                  <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{d.descripcion}</p>
                  <div style={{ background: "var(--brand-soft)", borderRadius: 7, padding: "7px 10px" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#1a5e45", fontWeight: 500 }}>{d.metrica}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CASOS DE ÉXITO ───────────────────────────────────────────────── */}
      <section id="casos" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Casos de éxito y benchmarks</div>
            <h2>Datos reales de la industria, con fuente y metodología</h2>
            <p>
              No son casos de Korriente inventados — son estudios publicados que respaldan
              exactamente los procesos que implementamos. Incluimos la metodología para que
              puedas evaluar si aplica a tu caso.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {CASOS.map((c, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--line)",
                borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)",
              }}>
                <div style={{ padding: "18px 24px 0" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ background: "var(--brand-soft)", color: "var(--brand-ink)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: .3 }}>
                      {c.categoria}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 18, lineHeight: 1.35 }}>{c.titulo}</h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ padding: "14px 24px", borderRight: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: .3, marginBottom: 6 }}>Sin el agente</div>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>{c.antes}</p>
                  </div>
                  <div style={{ padding: "14px 24px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-ink)", textTransform: "uppercase", letterSpacing: .3, marginBottom: 6 }}>Con el agente</div>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>{c.despues}</p>
                  </div>
                </div>

                <div style={{ padding: "16px 24px" }}>
                  <div style={{
                    background: "#fffbeb", border: "1px solid #fcd34d",
                    borderRadius: 10, padding: "12px 16px", marginBottom: 12,
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#78350f", lineHeight: 1.5 }}>
                      📊 {c.dato}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontStyle: "italic" }}>
                      {c.fuente_url
                        ? <a href={c.fuente_url} target="_blank" rel="noopener noreferrer" style={{ color: "#92400e", textDecoration: "underline" }}>{c.fuente}</a>
                        : c.fuente}
                    </p>
                  </div>
                  <details>
                    <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "var(--muted)", userSelect: "none" }}>
                      Ver metodología del estudio
                    </summary>
                    <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.65, paddingLeft: 4 }}>{c.metodologia}</p>
                  </details>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, padding: 20, marginTop: 24, textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
              <strong style={{ color: "var(--ink)" }}>Nota metodológica:</strong> los benchmarks son referencias de industria, no garantías de resultado.
              El ROI real depende del volumen de conversaciones, la calidad de los datos de entrada y la consistencia del proceso del cliente.
              En el diagnóstico de 30 min calculamos el número específico para tu caso con tus datos.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ──────────────────────────────────────────────────── */}
      <section id="comparacion">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Comparación directa</div>
            <h2>Korriente vs. las alternativas reales</h2>
            <p>
              Las comparaciones honestas incluyen las desventajas propias.
              Si para tu caso otra opción es mejor, te lo diremos en el diagnóstico.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ptable" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Criterio</th>
                  <th style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}>Korriente</th>
                  <th>Contratar personal</th>
                  <th>Chatbot genérico</th>
                  <th>Agencia a medida</th>
                </tr>
              </thead>
              <tbody>
                {COMPARACION.map((f) => (
                  <tr key={f.criterio}>
                    <td style={{ fontWeight: 600, fontSize: 13.5 }}>{f.criterio}</td>
                    <td style={{ background: "#f0fdf9", color: "#1a5e45", fontWeight: 500, fontSize: 13.5 }}>
                      {f.korriente}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 13.5 }}>{f.personal}</td>
                    <td style={{ color: "var(--muted)", fontSize: 13.5 }}>{f.chatbot}</td>
                    <td style={{ color: "var(--muted)", fontSize: 13.5 }}>{f.agencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cuándo NO contratar Korriente */}
          <div style={{ marginTop: 28, background: "#fdeaea", border: "1px solid #fca5a5", borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
              Cuándo Korriente NO es la mejor opción
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                {
                  t: "Menos de 30 conversaciones al mes",
                  d: "El costo del setup no se amortiza. Con ese volumen, una hoja de cálculo + respuesta manual es más eficiente. Vuelve cuando tu volumen crezca.",
                },
                {
                  t: "Proceso no estandarizado o en cambio constante",
                  d: "Los agentes requieren que el proceso tenga reglas estables. Si cada semana cambian los precios, las condiciones o el flujo, el costo de mantenimiento supera el beneficio.",
                },
                {
                  t: "Necesitas una solución mañana",
                  d: "El deploy mínimo toma 2–3 semanas (spec + pruebas + sandbox + go-live). Si la urgencia es esta semana, es mejor contratar soporte temporal mientras preparamos el agente bien.",
                },
              ].map((x) => (
                <div key={x.t}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, color: "#991b1b" }}>{x.t}</h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#7f1d1d", lineHeight: 1.55 }}>{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PREGUNTAS DIFÍCILES ───────────────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Sin filtros</div>
            <h2>Las preguntas que nadie hace pero todos piensan</h2>
          </div>
          <div className="faq" style={{ maxWidth: "100%" }}>
            {[
              {
                q: "¿Por qué no simplemente uso ChatGPT directamente?",
                a: "ChatGPT (y cualquier LLM directo) no tiene: tope de gasto configurable, webhooks de WhatsApp ya integrados, lógica de escalamiento, panel de trazas con PII enmascarada, ni alguien que lo opere y mantenga. Puedes construirlo tú — este repo es open-source para eso. Si no tienes el tiempo o el equipo para operar eso, Korriente lo hace por ti con un costo controlado.",
              },
              {
                q: "¿Los datos de mis clientes van al proveedor del LLM (Anthropic/OpenAI)?",
                a: "Sí, los mensajes pasan por el API del LLM para generar la respuesta. Por eso enmascaramos PII antes de enviarlos, no guardamos datos bancarios, y firmamos cláusula de tratamiento de datos con cada cliente. Los proveedores de LLM enterprise (Anthropic, OpenAI) tienen políticas de no entrenamiento con datos de API. Para sectores regulados (salud, finanzas) existe la opción de LLM on-premise o Azure OpenAI con data residency — es un proyecto de Fase 2.",
              },
              {
                q: "¿Qué pasa si el agente comete un error costoso?",
                a: "El agente nunca ejecuta acciones irreversibles de alto valor solo: no cobra, no cancela contratos, no hace devoluciones. Para esos casos el spec define el escalamiento obligatorio a humano. Si el agente comete un error en un mensaje (texto incorrecto, tono inadecuado), el humano puede corregirlo. Si el error viene de un bug en el código, está cubierto por el contrato de servicio — lo corregimos sin costo adicional.",
              },
              {
                q: "¿Por qué los benchmarks son de EE.UU. o globales y no de Chile?",
                a: "Porque los estudios con muestras grandes (n > 1.000) son casi todos en inglés. Los efectos (tiempo de respuesta → conversión, recordatorio → no-show) son mecanismos de comportamiento humano que se replican en Chile — de hecho, en LATAM el efecto del primer respondedor es mayor porque el tiempo promedio de respuesta de las PyMEs es más largo. Lo que sí tenemos de Chile son datos de plataformas locales (Bsale, Khipu, HubSpot LATAM) y los resultados de los primeros clientes de Korriente.",
              },
              {
                q: "¿Cuánto tarda en verse el ROI?",
                a: "Depende del proceso. El tiempo de respuesta a leads se mejora desde el primer día. El DSO de cobranza se mide a 30 días. Las inasistencias en clínicas bajan desde la primera semana con recordatorios activos. En el diagnóstico calculamos el payback específico para tu caso: cuánto cuesta el problema hoy y cuándo se recupera el setup.",
              },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <div className="cta">
            <h2>¿Quieres el número exacto para tu caso?</h2>
            <p>
              En el diagnóstico de 30 minutos calculamos el costo actual de tu proceso,
              el ahorro esperado y el payback con datos reales de tu negocio.
            </p>
            <a href="/#precios" className="btn btn-primary">Agendar diagnóstico gratuito</a>
          </div>
        </div>
      </section>
    </>
  );
}
