import { Fragment } from "react";
import Link from "next/link";

export const metadata = {
  title: "Documentación — Cómo funcionan los agentes Korriente",
  description:
    "Cómo funcionan nuestros agentes de IA: clasificación de intención, RAG (responde desde tus documentos), escalamiento a humano (HITL), conectores y control de costo. Explicado en simple y honesto sobre qué ya funciona y qué está en camino.",
};

/* El flujo que sigue un agente con CADA mensaje. Es determinista y queda registrado. */
const FLOW = [
  { k: "1 · Recibe", t: "Entra el mensaje", d: "Llega por WhatsApp o email. Se normaliza y se identifica al cliente y a qué negocio pertenece." },
  { k: "2 · Clasifica", t: "Entiende la intención", d: "Un modelo económico decide: ¿cotización, consulta, reclamo o spam? Con un nivel de confianza." },
  { k: "3 · Recupera", t: "Busca en TUS documentos", d: "Si es una consulta, recupera los fragmentos relevantes de tu catálogo/FAQ (RAG) para responder con datos reales." },
  { k: "4 · Responde", t: "Contesta o escala", d: "Responde fundamentado en tu información — o deriva a una persona si es sensible o no tiene la respuesta." },
];

/* Capacidades con estado HONESTO: lo que ya corre vs lo que está en entrega/desarrollo. */
const FEATURES = [
  {
    t: "Clasificación de intención",
    s: "ready",
    d: "Cada mensaje se etiqueta (cotización, consulta, reclamo, spam) con un nivel de confianza. Es la base de qué hace el agente después.",
  },
  {
    t: "Escalamiento a humano (HITL)",
    s: "ready",
    d: "El agente nunca decide solo lo sensible: reclamos, montos altos, baja confianza o cuando el cliente pide una persona. Ahí deriva a tu equipo con el contexto.",
  },
  {
    t: "Control de costo (budget cap)",
    s: "ready",
    d: "Cada plan tiene un tope de gasto en dólares y un límite de conversaciones. Al 80% se avisa; el budget cap nunca se sobrepasa. Sin facturas sorpresa.",
  },
  {
    t: "Provider-agnóstico",
    s: "ready",
    d: "El modelo de IA es una pieza intercambiable. Usamos modelos económicos por defecto y podemos cambiar de proveedor sin reescribir el agente.",
  },
  {
    t: "RAG — responde desde tus documentos",
    s: "dev",
    d: "El agente consulta tu catálogo, precios y políticas para responder con TU información real, sin inventar. En desarrollo (SPEC-004), parte con el primer cliente.",
  },
  {
    t: "Memoria conversacional",
    s: "dev",
    d: "Entiende preguntas de seguimiento en una conversación ('¿y ese incluye delivery?') condensando el contexto. En desarrollo junto con RAG.",
  },
  {
    t: "Conectores (WhatsApp, email, CRM, Sheets)",
    s: "dev",
    d: "Tools que el agente usa para actuar: responder, crear el lead en tu CRM, dejar registro. Probados en modo simulado; la versión real (WhatsApp oficial 360dialog) entra en la primera entrega.",
  },
  {
    t: "Trazabilidad y métricas",
    s: "ready",
    d: "Cada corrida deja una traza: intención, confianza, costo y si escaló. En el panel ves tiempo de respuesta, conversaciones y gasto real.",
  },
];

/* Glosario: los términos 'populares' de agentes, definidos en simple y sin humo. */
const GLOSSARY = [
  { t: "RAG (Retrieval-Augmented Generation)", d: "El agente busca primero en TUS documentos y recién entonces redacta la respuesta. Así contesta con tu catálogo y políticas reales en vez de inventar." },
  { t: "HITL (Human-in-the-loop)", d: "Diseñar al agente para que pase a una persona en los casos delicados. No es una falla: es una regla de calidad y confianza." },
  { t: "Tool-calling / Conectores", d: "Las 'herramientas' que el agente usa para actuar en el mundo: mandar un WhatsApp, crear un lead en el CRM, escribir en una planilla." },
  { t: "Embeddings", d: "Convertir texto en números para poder buscar por significado, no por palabras exactas. Es lo que hace posible RAG." },
  { t: "Provider-agnóstico", d: "No casarse con un solo proveedor de IA. El modelo se puede cambiar sin tocar la lógica del agente — control de costo y de riesgo." },
  { t: "ReAct", d: "Un patrón donde el modelo decide sus acciones en un loop abierto. Potente, pero impredecible y caro. Nosotros usamos un pipeline controlado (ver abajo) — a propósito." },
  { t: "Budget cap", d: "El tope de gasto real de APIs por mes. Es un límite duro: el agente nunca gasta por encima, pase lo que pase." },
];

