"""La tabla de planes debe ser coherente (y coincidir con docs/pricing.md)."""
from app.core.pricing import PLANS, UNLIMITED, get_plan
from app.core.errors import UnknownPlanError
import pytest


def test_planes_basicos_existen():
    assert set(PLANS) >= {"starter", "growth", "pro", "enterprise"}


def test_starter_tiene_los_numeros_del_doc():
    p = get_plan("starter")
    assert p.monthly_clp == 290_000
    assert p.setup_clp == 490_000
    assert p.included_conversations == 800
    assert p.included_llm_actions == 3_000
    assert p.budget_cap_usd == 60.0
    assert p.max_agents == 1


def test_los_limites_crecen_por_tier():
    s, g, pr = get_plan("starter"), get_plan("growth"), get_plan("pro")
    assert s.monthly_clp < g.monthly_clp < pr.monthly_clp
    assert s.included_conversations < g.included_conversations < pr.included_conversations
    assert s.budget_cap_usd < g.budget_cap_usd < pr.budget_cap_usd


def test_enterprise_es_ilimitado():
    e = get_plan("enterprise")
    assert e.is_unlimited("included_conversations")
    assert e.max_agents == UNLIMITED


def test_plan_desconocido_levanta_error():
    with pytest.raises(UnknownPlanError):
        get_plan("no-existe")
