"""Deduplicación de message_id para el webhook de WhatsApp (SPEC-005)."""
from __future__ import annotations

import sqlite3
import threading
import time

TTL_SECONDS = 48 * 3600  # 48 horas


class SeenMessages:
    def __init__(self, path: str = ":memory:") -> None:
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.execute(
            """CREATE TABLE IF NOT EXISTS seen (
                message_id TEXT PRIMARY KEY,
                ts REAL NOT NULL
            )"""
        )
        self._conn.commit()

    def seen(self, message_id: str) -> bool:
        self._cleanup()
        with self._lock:
            row = self._conn.execute(
                "SELECT 1 FROM seen WHERE message_id = ?", (message_id,)
            ).fetchone()
        return row is not None

    def mark(self, message_id: str) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR IGNORE INTO seen (message_id, ts) VALUES (?, ?)",
                (message_id, time.time()),
            )
            self._conn.commit()

    def _cleanup(self) -> None:
        cutoff = time.time() - TTL_SECONDS
        with self._lock:
            self._conn.execute("DELETE FROM seen WHERE ts < ?", (cutoff,))
            self._conn.commit()
