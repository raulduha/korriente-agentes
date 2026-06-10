"""Tests para app/jobs/dunning.py — moroso → suspendido tras días de gracia."""
from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from app.billing.service import BillingService
from app.core.storage import InMemoryUsageStore
from app.jobs.dunning import run_dunning


@pytest.fixture
def svc():
    store = InMemoryUsageStore()
    s = BillingService(store=store, grace_days=5)
    s.provision("tenant-a", "starter")
    return s


def test_moroso_dentro_de_gracia_no_suspende(svc):
    svc.apply_payment_event(_ev(status="FAILED"))
    # 4 días después — dentro de la gracia
    now = datetime.utcnow() + timedelta(days=4)
    run_dunning(svc, now=now)
    assert svc.get_tenant("tenant-a").estado == "moroso"


def test_moroso_pasada_gracia_suspende(svc):
    svc.apply_payment_event(_ev(status="FAILED"))
    # 6 días después — pasó la gracia
    now = datetime.utcnow() + timedelta(days=6)
    run_dunning(svc, now=now)
    assert svc.get_tenant("tenant-a").estado == "suspendido"


def test_activo_no_se_suspende(svc):
    svc.apply_payment_event(_ev(status="ACCEPTED"))
    now = datetime.utcnow() + timedelta(days=10)
    run_dunning(svc, now=now)
    assert svc.get_tenant("tenant-a").estado == "activo"


def _ev(**kwargs):
    from app.billing.service import PaymentEvent
    base = {"payment_id": "p1", "tenant_id": "tenant-a", "plan_key": "starter", "status": "ACCEPTED"}
    base.update(kwargs)
    return PaymentEvent(**base)
