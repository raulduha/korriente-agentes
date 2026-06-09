"""Conector HTTP genérico para cualquier API REST del cliente. Costo ~0.

En modo mock devuelve una respuesta canned configurable vía `mock_responses`.
"""
from __future__ import annotations

from .base import Tool, ToolResult


class HttpTool(Tool):
    name = "http"
    cost_per_call = 0.0

    def __init__(self, *, mock: bool = True, mock_responses: dict | None = None, **config):
        super().__init__(mock=mock, **config)
        self._mock_responses = mock_responses or {}

    def run(self, action: str, **params) -> ToolResult:
        if action != "request":
            return self._unknown(action)
        url = params.get("url", "")
        method = params.get("method", "GET").upper()
        self.sent.append({"method": method, "url": url})
        if self.mock:
            body = self._mock_responses.get(url, {"ok": True})
            return ToolResult(ok=True, data={"status": 200, "body": body})
        raise NotImplementedError("Configura el cliente HTTP real (httpx).")
