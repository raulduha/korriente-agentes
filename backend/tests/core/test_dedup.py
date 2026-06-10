"""Tests para app/core/dedup.py — idempotencia por message_id."""
from __future__ import annotations

import pytest

from app.core.dedup import SeenMessages


@pytest.fixture
def dedup(tmp_path):
    return SeenMessages(str(tmp_path / "dedup.db"))


def test_primer_mensaje_no_visto(dedup):
    assert dedup.seen("msg-001") is False


def test_marca_y_detecta_duplicado(dedup):
    dedup.mark("msg-002")
    assert dedup.seen("msg-002") is True


def test_ids_distintos_no_interfieren(dedup):
    dedup.mark("msg-A")
    assert dedup.seen("msg-B") is False


def test_persistencia(tmp_path):
    path = str(tmp_path / "d.db")
    d1 = SeenMessages(path)
    d1.mark("msg-persist")
    d2 = SeenMessages(path)
    assert d2.seen("msg-persist") is True


def test_seen_antes_de_marcar_es_false(dedup):
    result_before = dedup.seen("msg-new")
    dedup.mark("msg-new")
    result_after = dedup.seen("msg-new")
    assert result_before is False
    assert result_after is True
