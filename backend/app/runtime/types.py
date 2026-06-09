"""Tipos compartidos del runtime + utilidades."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Message:
    """Mensaje entrante normalizado por el Input Parser."""
    text: str
    channel: str            # "whatsapp", "email", "web", ...
    sender: str             # teléfono o email del remitente
    tenant_id: str          # cliente PyME dueño del agente
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass
class RunTrace:
    """Traza de una corrida de agente (observabilidad — constitución §9)."""
    tenant_id: str
    agent_key: str
    input_text: str
    steps: list[dict] = field(default_factory=list)
    llm_calls: int = 0
    tools_used: list[str] = field(default_factory=list)
    cost_usd: float = 0.0
    escalated_to_human: bool = False
    blocked: bool = False
    block_reason: str | None = None
    near_limit: bool = False
    output: str | None = None
    data: dict[str, Any] = field(default_factory=dict)  # resultados del agente (intent, etc.)

    def add_step(self, kind: str, **payload) -> None:
        self.steps.append({"kind": kind, **payload})

    def as_dict(self) -> dict:
        return {
            "tenant_id": self.tenant_id,
            "agent_key": self.agent_key,
            "input": self.input_text,
            "output": self.output,
            "llm_calls": self.llm_calls,
            "tools_used": self.tools_used,
            "cost_usd": round(self.cost_usd, 6),
            "escalated_to_human": self.escalated_to_human,
            "blocked": self.blocked,
            "block_reason": self.block_reason,
            "near_limit": self.near_limit,
            "data": self.data,
            "steps": self.steps,
        }


def parse_json(text: str) -> dict:
    """Extrae el primer objeto JSON de un texto del LLM, tolerante a ruido.

    Los modelos a veces envuelven el JSON en ```json ... ``` o agregan texto. Esta
    función intenta json.loads directo y, si falla, busca el primer bloque {...}.
    """
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {}
