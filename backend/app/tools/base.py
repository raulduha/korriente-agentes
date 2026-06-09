"""Contrato base de los conectores (Tools).

Cada conector:
- declara `name` y `cost_per_call` (USD), que el runtime suma al uso,
- soporta `mock=True` (sin red, respuestas deterministas) para tests/demos,
- enmascara PII en cualquier log (helper `mask`).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ToolResult:
    ok: bool
    data: dict[str, Any] = field(default_factory=dict)
    cost_usd: float = 0.0
    error: str | None = None


def mask(value: str) -> str:
    """Enmascara PII para logs: deja inicio y fin, oculta el medio."""
    if not value:
        return value
    if "@" in value:  # email
        name, _, domain = value.partition("@")
        head = name[:2]
        return f"{head}{'*' * max(1, len(name) - 2)}@{domain}"
    # teléfono u otro: deja 4 finales
    digits = value[-4:]
    return f"{value[:4]}{'*' * max(1, len(value) - 8)}{digits}" if len(value) > 8 else "****"


class Tool(ABC):
    name: str = "tool"
    cost_per_call: float = 0.0

    def __init__(self, *, mock: bool = True, **config):
        self.mock = mock
        self.config = config
        self.sent: list[dict] = []  # historial (útil en tests)

    @abstractmethod
    def run(self, action: str, **params) -> ToolResult:
        raise NotImplementedError

    def _unknown(self, action: str) -> ToolResult:
        return ToolResult(ok=False, error=f"Acción no soportada por {self.name!r}: {action!r}")
