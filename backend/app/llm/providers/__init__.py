"""Factory de proveedores de LLM."""
from __future__ import annotations

from ..base import LLMProvider
from .mock import MockLLMProvider


def get_provider(name: str = "mock", **kwargs) -> LLMProvider:
    """Devuelve un proveedor por nombre.

    - "mock": no gasta dinero, respuestas deterministas (tests/demos).
    - "openai" / "anthropic": requieren el extra y la API key correspondiente.
    """
    name = (name or "mock").lower()
    if name == "mock":
        return MockLLMProvider(**kwargs)
    if name == "openai":
        from .openai_provider import OpenAIProvider  # import perezoso (dep opcional)

        return OpenAIProvider(**kwargs)
    if name == "anthropic":
        from .anthropic_provider import AnthropicProvider  # import perezoso

        return AnthropicProvider(**kwargs)
    raise ValueError(f"Proveedor de LLM desconocido: {name!r}")


__all__ = ["get_provider", "MockLLMProvider"]
