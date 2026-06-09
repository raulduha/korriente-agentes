"""Fixtures y helpers para las pruebas simuladas (mock LLM + mock conectores)."""
from __future__ import annotations

import json

import pytest

from app.core.limits import LimitsService
from app.llm.providers.mock import MockLLMProvider


@pytest.fixture
def limits():
    """Servicio de límites con un tenant 'pyme-1' en plan starter."""
    svc = LimitsService()
    svc.set_plan("pyme-1", "starter")
    return svc


def make_mock_llm(router=None, responses=None, default="{}"):
    """Atajo para crear un MockLLMProvider en los tests."""
    return MockLLMProvider(router=router, responses=responses, default=default)


def j(**kwargs) -> str:
    """Serializa un dict a JSON (lo que devolvería el LLM)."""
    return json.dumps(kwargs, ensure_ascii=False)
