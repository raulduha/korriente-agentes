"""Endpoints del dashboard: planes, tenants, uso, trazas (SPEC-008)."""
from __future__ import annotations

import os

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from ..core.limits import LimitsService
from ..core.pricing import PLANS, get_plan
from ..core.tenant_registry import TenantRegistry
from ..runtime.memory import Memory
from .deps import get_limits, get_memory

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _get_registry() -> TenantRegistry:
    db = os.getenv("KORRIENTE_WA_REGISTRY_DB", ":memory:")
    return TenantRegistry(db)


def _resolve_tenant_from_token(x_tenant_token: str | None) -> str:
    """Resuelve el tenant_id a partir del token de lectura. 401 si inválido."""
    if not x_tenant_token:
        raise HTTPException(status_code=401, detail="Token requerido")
    reg = _get_registry()
    tenant_id = reg.resolve_token(x_tenant_token)
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Token inválido")
    return tenant_id


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
def traces_internal(tenant_id: str, memory: Memory = Depends(get_memory)) -> dict:
    """Endpoint interno (admin). Sin token de cliente."""
    return {"traces": memory.traces(tenant_id)}


@router.get("/traces")
def traces_by_token(
    x_tenant_token: str | None = Header(default=None),
    memory: Memory = Depends(get_memory),
) -> dict:
    """Endpoint de cliente: solo-lectura, protegido por token. Ve solo sus trazas."""
    tenant_id = _resolve_tenant_from_token(x_tenant_token)
    raw = memory.traces(tenant_id)
    # Asegura que cada traza tenga tenant_id y que PII sensible no se exponga extra
    traces = [dict(t, tenant_id=tenant_id) for t in raw]
    return {"tenant_id": tenant_id, "traces": traces}
