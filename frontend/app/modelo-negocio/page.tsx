import Link from "next/link";
import { PLANS_FALLBACK } from "@/lib/plans";

export const metadata = {
  title: "Modelo de negocio — Korriente Agentes",
  description:
    "Qué estás comprando exactamente: un servicio gestionado, no un software. Cómo cobramos, qué incluye cada parte, las reglas del modelo y por qué nos conviene a ambos. Sin letra chica.",
};

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

/* Las 4 reglas del modelo gestionado (alineadas con docs/plan-negocio.md §1). */
const REGLAS = [
  {
    ico: "⏸️",
    t: "Pausa, no cancela",
    d: "Si un mes no pagas, el agente se pausa: deja de gastar y responde un mensaje de cortesía. Tu configuración queda intacta y revive en minutos cuando pagas. Borrar algo es siempre una decisión tuya, nunca un castigo automático.",
  },
  {
    ico: "👀",
    t: "Tú ves, nosotros operamos",
    d: "Tu panel es de solo lectura: conversaciones, métricas, gasto real. No tienes que configurar ni mantener nada — y tampoco puedes romper nada. La operación, el monitoreo y las mejoras son nuestro trabajo, no el tuyo.",
  },
  {
    ico: "🛠️",
    t: "Cambios menores incluidos, mayores cotizados",
    d: "¿Cambió un precio, un horario, una política? Lo pides por el canal de solicitudes y lo aplicamos sin costo. Si el cambio es un proceso nuevo (otro flujo, otra integración), te lo cotizamos por escrito antes de mover un dedo.",
  },
  {
    ico: "🛑",
    t: "Tope de gasto duro",
    d: "Cada plan tiene un presupuesto máximo de IA. Al 80% te avisamos; al 100% el agente deriva a tu equipo en vez de seguir gastando. La factura sorpresa no existe en este modelo, por diseño.",
  },
];

const FAQ = [
  {
    q: "¿Por qué cobran un setup además de la mensualidad?",
    a: "Porque son dos trabajos distintos. El setup paga el trabajo consultivo de una vez: diagnóstico, conectar tu WhatsApp oficial, cargar tu información, configurar las reglas y probar contigo hasta que apruebes. La mensualidad paga la operación continua: servidores, costos de IA, monitoreo, alertas y los ajustes menores. Separarlos hace que cada peso tenga nombre y apellido.",
  },
  {
    q: "¿Quedo amarrado con un contrato a plazo?",
    a: "No. La suscripción es mes a mes. Para bajar de plan o irte pedimos 30 días de aviso, solamente para no cortar el servicio de golpe a tus clientes. Eso significa que tenemos que ganarnos tu renovación todos los meses con resultados, no con una cláusula.",
  },
  {
    q: "¿Por qué no puedo editar el agente yo mismo?",
    a: "Porque un agente que atiende a tus clientes reales es como la contabilidad: poder editarla sin saber, a las 11 de la noche, es un riesgo, no una libertad. En esta etapa el valor está en que un especialista haga los cambios, los pruebe y se haga responsable. Cuando el producto madure a una versión auto-administrable, nuestros clientes actuales serán los primeros en tenerla.",
  },
  {
    q: "¿Qué pasa con mi información si me voy?",
    a: "Es tuya. Te entregamos el historial de conversaciones y la información de negocio que cargamos (catálogo, plantillas, reglas) en formato exportable, y eliminamos tus datos de nuestros sistemas según la cláusula de tratamiento de datos del contrato.",
  },
  {
    q: "¿Qué cuenta como cambio menor y qué como cambio mayor?",
    a: "Menor: ajustar textos, precios, horarios, agregar preguntas frecuentes, afinar cuándo escala a humano. Mayor: un canal nuevo, una integración nueva, un proceso distinto al contratado. La regla práctica: si cambia LO QUE el agente hace, se cotiza; si cambia CÓMO dice o decide lo que ya hace, está incluido. Y cada solicitud queda registrada por escrito, así nunca discutimos de memoria.",
  },
  {
    q: "¿Y si mi caso no calza con ningún plan?",
    a: "Te lo decimos en el diagnóstico, gratis. Si tu proceso necesita algo fuera del molde, lo cotizamos como proyecto a medida; y si creemos que un agente no te va a dar retorno, también te lo decimos. Un cliente al que no le resulta nos cuesta más caro que decir que no.",
  },
];

