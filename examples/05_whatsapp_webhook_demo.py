"""Demo SPEC-005: simula un POST de 360dialog contra el webhook.

Corre sin red ni claves reales: usa MockLLMProvider y WhatsAppTool en mock.
Muestra: challenge → routing → dedup → agente → "envío" mock.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)) + "/backend")

from fastapi.testclient import TestClient

SECRET = "demo_app_secret"
VERIFY_TOKEN = "demo_verify_token"
PHONE_NUMBER_ID = "demo_phone_id"
TENANT_ID = "demo-pyme"


def _sign(body: bytes) -> str:
    sig = hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
    return f"sha256={sig}"


def main():
    # Parchea settings antes de importar la app
    import app.core.config as cfg
    from dataclasses import replace

    cfg.settings = replace(
        cfg.settings,
        wa_verify_token=VERIFY_TOKEN,
        wa_app_secret=SECRET,
        wa_registry_db=":memory:",
        dedup_db=":memory:",
    )
    import app.api.webhooks as wh
    wh.settings = cfg.settings
    wh._registry = None
    wh._dedup = None

    from app.core.tenant_registry import TenantRegistry
    from app.core.limits import LimitsService
    from app.api.deps import get_limits, get_store, get_memory, get_llm
    get_store.cache_clear(); get_limits.cache_clear(); get_memory.cache_clear(); get_llm.cache_clear()

    reg = TenantRegistry(":memory:")
    reg.register(PHONE_NUMBER_ID, TENANT_ID, "lead-classifier-whatsapp", "starter")
    wh._registry = reg

    limits = get_limits()
    limits.set_plan(TENANT_ID, "starter")

    from app.main import app
    client = TestClient(app, raise_server_exceptions=False)

    print("\n=== SPEC-005 Demo: WhatsApp Webhook ===\n")

    # 1. Challenge
    r = client.get(
        "/webhooks/whatsapp",
        params={"hub.mode": "subscribe", "hub.verify_token": VERIFY_TOKEN, "hub.challenge": "abc123"},
    )
    print(f"[1] GET challenge → {r.status_code} | body: {r.text!r}")

    # 2. Firma inválida
    body = b'{"garbage": true}'
    r = client.post("/webhooks/whatsapp", content=body,
                    headers={"Content-Type": "application/json", "X-Hub-Signature-256": "sha256=bad"})
    print(f"[2] POST firma inválida → {r.status_code} (esperado 403)")

    # 3. Mensaje de texto real
    payload = {
        "object": "whatsapp_business_account",
        "entry": [{"id": "W", "changes": [{"value": {
            "messaging_product": "whatsapp",
            "metadata": {"display_phone_number": "+56912345678", "phone_number_id": PHONE_NUMBER_ID},
            "contacts": [{"profile": {"name": "Cliente Demo"}, "wa_id": "56987654321"}],
            "messages": [{"from": "56987654321", "id": "wamid.DEMO001",
                           "timestamp": "1717000000", "text": {"body": "Hola, quiero info del plan"}, "type": "text"}],
        }, "field": "messages"}]}],
    }
    body = json.dumps(payload).encode()
    r = client.post("/webhooks/whatsapp", content=body,
                    headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)})
    print(f"[3] POST mensaje de texto → {r.status_code} | {r.json()}")

    # 4. Duplicado (mismo message_id)
    r = client.post("/webhooks/whatsapp", content=body,
                    headers={"Content-Type": "application/json", "X-Hub-Signature-256": _sign(body)})
    print(f"[4] POST duplicado → {r.status_code} | {r.json()}")

    # 5. Trazas guardadas
    traces = get_memory().traces(TENANT_ID)
    print(f"[5] Trazas en memoria para {TENANT_ID!r}: {len(traces)} traza(s)")
    if traces:
        t = traces[0]
        print(f"    agente={t.get('agent_key')} | blocked={t.get('blocked')} | escalado={t.get('escalated_to_human')}")

    print("\n✓ Demo completado sin red ni claves reales.\n")


if __name__ == "__main__":
    main()
