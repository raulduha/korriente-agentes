import LiveDemo from "@/components/LiveDemo";
import PricingTabs from "@/app/components/PricingTabs";
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

      {/* AGENTES CON VOZ */}
      <section id="voz">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Agentes con voz · Llamadas reales</div>
            <h2>El cliente habla normal — sin menús, sin "marque 1 para ventas"</h2>
            <p>
              No es un IVR. El agente entiende lo que dice el cliente en lenguaje natural, responde
              con voz humana (≈ 1 segundo de latencia) y resuelve o escala según el caso.
              Funciona con llamadas entrantes y salientes.
            </p>
          </div>

          {/* Casos de uso */}
          <div className="feature-grid" style={{ marginBottom: 36 }}>
            <div className="feature">
              <h3>📅 Recepción y agenda</h3>
              <p>Responde llamadas 24/7, da información de horarios y precios, y agenda citas directo en Google Calendar o tu sistema de turnos.</p>
            </div>
            <div className="feature">
              <h3>📞 Seguimiento de leads</h3>
              <p>Llama al lead a los 30 segundos de que llena un formulario web. Lo califica y agenda una reunión con tu equipo — cuando el interés es máximo.</p>
            </div>
            <div className="feature">
              <h3>💰 Recordatorio de cobro</h3>
              <p>Llama a clientes con facturas vencidas, negocia una fecha de pago y registra el acuerdo. Sin tensión: voz amable, sin presión.</p>
            </div>
            <div className="feature">
              <h3>✅ Confirmación de pedidos</h3>
              <p>Llama antes del despacho para confirmar dirección y horario. Reduce devoluciones y mejora la experiencia sin agregar personal.</p>
            </div>
          </div>

          {/* Stack técnico */}
          <div className="voice-stack-wrap">
            <h3 className="voice-stack-title">Cómo funciona por dentro</h3>
            <div className="voice-stack">
              <div className="vstack-node vstack-trigger">
                <div className="vstack-ico">📞</div>
                <div className="vstack-label">Llamada</div>
                <div className="vstack-sub">Twilio · número DID</div>
              </div>
              <div className="vstack-arrow">→</div>
              <div className="vstack-node vstack-stt">
                <div className="vstack-ico">🎙️</div>
                <div className="vstack-label">Transcripción</div>
                <div className="vstack-sub">Deepgram Nova-3 · español</div>
              </div>
              <div className="vstack-arrow">→</div>
              <div className="vstack-node vstack-llm">
                <div className="vstack-ico">🤖</div>
                <div className="vstack-label">Razonamiento</div>
                <div className="vstack-sub">Claude Haiku · contexto</div>
              </div>
              <div className="vstack-arrow">→</div>
              <div className="vstack-node vstack-tts">
                <div className="vstack-ico">🔊</div>
                <div className="vstack-label">Voz natural</div>
                <div className="vstack-sub">ElevenLabs · latencia 75 ms</div>
              </div>
              <div className="vstack-arrow">→</div>
              <div className="vstack-node vstack-n8n">
                <div className="vstack-ico">⚙️</div>
                <div className="vstack-label">Post-llamada</div>
                <div className="vstack-sub">n8n · CRM + alerta</div>
              </div>
            </div>
            <p className="voice-stack-note">
              Plataforma de orquestación: <strong>Retell AI</strong> o <strong>Vapi</strong> — ambas tienen integración nativa con n8n vía webhook.
              El agente puede colgar, escalar la llamada a un humano o disparar una acción (enviar un mail, registrar en CRM, agendar en calendario) al terminar.
            </p>
          </div>

          {/* Costos reales */}
          <h3 style={{ marginTop: 36, marginBottom: 12, fontSize: 17 }}>Costos reales por minuto de llamada</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="ptable" style={{ marginBottom: 10 }}>
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>Costo / min</th>
                  <th>Qué hace</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plataforma — Retell AI</td>
                  <td><b>US$0,07</b></td>
                  <td style={{ color: "var(--muted)" }}>Orquesta STT + LLM + TTS en tiempo real con latencia &lt;1,5 s</td>
                </tr>
                <tr>
                  <td>Transcripción — Deepgram Nova-3</td>
                  <td><b>US$0,008</b></td>
                  <td style={{ color: "var(--muted)" }}>Speech-to-text en español, streaming en tiempo real</td>
                </tr>
                <tr>
                  <td>IA — Claude Haiku</td>
                  <td><b>US$0,003</b></td>
                  <td style={{ color: "var(--muted)" }}>Entiende intención, mantiene contexto, decide acción</td>
                </tr>
                <tr>
                  <td>Voz — ElevenLabs Multilingual v2</td>
                  <td><b>US$0,04</b></td>
                  <td style={{ color: "var(--muted)" }}>Voz humana en español de Chile, 75 ms de latencia</td>
                </tr>
                <tr>
                  <td>Telefonía — Twilio</td>
                  <td><b>US$0,015</b></td>
                  <td style={{ color: "var(--muted)" }}>Número DID + minuto de llamada inbound/outbound</td>
                </tr>
                <tr style={{ background: "var(--brand-soft)" }}>
                  <td><b>Total estimado</b></td>
                  <td><b>≈ US$0,14 / min</b></td>
                  <td style={{ color: "var(--muted)" }}>200 llamadas × 4 min ≈ <b>US$112 / mes</b> (≈ CLP 105.000)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 0 }}>
            Referencia: un agente humano atendiendo esas mismas 800 min/mes cuesta ≈ CLP 250.000–350.000/mes solo en sueldo,
            sin contar capacitación ni disponibilidad 24/7. Precios Retell/Deepgram/ElevenLabs a junio 2026 — confirmar en cada plataforma.
          </p>
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

      {/* PROCESO + PAGOS */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Transparencia total</div>
            <h2>Cómo es contratar y cómo se manejan los pagos</h2>
            <p>Sin letra chica, sin sorpresas. Esto es exactamente lo que ocurre de principio a fin.</p>
          </div>
          <PricingTabs />
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
