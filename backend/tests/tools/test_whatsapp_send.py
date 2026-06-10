"""Tests para WhatsAppTool — send_message y send_template en modo mock y real stub."""
from __future__ import annotations

import pytest

from app.tools.whatsapp import WhatsAppTool


@pytest.fixture
def wa_mock():
    return WhatsAppTool(mock=True)


def test_send_message_mock_ok(wa_mock):
    r = wa_mock.run("send_message", to="+56987654321", body="Hola")
    assert r.ok is True
    assert r.data["message_id"].startswith("mock-wa-")
    assert r.cost_usd > 0


def test_send_template_mock_ok(wa_mock):
    r = wa_mock.run("send_template", to="+56987654321", template="saludo", params=["Juan"])
    assert r.ok is True
    assert "message_id" in r.data


def test_send_message_sin_to_falla(wa_mock):
    r = wa_mock.run("send_message", to="", body="Hola")
    assert r.ok is False
    assert r.cost_usd == 0.0


def test_send_message_sin_body_falla(wa_mock):
    r = wa_mock.run("send_message", to="+56987654321", body="")
    assert r.ok is False


def test_historial_registrado(wa_mock):
    wa_mock.run("send_message", to="+56987654321", body="msg1")
    wa_mock.run("send_message", to="+56987654321", body="msg2")
    assert len(wa_mock.sent) == 2


def test_send_real_lanza_notimplemented():
    wa_real = WhatsAppTool(mock=False)
    with pytest.raises(NotImplementedError):
        wa_real.run("send_message", to="+56987654321", body="Hola")


def test_send_real_con_config_usa_api(monkeypatch):
    """Con api_key configurada, _send debe llamar a httpx, no lanzar NotImplementedError."""
    import httpx

    class FakeResp:
        def raise_for_status(self): pass
        def json(self): return {"messages": [{"id": "real-wa-id-001"}]}

    monkeypatch.setattr(httpx, "post", lambda *a, **kw: FakeResp())
    wa = WhatsAppTool(mock=False, api_key="test-key", phone_number_id="111")
    r = wa.run("send_message", to="+56987654321", body="Hola real")
    assert r.ok is True
    assert r.data["message_id"] == "real-wa-id-001"


def test_error_de_red_devuelve_ok_false(monkeypatch):
    import httpx

    def _raise(*a, **kw):
        raise httpx.RequestError("timeout")

    monkeypatch.setattr(httpx, "post", _raise)
    wa = WhatsAppTool(mock=False, api_key="test-key", phone_number_id="111")
    r = wa.run("send_message", to="+56987654321", body="Hola")
    assert r.ok is False
    assert r.cost_usd == 0.0
