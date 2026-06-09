"""Proveedor de LLM simulado (mock).

No hace llamadas de red ni gasta dinero. Es la base de las pruebas simuladas y de los
ejemplos. Se puede programar de tres formas (en orden de prioridad):

1. `router`: una función `(system, user) -> str` que decide la respuesta.
2. `responses`: una lista de strings que se consumen en orden (la última se repite).
3. `default`: string que se devuelve si no hay nada más.

Calcula tokens y costo igual que un proveedor real, para que las pruebas de límites y
budget sean realistas.
"""
from __future__ import annotations

from typing import Callable, Optional

from ..base import LLMProvider, LLMResponse, estimate_cost, estimate_tokens


class MockLLMProvider(LLMProvider):
    def __init__(
        self,
        *,
        responses: Optional[list[str]] = None,
        router: Optional[Callable[[str, str], str]] = None,
        default: str = "{}",
    ):
        self._responses = list(responses) if responses else []
        self._router = router
        self._default = default
        self.calls: list[dict] = []  # historial, útil para asserts en tests

    def complete(
        self,
        *,
        system: str,
        user: str,
        model: str = "mini",
        json_mode: bool = False,
    ) -> LLMResponse:
        if self._router is not None:
            text = self._router(system, user)
        elif self._responses:
            text = self._responses.pop(0) if len(self._responses) > 1 else self._responses[0]
        else:
            text = self._default

        in_tokens = estimate_tokens(system + user)
        out_tokens = estimate_tokens(text)
        cost = estimate_cost(model, in_tokens, out_tokens)

        self.calls.append({"system": system, "user": user, "model": model, "text": text})
        return LLMResponse(
            text=text,
            model=f"mock:{model}",
            input_tokens=in_tokens,
            output_tokens=out_tokens,
            cost_usd=cost,
        )
