"""Endpoints para el dashboard: planes, alta de tenant, uso y trazas."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..core.limits import LimitsService
from ..core.pricing import PLANS, get_plan
from ..runtime.memory import Memory
from .deps import get_limits, get_memory

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/plans")
def list_plans() -> dict:
    return {
        key: {
            "name": p.name,
            "setup_clp": p.setup_clp,
            "monthly_clp": p.monthly_clp,
            "max_agents": p.max_agents,
            "max_channels": p.max_channels,
            "included_conversations": p.included_conversations,
            "included_llm_actions": p.included_llm_actions,
            "budget_cap_usd": p.budget_cap_usd,
        }
        for key, p in PLANS.items()
    }


class AssignPlan(BaseModel):
    tenant_id: str
    plan_key: str


@router.post("/tenants")
def assign_plan(payload: AssignPlan, limits: LimitsService = Depends(get_limits)) -> dict:
    try:
        get_plan(payload.plan_key)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    limits.set_plan(payload.tenant_id, payload.plan_key)
    return {"ok": True, "tenant_id": payload.tenant_id, "plan": payload.plan_key}


@router.get("/tenants/{tenant_id}/usage")
def usage(tenant_id: str, limits: LimitsService = Depends(get_limits)) -> dict:
    try:
        return limits.snapshot(tenant_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/tenants/{tenant_id}/traces")
def traces(tenant_id: str, memory: Memory = Depends(get_memory)) -> dict:
    return {"traces": memory.traces(tenant_id)}
