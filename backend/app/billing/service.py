"""Máquina de estados de billing por tenant (SPEC-006)."""
from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

from ..core.storage import UsageStore, InMemoryUsageStore, Usage

TenantEstado = Literal["trial", "activo", "moroso", "suspendido", "cancelado"]


@dataclass
class Tenant:
    tenant_id: str
    plan_key: str
    estado: TenantEstado = "trial"
    flow_customer_id: str = ""
    # ISO timestamp del último cambio de estado
    estado_desde: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    override_reason: str = ""
    override_by: str = ""


@dataclass
class PaymentEvent:
    payment_id: str
    tenant_id: str
    plan_key: str
    status: str  # "ACCEPTED" | "FAILED" | ...


class BillingService:
    def __init__(
        self,
        *,
        store: UsageStore | None = None,
        grace_days: int = 5,
    ) -> None:
        self._store = store or InMemoryUsageStore()
        self.grace_days = grace_days
        self._tenants: dict[str, Tenant] = {}
        self._processed_payments: set[str] = set()
        self._lock = threading.Lock()

    # ── provisioning ────────────────────────────────────────────────────────

    def provision(self, tenant_id: str, plan_key: str) -> Tenant:
        with self._lock:
            t = Tenant(tenant_id=tenant_id, plan_key=plan_key)
            self._tenants[tenant_id] = t
            u = self._store.get(tenant_id)
            if u is None:
                self._store.put(Usage(tenant_id=tenant_id, plan_key=plan_key))
        return t

    def get_tenant(self, tenant_id: str) -> Tenant | None:
        return self._tenants.get(tenant_id)

    def is_active(self, tenant_id: str) -> bool:
        t = self._tenants.get(tenant_id)
        if t is None:
            return True  # sin registro = no gestionado = permitir (no bloquear)
        return t.estado in ("trial", "activo")

    # ── máquina de estados ───────────────────────────────────────────────────

    def apply_payment_event(self, event: PaymentEvent) -> Tenant:
        with self._lock:
            # Idempotencia
            if event.payment_id in self._processed_payments:
                return self._tenants[event.tenant_id]
            self._processed_payments.add(event.payment_id)

            t = self._tenants.get(event.tenant_id)
            if t is None:
                t = Tenant(tenant_id=event.tenant_id, plan_key=event.plan_key)
                self._tenants[event.tenant_id] = t

            if event.status == "ACCEPTED":
                t.estado = "activo"
                t.estado_desde = datetime.utcnow().isoformat()
            else:
                if t.estado in ("trial", "activo"):
                    t.estado = "moroso"
                    t.estado_desde = datetime.utcnow().isoformat()
        return t

    def suspend(self, tenant_id: str) -> None:
        with self._lock:
            t = self._tenants.get(tenant_id)
            if t:
                t.estado = "suspendido"
                t.estado_desde = datetime.utcnow().isoformat()

    def manual_override(self, tenant_id: str, nuevo_estado: TenantEstado, *, reason: str, by: str) -> Tenant:
        with self._lock:
            t = self._tenants.get(tenant_id)
            if t is None:
                raise KeyError(f"Tenant no encontrado: {tenant_id!r}")
            t.estado = nuevo_estado
            t.estado_desde = datetime.utcnow().isoformat()
            t.override_reason = reason
            t.override_by = by
        return t