export default function ModeloNegocio() {
  return (
    <>
      {/* HERO */}
      <header className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <span className="eyebrow">Modelo de negocio · Qué estás comprando exactamente</span>
          <h1>
            Un servicio gestionado, <span className="grad">no un software más</span>
          </h1>
          <p className="lead doc-lead">
            No te vendemos una licencia ni una plataforma para que la armes tú. Te vendemos
            un proceso de tu negocio funcionando — instalado, operado y mejorado por
            nosotros — y tú lo ves trabajar desde tu panel. Aquí está el modelo completo:
            cómo cobramos, qué incluye cada parte y por qué está armado así.
          </p>
          <div className="hero-cta">
            <a href="#como-cobramos" className="btn btn-primary">Ver cómo cobramos</a>
            <Link href="/como-funciona" className="btn btn-ghost">Ver el proceso paso a paso</Link>
          </div>
        </div>
      </header>

      {/* QUÉ ES Y QUÉ NO ES */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">La definición</div>
            <h2>Qué es esto (y qué no es)</h2>
            <p>La palabra técnica es "servicio gestionado": como un contador externo, pero para atender clientes con IA.</p>
          </div>
          <div className="compare">
            <div className="card" style={{ borderColor: "var(--brand)" }}>
              <h3>Lo que SÍ compras</h3>
              <ul>
                <li>Un proceso concreto resuelto: responder leads, cobrar, agendar o hacer triage.</li>
                <li>Instalación completa hecha por nosotros — tú no instalas ni configuras nada.</li>
                <li>Operación continua: monitoreo, alertas, costos de IA y servidores incluidos en el plan.</li>
                <li>Un panel donde ves cada conversación, el resultado y el gasto real del mes.</li>
                <li>Un canal formal para pedir cambios, con registro por escrito.</li>
                <li>Resultados medibles: el agente declara su métrica de negocio desde el día uno.</li>
              </ul>
            </div>
            <div className="card">
              <h3>Lo que NO es</h3>
              <ul>
                <li>No es un software que descargas y te las arreglas solo.</li>
                <li>No es una plataforma donde armas flujos arrastrando cajitas (eso lo hacemos nosotros, con responsabilidad).</li>
                <li>No es una consultoría que entrega un informe y desaparece.</li>
                <li>No es un chatbot de "marque 1, marque 2" con respuestas enlatadas.</li>
                <li>No es un contrato de permanencia: es mes a mes, con 30 días de aviso.</li>
                <li>No reemplaza a tu equipo: maneja lo repetitivo y escala lo delicado a personas.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO COBRAMOS */}
      <section id="como-cobramos">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Cómo cobramos</div>
            <h2>Dos componentes, cada peso con nombre y apellido</h2>
            <p>Un pago único por dejar el agente funcionando, y una suscripción por mantenerlo operando. Nada más.</p>
          </div>
          <div className="compare" style={{ marginBottom: 28 }}>
            <div className="card">
              <h3>1 · Setup único (al partir)</h3>
              <ul>
                <li>Diagnóstico del proceso y definición del alcance por escrito.</li>
                <li>Conexión de tu WhatsApp Business oficial, correo o CRM.</li>
                <li>Carga de tu información real: catálogo, precios, políticas, tono.</li>
                <li>Pruebas contigo hasta que apruebes el comportamiento.</li>
                <li>Es trabajo consultivo de una vez: se paga una vez.</li>
              </ul>
            </div>
            <div className="card" style={{ borderColor: "var(--brand)" }}>
              <h3>2 · Suscripción mensual (mientras opera)</h3>
              <ul>
                <li>El agente atendiendo 24/7 dentro de los límites de tu plan.</li>
                <li>Costos de IA y servidores incluidos — no se cobran aparte.</li>
                <li>Monitoreo, alertas de gasto y soporte.</li>
                <li>Cambios menores incluidos (textos, precios, reglas).</li>
                <li>Si dejas de pagar, se pausa; no se borra ni se cobra de más.</li>
              </ul>
            </div>
          </div>

          {/* Tabla de planes desde la única fuente de verdad */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5, background: "#fff", border: "1px solid var(--line)", borderRadius: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "12px 16px" }}>Plan</th>
                  <th style={{ padding: "12px 16px" }}>Setup único</th>
                  <th style={{ padding: "12px 16px" }}>Mensual</th>
                  <th style={{ padding: "12px 16px" }}>Conversaciones incluidas</th>
                  <th style={{ padding: "12px 16px" }}>Para quién</th>
                </tr>
              </thead>
              <tbody>
                {PLANS_FALLBACK.map((p) => (
                  <tr key={p.key} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{p.name}</td>
                    <td style={{ padding: "12px 16px" }}>{clp(p.setup_clp)}</td>
                    <td style={{ padding: "12px 16px" }}>{clp(p.monthly_clp)} / mes</td>
                    <td style={{ padding: "12px 16px" }}>{p.included_conversations.toLocaleString("es-CL")}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{p.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13.5, marginTop: 12 }}>
            Valores en CLP + IVA. El cobro mensual se procesa por Flow (Webpay, transferencia o tarjeta).
            Detalle completo de cada plan en <a href="/#precios">precios</a>.
          </p>
        </div>
      </section>

      {/* LAS REGLAS DEL MODELO */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Las reglas</div>
            <h2>Las 4 reglas del modelo gestionado</h2>
            <p>Están pensadas para que nunca haya una sorpresa — ni en tu factura ni en tu servicio.</p>
          </div>
          <div className="feature-grid">
            {REGLAS.map((r) => (
              <div className="feature" key={r.t}>
                <h3><span style={{ marginRight: 8 }}>{r.ico}</span>{r.t}</h3>
                <p>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ESTE MODELO Y NO OTRO */}
      <section>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Las alternativas</div>
            <h2>Comparado honestamente con tus otras opciones</h2>
            <p>Tienes tres caminos para resolver el mismo problema. Esto es lo que cuesta cada uno de verdad.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">👤</div>
              <h3>Contratar a una persona</h3>
              <p>
                Sueldo desde ~$700.000 + leyes sociales, en horario laboral, con vacaciones,
                licencias y rotación. Excelente para lo que necesita criterio humano; caro
                para responder lo mismo cien veces al día. Nuestro modelo cuesta menos que
                media jornada y trabaja las 24 horas — y deriva a tu gente justo lo que sí
                necesita criterio.
              </p>
            </div>
            <div className="step">
              <div className="num">🏢</div>
              <h3>Agencia o consultora de proyecto</h3>
              <p>
                Te cobra un proyecto grande una vez, entrega y se va. Cuando algo cambia (un
                precio, una política, WhatsApp actualiza su API), no hay nadie a cargo.
                Tomamos lo bueno (el trabajo consultivo serio del setup) y le agregamos lo
                que falta: alguien que opera y responde por el agente todos los meses.
              </p>
            </div>
            <div className="step">
              <div className="num">🔧</div>
              <h3>Armarlo tú con herramientas no-code</h3>
              <p>
                Es la opción más barata en plata y la más cara en tu tiempo: aprender la
                herramienta, mantener los flujos, vigilar el gasto de IA sin tope y
                arreglarlo cuando se cae un domingo. Si te gusta ese mundo, adelante — de
                hecho regalamos <Link href="/workflows">workflows descargables</Link> para
                que partas. Nuestro servicio existe para cuando tu tiempo vale más que eso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INCENTIVOS ALINEADOS */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Por qué funciona</div>
            <h2>El modelo nos conviene a ambos — y eso es a propósito</h2>
            <p>Un buen modelo de negocio es uno donde al proveedor le va bien solo si al cliente le va bien.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">📈</div>
              <h3>Ganamos si renuevas</h3>
              <p>Sin permanencia forzada, la única forma de mantener tu suscripción es que el agente te genere más de lo que cuesta. El ROI está en tu panel, no en nuestra palabra.</p>
            </div>
            <div className="step">
              <div className="num">🧮</div>
              <h3>No ganamos con tu sobreconsumo</h3>
              <p>El precio es plano por plan, con tope de gasto. No tenemos incentivo para que el agente "hable de más": al contrario, usamos modelos de IA económicos y eficientes por defecto.</p>
            </div>
            <div className="step">
              <div className="num">🔁</div>
              <h3>Mientras más clientes del mismo rubro, mejor tu agente</h3>
              <p>Cada cliente mejora el molde: lo que aprendemos instalando agentes en negocios como el tuyo vuelve a tu agente como mejoras, sin costo extra para ti.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Preguntas frecuentes</div>
            <h2>Las preguntas comerciales, respondidas de frente</h2>
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
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <div className="cta">
            <h2>¿Te hace sentido el modelo?</h2>
            <p>Entonces el siguiente paso es ponerle números a TU caso: agenda un diagnóstico de 30 minutos, gratis y sin compromiso.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#precios" className="btn btn-primary">Agendar diagnóstico</a>
              <Link href="/como-funciona" className="btn btn-ghost" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
                Ver el proceso completo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
