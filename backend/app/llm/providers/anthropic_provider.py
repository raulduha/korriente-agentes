"""Proveedor Anthropic (stub funcional, dependencia opcional).

Se activa con KORRIENTE_LLM_PROVIDER=anthropic y ANTHROPIC_API_KEY en el entorno.
Instala el extra: pip install -e ".[anthropic]". No se usa en tests (esos van con mock).
"""
from __future__ import annotations

import os

from ..base import LLMProvider, LLMResponse, estimate_cost

_TIER_TO_MODEL = {
    "mini": "claude-haiku-4-5-20251001",
    "smart": "claude-sonnet-4-6",
}


class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str | None = None):
        try:
            import anthropic  # type: ignore
        except ImportError as exc:  # pragma: no cover
            raise ImportError(
                "Falta el paquete 'anthropic'. Instala: pip install -e \".[anthropic]\""
            ) from exc
        self._client = anthropic.Anthropic(api_key=api_key or os.environ["ANTHROPIC_API_KEY"])

    def complete(self, *, system: str, user: str, model: str = "mini", json_mode: bool = False) -> LLMResponse:  # pragma: no cover
        real_model = _TIER_TO_MODEL.get(model, _TIER_TO_MODEL["mini"])
        msg = self._client.messages.create(
            model=real_model,
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        text = "".join(block.text for block in msg.content if block.type == "text")
        in_tok = msg.usage.input_tokens
        out_tok = msg.usage.output_tokens
        return LLMResponse(
            text=text,
            model=real_model,
            input_tokens=in_tok,
            output_tokens=out_tok,
            cost_usd=estimate_cost(model, in_tok, out_tok),
        )
