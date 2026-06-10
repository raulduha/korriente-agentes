"""Registro phone_number_id → tenant (SPEC-005) y token → tenant (SPEC-008)."""
from __future__ import annotations

import sqlite3
import threading


class TenantRegistry:
    def __init__(self, path: str = ":memory:") -> None:
        self.path = path
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS phone_routing (
                phone_number_id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                agent_key TEXT NOT NULL,
                plan TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS tenant_tokens (
                token TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL
            );
        """)
        self._conn.commit()

    def register(self, phone_number_id: str, tenant_id: str, agent_key: str, plan: str) -> None:
        with self._lock:
            self._conn.execute(
                """INSERT INTO phone_routing (phone_number_id, tenant_id, agent_key, plan)
                   VALUES (?, ?, ?, ?)
                   ON CONFLICT(phone_number_id) DO UPDATE SET
                     tenant_id=excluded.tenant_id,
                     agent_key=excluded.agent_key,
                     plan=excluded.plan""",
                (phone_number_id, tenant_id, agent_key, plan),
            )
            self._conn.commit()

    def resolve(self, phone_number_id: str) -> dict | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT tenant_id, agent_key, plan FROM phone_routing WHERE phone_number_id = ?",
                (phone_number_id,),
            ).fetchone()
        if row is None:
            return None
        return {"tenant_id": row["tenant_id"], "agent_key": row["agent_key"], "plan": row["plan"]}

    def register_token(self, tenant_id: str, token: str) -> None:
        with self._lock:
            self._conn.execute(
                """INSERT INTO tenant_tokens (token, tenant_id) VALUES (?, ?)
                   ON CONFLICT(token) DO UPDATE SET tenant_id=excluded.tenant_id""",
                (token, tenant_id),
            )
            self._conn.commit()

    def resolve_token(self, token: str) -> str | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT tenant_id FROM tenant_tokens WHERE token = ?", (token,)
            ).fetchone()
        return row["tenant_id"] if row else None
