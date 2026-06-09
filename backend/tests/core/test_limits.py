"""Cuotas y budget cap: el corazón de la promesa PyME-first."""
import pytest

from app.core.limits import LimitsService


@pytest.fixture
def svc():
    s = LimitsService()
    s.set_plan("t1", "starter")  # 800 conv, 3000 acciones, cap US$60
    return s


def test_permite_dentro_del_limite(svc):
    d = svc.check("t1", conversations=1, llm_actions=1, est_cost_usd=0.05)
    assert d.allowed is True
    assert d.near_limit is False


def test_bloquea_al_exceder_conversaciones(svc):
    svc.record("t1", conversations=800)
    d = svc.check("t1", conversations=1)
    assert d.allowed is False
    assert "conversaciones" in d.reason.lower()


def test_bloquea_al_exceder_budget_cap(svc):
    svc.record("t1", cost_usd=59.99)
    d = svc.check("t1", est_cost_usd=0.50)  # proyecta 60.49 > 60
    assert d.allowed is False
    assert "gasto" in d.reason.lower() or "budget" in d.reason.lower()


def test_avisa_cerca_del_limite_al_80pct(svc):
    svc.record("t1", conversations=640)  # 80% de 800
    d = svc.check("t1", conversations=1)
    assert d.allowed is True
    assert d.near_limit is True


def test_limite_blando_no_bloquea_pero_avisa():
    s = LimitsService(hard_limits=False)
    s.set_plan("t2", "starter")
    s.record("t2", conversations=800)
    d = s.check("t2", conversations=10)
    assert d.allowed is True
    assert d.near_limit is True


def test_reset_mensual(svc):
    svc.record("t1", conversations=800, cost_usd=60)
    svc.reset_month("t1")
    u = svc.get_usage("t1")
    assert u.conversations == 0 and u.cost_usd == 0.0


def test_snapshot_reporta_porcentajes(svc):
    svc.record("t1", conversations=400)
    snap = svc.snapshot("t1")
    assert snap["conversations"]["pct"] == 50.0
