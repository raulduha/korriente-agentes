"""Agente: Cobranza y recordatorios de pago.

Spec: specs/002-cobranza-recordatorios.md
Métrica: % de facturas pagadas a tiempo sube; días de cobro (DSO) baja.

La factura llega en message.meta["invoice"]:
{
  "id": "F-123", "customer": "Juan Perez", "contact": "+569...",
  "amount": 150000, "due_in_days": -5,   # negativo = vencida hace N días
  "attempts": 0, "status": "pending"|"disputed"|"paid", "channel": "whatsapp"|"email"
}
Parámetros opcionales en meta: amount_threshold, max_attempts.

Seguridad primero (reglas deterministas) ANTES de llamar al LLM:
nunca envía sobre el umbral, ni en disputa, ni tras agotar intentos.
"""
from __future__ import annotations

from ..runtime.agent import Agent, AgentSpec, HitlRule
from ..runtime.types import Message, RunTrace, parse_json

DEFAULT_AMOUNT_THRESHOLD = 2_000_000  # CLP
DEFAULT_MAX_ATTEMPTS = 3

SYSTEM_PROMPT = """\
Eres asistente de cobranza de una PyME chilena. Redacta un recordatorio de pago breve,
cordial y profesional en español de Chile. NUNCA amenaces, intimides ni menciones
acciones legales. NO incluyas datos bancarios.

Devuelve SOLO un JSON:
{
  "message": "<mensaje de recordatorio para el cliente>",
  "next_touch_days": <entero: en cuántos días volver a contactar>
}
"""


class CobranzaAgent(Agent):
    spec = AgentSpec(
        key="cobranza-recordatorios",
        business_metric="% facturas pagadas a tiempo / DSO",
        channels=["whatsapp", "email"],
        tools=["whatsapp", "email", "sheets"],
        default_model="mini",
        hitl_rules=[
            HitlRule("monto_alto", "Monto sobre el umbral: prepara borrador, no envía"),
            HitlRule("disputa", "Factura en disputa: detiene secuencia"),
            HitlRule("max_intentos", "Se agotaron los intentos automáticos"),
        ],
    )

    def run(self, message: Message, trace: RunTrace) -> None:
        invoice = message.meta.get("invoice")
        if not invoice:
            trace.add_step("error", reason="falta invoice en meta")
            trace.output = None
            return

        threshold = message.meta.get("amount_threshold", DEFAULT_AMOUNT_THRESHOLD)
        max_attempts = message.meta.get("max_attempts", DEFAULT_MAX_ATTEMPTS)

        trace.data["invoice_id"] = invoice.get("id")

        # --- reglas deterministas de seguridad (HITL) ---
        if invoice.get("status") == "paid":
            trace.add_step("skip", reason="factura ya pagada")
            trace.output = None
            return

        if invoice.get("status") == "disputed":
            self.escalate(trace, reason="disputa")
            trace.data["action"] = "escalado"
            trace.output = None
            return

        if int(invoice.get("attempts", 0)) >= max_attempts:
            self.escalate(trace, reason="max_intentos")
            trace.data["action"] = "escalado"
            trace.output = None
            return

        if int(invoice.get("amount", 0)) > threshold:
            # Monto alto: el LLM prepara un borrador, pero NO se envía. Va a humano.
            draft = self.llm(
                system=SYSTEM_PROMPT,
                user=self._invoice_brief(invoice),
                trace=trace,
            )
            trace.data["draft"] = parse_json(draft.text).get("message", "")
            trace.data["action"] = "borrador_para_humano"
            self.escalate(trace, reason="monto_alto")
            trace.output = None
            return

        # --- caso normal: redactar y enviar recordatorio ---
        resp = self.llm(system=SYSTEM_PROMPT, user=self._invoice_brief(invoice), trace=trace)
        data = parse_json(resp.text)
        body = (data.get("message") or "").strip() or (
            f"Hola {invoice.get('customer', '')}, te recordamos el pago de la factura "
            f"{invoice.get('id', '')}. ¡Gracias!"
        )
        next_touch = int(data.get("next_touch_days", 4))

        channel = invoice.get("channel", "whatsapp")
        if channel == "email":
            self.use_tool("email", "send", trace, to=invoice.get("contact", ""),
                          subject=f"Recordatorio de pago — factura {invoice.get('id', '')}",
                          body=body)
        else:
            self.use_tool("whatsapp", "send_message", trace,
                          to=invoice.get("contact", ""), body=body)

        self.use_tool("sheets", "append_row", trace, table="cobranza",
                      row={"invoice_id": invoice.get("id"), "action": "recordatorio_enviado",
                           "channel": channel, "next_touch_days": next_touch})

        trace.data["action"] = "recordatorio_enviado"
        trace.data["next_touch_days"] = next_touch
        trace.output = body

    @staticmethod
    def _invoice_brief(invoice: dict) -> str:
        due = invoice.get("due_in_days", 0)
        estado = (
            f"vencida hace {abs(due)} días" if due < 0
            else f"vence en {due} días" if due > 0 else "vence hoy"
        )
        return (
            f"Cliente: {invoice.get('customer', '')}. "
            f"Factura {invoice.get('id', '')} por ${invoice.get('amount', 0):,} CLP, {estado}. "
            f"Intentos previos: {invoice.get('attempts', 0)}."
        )
