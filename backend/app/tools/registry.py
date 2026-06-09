"""Registro de conectores disponibles y armado de sets de tools."""
from __future__ import annotations

from .base import Tool
from .crm import CRMTool
from .email import EmailTool
from .http_tool import HttpTool
from .sheets import SheetsTool
from .whatsapp import WhatsAppTool

# name -> clase
TOOL_CLASSES: dict[str, type[Tool]] = {
    "whatsapp": WhatsAppTool,
    "email": EmailTool,
    "crm": CRMTool,
    "sheets": SheetsTool,
    "http": HttpTool,
}


def build_tools(names: list[str], *, mock: bool = True, **per_tool_config) -> dict[str, Tool]:
    """Instancia los tools pedidos por nombre.

    `per_tool_config` permite pasar config a un tool específico, ej:
        build_tools(["http"], http={"mock_responses": {...}})
    """
    tools: dict[str, Tool] = {}
    for name in names:
        if name not in TOOL_CLASSES:
            raise ValueError(f"Conector desconocido: {name!r}")
        cfg = per_tool_config.get(name, {})
        tools[name] = TOOL_CLASSES[name](mock=mock, **cfg)
    return tools


def default_mock_tools() -> dict[str, Tool]:
    """Todos los conectores en modo mock — práctico para demos y tests."""
    return build_tools(list(TOOL_CLASSES.keys()), mock=True)
