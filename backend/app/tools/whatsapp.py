"""Conector WhatsApp Business API.

Acciones: send_message, send_template. Costo: ~US$0.05 por conversación (passthrough
o incluido en el plan). En modo mock no llama a Meta; registra el envío.
"""
from __future__ import annotations

from .base import Tool, ToolResult, mask


class WhatsAppTool(Tool):
    name = "whatsapp"
    cost_per_call = 0.05  # USD aprox por conversación

    def run(self, action: str, **params) -> ToolResult:
        if action == "send_message":
            return self._send(params.get("to", ""), params.get("body", ""), kind="message")
        if action == "send_template":
            return self._send(params.get("to", ""), params.get("template", ""), kind="template")
        return self._unknown(action)

    def _send(self, to: str, body: str, *, kind: str) -> ToolResult:
        if not to or not body:
            return ToolResult(ok=False, error="Faltan 'to' o 'body'", cost_usd=0.0)
        record = {"to": to, "body": body, "kind": kind}
        self.sent.append(record)
        if self.mock:
            return ToolResult(
                ok=True,
                data={"to_masked": mask(to), "kind": kind, "message_id": f"mock-wa-{len(self.sent)}"},
                cost_usd=self.cost_per_call,
            )
        # Implementación real (Fase 1+): POST a Graph API. Stub:
        raise NotImplementedError("Configura el cliente real de WhatsApp Business API.")
