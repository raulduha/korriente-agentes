"""Memoria por tenant (contexto persistente entre conversaciones).

Las trazas pueden persistir si se pasa un `UsageStore` (ver app/core/storage.py); si no,
quedan en memoria (Fase 1). El historial conversacional sigue en memoria por ahora.
Misma interfaz para reemplazar por PostgreSQL/Redis/Qdrant en Fase 2.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Optional

from ..core.storage import UsageStore


class Memory:
    def __init__(self, store: Optional[UsageStore] = None) -> None:
        self._store = store
        self._history: dict[str, dict[str, list[dict[str, Any]]]] = defaultdict(
            lambda: defaultdict(list)
        )
        self._traces: dict[str, list[dict]] = defaultdict(list)

    def append_turn(self, tenant_id: str, conversation_key: str, role: str, text: str) -> None:
        self._history[tenant_id][conversation_key].append({"role": role, "text": text})

    def history(self, tenant_id: str, conversation_key: str) -> list[dict[str, Any]]:
        return list(self._history[tenant_id][conversation_key])

    def save_trace(self, tenant_id: str, trace: dict) -> None:
        if self._store is not None:
            self._store.add_trace(tenant_id, trace)
        else:
            self._traces[tenant_id].append(trace)

    def traces(self, tenant_id: str) -> list[dict]:
        if self._store is not None:
            return self._store.traces(tenant_id)
        return list(self._traces[tenant_id])
