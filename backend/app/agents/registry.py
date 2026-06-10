"""Registro de agentes disponibles."""
from __future__ import annotations

from typing import Optional

from ..core.errors import UnknownAgentError
from ..core.limits import LimitsService
from ..llm.base import LLMProvider
from ..runtime.agent import Agent
from ..runtime.memory import Memory
from ..tools.base import Tool
from ..tools.registry import build_tools
from .cobranza import CobranzaAgent
from .lead_classifier import LeadClassifierAgent

AGENT_CLASSES: dict[str, type[Agent]] = {
    LeadClassifierAgent.spec.key: LeadClassifierAgent,
    CobranzaAgent.spec.key: CobranzaAgent,
}


def build_agent(
    key: str,
    *,
    llm: LLMProvider,
    limits: LimitsService,
    tools: Optional[dict[str, Tool]] = None,
    memory: Optional[Memory] = None,
    billing=None,
    mock_tools: bool = True,
) -> Agent:
    """Construye un agente por su key, armando sus tools si no se pasan."""
    if key not in AGENT_CLASSES:
        raise UnknownAgentError(f"Agente desconocido: {key!r}")
    cls = AGENT_CLASSES[key]
    if tools is None:
        tools = build_tools(cls.spec.tools, mock=mock_tools)
    return cls(llm=llm, tools=tools, limits=limits, memory=memory, billing=billing)
