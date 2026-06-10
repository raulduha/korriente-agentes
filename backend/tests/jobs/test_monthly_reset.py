"""Tests para app/jobs/monthly_reset.py — resetea uso, rearma alertas, conserva trazas."""
from __future__ import annotations

import pytest

from app.core.limits import LimitsService
from app.core.storage import InMemoryUsageStore
from app.alerts.service import AlertService
from app.jobs.monthly_reset import run_monthly_reset


@pytest.fixture
def setup():
    store = InMemoryUsageStore()
    limits = LimitsService(store=store)
    limits.set_plan("t1", "starter")
    limits.record("t1", conversations=500, llm_actions=1000, cost_usd=30.0)
    store.add_trace("t1", {"msg": "conversación 1"})
    sent = []
    alerts = AlertService(store=store, notifier=lambda tid, thr, msg: sent.append(thr))
    return store, limits, alerts, sent


def test_reset_pone_uso_a_cero(setup):
    store, limits, alerts, _ = setup
    run_monthly_reset(limits, alerts, ["t1"])
    u = limits.get_usage("t1")
    assert u.conversations == 0
    assert u.cost_usd == 0.0


def test_reset_conserva_trazas(setup):
    store, limits, alerts, _ = setup
    run_monthly_reset(limits, alerts, ["t1"])
    assert len(store.traces("t1")) == 1  # la traza sigue ahí


def test_reset_rearma_alertas(setup):
    store, limits, alerts, sent = setup
    alerts.check_and_notify("t1", usage_ratio=0.85)   # dispara 80%
    run_monthly_reset(limits, alerts, ["t1"])
    alerts.check_and_notify("t1", usage_ratio=0.85)   # debe disparar de nuevo
    assert sent.count(80) == 2
