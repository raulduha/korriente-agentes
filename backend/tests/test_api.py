"""Smoke test de la API. Se omite si no está instalado el TestClient (httpx)."""
import pytest

pytest.importorskip("httpx", reason="TestClient requiere httpx")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_plans_endpoint():
    r = client.get("/dashboard/plans")
    assert r.status_code == 200
    assert "starter" in r.json()


def test_flujo_completo_alta_y_mensaje():
    # alta de tenant
    r = client.post("/dashboard/tenants", json={"tenant_id": "api-pyme", "plan_key": "starter"})
    assert r.status_code == 200
    # mensaje entrante (LLM mock por defecto -> default "{}" => consulta baja confianza)
    r = client.post("/webhooks/message", json={
        "tenant_id": "api-pyme", "agent_key": "lead-classifier-whatsapp",
        "text": "Hola, una consulta", "sender": "+56998761234",
    })
    assert r.status_code == 200
    body = r.json()
    assert body["agent_key"] == "lead-classifier-whatsapp"
    # uso reflejado
    r = client.get("/dashboard/tenants/api-pyme/usage")
    assert r.json()["conversations"]["used"] == 1
