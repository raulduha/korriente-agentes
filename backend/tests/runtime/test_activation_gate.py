"""Tests para el gate de activación del runtime (SPEC-006 caso 5)."""
from __future__ import annotations

import pytest

from app.agents import build_agent
from app.billing.service import BillingService
from app.core.limits import LimitsService
from app.core.storage import InMemoryUsageStore
from app.llm.providers.mock import MockLLMProvider
from app.runtime.memory import Memory
from app.runtime.types import Message


def _make_agent(*, tenant_estado: str):
    store = InMemoryUsageStore()
    limits = LimitsService(store=store)
    limits.set_plan("tenant-x", "starter")
    billing = BillingService(store=store)
    billing.provision("tenant-x", "starter")
    if tenant_estado == "suspendido":
        billing.suspend("tenant-x")
    llm = MockLLMProvider(default='{"intent":"info","confidence":0.9}')
    memory = Memory(store=store)
    agent = build_agent(
        "lead-classifier-whatsapp",
        llm=llm,
        limits=limits,
        memory=memory,
        billing=billing,
    )
    return agent, store


def test_tenant_activo_procesa():
    agent, store = _make_agent(tenant_estado="activo")
    msg = Message(text="Hola", channel="whatsapp", sender="+56987654321", tenant_id="tenant-x")
    trace = agent.handle(msg)
    assert trace.blocked is False


def test_tenant_suspendido_no_gasta():
    agent, store = _make_agent(tenant_estado="suspendido")
    msg = Message(text="Hola", channel="whatsapp", sender="+56987654321", tenant_id="tenant-x")
    trace = agent.handle(msg)
    assert trace.blocked is True
    assert trace.block_reason is not None
    # Gasto de API debe ser $0
    from app.core.limits import LimitsService
    svc = LimitsService(store=store)
    usage = svc.get_usage("tenant-x")
    assert usage.cost_usd == 0.0
