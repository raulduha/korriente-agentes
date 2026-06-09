"""Proveedor OpenAI (stub funcional, dependencia opcional).

Se activa con KORRIENTE_LLM_PROVIDER=openai y OPENAI_API_KEY en el entorno.
Instala el extra: pip install -e ".[openai]". No se usa en tests (esos van con mock).
"""
from __future__ import annotations

import os

from ..base import LLMProvider, LLMResponse, estimate_cost

# Traducción tier lógico -> modelo real del proveedor.
_TIER_TO_MODEL = {
    "mini": "gpt-4o-mini",
    "smart": "gpt-4o",
}


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str | None = None):
        try:
            from openai import OpenAI  # type: ignore
        except ImportError as exc:  # pragma: no cover
            raise ImportError(
                "Falta el paquete 'openai'. Instala: pip install -e \".[openai]\""
            ) from exc
        self._client = OpenAI(api_key=api_key or os.environ["OPENAI_API_KEY"])

    def complete(self, *, system: str, user: str, model: str = "mini", json_mode: bool = False) -> LLMResponse:  # pragma: no cover
        real_model = _TIER_TO_MODEL.get(model, _TIER_TO_MODEL["mini"])
        kwargs = {}
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        resp = self._client.chat.completions.create(
            model=real_model,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            **kwargs,
        )
        text = resp.choices[0].message.content or ""
        usage = resp.usage
        in_tok = usage.prompt_tokens if usage else 0
        out_tok = usage.completion_tokens if usage else 0
        return LLMResponse(
            text=text,
            model=real_model,
            input_tokens=in_tok,
            output_tokens=out_tok,
            cost_usd=estimate_cost(model, in_tok, out_tok),
        )
