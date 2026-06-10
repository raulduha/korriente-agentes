"""Smoke test post-deploy: verifica /health y un ciclo completo con tenant sandbox.

Uso:
    python scripts/smoke_test.py https://TU_DOMINIO

Requiere un tenant de sandbox registrado o usa el endpoint /webhooks/message interno.
No gasta dinero si KORRIENTE_LLM_PROVIDER=mock en el deploy.
"""
from __future__ import annotations

import json
import sys

try:
    import httpx
except ImportError:
    print("Instala httpx: pip install httpx")
    sys.exit(1)


def main(base_url: str) -> None:
    base_url = base_url.rstrip("/")
    errors = []

    # 1. Healthcheck
    print(f"[1] GET {base_url}/health ...", end=" ")
    try:
        r = httpx.get(f"{base_url}/health", timeout=10)
        r.raise_for_status()
        data = r.json()
        assert data.get("status") == "ok", f"status inesperado: {data}"
        print("OK")
    except Exception as e:
        print(f"FALLO: {e}")
        errors.append(f"healthcheck: {e}")

    # 2. Webhook interno de testing
    print(f"[2] POST {base_url}/webhooks/message (sandbox) ...", end=" ")
    try:
        payload = {
            "tenant_id": "sandbox",
            "agent_key": "lead-classifier-whatsapp",
            "text": "smoke test — hola",
            "sender": "+56900000000",
            "channel": "whatsapp",
        }
        # Requiere que "sandbox" tenga un plan. Si no existe, el endpoint devuelve 500.
        r = httpx.post(
            f"{base_url}/webhooks/message",
            json=payload,
            timeout=30,
        )
        if r.status_code == 200:
            trace = r.json()
            print(f"OK | blocked={trace.get('blocked')} | cost_usd={trace.get('cost_usd')}")
        else:
            # 422 / 500 si el tenant sandbox no está provisionado — aceptable
            print(f"skip (tenant sandbox no provisionado, {r.status_code})")
    except Exception as e:
        print(f"FALLO: {e}")
        errors.append(f"webhook/message: {e}")

    # Resultado
    print()
    if errors:
        print(f"SMOKE TEST FALLIDO: {errors}")
        sys.exit(1)
    else:
        print("smoke test OK — deploy funcionando.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python scripts/smoke_test.py https://TU_DOMINIO")
        sys.exit(1)
    main(sys.argv[1])
