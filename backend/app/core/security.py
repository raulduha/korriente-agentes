"""Verificación de firma HMAC-SHA256 para webhooks (WhatsApp y Flow)."""
from __future__ import annotations

import hashlib
import hmac


def verify_signature(raw_body: bytes, header: str | None, secret: str) -> bool:
    """Verifica X-Hub-Signature-256 o equivalente. Usa compare_digest (tiempo constante)."""
    if not header:
        return False
    prefix = "sha256="
    if not header.startswith(prefix):
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    received = header[len(prefix):]
    return hmac.compare_digest(expected, received)
