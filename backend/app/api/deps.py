"""Dependencias compartidas de la API (singletons de Fase 1).

En Fase 1 todo vive en memoria. La interfaz no cambia al migrar a PostgreSQL.
"""
from __future__ import annotations

import os
from functools import lru_cache

from ..core.config import settings
from ..core.limits import LimitsService
from ..core.storage import InMemoryUsageStore, SQLiteUsageStore, UsageStore
from ..llm import get_provider
from ..llm.base import LLMProvider
from ..runtime.memory import Memory


@lru_cache
def get_store() -> UsageStore:
    # Si KORRIENTE_DB está seteado, persiste en SQLite; si no, memoria (dev/tests).
    db = os.getenv("KORRIENTE_DB")
    return SQLiteUsageStore(db) if db else InMemoryUsageStore()


@lru_cache
def get_limits() -> LimitsService:
    return LimitsService(store=get_store())


@lru_cache
def get_memory() -> Memory:
    return Memory(store=get_store())


@lru_cache
def get_llm() -> LLMProvider:
    # En dev/tests usa "mock". En prod, KORRIENTE_LLM_PROVIDER=openai|anthropic.
    return get_provider(settings.llm_provider)
