"""Agente: Clasificador y respondedor de leads WhatsApp.

Spec: specs/001-lead-classifier-whatsapp.md
Métrica: tiempo de respuesta a leads < 2 min, cobertura 24/7.
"""
from __future__ import annotations

from ..runtime.agent import Agent, AgentSpec, HitlRule
from ..runtime.types import Message, RunTrace, parse_json

CONFIDENCE_THRESHOLD = 0.6
SENSITIVE_KEYWORDS = ("contrato", "legal", "demanda", "factura", "reembolso", "abogado")

SYSTEM_PROMPT = """\
Eres el asistente de leads de una PyME chilena por WhatsApp. Clasifica el mensaje del
cliente y prepara una respuesta breve y cordial en español de Chile.

Devuelve SOLO un JSON con esta forma exacta:
{
  "intent": "cotizacion" | "consulta" | "reclamo" | "spam",
  "confidence": <número entre 0 y 1>,
  "reply": "<respuesta breve para el cliente, o cadena vacía si es spam>"
}

Reglas:
- "cotizacion": pregunta por precios, planes o quiere comprar.
- "consulta": pregunta general (horarios, ubicación, info básica).
- "reclamo": queja, molestia, reclamo por servicio.
- "spam": publicidad, links sospechosos, contenido irrelevante.
No inventes precios exactos; si piden cotización, responde con info general y pide datos.
"""


class LeadClassifierAgent(Agent):
    spec = AgentSpec(
        key="lead-classifier-whatsapp",
        business_metric="tiempo de respuesta a leads < 2 min",
        channels=["whatsapp"],
        tools=["whatsapp", "crm", "sheets"],
        default_model="mini",
        hitl_rules=[
            HitlRule("reclamo", "Los reclamos siempre van a un humano"),
            HitlRule("baja_confianza", f"Confianza del clasificador < {CONFIDENCE_THRESHOLD}"),
            HitlRule("tema_sensible", "Menciona contrato/legal/factura/etc."),
            HitlRule("pide_humano", "El cliente pide hablar con una persona"),
        ],
    )

    def run(self, message: Message, trace: RunTrace) -> None:
        resp = self.llm(system=SYSTEM_PROMPT, user=message.text, trace=trace)
        data = parse_json(resp.text)

        intent = data.get("intent", "consulta")
        confidence = float(data.get("confidence", 0.0))
        reply = (data.get("reply") or "").strip()

        trace.data.update({"intent": intent, "confidence": confidence})

        # 1) Spam: no se responde ni se crea lead.
        if intent == "spam":
            trace.add_step("ignored", reason="spam")
            trace.output = None
            return

        # 2) Registrar el lead (consulta/cotización/reclamo dejan rastro).
        priority = "alta" if intent == "cotizacion" else "media"
        self.use_tool("crm", "create_lead", trace,
                      contact=message.sender, intent=intent, priority=priority,
                      notes=message.text[:280])
        self.use_tool("sheets", "append_row", trace, table="leads",
                      row={"contact": message.sender, "intent": intent,
                           "confidence": confidence, "channel": message.channel})

        # 3) ¿Escala a humano?
        wants_human = "hablar con" in message.text.lower() or "una persona" in message.text.lower()
        is_sensitive = any(k in message.text.lower() for k in SENSITIVE_KEYWORDS)
        if intent == "reclamo" or confidence < CONFIDENCE_THRESHOLD or is_sensitive or wants_human:
            reason = (
                "reclamo" if intent == "reclamo"
                else "baja_confianza" if confidence < CONFIDENCE_THRESHOLD
                else "tema_sensible" if is_sensitive
                else "pide_humano"
            )
            self.escalate(trace, reason=reason)
            holding = (
                "Gracias por escribirnos. Lamento lo ocurrido; un ejecutivo te va a "
                "contactar a la brevedad."
                if intent == "reclamo"
                else "Gracias por tu mensaje. Un ejecutivo te va a responder en breve."
            )
            self.use_tool("whatsapp", "send_message", trace, to=message.sender, body=holding)
            trace.output = holding
            return

        # 4) Responder automáticamente.
        if not reply:
            reply = "¡Hola! Gracias por escribirnos. ¿En qué te podemos ayudar?"
        self.use_tool("whatsapp", "send_message", trace, to=message.sender, body=reply)
        trace.output = reply
