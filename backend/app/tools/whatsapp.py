"""Conector WhatsApp Business API (SPEC-005).

Modo mock: sin red, respuestas deterministas (tests/demos).
Modo real: POST a la API de 360dialog con httpx. Errores de red → ok=False, sin lanzar.
"""
from __future__ import annotations

from .base import Tool, ToolResult, mask


class WhatsAppTool(Tool):
    name = "whatsapp"
    cost_per_call = 0.05  # USD por conversación

    def run(self, action: str, **params) -> ToolResult:
        if action == "send_message":
            return self._send(
                params.get("to", ""), params.get("body", ""), kind="message"
            )
        if action == "send_template":
            return self._send(
                params.get("to", ""),
                params.get("template", ""),
                kind="template",
                params_list=params.get("params", []),
            )
        return self._unknown(action)

    def _send(self, to: str, body: str, *, kind: str, params_list: list | None = None) -> ToolResult:
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

        # Implementación real con 360dialog
        api_key = self.config.get("api_key", "")
        phone_number_id = self.config.get("phone_number_id", "")
        base_url = self.config.get("base_url", "https://waba.360dialog.io/v1")

        if not api_key or not phone_number_id:
            raise NotImplementedError(
                "Configura api_key y phone_number_id en el WhatsAppTool real."
            )

        try:
            import httpx
            if kind == "template":
                payload = {
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "template",
                    "template": {
                        "name": body,
                        "language": {"code": "es"},
                        "components": (
                            [{"type": "body", "parameters": [{"type": "text", "text": p} for p in (params_list or [])]}]
                            if params_list else []
                        ),
                    },
                }
            else:
                payload = {
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {"body": body},
                }

            resp = httpx.post(
                f"{base_url}/messages",
                json=payload,
                headers={"D360-API-KEY": api_key},
                timeout=10.0,
            )
            resp.raise_for_status()
            data = resp.json()
            message_id = data.get("messages", [{}])[0].get("id", "")
            return ToolResult(
                ok=True,
                data={"to_masked": mask(to), "kind": kind, "message_id": message_id},
                cost_usd=self.cost_per_call,
            )
        except Exception as exc:
            return ToolResult(ok=False, error=str(exc), cost_usd=0.0)
