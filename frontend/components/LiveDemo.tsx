"use client";

import { useState } from "react";
import { classifyLead, INTENT_LABEL, type LeadResult } from "@/lib/demo";

const SAMPLES = [
  "Hola, ¿cuánto cuesta el plan mensual?",
  "¿A qué hora abren los sábados?",
  "Llevo 3 días esperando, pésimo servicio",
  "Gana plata fácil 👉 http://bit.ly/x",
  "Quiero revisar una cláusula de mi contrato",
];

export default function LiveDemo() {
  const [text, setText] = useState(SAMPLES[0]);
  const [result, setResult] = useState<LeadResult | null>(() => classifyLead(SAMPLES[0]));

  const run = (t: string) => {
    setText(t);
    setResult(classifyLead(t));
  };

  return (
    <div className="demo-wrap" id="demo">
      <div className="demo-head">
        <span className="dot" style={{ background: "#ff5f57" }} />
        <span className="dot" style={{ background: "#febc2e" }} />
        <span className="dot" style={{ background: "#28c840" }} />
        <span style={{ marginLeft: 8 }}>Agente clasificador de leads · WhatsApp</span>
      </div>
      <div className="demo-body">
        <div className="chips">
          {SAMPLES.map((s) => (
            <button key={s} className="chip" onClick={() => run(s)}>
              {s.length > 32 ? s.slice(0, 30) + "…" : s}
            </button>
          ))}
        </div>
        <div className="demo-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(text)}
            placeholder="Escribe un mensaje de cliente…"
            aria-label="Mensaje del cliente"
          />
          <button className="btn btn-primary" onClick={() => run(text)}>
            Clasificar
          </button>
        </div>

        {result && (
          <div className="result">
            <div className="result-row">
              <span className={`tag ${result.intent}`}>{INTENT_LABEL[result.intent]}</span>
              <span className="meta">confianza {(result.confidence * 100).toFixed(0)}%</span>
              {result.escalated && <span className="tag human">→ Humano ({result.reason})</span>}
            </div>
            <div className={`bubble ${result.reply ? "" : "empty"}`}>
              {result.reply || "Sin respuesta automática (se ignora o queda en manos de un ejecutivo)."}
            </div>
            <p className="meta">
              {result.escalated
                ? "El agente no decide solo: deriva a una persona (regla Human-in-the-loop)."
                : "El agente responde en segundos y registra el lead en tu CRM."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
