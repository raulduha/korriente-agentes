"""Tests para GET/POST /webhooks/whatsapp — los 11 casos de SPEC-005 §4."""
from __future__ import annotations

import hashlib
import hmac
import json

import pytest
from fastapi.testclient import TestClient

from app.main import app

CLIENT = TestClient(app, raise_server_exceptions=False)
SECRET = "test_app_secret"
VERIFY_TOKEN = "test_verify_token"
PHONE_NUMBER_ID = "111222333"
TENANT_ID = "tenant-demo"


def _sign(body: bytes) -> str:
    sig = hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={sig}"


def _wa_text_payload(msg_id: str = "wamid.TEST001", text: str = "Hola") -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "WABA",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {"display_phone_number": "+56912345678", "phone_number_id": PHONE_NUMBER_ID},
                    "contacts": [{"profile": {"name": "Test"}, "wa_id": "56987654321"}],
                    "messages": [{
                        "from": "56987654321",
                        "id": msg_id,
                        "timestamp": "1717000000",
                        "text": {"body": text},
                        "type": "text",
                    }],
                },
                "field": "messages",
            }],
        }],
    }


def _wa_status_payload() -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "WABA",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {"display_phone_number": "+56912345678", "phone_number_id": PHONE_NUMBER_ID},
                    "statuses": [{"id": "wamid.STATUS001", "status": "delivered", "timestamp": "1717000001", "recipient_id": "56987654321"}],
                },
                "field": "messages",
            }],
        }],
    }


def _wa_image_payload() -> dict:
    return {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "WABA",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {"display_phone_number": "+56912345678", "phone_number_id": PHONE_NUMBER_ID},
                    "contacts": [{"profile": {"name": "Ana"}, "wa_id": "56911111111"}],
                    "messages": [{
                        "from": "56911111111",
                        "id": "wamid.IMG001",
                        "timestamp": "1717000002",
                        "image": {"mime_type": "image/jpeg", "id": "img-id"},
                        "type": "image",
                    }],
                },
                "field": "messages",
            }],
        }],
    }


@pytest.fixture(autouse=True)
def setup_env(monkeypatch, tmp_path):
    import app.api.webhooks as wh_mod
    import app.core.config as cfg_mod
    from dataclasses import replace

    # Parchea el singleton de settings con los valores de test
    patched = replace(
        cfg_mod.settings,
        wa_verify_token=VERIFY_TOKEN,
        wa_app_secret=SECRET,
        wa_registry_db=str(tmp_path / "registry.db"),
        dedup_db=str(tmp_path / "dedup.db"),
    )
    monkeypatch.setattr(cfg_mod, "settings", patched)
    monkeypatch.setattr(wh_mod, "settings", patched)

    # Registra el phone_number_id en el registry y provee el tenant
    from app.core.tenant_registry import TenantRegistry
    from app.core.limits import LimitsService
    reg = TenantRegistry(str(tmp_path / "registry.db"))
    reg.register(PHONE_NUMBER_ID, TENANT_ID, "lead-classifier-whatsapp", "starter")
    limits = LimitsService()
    limits.set_plan(TENANT_ID, "starter")

    # Resetea singletons de webhooks para usar el registry parcheado
    monkeypatch.setattr(wh_mod, "_registry", None)
    monkeypatch.setattr(wh_mod, "_dedup", None)

    # Resetea caches de deps
    from app.api import deps
    deps.get_store.cache_clear()
    deps.get_limits.cache_clear()
    deps.get_memory.cache_clear()
    deps.get_llm.cache_clear()
    yield
    deps.get_store.cache_clear()
    deps.get_limits.cache_clear()
    deps.get_memory.cache_clear()
    deps.get_llm.cache_clear()


# Caso 1 — GET challenge válido
def test_challenge_ok():
    r = CLIENT.get(
        "/webhooks/whatsapp",
        params={"hub.mode": "subscribe", "hub.verify_token": VERIFY_TOKEN, "hub.challenge": "abc123"},
    )
    assert r.status_code == 200
    assert r.text == "abc123"


# Caso 2 — GET token incorrecto
def test_challenge_token_incorrecto():
    r = CLIENT.get(
        "/webhooks/whatsapp",
        params={"hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "abc123"},
    )
    assert r.status_code == 403


# Caso 3 — POST firma válida, mensaje de texto
def test_post_firma_valida_texto():
    body = json.dumps(_wa_text_payload()).encode()
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)},
    )
    assert r.status_code == 200


# Caso 4 — POST firma inválida
def test_post_firma_invalida():
    body = json.dumps(_wa_text_payload()).encode()
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": "sha256=badbadbad"},
    )
    assert r.status_code == 403


# Caso 4b — POST sin firma
def test_post_sin_firma():
    body = json.dumps(_wa_text_payload()).encode()
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json"},
    )
    assert r.status_code == 403


# Caso 5 — phone_number_id no registrado: 200 pero no procesa
def test_post_numero_no_registrado():
    payload = _wa_text_payload()
    payload["entry"][0]["changes"][0]["value"]["metadata"]["phone_number_id"] = "UNKNOWN"
    body = json.dumps(payload).encode()
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)},
    )
    assert r.status_code == 200


# Caso 6 — Duplicado: segundo POST con mismo message_id → ignorado
def test_post_duplicado_ignorado():
    body = json.dumps(_wa_text_payload("wamid.DEDUP")).encode()
    headers = {"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)}
    r1 = CLIENT.post("/webhooks/whatsapp", content=body, headers=headers)
    r2 = CLIENT.post("/webhooks/whatsapp", content=body, headers=headers)
    assert r1.status_code == 200
    assert r2.status_code == 200


# Caso 7 — Mensaje no-texto (imagen): 200, escala
def test_post_imagen_escala():
    body = json.dumps(_wa_image_payload()).encode()
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)},
    )
    assert r.status_code == 200


# Caso 8 — Callback de estado: 200, no corre agente
def test_post_status_callback():
    body = json.dumps(_wa_status_payload()).encode()
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)},
    )
    assert r.status_code == 200


# Caso 9 — Payload malformado: 200 (ack, no rompe)
def test_post_payload_malformado():
    body = b'{"garbage": true}'
    r = CLIENT.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)},
    )
    assert r.status_code == 200
