"""Conector Email (SMTP para enviar / IMAP para leer). Costo ~0."""
from __future__ import annotations

from .base import Tool, ToolResult, mask


class EmailTool(Tool):
    name = "email"
    cost_per_call = 0.0

    def run(self, action: str, **params) -> ToolResult:
        if action == "send":
            to = params.get("to", "")
            subject = params.get("subject", "")
            body = params.get("body", "")
            if not to or not body:
                return ToolResult(ok=False, error="Faltan 'to' o 'body'")
            self.sent.append({"to": to, "subject": subject, "body": body})
            if self.mock:
                return ToolResult(
                    ok=True,
                    data={"to_masked": mask(to), "subject": subject, "message_id": f"mock-mail-{len(self.sent)}"},
                )
            raise NotImplementedError("Configura SMTP real.")
        if action == "fetch":
            if self.mock:
                return ToolResult(ok=True, data={"messages": []})
            raise NotImplementedError("Configura IMAP real.")
        return self._unknown(action)
