"""Cliente Flow.cl — verificación de firma y mock para tests (SPEC-006)."""
from __future__ import annotations

import hashlib
import hmac


class FlowClient:
    def __init__(self, *, mock: bool = True, webhook_secret: str = "") -> None:
        self.mock = mock
        self._secret = webhook_secret

    def verify_signature(self, raw_body: bytes, signature: str | None) -> bool:
        if not signature:
            return False
        expected = hmac.new(self._secret.encode(), raw_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
