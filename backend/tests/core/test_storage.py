"""SPEC-003: persistencia. SQLite conserva plan, uso y trazas entre instancias."""
from app.core.limits import LimitsService
from app.core.storage import InMemoryUsageStore, SQLiteUsageStore
from app.runtime.memory import Memory


def test_sqlite_persiste_uso_entre_instancias(tmp_path):
    db = str(tmp_path / "k.sqlite3")
    s1 = LimitsService(store=SQLiteUsageStore(db))
    s1.set_plan("t1", "starter")
    s1.record("t1", conversations=10, llm_actions=5, cost_usd=1.5)

    s2 = LimitsService(store=SQLiteUsageStore(db))  # nueva instancia, misma DB
    u = s2.get_usage("t1")
    assert u.plan_key == "starter"
    assert u.conversations == 10
    assert u.llm_actions == 5
    assert round(u.cost_usd, 2) == 1.5


def test_sqlite_snapshot_refleja_lo_guardado(tmp_path):
    db = str(tmp_path / "k.sqlite3")
    s = LimitsService(store=SQLiteUsageStore(db))
    s.set_plan("t1", "starter")
    s.record("t1", conversations=400)
    assert s.snapshot("t1")["conversations"]["pct"] == 50.0


def test_sqlite_check_bloquea_tras_reabrir(tmp_path):
    db = str(tmp_path / "k.sqlite3")
    s1 = LimitsService(store=SQLiteUsageStore(db))
    s1.set_plan("t1", "starter")
    s1.record("t1", conversations=800)  # tope starter
    s2 = LimitsService(store=SQLiteUsageStore(db))
    assert s2.check("t1", conversations=1).allowed is False


def test_sqlite_reset_month_persiste(tmp_path):
    db = str(tmp_path / "k.sqlite3")
    s = LimitsService(store=SQLiteUsageStore(db))
    s.set_plan("t1", "starter")
    s.record("t1", conversations=500, cost_usd=10)
    s.reset_month("t1")
    s2 = LimitsService(store=SQLiteUsageStore(db))
    u = s2.get_usage("t1")
    assert u.conversations == 0 and u.cost_usd == 0.0


def test_sqlite_traces_persisten(tmp_path):
    db = str(tmp_path / "k.sqlite3")
    m1 = Memory(store=SQLiteUsageStore(db))
    m1.save_trace("t1", {"agent_key": "lead", "cost_usd": 0.05})
    m1.save_trace("t1", {"agent_key": "cobranza", "cost_usd": 0.0})
    m2 = Memory(store=SQLiteUsageStore(db))
    tr = m2.traces("t1")
    assert len(tr) == 2
    assert tr[0]["agent_key"] == "lead"


def test_inmemory_default_no_rompe():
    s = LimitsService(store=InMemoryUsageStore())
    s.set_plan("t1", "growth")
    s.record("t1", conversations=3)
    assert s.get_usage("t1").conversations == 3
