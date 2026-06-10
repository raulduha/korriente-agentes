"""Tests para app/core/tenant_registry.py — routing phone_number_id → tenant."""
from __future__ import annotations

import pytest

from app.core.tenant_registry import TenantRegistry


@pytest.fixture
def registry(tmp_path):
    return TenantRegistry(str(tmp_path / "registry.db"))


def test_registra_y_resuelve(registry):
    registry.register("111222333", "tenant-a", "lead-classifier-whatsapp", "starter")
    r = registry.resolve("111222333")
    assert r is not None
    assert r["tenant_id"] == "tenant-a"
    assert r["agent_key"] == "lead-classifier-whatsapp"
    assert r["plan"] == "starter"


def test_numero_no_registrado_devuelve_none(registry):
    assert registry.resolve("000000000") is None


def test_persiste_en_sqlite(tmp_path):
    path = str(tmp_path / "reg.db")
    r1 = TenantRegistry(path)
    r1.register("555", "tenant-x", "cobranza", "growth")
    r2 = TenantRegistry(path)
    assert r2.resolve("555")["tenant_id"] == "tenant-x"


def test_aislamiento_un_numero_un_tenant(registry):
    registry.register("aaa", "t1", "lead-classifier-whatsapp", "starter")
    registry.register("bbb", "t2", "cobranza", "starter")
    assert registry.resolve("aaa")["tenant_id"] == "t1"
    assert registry.resolve("bbb")["tenant_id"] == "t2"
    assert registry.resolve("aaa")["tenant_id"] != registry.resolve("bbb")["tenant_id"]


def test_update_registro(registry):
    registry.register("999", "t1", "lead-classifier-whatsapp", "starter")
    registry.register("999", "t1", "lead-classifier-whatsapp", "growth")
    assert registry.resolve("999")["plan"] == "growth"
