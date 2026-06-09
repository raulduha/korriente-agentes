"""Capa de persistencia intercambiable (SPEC-003).

`UsageStore` define la interfaz; `InMemoryUsageStore` es el default (Fase 1, idéntico al
comportamiento previo) y `SQLiteUsageStore` persiste en un archivo local. La misma
interfaz se reemplazará por PostgreSQL en Fase 2 sin tocar agentes ni límites.
"""
from __future__ import annotations

import json
import sqlite3
import threading
from abc import ABC, abstractmethod
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class Usage:
    tenant_id: str
    plan_key: str
    conversations: int = 0
    llm_actions: int = 0
    cost_usd: float = 0.0


class UsageStore(ABC):
    """Persiste uso por tenant y trazas de corridas."""

    @abstractmethod
    def get(self, tenant_id: str) -> Usage | None: ...

    @abstractmethod
    def put(self, usage: Usage) -> None: ...

    @abstractmethod
    def all_tenants(self) -> list[str]: ...

    @abstractmethod
    def add_trace(self, tenant_id: str, trace: dict) -> None: ...

    @abstractmethod
    def traces(self, tenant_id: str) -> list[dict]: ...


class InMemoryUsageStore(UsageStore):
    def __init__(self) -> None:
        self._usage: dict[str, Usage] = {}
        self._traces: dict[str, list[dict]] = defaultdict(list)

    def get(self, tenant_id: str) -> Usage | None:
        return self._usage.get(tenant_id)

    def put(self, usage: Usage) -> None:
        self._usage[usage.tenant_id] = usage

    def all_tenants(self) -> list[str]:
        return list(self._usage)

    def add_trace(self, tenant_id: str, trace: dict) -> None:
        self._traces[tenant_id].append(trace)

    def traces(self, tenant_id: str) -> list[dict]:
        return list(self._traces[tenant_id])


class SQLiteUsageStore(UsageStore):
    def __init__(self, path: str) -> None:
        self.path = path
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute(
            """CREATE TABLE IF NOT EXISTS usage (
                tenant_id TEXT PRIMARY KEY,
                plan_key TEXT NOT NULL,
                conversations INTEGER NOT NULL DEFAULT 0,
                llm_actions INTEGER NOT NULL DEFAULT 0,
                cost_usd REAL NOT NULL DEFAULT 0
            )"""
        )
        self._conn.execute(
            """CREATE TABLE IF NOT EXISTS traces (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT NOT NULL,
                payload TEXT NOT NULL
            )"""
        )
        self._conn.commit()

    def get(self, tenant_id: str) -> Usage | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT tenant_id, plan_key, conversations, llm_actions, cost_usd "
                "FROM usage WHERE tenant_id = ?",
                (tenant_id,),
            ).fetchone()
        if row is None:
            return None
        return Usage(
            tenant_id=row["tenant_id"],
            plan_key=row["plan_key"],
            conversations=row["conversations"],
            llm_actions=row["llm_actions"],
            cost_usd=row["cost_usd"],
        )

    def put(self, usage: Usage) -> None:
        with self._lock:
            self._conn.execute(
                """INSERT INTO usage (tenant_id, plan_key, conversations, llm_actions, cost_usd)
                   VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT(tenant_id) DO UPDATE SET
                     plan_key=excluded.plan_key,
                     conversations=excluded.conversations,
                     llm_actions=excluded.llm_actions,
                     cost_usd=excluded.cost_usd""",
                (usage.tenant_id, usage.plan_key, usage.conversations,
                 usage.llm_actions, usage.cost_usd),
            )
            self._conn.commit()

    def all_tenants(self) -> list[str]:
        with self._lock:
            rows = self._conn.execute("SELECT tenant_id FROM usage").fetchall()
        return [r["tenant_id"] for r in rows]

    def add_trace(self, tenant_id: str, trace: dict) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT INTO traces (tenant_id, payload) VALUES (?, ?)",
                (tenant_id, json.dumps(trace, ensure_ascii=False)),
            )
            self._conn.commit()

    def traces(self, tenant_id: str) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT payload FROM traces WHERE tenant_id = ? ORDER BY id",
                (tenant_id,),
            ).fetchall()
        return [json.loads(r["payload"]) for r in rows]
