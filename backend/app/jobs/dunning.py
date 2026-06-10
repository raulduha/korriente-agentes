"""Job de dunning: moroso → suspendido tras días de gracia (SPEC-006)."""
from __future__ import annotations

from datetime import datetime

from ..billing.service import BillingService


def run_dunning(svc: BillingService, *, now: datetime | None = None) -> list[str]:
    """Suspende tenants morosos que superaron el período de gracia. Devuelve los afectados."""
    now = now or datetime.utcnow()
    suspended = []
    for tenant_id, tenant in list(svc._tenants.items()):
        if tenant.estado != "moroso":
            continue
        try:
            desde = datetime.fromisoformat(tenant.estado_desde)
        except Exception:
            continue
        elapsed_days = (now - desde).days
        if elapsed_days >= svc.grace_days:
            svc.suspend(tenant_id)
            suspended.append(tenant_id)
    return suspended
