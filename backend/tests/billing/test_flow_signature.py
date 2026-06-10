"""Tests para app/billing/flow.py — verificación de firma Flow."""
from __future__ import annotations

import hashlib
import hmac

import pytest

from app.billing.flow import FlowClient


SECRET = "flow_webhook_secret"


def _sign(body: bytes) -> str:
    return hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()


@pytest.fixture
def flow():
    return FlowClient(mock=True, webhook_secret=SECRET)


def test_firma_valida_ok(flow):
    body = b'{"paymentId": "pay-001", "status": "ACCEPTED"}'
    sig = _sign(body)
    assert flow.verify_signature(body, sig) is True


def test_firma_invalida_rechazada(flow):
    body = b'{"paymentId": "pay-001", "status": "ACCEPTED"}'
    assert flow.verify_signature(body, "badfirma") is False


def test_payload_alterado_rechazado(flow):
    body = b'{"paymentId": "pay-001", "status": "ACCEPTED"}'
    sig = _sign(body)
    assert flow.verify_signature(b'{"paymentId": "pay-002"}', sig) is False


def test_firma_ausente_rechazada(flow):
    body = b'{"paymentId": "pay-001"}'
    assert flow.verify_signature(body, None) is False
    assert flow.verify_signature(body, "") is False
