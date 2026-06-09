"""Abstracción del LLM — provider-agnóstica (constitución §5).

Nadie fuera de app/llm/providers habla con un SDK concreto. Los agentes usan
`LLMProvider.complete()` y el runtime contabiliza el costo de `LLMResponse`.

Usamos "tiers" lógicos (`mini`, `smart`) en vez de nombres de modelo, para poder
cambiar de proveedor/modelo sin tocar el código de los agentes (constitución §2:
modelo barato por defecto).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class TierPricing:
    in_per_token: float
    out_per_token: float


# Precios por millón de tokens, traducidos a por-token. Aproximados (junio 2026).
MODEL_TIERS: dict[str, TierPricing] = {
    # Barato, para clasificar/extraer/redactar mensajes cortos (default).
    "mini": TierPricing(in_per_token=0.15 / 1_000_000, out_per_token=0.60 / 1_000_000),
    # Razonamiento complejo; usar solo cuando se justifica.
    "smart": TierPricing(in_per_token=3.0 / 1_000_000, out_per_token=15.0 / 1_000_000),
}


def estimate_tokens(text: str) -> int:
    """Estimación simple: ~4 caracteres por token."""
    return max(1, len(text) // 4)


def estimate_cost(tier: str, input_tokens: int, output_tokens: int) -> float:
    p = MODEL_TIERS.get(tier, MODEL_TIERS["mini"])
    return input_tokens * p.in_per_token + output_tokens * p.out_per_token


@dataclass
class LLMResponse:
    text: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float


class LLMProvider(ABC):
    """Contrato mínimo que todo proveedor debe cumplir."""

    @abstractmethod
    def complete(
        self,
        *,
        system: str,
        user: str,
        model: str = "mini",
        json_mode: bool = False,
    ) -> LLMResponse:
        """Devuelve la respuesta del modelo + costo estimado."""
        raise NotImplementedError
