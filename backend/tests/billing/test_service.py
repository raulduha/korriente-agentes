"""Tests para app/billing/service.py — máquina de estados de pagos (8 casos SPEC-006 §4)."""
from __future__ import annotations

import pytest

from app.billing.service import BillingService, PaymentEvent
from app.core.storage import InMemoryUsageStore


@pytest.fixture
def svc():
    return BillingService(store=InMemoryUsageStore())


def _mk_event(**kwargs):
    base = {
        "payment_id": "pay-001",
        "tenant_id": "tenant-a",
        "plan_key": "starter",
        "status": "ACCEPTED",
    }
    base.update(kwargs)
    return PaymentEvent(**base)


# Caso 1 — pago OK, tenant trial → activo
def test_pago_ok_trial_activa(svc):
    svc.provision("tenant-a", "starter")
    t = svc.apply_payment_event(_mk_event())
    assert t.estado == "activo"


# Caso 2 — pago OK, tenant moroso → reactiva
def test_pago_ok_moroso_reactiva(svc):
    svc.provision("tenant-a", "starter")
    svc.apply_payment_event(_mk_event(status="FAILED"))   # → moroso
    t = svc.apply_payment_event(_mk_event(payment_id="pay-002", status="ACCEPTED"))
    assert t.estado == "activo"


# Caso 3 — pago fallido → moroso (agente sigue activo durante gracia)
def test_pago_fallido_pone_moroso(svc):
    svc.provision("tenant-a", "starter")
    t = svc.apply_payment_event(_mk_event(status="FAILED"))
    assert t.estado == "moroso"


# Caso 4 — job dunning: moroso > gracia → suspendido (ver test_dunning.py)

# Caso 5 — mensaje con tenant suspendido no gasta (ver test_activation_gate.py)

# Caso 6 — firma inválida no cambia estado (testeado en test_flow_signature.py + webhook)

# Caso 7 — idempotencia: mismo payment_id no cambia estado dos veces
def test_idempotencia_mismo_payment_id(svc):
    svc.provision("tenant-a", "starter")
    t1 = svc.apply_payment_event(_mk_event())
    t2 = svc.apply_payment_event(_mk_event())   # mismo payment_id
    assert t1.estado == t2.estado == "activo"


# Caso 8 — aislamiento: evento de tenant-a no toca tenant-b
def test_aislamiento_por_tenant(svc):
    svc.provision("tenant-a", "starter")
    svc.provision("tenant-b", "starter")
    svc.apply_payment_event(_mk_event(status="FAILED"))  # falla tenant-a
    tb = svc.get_tenant("tenant-b")
    assert tb.estado == "trial"  # tenant-b intacto


def test_reactivacion_manual(svc):
    svc.provision("tenant-a", "starter")
    svc.apply_payment_event(_mk_event(status="FAILED"))
    svc.manual_override("tenant-a", "activo", reason="cliente avisó retraso", by="raul")
    assert svc.get_tenant("tenant-a").estado == "activo"
    assert svc.get_tenant("tenant-a").override_reason == "cliente avisó retraso"
