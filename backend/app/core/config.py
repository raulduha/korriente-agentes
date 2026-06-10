"""Configuración central. Lee de variables de entorno con defaults seguros."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    # LLM
    llm_provider: str = os.getenv("KORRIENTE_LLM_PROVIDER", "mock")
    # Tipo de cambio referencial para mostrar costos en CLP.
    clp_per_usd: float = float(os.getenv("KORRIENTE_CLP_PER_USD", "950"))
    # Umbral para avisar "cerca del límite" (0.8 = 80%).
    near_limit_ratio: float = float(os.getenv("KORRIENTE_NEAR_LIMIT_RATIO", "0.8"))
    # Por defecto los límites son DUROS (bloquean al llegar al 100%).
    hard_limits: bool = os.getenv("KORRIENTE_HARD_LIMITS", "true").lower() == "true"

    # WhatsApp / 360dialog (SPEC-005)
    wa_verify_token: str = os.getenv("KORRIENTE_WA_VERIFY_TOKEN", "")
    wa_app_secret: str = os.getenv("KORRIENTE_WA_APP_SECRET", "")
    dialog360_api_key: str = os.getenv("KORRIENTE_DIALOG360_API_KEY", "")
    dialog360_base_url: str = os.getenv(
        "KORRIENTE_DIALOG360_BASE_URL", "https://waba.360dialog.io/v1"
    )
    # Rutas de las DBs auxiliares (defaults a :memory: para tests)
    wa_registry_db: str = os.getenv("KORRIENTE_WA_REGISTRY_DB", ":memory:")
    dedup_db: str = os.getenv("KORRIENTE_DEDUP_DB", ":memory:")

    # Flow.cl (SPEC-006)
    flow_webhook_secret: str = os.getenv("KORRIENTE_FLOW_WEBHOOK_SECRET", "")
    flow_api_key: str = os.getenv("KORRIENTE_FLOW_API_KEY", "")
    flow_grace_days: int = int(os.getenv("KORRIENTE_FLOW_GRACE_DAYS", "5"))


settings = Settings()
