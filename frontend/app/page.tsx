import LiveDemo from "@/components/LiveDemo";
import { PLANS_FALLBACK } from "@/lib/plans";
import { clp } from "@/lib/format";

const STEPS = [
  {
    n: 1,
    t: "Diagnóstico de 30 min",
    d: "Revisamos un proceso concreto (leads o cobranza) y calculamos cuánto te cuesta hoy en horas y oportunidades perdidas.",
  },
  {
    n: 2,
    t: "Agente en producción en 30 días",
    d: "Conectamos WhatsApp/email y dejamos el agente respondiendo y registrando todo, con tope de gasto y reglas de escalamiento a humano.",
  },
  {
    n: 3,
    t: "Resultados medibles",
    d: "Ves en el panel el tiempo de respuesta, conversaciones atendidas y costo real. Iteramos con datos, no con corazonadas.",
  },
];

const FAQ = [
  {
    q: "¿Me pueden banear el WhatsApp?",
    a: "No, porque usamos la API oficial de WhatsApp Business (vía un proveedor autorizado). El baneo viene de herramientas no oficiales o de mandar spam sin consentimiento. Nosotros operamos con opt-in, plantillas aprobadas y la ventana de 24 horas.",
  },
  {
    q: "¿Y si se dispara el costo?",
    a: "Cada plan tiene un tope de gasto y un límite de conversaciones. Al llegar al 80% te avisamos y al 100% el agente deja de gastar y deriva a una persona. Nunca recibes una factura sorpresa.",
  },
  {
    q: "¿Reemplaza a mi equipo?",
    a: "No. El agente maneja el volumen repetitivo y deriva a un humano lo sensible (reclamos, montos altos, casos delicados). Tu equipo se enfoca en lo que de verdad necesita criterio.",
  },
  {
    q: "¿Qué pasa con mis datos? (Ley 19.628)",
    a: "Minimizamos los datos que se guardan, enmascaramos información personal en los registros y nunca almacenamos datos bancarios en claro. Incluimos cláusula de tratamiento de datos en el contrato.",
  },
];

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="container">
          <span className="eyebrow">Para PyMEs chilenas · WhatsApp + Email</span>
          <h1>
            Agentes de IA que <span className="grad">responden tus leads</span>
            <br /> y cobran tus facturas, 24/7
          </h1>
          <p className="lead">
            Dejá de perder clientes por responder tarde. Korriente implementa agentes que
            atienden en segundos, escalan a una persona cuando hace falta y mantienen el
            costo bajo control.
          </p>
          <div className="hero-cta">
            <a href="#precios" className="btn btn-primary">Agendar diagnóstico de 30 min</a>
            <a href="#demo" className="btn btn-ghost">Ver demo en vivo</a>
          </div>
          <p className="trust">Tiempo de respuesta de 36 h → menos de 2 min · ROI medible en 30 días</p>
        </div>
      </header>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Cómo funciona</div>
            <h2>De tu problema a un agente funcionando, en 3 pasos</h2>
            <p>Sin jerga técnica. Vendemos resultados, no tecnología.</p>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Demo en vivo</div>
            <h2>Probá el clasificador de leads ahora mismo</h2>
            <p>Escribe un mensaje como lo haría un cliente (o usa un ejemplo) y mira qué decide el agente.</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Precios</div>
            <h2>Planes simples, con límites que te protegen</h2>
            <p>Cada plan trae un tope de gasto. Si lo alcanzas, el agente deriva a humano en vez de seguir gastando.</p>
          </div>
          <div className="plans">
            {PLANS_FALLBACK.map((p) => (
              <div className={`plan ${p.highlight ? "highlight" : ""}`} key={p.key}>
                {p.highlight && <span className="badge">Más elegido</span>}
                <h3>{p.name}</h3>
                <div className="amt">
                  {clp(p.monthly_clp)} <span>/mes + IVA</span>
                </div>
                <div className="setup">Setup único {clp(p.setup_clp)}</div>
                <ul>
                  <li>{p.max_agents} agente{p.max_agents > 1 ? "s" : ""} de IA</li>
                  <li>{p.included_conversations.toLocaleString("es-CL")} conversaciones/mes</li>
                  <li>Tope de gasto US${p.budget_cap_usd} (sin sorpresas)</li>
                  <li>Escalamiento a humano incluido</li>
                </ul>
                <a href="#" className="btn btn-primary" style={{ width: "100%" }}>Empezar</a>
                <p className="target">{p.target}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTÍA */}
      <section>
        <div className="container">
          <div className="guarantee">
            <h2>Tu costo, siempre bajo control</h2>
            <p>
              Modelos de IA económicos por defecto, tope de gasto por plan y aviso al 80%.
              Nunca cobramos más de lo que tu PyME puede pagar — esa es la promesa.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Preguntas frecuentes</div>
            <h2>Lo que todos preguntan</h2>
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
            <h2>¿Listo para dejar de perder leads?</h2>
            <p>Agenda un diagnóstico de 30 minutos. Salís con un número claro de cuánto te cuesta el problema hoy.</p>
            <a href="#precios" className="btn btn-primary">Agendar diagnóstico</a>
          </div>
        </div>
      </section>
    </>
  );
}
