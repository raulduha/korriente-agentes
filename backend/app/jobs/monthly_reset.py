"""Job de reset mensual: pone uso a 0, rearma alertas, conserva trazas (SPEC-008)."""
from __future__ import annotations

from ..alerts.service import AlertService
from ..core.limits import LimitsService


def run_monthly_reset(
    limits: LimitsService,
    alerts: AlertService,
    tenant_ids: list[str],
) -> None:
    for tid in tenant_ids:
        limits.reset_month(tid)
        alerts.reset_month(tid)
