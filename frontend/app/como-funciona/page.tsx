import { Fragment } from "react";
import Link from "next/link";

export const metadata = {
  title: "Cómo funciona el servicio — Korriente Agentes",
  description:
    "El recorrido completo de Korriente Agentes, explicado en simple: desde el diagnóstico hasta tu agente operando 24/7. Dónde vive todo, cómo se controla el pago, qué ves en tu panel y cómo cuidamos tus datos.",
};

/* El recorrido del cliente, de principio a fin. Lenguaje claro, sin jerga. */
const RECORRIDO = [
  {
    n: 1,
    t: "Diagnóstico (30 min, gratis)",
    d: "Conversamos sobre un proceso concreto —responder leads, cobrar, agendar— y calculamos cuánto te cuesta hoy en horas y oportunidades perdidas. Sales con un número de ROI antes de comprometerte a nada.",
  },
  {
    n: 2,
    t: "Propuesta y contrato",
    d: "Recibes por escrito el alcance exacto: qué hará el agente, qué se conecta, en cuánto tiempo y en qué plan. Lo que dice el papel es lo que se entrega. Firmas y pagas el setup inicial por un link de Flow.",
  },
  {
    n: 3,
    t: "Integración (5–10 días hábiles)",
    d: "Conectamos tu WhatsApp Business oficial, tu correo o CRM, y cargamos tu información (catálogo, precios, políticas) para que el agente responda con TUS datos reales. Tú no instalas nada.",
  },
  {
    n: 4,
    t: "Pruebas (tú apruebas)",
    d: "El agente corre con datos reales pero sin enviar mensajes a tus clientes todavía. Revisas cómo clasifica, qué responde y cuándo escala a una persona. Recién cuando lo apruebas, sale a producción.",
  },
  {
    n: 5,
    t: "Salida en vivo",
    d: "El agente empieza a atender 24/7 en tu WhatsApp. Responde en segundos, registra cada conversación y deriva a tu equipo los casos delicados. Monitoreamos de cerca las primeras 48 horas.",
  },
  {
    n: 6,
    t: "Operación y ajuste",
    d: "Cada mes el agente trabaja dentro de los límites de tu plan, con tope de gasto y alertas. A los 30 días revisamos métricas reales y afinamos. El servicio mejora con el tiempo.",
  },
];

/* Las piezas del sistema, explicadas como las entiende un dueño de PyME. */
const PIEZAS = [
  {
    ico: "💬",
    t: "Tu WhatsApp / email",
    d: "El canal donde tus clientes ya te escriben. Usamos la API oficial de WhatsApp Business (vía 360dialog), así que no hay riesgo de baneo.",
  },
  {
    ico: "🤖",
    t: "El agente de IA",
    d: "El cerebro: entiende lo que pide el cliente en lenguaje natural, busca en tu información y decide responder o escalar. Sin árboles de 'marque 1, marque 2'.",
  },
  {
    ico: "🔌",
    t: "Tus conexiones",
    d: "El agente actúa en tu mundo: crea el lead en tu CRM, agenda en tu calendario, deja registro en una planilla. Solo lo que tu proceso necesita.",
  },
  {
    ico: "📊",
    t: "Tu panel",
    d: "Donde ves que está funcionando: conversaciones atendidas, tiempo de respuesta, casos que escalaron y tu gasto real del mes. Sin sorpresas.",
  },
];

/* FAQ orientado al servicio, no a la tecnología. */
const FAQ = [
  {
    q: "¿Dónde queda alojado todo? ¿Mis datos salen de Chile?",
    a: "El servicio corre en servidores en la nube (Railway/Render en Fase inicial; infraestructura dedicada a medida que creces). Guardamos lo mínimo necesario y enmascaramos los datos personales en los registros. El contenido que el agente usa para responder es tu información de negocio (catálogo, precios), no datos sensibles. Todo queda en el contrato con cláusula de tratamiento de datos según la Ley 19.628.",
  },
  {
    q: "¿Qué pasa si un mes no pago?",
    a: "El cobro mensual es automático por Flow. Si un pago falla, te avisamos y tienes unos días de gracia sin que se corte nada. Si aún así no se regulariza, el agente entra en pausa: deja de gastar y responde un mensaje de cortesía, sin perder tu configuración. Apenas pagas, vuelve a funcionar en minutos.",
  },
  {
    q: "¿Me puede llegar una factura sorpresa?",
    a: "No. Cada plan tiene un tope de gasto en dólares (budget cap) y un límite de conversaciones. Al llegar al 80% te avisamos; al 100% el agente deja de gastar y deriva a una persona. Nunca gasta por encima del tope, pase lo que pase.",
  },
  {
    q: "¿Necesito saber de tecnología o instalar algo?",
    a: "No. Nosotros hacemos la integración y la configuración. Tú apruebas el comportamiento del agente en las pruebas y luego usas tu panel para ver cómo va. Si sabes leer un WhatsApp, puedes operar esto.",
  },
  {
    q: "¿El agente reemplaza a mi equipo?",
    a: "No. Maneja el volumen repetitivo y deriva a un humano lo sensible: reclamos, montos altos, casos delicados o cuando el cliente pide hablar con una persona. Tu equipo se enfoca en lo que de verdad necesita criterio.",
  },
  {
    q: "¿Puedo cambiar de plan o cancelar?",
    a: "Sí. Subes de plan cuando quieras (efectivo al día siguiente). Para bajar o cancelar pedimos 30 días de aviso, para no cortar el servicio de golpe. Sin permanencias forzadas.",
  },
];

