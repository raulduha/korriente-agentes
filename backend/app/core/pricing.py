"""Planes de suscripción y sus límites.

FUENTE DE VERDAD del pricing. Debe coincidir con docs/pricing.md.
Si cambias un número acá, cámbialo allá y corre los tests (tests/core/test_pricing.py).
"""
from __future__ import annotations

from dataclasses import dataclass

from .errors import UnknownPlanError

UNLIMITED = -1


@dataclass(frozen=True)
class Plan:
    key: str
    name: str
    setup_clp: int
    monthly_clp: int
    max_agents: int
    max_channels: int
    max_integrations: int            # -1 = ilimitado
    included_conversations: int      # por mes
    included_llm_actions: int        # por mes
    budget_cap_usd: float            # tope de costo real de APIs por mes
    overage_per_conversation_clp: int  # precio por conversación extra si se activa overage

    def is_unlimited(self, field: str) -> bool:
        return getattr(self, field) == UNLIMITED


# Planes PyME-first. Límites pensados para que el cliente no se exceda sin querer.
PLANS: dict[str, Plan] = {
    "starter": Plan(
        key="starter",
        name="Korriente Starter",
        setup_clp=490_000,
        monthly_clp=290_000,
        max_agents=1,
        max_channels=1,
        max_integrations=2,
        included_conversations=800,
        included_llm_actions=3_000,
        budget_cap_usd=60.0,
        overage_per_conversation_clp=350,
    ),
    "growth": Plan(
        key="growth",
        name="Korriente Growth",
        setup_clp=990_000,
        monthly_clp=590_000,
        max_agents=3,
        max_channels=2,
        max_integrations=5,
        included_conversations=2_500,
        included_llm_actions=10_000,
        budget_cap_usd=180.0,
        overage_per_conversation_clp=300,
    ),
    "pro": Plan(
        key="pro",
        name="Korriente Pro",
        setup_clp=1_900_000,
        monthly_clp=1_190_000,
        max_agents=6,
        max_channels=4,
        max_integrations=UNLIMITED,
        included_conversations=8_000,
        included_llm_actions=30_000,
        budget_cap_usd=500.0,
        overage_per_conversation_clp=250,
    ),
    "enterprise": Plan(
        key="enterprise",
        name="Korriente Enterprise",
        setup_clp=0,                 # a medida (flujo consultivo)
        monthly_clp=3_500_000,       # desde
        max_agents=UNLIMITED,
        max_channels=UNLIMITED,
        max_integrations=UNLIMITED,
        included_conversations=UNLIMITED,
        included_llm_actions=UNLIMITED,
        budget_cap_usd=10_000.0,
        overage_per_conversation_clp=0,
    ),
}


def get_plan(key: str) -> Plan:
    try:
        return PLANS[key]
    except KeyError as exc:
        raise UnknownPlanError(f"Plan desconocido: {key!r}") from exc