export default function Docs() {
  return (
    <>
      {/* HERO */}
      <header className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <span className="eyebrow">Documentación · Cómo funcionan los agentes</span>
          <h1>
            Agentes de IA, <span className="grad">explicados sin humo</span>
          </h1>
          <p className="lead doc-lead">
            Lo que hay debajo de un agente Korriente: cómo decide, cómo responde con TU
            información, cuándo llama a una persona y cómo mantenemos el costo bajo control.
            Los conceptos modernos de agentes —RAG, HITL, tool-calling— en simple, y
            honestos sobre qué ya funciona y qué está en camino.
          </p>
        </div>
      </header>

      {/* EL FLUJO */}
      <section id="flujo" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">El flujo</div>
            <h2>Qué hace el agente con cada mensaje</h2>
            <p>Cuatro pasos controlados y registrados. Nada de magia ni de cajas negras.</p>
          </div>
          <div className="flow">
            {FLOW.map((f, i) => (
              <Fragment key={f.k}>
                <div className="flow-step">
                  <div className="s-k">{f.k}</div>
                  <h4>{f.t}</h4>
                  <p>{f.d}</p>
                </div>
                {i < FLOW.length - 1 && <div className="flow-arrow">→</div>}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CAPACIDADES */}
      <section id="capacidades">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Capacidades</div>
            <h2>Qué hace hoy (y qué está en camino)</h2>
            <p>Marcamos cada capacidad con su estado real. Sin prometer lo que todavía no corre.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature" key={f.t}>
                <h3>
                  {f.t}
                  <span className={`status ${f.s}`}>
                    {f.s === "ready" ? "Disponible" : "En desarrollo"}
                  </span>
                </h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RAG EXPLICADO */}
      <section id="rag" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">RAG en simple</div>
            <h2>Responde con TU información, no con inventos</h2>
            <p>
              RAG = el agente busca primero en tus documentos y recién ahí redacta la respuesta.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <h3>Cargamos tus documentos</h3>
              <p>Catálogo, precios, políticas, FAQ. Se procesan una sola vez, en el onboarding, y quedan asociados solo a tu negocio.</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h3>Busca por significado</h3>
              <p>Cuando un cliente pregunta, el agente encuentra los fragmentos relevantes de TUS documentos —aunque la pregunta use otras palabras.</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h3>Responde o se abstiene</h3>
              <p>Redacta usando solo esa información. ¿No está en tus documentos? No inventa: lo dice y deriva a una persona. Cero precios o plazos falsos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PIPELINE vs ReAct */}
      <section id="diseno">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Diseño</div>
            <h2>Por qué un pipeline controlado y no un agente «suelto»</h2>
            <p>La diferencia honesta entre lo que vende y lo que sirve a una PyME.</p>
          </div>
          <div className="compare">
            <div className="card">
              <h3>Agente ReAct «libre»</h3>
              <ul>
                <li>El modelo decide sus acciones en un loop abierto.</li>
                <li>Impredecible: difícil saber qué hará en cada caso.</li>
                <li>Más caro: muchas llamadas al modelo por mensaje.</li>
                <li>Más riesgo de alucinar o salirse del guion.</li>
                <li>Difícil de auditar y de poner topes de costo.</li>
              </ul>
            </div>
            <div className="card" style={{ borderColor: "var(--brand)" }}>
              <h3>Pipeline Korriente</h3>
              <ul>
                <li>Pasos definidos: clasificar → recuperar → responder → escalar.</li>
                <li>Predecible: sabés exactamente qué hace en cada intención.</li>
                <li>Económico: solo gasta cuando aporta (no en spam o reclamos).</li>
                <li>Fundamentado en tus documentos, con abstención si no sabe.</li>
                <li>Auditable, con tope de gasto y reglas de escalamiento claras.</li>
              </ul>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 18, maxWidth: 720, marginInline: "auto" }}>
            No es que «no podamos» hacer ReAct: elegimos el pipeline a propósito. Para una
            PyME, un agente predecible y barato vale más que uno impresionante y descontrolado.
          </p>
        </div>
      </section>

      {/* COSTO */}
      <section>
        <div className="container">
          <div className="guarantee">
            <h2>Tu costo, siempre bajo control</h2>
            <p>
              Modelos económicos por defecto, un tope de gasto (budget cap) por plan y aviso
              al 80%. El agente solo gasta cuando aporta, y nunca por encima del tope. Esa es
              la promesa — y está escrita en nuestra constitución técnica.
            </p>
          </div>
        </div>
      </section>

      {/* DATOS */}
      <section id="datos" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Datos · Ley 19.628</div>
            <h2>Tus datos, tratados con cuidado</h2>
            <p>
              Minimizamos lo que se guarda, enmascaramos la información personal en los
              registros (ej. <code>+569****1234</code>) y nunca almacenamos datos bancarios en
              claro. El contenido que indexamos para RAG es tu información de negocio
              (catálogo, FAQ), no datos personales. Incluimos cláusula de tratamiento de datos
              en el contrato y anticipamos la nueva Ley 21.719.
            </p>
          </div>
        </div>
      </section>

      {/* GLOSARIO */}
      <section id="glosario">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Glosario</div>
            <h2>Los términos «de moda», sin humo</h2>
            <p>Para que entiendas qué te están vendiendo cuando hablan de agentes de IA.</p>
          </div>
          <div className="glossary">
            {GLOSSARY.map((g) => (
              <div className="term" key={g.t}>
                <b>{g.t}</b> — <span>{g.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <div className="cta">
            <h2>¿Quieres ver esto funcionando con tu caso?</h2>
            <p>Agenda un diagnóstico de 30 minutos. Te mostramos el agente y un número claro de cuánto te cuesta el problema hoy.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#precios" className="btn btn-primary">Agendar diagnóstico</a>
              <Link href="/#demo" className="btn btn-ghost" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
                Ver demo en vivo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