export default function ComoFunciona() {
  return (
    <>
      {/* HERO */}
      <header className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <span className="eyebrow">Cómo funciona · El servicio de principio a fin</span>
          <h1>
            Todo el proceso, <span className="grad">explicado en simple</span>
          </h1>
          <p className="lead doc-lead">
            Desde la primera conversación hasta tu agente atendiendo solo, 24/7. Qué pasa en
            cada etapa, dónde vive todo, cómo se controla el pago y qué ves tú. Para que
            sepas exactamente en qué te estás metiendo — sin letra chica.
          </p>
          <div className="hero-cta">
            <a href="#recorrido" className="btn btn-primary">Ver el recorrido</a>
            <Link href="/docs" className="btn btn-ghost">Cómo funciona el agente por dentro</Link>
          </div>
        </div>
      </header>

      {/* EL RECORRIDO */}
      <section id="recorrido" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">El recorrido</div>
            <h2>De tu problema a un agente funcionando, paso a paso</h2>
            <p>Seis etapas. En cada una sabes qué pasa, cuánto demora y qué decides tú.</p>
          </div>
          <div className="ptabs-wrap">
            <div className="ptab-steps">
              {RECORRIDO.map((s) => (
                <div className="ptab-step" key={s.n}>
                  <div className="ptab-num">{s.n}</div>
                  <div>
                    <h4 className="ptab-step-title">{s.t}</h4>
                    <p className="ptab-step-desc">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LAS PIEZAS */}
      <section id="piezas">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Las piezas</div>
            <h2>Cómo se conecta a tu negocio</h2>
            <p>Cuatro piezas, ni una más de lo necesario. Así fluye una conversación real.</p>
          </div>

          {/* Flujo visual */}
          <div className="flow" style={{ marginBottom: 32 }}>
            <Fragment>
              <div className="flow-step">
                <div className="s-k">Cliente</div>
                <h4>Escribe por WhatsApp</h4>
                <p>"Hola, ¿hacen despacho a Concepción y cuánto sale el plan pro?"</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="s-k">Agente</div>
                <h4>Entiende y busca</h4>
                <p>Identifica la intención y busca la respuesta en TU información cargada.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="s-k">Acción</div>
                <h4>Responde y registra</h4>
                <p>Contesta con datos reales, crea el lead en tu CRM y deja la traza.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="s-k">Tú</div>
                <h4>Lo ves en el panel</h4>
                <p>Conversación atendida en segundos, sin que levantaras un dedo.</p>
              </div>
            </Fragment>
          </div>

          <div className="feature-grid">
            {PIEZAS.map((p) => (
              <div className="feature" key={p.t}>
                <h3><span style={{ marginRight: 8 }}>{p.ico}</span>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DÓNDE VIVE TODO */}
      <section id="infra" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Dónde vive todo</div>
            <h2>La infraestructura, sin tecnicismos</h2>
            <p>No necesitas servidores ni instalar nada. Esto es lo que hay detrás y quién lo opera.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">☁️</div>
              <h3>En la nube, operado por nosotros</h3>
              <p>El agente corre en servidores en la nube que Korriente administra y monitorea. Tú no mantienes nada: te llega funcionando.</p>
            </div>
            <div className="step">
              <div className="num">🔒</div>
              <h3>Tus llaves, cifradas</h3>
              <p>Las claves de los servicios (IA, WhatsApp) se guardan cifradas, nunca en archivos sueltos. Una llave por cliente, rotable si hace falta.</p>
            </div>
            <div className="step">
              <div className="num">🇨🇱</div>
              <h3>Datos con cuidado (Ley 19.628)</h3>
              <p>Guardamos lo mínimo, enmascaramos lo personal y nunca datos bancarios en claro. Con cláusula de tratamiento de datos en el contrato.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL DE PAGO Y SERVICIO */}
      <section id="pago">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Pago y control del servicio</div>
            <h2>Pagas, funciona. Es así de directo.</h2>
            <p>El cobro y el servicio están enganchados de forma transparente. Sin sorpresas en ninguna dirección.</p>
          </div>
          <div className="compare">
            <div className="card" style={{ borderColor: "var(--brand)" }}>
              <h3>Mientras tu plan está al día</h3>
              <ul>
                <li>Cobro mensual automático por Flow (Webpay, transferencia o tarjeta).</li>
                <li>El agente opera 24/7 dentro de los límites de tu plan.</li>
                <li>Aviso al 80% del tope de gasto, antes de cualquier sorpresa.</li>
                <li>Tope duro al 100%: nunca se gasta de más.</li>
              </ul>
            </div>
            <div className="card">
              <h3>Si un pago falla</h3>
              <ul>
                <li>Te avisamos de inmediato y tienes días de gracia.</li>
                <li>Durante la gracia, el agente sigue funcionando normal.</li>
                <li>Si no se regulariza, entra en pausa (no gasta, no se pierde nada).</li>
                <li>Apenas pagas, vuelve a funcionar en minutos.</li>
              </ul>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 18, maxWidth: 720, marginInline: "auto" }}>
            Nunca tocamos tu tarjeta ni tus cuentas: el pago lo procesa Flow, el servicio
            chileno especializado. Nosotros solo activamos o pausamos tu agente según tu estado.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Preguntas frecuentes</div>
            <h2>Lo que todos preguntan antes de partir</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
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
            <h2>¿Lo vemos con tu caso?</h2>
            <p>Agenda un diagnóstico de 30 minutos. Salís con un número claro de cuánto te cuesta el problema hoy y cómo sería tu agente.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#precios" className="btn btn-primary">Agendar diagnóstico</a>
              <Link href="/workflows" className="btn btn-ghost" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
                Ver los workflows
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
