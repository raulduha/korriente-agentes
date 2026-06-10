"""Tests para app/alerts/service.py — alertas 80/100%, idempotentes por mes."""
from __future__ import annotations

import pytest

from app.alerts.service import AlertService
from app.core.storage import InMemoryUsageStore


@pytest.fixture
def alerts():
    store = InMemoryUsageStore()
    sent = []
    def _notifier(tenant_id: str, threshold: int, message: str):
        sent.append({"tenant_id": tenant_id, "threshold": threshold})
    svc = AlertService(store=store, notifier=_notifier)
    return svc, sent


def test_no_alerta_bajo_80(alerts):
    svc, sent = alerts
    svc.check_and_notify("t1", usage_ratio=0.5)
    assert len(sent) == 0


def test_alerta_al_80(alerts):
    svc, sent = alerts
    svc.check_and_notify("t1", usage_ratio=0.82)
    assert len(sent) == 1
    assert sent[0]["threshold"] == 80


def test_alerta_al_100(alerts):
    svc, sent = alerts
    svc.check_and_notify("t1", usage_ratio=1.0)
    assert any(s["threshold"] == 100 for s in sent)


def test_idempotente_mismo_umbral(alerts):
    svc, sent = alerts
    svc.check_and_notify("t1", usage_ratio=0.85)
    svc.check_and_notify("t1", usage_ratio=0.88)  # mismo umbral (80%), no reenvía
    assert len([s for s in sent if s["threshold"] == 80]) == 1


def test_reset_mensual_rearma_alertas(alerts):
    svc, sent = alerts
    svc.check_and_notify("t1", usage_ratio=0.85)   # dispara 80%
    svc.reset_month("t1")
    svc.check_and_notify("t1", usage_ratio=0.85)   # debe disparar de nuevo
    assert len([s for s in sent if s["threshold"] == 80]) == 2


def test_aislamiento_entre_tenants(alerts):
    svc, sent = alerts
    svc.check_and_notify("t1", usage_ratio=0.85)
    svc.check_and_notify("t2", usage_ratio=0.30)
    t2_alerts = [s for s in sent if s["tenant_id"] == "t2"]
    assert len(t2_alerts) == 0
