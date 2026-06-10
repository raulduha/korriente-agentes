"""Tests para app/core/security.py — HMAC-SHA256 firma de webhooks."""
from __future__ import annotations

import hashlib
import hmac

import pytest

from app.core.security import verify_signature


SECRET = "supersecret"


def _sign(body: bytes, secret: str) -> str:
    sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={sig}"


def test_firma_valida():
    body = b'{"test": 1}'
    header = _sign(body, SECRET)
    assert verify_signature(body, header, SECRET) is True


def test_firma_invalida_rechazada():
    body = b'{"test": 1}'
    header = _sign(body, "wrong_secret")
    assert verify_signature(body, header, SECRET) is False


def test_body_alterado_rechazado():
    body = b'{"test": 1}'
    header = _sign(body, SECRET)
    assert verify_signature(b'{"test": 2}', header, SECRET) is False


def test_header_ausente():
    assert verify_signature(b"body", None, SECRET) is False
    assert verify_signature(b"body", "", SECRET) is False


def test_formato_invalido():
    # sin prefijo sha256=
    assert verify_signature(b"body", "deadbeef", SECRET) is False


def test_compare_digest_no_shortcircuit():
    """Asegura que se usa compare_digest (no == directo)."""
    import inspect
    from app.core import security
    src = inspect.getsource(security.verify_signature)
    assert "compare_digest" in src
