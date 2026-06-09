// Clasificador de leads DEMO (determinista, sin LLM) para la landing.
// Espeja la lógica del agente backend (app/agents/lead_classifier.py) para que los
// ejemplos de la página funcionen offline. Es pura -> testeada en demo.test.ts.

export type Intent = "cotizacion" | "consulta" | "reclamo" | "spam";

export interface LeadResult {
  intent: Intent;
  confidence: number;
  reply: string;
  escalated: boolean;
  reason: string | null;
}

const SENSITIVE = ["contrato", "legal", "demanda", "factura", "reembolso", "abogado"];
const CONFIDENCE_THRESHOLD = 0.6;

function classifyIntent(text: string): { intent: Intent; confidence: number; reply: string } {
  const u = text.toLowerCase();
  if (/(gana plata|click aquí|http:\/\/|https:\/\/|bit\.ly|promoción|gratis ya)/.test(u))
    return { intent: "spam", confidence: 0.98, reply: "" };
  if (/(pésimo|malo|esperando|reclamo|queja|terrible|nadie responde)/.test(u))
    return { intent: "reclamo", confidence: 0.9, reply: "" };
  if (/(cuánto|cuanto|precio|valor|plan|cotiz|comprar|contratar)/.test(u))
    return {
      intent: "cotizacion",
      confidence: 0.9,
      reply: "¡Hola! Tenemos planes a tu medida. ¿Me das tu nombre y empresa para enviarte una propuesta?",
    };
  if (/(hora|horario|abren|ubicad|dónde|donde|dirección)/.test(u))
    return { intent: "consulta", confidence: 0.95, reply: "Atendemos de lunes a viernes de 9 a 18 h. ¿Te ayudo con algo más?" };
  // Términos de negocio (sensibles): se entienden claro, pero luego escalan a humano.
  if (/(contrato|factura|reembolso|cláusula|clausula)/.test(u))
    return { intent: "consulta", confidence: 0.85, reply: "Con gusto reviso eso contigo." };
  // Sin señales claras -> baja confianza.
  return { intent: "consulta", confidence: 0.4, reply: "" };
}

export function classifyLead(text: string): LeadResult {
  const { intent, confidence, reply } = classifyIntent(text);
  const u = text.toLowerCase();

  if (intent === "spam") {
    return { intent, confidence, reply: "", escalated: false, reason: null };
  }

  const wantsHuman = u.includes("hablar con") || u.includes("una persona");
  const isSensitive = SENSITIVE.some((k) => u.includes(k));

  if (intent === "reclamo" || confidence < CONFIDENCE_THRESHOLD || isSensitive || wantsHuman) {
    const reason =
      intent === "reclamo"
        ? "reclamo"
        : confidence < CONFIDENCE_THRESHOLD
        ? "baja_confianza"
        : isSensitive
        ? "tema_sensible"
        : "pide_humano";
    const holding =
      intent === "reclamo"
        ? "Gracias por escribirnos. Lamento lo ocurrido; un ejecutivo te va a contactar a la brevedad."
        : "Gracias por tu mensaje. Un ejecutivo te va a responder en breve.";
    return { intent, confidence, reply: holding, escalated: true, reason };
  }

  return {
    intent,
    confidence,
    reply: reply || "¡Hola! Gracias por escribirnos. ¿En qué te podemos ayudar?",
    escalated: false,
    reason: null,
  };
}

export const INTENT_LABEL: Record<Intent, string> = {
  cotizacion: "Cotización",
  consulta: "Consulta",
  reclamo: "Reclamo",
  spam: "Spam",
};
