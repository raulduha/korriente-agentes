"""Configuración central. Lee de variables de entorno con defaults seguros para dev."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    # Proveedor de LLM por defecto. "mock" no gasta dinero y se usa en tests/demos.
    llm_provider: str = os.getenv("KORRIENTE_LLM_PROVIDER", "mock")
    # Tipo de cambio referencial para mostrar costos en CLP.
    clp_per_usd: float = float(os.getenv("KORRIENTE_CLP_PER_USD", "950"))
    # Umbral para avisar "cerca del límite" (0.8 = 80%).
    near_limit_ratio: float = float(os.getenv("KORRIENTE_NEAR_LIMIT_RATIO", "0.8"))
    # Por defecto los límites son DUROS (bloquean al llegar al 100%).
    hard_limits: bool = os.getenv("KORRIENTE_HARD_LIMITS", "true").lower() == "true"


settings = Settings()
