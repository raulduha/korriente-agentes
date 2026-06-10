"""Tests para /dashboard/traces — aislamiento por token/tenant (SPEC-008)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

CLIENT = TestClient(app)


@pytest.fixture(autouse=True)
def setup_traces(monkeypatch, tmp_path):
    monkeypatch.setenv("KORRIENTE_DB", str(tmp_path / "test.db"))
    from app.api import deps
    deps.get_store.cache_clear()
    deps.get_limits.cache_clear()
    deps.get_memory.cache_clear()
    deps.get_llm.cache_clear()

    store = deps.get_store()
    limits = deps.get_limits()
    limits.set_plan("tenant-A", "starter")
    limits.set_plan("tenant-B", "starter")
    store.add_trace("tenant-A", {"msg": "hola", "tenant_id": "tenant-A"})
    store.add_trace("tenant-A", {"msg": "segundo", "tenant_id": "tenant-A"})
    store.add_trace("tenant-B", {"msg": "otro tenant", "tenant_id": "tenant-B"})

    # Registra tokens
    from app.core.tenant_registry import TenantRegistry
    reg = TenantRegistry(str(tmp_path / "registry.db"))
    reg.register_token("tenant-A", "token-aaa")
    reg.register_token("tenant-B", "token-bbb")
    monkeypatch.setenv("KORRIENTE_WA_REGISTRY_DB", str(tmp_path / "registry.db"))
    yield
    deps.get_store.cache_clear()
    deps.get_limits.cache_clear()
    deps.get_memory.cache_clear()
    deps.get_llm.cache_clear()


def test_token_valido_ve_sus_trazas():
    r = CLIENT.get("/dashboard/traces", headers={"X-Tenant-Token": "token-aaa"})
    assert r.status_code == 200
    data = r.json()
    assert len(data["traces"]) == 2
    for t in data["traces"]:
        assert t["tenant_id"] == "tenant-A"


def test_token_valido_no_ve_otro_tenant():
    r = CLIENT.get("/dashboard/traces", headers={"X-Tenant-Token": "token-aaa"})
    data = r.json()
    tenants = {t["tenant_id"] for t in data["traces"]}
    assert "tenant-B" not in tenants


def test_token_invalido_no_devuelve_datos():
    r = CLIENT.get("/dashboard/traces", headers={"X-Tenant-Token": "wrong-token"})
    assert r.status_code == 401


def test_sin_token_rechazado():
    r = CLIENT.get("/dashboard/traces")
    assert r.status_code == 401
