"""Cuotas de uso y budget cap.

Protege al cliente PyME de sobrepasar lo que puede pagar:
- Limite DURO por defecto: al llegar al 100% bloquea las llamadas pagadas.
- Aviso al 80% (`near_limit`).
- Budget cap en USD sobre el costo real de APIs.

El store por defecto es en memoria (Fase 1). En prod se reemplaza por uno con
SQLite/PostgreSQL respetando la misma interfaz (ver app/core/storage.py).
"""
from __future__ import annotations

from dataclasses import dataclass

from .config import settings
from .pricing import UNLIMITED, Plan, get_plan
from .storage import InMemoryUsageStore, Usage, UsageStore

# Usage se re-exporta desde storage para no romper imports existentes.
__all__ = ["Usage", "LimitDecision", "LimitsService"]


@dataclass
class LimitDecision:
    allowed: bool
    near_limit: bool = False
    reason: str | None = None
    usage_ratio: float = 0.0


class LimitsService:
    """Lleva el uso por tenant y decide si una accion esta permitida."""

    def __init__(self, *, store: UsageStore | None = None,
                 hard_limits: bool | None = None, near_limit_ratio: float | None = None):
        self.store: UsageStore = store or InMemoryUsageStore()
        self.hard_limits = settings.hard_limits if hard_limits is None else hard_limits
        self.near_limit_ratio = (
            settings.near_limit_ratio if near_limit_ratio is None else near_limit_ratio
        )

    # ---- gestion de tenants ------------------------------------------------
    def set_plan(self, tenant_id: str, plan_key: str) -> None:
        get_plan(plan_key)  # valida que exista
        u = self.store.get(tenant_id)
        if u is None:
            u = Usage(tenant_id=tenant_id, plan_key=plan_key)
        else:
            u.plan_key = plan_key
        self.store.put(u)

    def get_usage(self, tenant_id: str) -> Usage:
        u = self.store.get(tenant_id)
        if u is None:
            raise KeyError(f"Tenant sin plan asignado: {tenant_id!r}. Usa set_plan() primero.")
        return u

    def reset_month(self, tenant_id: str) -> None:
        u = self.get_usage(tenant_id)
        u.conversations = 0
        u.llm_actions = 0
        u.cost_usd = 0.0
        self.store.put(u)

    # ---- decision ----------------------------------------------------------
    def check(
        self,
        tenant_id: str,
        *,
        conversations: int = 0,
        llm_actions: int = 0,
        est_cost_usd: float = 0.0,
    ) -> LimitDecision:
        """Decide si se puede ejecutar una accion que sumaria el uso indicado."""
        u = self.get_usage(tenant_id)
        plan = get_plan(u.plan_key)

        checks = [
            ("conversations", u.conversations + conversations, plan.included_conversations,
             "Se alcanzo el limite de conversaciones del plan"),
            ("llm_actions", u.llm_actions + llm_actions, plan.included_llm_actions,
             "Se alcanzo el limite de acciones de IA del plan"),
            ("budget", u.cost_usd + est_cost_usd, plan.budget_cap_usd,
             "Se alcanzo el tope de gasto (budget cap) del plan"),
        ]

        worst_ratio = 0.0
        for _field, projected, limit, reason in checks:
            if limit == UNLIMITED:
                continue
            ratio = projected / limit if limit else 1.0
            worst_ratio = max(worst_ratio, ratio)
            if projected > limit:
                if self.hard_limits:
                    return LimitDecision(
                        allowed=False, near_limit=True, reason=reason, usage_ratio=ratio
                    )

        return LimitDecision(
            allowed=True,
            near_limit=worst_ratio >= self.near_limit_ratio,
            usage_ratio=round(worst_ratio, 3),
        )

    # ---- registro ----------------------------------------------------------
    def record(
        self,
        tenant_id: str,
        *,
        conversations: int = 0,
        llm_actions: int = 0,
        cost_usd: float = 0.0,
    ) -> Usage:
        u = self.get_usage(tenant_id)
        u.conversations += conversations
        u.llm_actions += llm_actions
        u.cost_usd += cost_usd
        self.store.put(u)
        return u

    # ---- helpers de reporte ------------------------------------------------
    def snapshot(self, tenant_id: str) -> dict:
        u = self.get_usage(tenant_id)
        plan: Plan = get_plan(u.plan_key)

        def pct(used: int | float, limit: int | float) -> float | None:
            if limit == UNLIMITED:
                return None
            return round(100 * used / limit, 1) if limit else None

        return {
            "tenant_id": tenant_id,
            "plan": plan.name,
            "conversations": {"used": u.conversations, "limit": plan.included_conversations,
                              "pct": pct(u.conversations, plan.included_conversations)},
            "llm_actions": {"used": u.llm_actions, "limit": plan.included_llm_actions,
                            "pct": pct(u.llm_actions, plan.included_llm_actions)},
            "budget_usd": {"used": round(u.cost_usd, 4), "limit": plan.budget_cap_usd,
                           "pct": pct(u.cost_usd, plan.budget_cap_usd)},
        }
