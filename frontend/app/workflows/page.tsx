import { Fragment } from "react";
import Link from "next/link";
import { WORKFLOWS, INSTALL_STEPS, TRUST, PRICING_LLM } from "@/lib/workflows";

export const metadata = {
  title: "Workflows descargables — Plantillas n8n de Korriente",
  description:
    "Workflows de n8n listos para descargar, importar y adaptar: clasificador de leads, cobranza y un orquestador multi-agente de marketing. Documentados, auditables y con costo bajo control.",
};

export default function Workflows() {
  return (
    <>
      {/* HERO */}
      <header className="hero" style={{ paddingBottom: 24 }}>
        <div className="container">
          <span className="eyebrow">Plantillas n8n · Listas para descargar</span>
          <h1>
            Workflows que <span className="grad">descargas, importas y moldeas</span>
          </h1>
          <p className="lead doc-lead">
            Plantillas de automatización probadas para n8n. Las descargas, las importas en tu
            propia instancia y las adaptas a cada empresa: leads, cobranza y un orquestador
            multi-agente. Abiertas, documentadas y con el costo bajo control.
          </p>
          <div className="hero-cta">
            <a href="#workflows" className="btn btn-primary">Ver los workflows</a>
            <a href="#instalar" className="btn btn-ghost">Cómo instalar</a>
          </div>
        </div>
      </header>

      {/* POR QUÉ CONFIAR */}
      <section id="confianza" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Por qué fiarte</div>
            <h2>Hechos para que un cliente los use con confianza</h2>
            <p>No es una caja negra: es código abierto que corre en tu casa, con reglas claras.</p>
          </div>
          <div className="feature-grid">
            {TRUST.map((t) => (
              <div className="feature" key={t.t}>
                <h3>{t.t}</h3>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO INSTALAR */}
      <section id="instalar">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Cómo instalar</div>
            <h2>De la descarga a funcionando, en 4 pasos</h2>
            <p>No necesitas saber programar. Si sabes copiar y pegar una llave, puedes.</p>
          </div>
          <div className="steps" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {INSTALL_STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOWS */}
      <section id="workflows" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">El catálogo</div>
            <h2>Los workflows, explicados</h2>
            <p>Qué hace cada uno, en qué escenarios sirve, cómo funciona por dentro y qué conectar.</p>
          </div>

          {WORKFLOWS.map((w) => (
            <article className={`wf ${w.featured ? "featured" : ""}`} key={w.key} id={w.key}>
              <div className="wf-top">
                <div className="wf-ico">{w.ico}</div>
                <div>
                  <div className="wf-cat">{w.cat}</div>
                  <h3>{w.name}</h3>
                </div>
              </div>
              <p className="wf-tag">{w.tagline}</p>

              <div className="wf-cols">
                {/* IZQUIERDA: explicación */}
                <div>
                  <div className="wf-block">
                    <h4>Qué hace</h4>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: 14.5 }}>{w.queHace}</p>
                  </div>

                  <div className="wf-block">
                    <h4>Escenarios reales</h4>
                    <ul className="wf-list">
                      {w.escenarios.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="wf-block">
                    <h4>Cómo funciona (los nodos)</h4>
                    <div className="wf-flow">
                      {w.flujo.map((n, i) => (
                        <Fragment key={i}>
                          <span className="node">{n}</span>
                          {i < w.flujo.length - 1 && <span className="node-arrow">→</span>}
                        </Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="wf-block" style={{ marginBottom: 0 }}>
                    <h4>Qué conectar</h4>
                    <div className="pills">
                      {w.conectores.map((c) => (
                        <span className="pill" key={c}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DERECHA: meta + descarga */}
                <div className="wf-meta">
                  <dl style={{ margin: 0 }}>
                    <dt>Modelo de IA</dt>
                    <dd>{w.modelo}</dd>
                    <dt>Costo aprox.</dt>
                    <dd>{w.costo}</dd>
                    <dt>Escala a humano</dt>
                    <dd>{w.hitl}</dd>
                  </dl>

                  <div className="wf-dl">
                    <a href={w.file} download className="btn btn-primary" style={{ width: "100%" }}>
                      ⬇ Descargar workflow
                    </a>
                  </div>

                  {w.extras && (
                    <div className="wf-extras">
                      <h4>Incluye sus workers</h4>
                      {w.extras.map((ex) => (
                        <div className="wf-extra-row" key={ex.file}>
                          <span>{ex.name}</span>
                          <a href={ex.file} download className="dl-link">Descargar</a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MULTI-AGENTE EXPLICADO */}
      <section id="multiagente">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Patrón multi-agente</div>
            <h2>Un orquestador + trabajadores especializados</h2>
            <p>
              El molde para armar tu propio equipo de agentes. Uno coordina; cada worker es un
              experto en una sola tarea. Agregas o cambias workers según el negocio.
            </p>
          </div>
          <div className="compare">
            <div className="card">
              <h3>El orquestador</h3>
              <ul>
                <li>Recibe el objetivo del cliente en lenguaje natural.</li>
                <li>Lo descompone en briefs específicos por especialidad.</li>
                <li>Llama a los workers en paralelo y espera sus resultados.</li>
                <li>Sintetiza todo en un entregable ordenado y accionable.</li>
              </ul>
            </div>
            <div className="card" style={{ borderColor: "var(--brand)" }}>
              <h3>Los workers</h3>
              <ul>
                <li>Cada uno es un workflow aparte con su propio prompt.</li>
                <li>Hoy: análisis de mercado, copywriting y SEO.</li>
                <li>Reusables: el mismo worker sirve en varias campañas.</li>
                <li>Extensible: duplicas uno y creas «finanzas», «soporte», etc.</li>
              </ul>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginTop: 18, maxWidth: 720, marginInline: "auto" }}>
            Importa el orquestador y sus tres workers, reasigna cada nodo «Llamar worker» al
            workflow correspondiente y listo. Para sumar un especialista nuevo, duplicas un
            worker, le cambias el prompt y lo enganchas.
          </p>
        </div>
      </section>

      {/* SEGURIDAD DE KEYS */}
      <section id="seguridad" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="section-head">
            <div className="kicker">Seguridad · API keys</div>
            <h2>Tus llaves, guardadas como corresponde</h2>
            <p>La API key nunca va dentro del archivo que descargas. Se carga como credencial cifrada en n8n.</p>
          </div>
          <div className="codebox">
            <div><span className="c"># 1. En n8n: Credentials → New → &quot;Header Auth&quot;</span></div>
            <div>Name:  x-api-key</div>
            <div>Value: sk-ant-•••••••••••••••••••••  <span className="c"># tu llave del proveedor</span></div>
            <div>&nbsp;</div>
            <div><span className="c"># 2. Asígnala a cada nodo &quot;LLM&quot; del workflow (campo Credential).</span></div>
            <div><span className="c"># 3. Guarda la llave también como variable de entorno del servidor,</span></div>
            <div><span className="c">#    nunca en el código ni en el .json. Rótala si se filtra.</span></div>
          </div>
          <div className="feature-grid" style={{ marginTop: 22 }}>
            <div className="feature">
              <h3>Buenas prácticas</h3>
              <p>Una llave por entorno (prueba/producción), permisos mínimos, y rotación si se expone. Nunca compartas la llave por chat o correo.</p>
            </div>
            <div className="feature">
              <h3>Tope de gasto</h3>
              <p>En el panel del proveedor de IA fija un límite de gasto mensual. Sumado al modelo económico, evitas cualquier sorpresa de facturación.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING LLM */}
      <section id="pricing-llm">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Pricing de IA · paso a paso</div>
            <h2>Cuánto cuesta y cómo elegir el modelo</h2>
            <p>Regla de oro: modelo barato por defecto; el caro solo cuando de verdad aporta.</p>
          </div>
          <table className="ptable">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Modelo</th>
                <th>Costo por acción</th>
                <th>Cuándo usarlo</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_LLM.map((p) => (
                <tr key={p.tarea}>
                  <td>{p.tarea}</td>
                  <td><b>{p.modelo}</b></td>
                  <td>{p.costo}</td>
                  <td style={{ color: "var(--muted)" }}>{p.cuando}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="steps" style={{ marginTop: 28 }}>
            <div className="step">
              <div className="num">1</div>
              <h3>Estima el volumen</h3>
              <p>¿Cuántos mensajes o facturas al mes? Ese es tu número de «acciones» de IA.</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h3>Multiplica</h3>
              <p>Acciones × costo por acción. Ej: 3.000 leads × US$0,0004 ≈ US$1,2 al mes en IA.</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h3>Pon un tope</h3>
              <p>Fija un límite de gasto en el proveedor. El flujo nunca lo supera: deriva a humano.</p>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13.5, marginTop: 18, maxWidth: 720, marginInline: "auto" }}>
            Valores referenciales (junio 2026). El costo de WhatsApp/email va aparte (≈ US$0,03–0,10
            por conversación). Confirma siempre los precios vigentes con tu proveedor de IA.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <div className="cta">
            <h2>¿Quieres que lo dejemos andando con tu caso?</h2>
            <p>Descarga el workflow que más te sirva, o agenda un diagnóstico y lo conectamos a tu WhatsApp, ERP y datos reales.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#precios" className="btn btn-primary">Agendar diagnóstico</a>
              <Link href="/docs" className="btn btn-ghost" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
                Cómo funcionan los agentes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
