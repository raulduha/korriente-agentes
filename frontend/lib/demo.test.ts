import { describe, it, expect } from "vitest";
import { classifyLead } from "./demo";

describe("classifyLead (espeja al agente backend)", () => {
  it("cotización: responde y no escala", () => {
    const r = classifyLead("Hola, cuánto cuesta el plan?");
    expect(r.intent).toBe("cotizacion");
    expect(r.escalated).toBe(false);
    expect(r.reply.length).toBeGreaterThan(0);
  });

  it("consulta de horario: responde automático", () => {
    const r = classifyLead("¿A qué hora abren?");
    expect(r.intent).toBe("consulta");
    expect(r.escalated).toBe(false);
  });

  it("reclamo: escala a humano", () => {
    const r = classifyLead("Llevo 3 días esperando, pésimo servicio");
    expect(r.intent).toBe("reclamo");
    expect(r.escalated).toBe(true);
    expect(r.reason).toBe("reclamo");
  });

  it("spam: no responde ni escala", () => {
    const r = classifyLead("Gana plata fácil click aquí http://bit.ly/x");
    expect(r.intent).toBe("spam");
    expect(r.reply).toBe("");
    expect(r.escalated).toBe(false);
  });

  it("baja confianza: escala", () => {
    const r = classifyLead("hmm no sé jeje");
    expect(r.escalated).toBe(true);
    expect(r.reason).toBe("baja_confianza");
  });

  it("tema sensible (contrato) escala aunque sea claro", () => {
    const r = classifyLead("Quiero revisar una cláusula de mi contrato");
    expect(r.escalated).toBe(true);
    expect(r.reason).toBe("tema_sensible");
  });

  it("pide hablar con persona: escala", () => {
    const r = classifyLead("Prefiero hablar con una persona por favor");
    expect(r.escalated).toBe(true);
  });
});
