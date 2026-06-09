"""Clase base de agentes y su orquestacion.

Todo agente:
- declara un `AgentSpec` (metadata + metrica de negocio + tools + modelo por defecto),
- implementa `run(message, trace)` con su logica,
- usa los helpers `llm()` y `use_tool()` para que el runtime contabilice uso y costo,
- usa `escalate()` para Human-in-the-loop.

`handle()` envuelve todo: chequea limites ANTES de gastar, ejecuta `run()`, registra el
uso real y guarda la traza. Si el plan esta al tope, no gasta: deriva a humano para no
perder al cliente (constitucion section 2 y 4).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

from ..core.limits import LimitsService
from ..llm.base import LLMProvider, LLMResponse
from ..tools.base import Tool, ToolResult
from .memory import Memory
from .types import Message, RunTrace

# Costo estimado de una corrida antes de ejecutarla (para el pre-check de budget).
# Asume ~1 conversacion de WhatsApp + un par de llamadas LLM baratas.
DEFAULT_PRECHECK_COST_USD = 0.12


@dataclass
class HitlRule:
    """Regla de escalamiento a humano, declarativa y documentable."""
    name: str
    reason: str


@dataclass
class AgentSpec:
    key: str
    business_metric: str
    channels: list[str]
    tools: list[str]
    default_model: str = "mini"
    hitl_rules: list[HitlRule] = field(default_factory=list)


class Agent(ABC):
    spec: AgentSpec  # lo define cada subclase

    def __init__(
        self,
        *,
        llm: LLMProvider,
        tools: dict[str, Tool],
        limits: LimitsService,
        memory: Optional[Memory] = None,
    ):
        self.provider = llm
        self.tools = tools
        self.limits = limits
        self.memory = memory or Memory()
        self._validate_tools()

    def _validate_tools(self) -> None:
        missing = [t for t in self.spec.tools if t not in self.tools]
        if missing:
            raise ValueError(
                f"Agente {self.spec.key!r} requiere tools no provistos: {missing}"
            )

    # ---- ciclo de vida -----------------------------------------------------
    def handle(self, message: Message) -> RunTrace:
        trace = RunTrace(
            tenant_id=message.tenant_id,
            agent_key=self.spec.key,
            input_text=message.text,
        )

        decision = self.limits.check(
            message.tenant_id, conversations=1, est_cost_usd=DEFAULT_PRECHECK_COST_USD
        )
        trace.near_limit = decision.near_limit
        if not decision.allowed:
            # Plan al tope: NO gastamos. Derivamos a humano para no perder al cliente.
            trace.blocked = True
            trace.block_reason = decision.reason
            trace.escalated_to_human = True
            trace.output = (
                "Gracias por tu mensaje. Un ejecutivo te va a responder a la brevedad."
            )
            trace.add_step("blocked", reason=decision.reason)
            self.memory.save_trace(message.tenant_id, trace.as_dict())
            return trace

        try:
            self.run(message, trace)
        finally:
            # Registra el uso REAL (lo que efectivamente se gasto).
            self.limits.record(
                message.tenant_id,
                conversations=1,
                llm_actions=trace.llm_calls,
                cost_usd=trace.cost_usd,
            )
            self.memory.save_trace(message.tenant_id, trace.as_dict())
        return trace

    @abstractmethod
    def run(self, message: Message, trace: RunTrace) -> None:
        """Logica del agente. Debe usar self.llm()/self.use_tool()/self.escalate()."""
        raise NotImplementedError

    # ---- helpers que contabilizan uso --------------------------------------
    def llm(self, *, system: str, user: str, trace: RunTrace, model: str | None = None,
            json_mode: bool = True) -> LLMResponse:
        resp = self.provider.complete(
            system=system, user=user,
            model=model or self.spec.default_model, json_mode=json_mode,
        )
        trace.llm_calls += 1
        trace.cost_usd += resp.cost_usd
        trace.add_step("llm", model=resp.model, cost_usd=round(resp.cost_usd, 6))
        return resp

    def use_tool(self, name: str, action: str, trace: RunTrace, **params) -> ToolResult:
        tool = self.tools[name]
        result = tool.run(action, **params)
        trace.cost_usd += result.cost_usd
        if name not in trace.tools_used:
            trace.tools_used.append(name)
        trace.add_step("tool", tool=name, action=action, ok=result.ok,
                       cost_usd=round(result.cost_usd, 6), error=result.error)
        return result

    def escalate(self, trace: RunTrace, reason: str) -> None:
        trace.escalated_to_human = True
        trace.add_step("escalate", reason=reason)
