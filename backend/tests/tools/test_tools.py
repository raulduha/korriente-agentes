"""Conectores en modo mock: comportamiento determinista + enmascarado de PII."""
from app.tools.base import mask
from app.tools.registry import build_tools, default_mock_tools


def test_whatsapp_envia_y_cobra():
    tools = build_tools(["whatsapp"])
    r = tools["whatsapp"].run("send_message", to="+56998761234", body="Hola")
    assert r.ok
    assert r.cost_usd == 0.05
    assert "****" in r.data["to_masked"]  # PII enmascarada


def test_whatsapp_falla_sin_destinatario():
    tools = build_tools(["whatsapp"])
    r = tools["whatsapp"].run("send_message", to="", body="Hola")
    assert not r.ok


def test_crm_crea_y_lee_lead():
    tools = build_tools(["crm"])
    created = tools["crm"].run("create_lead", contact="+56911112222", intent="cotizacion")
    assert created.ok
    got = tools["crm"].run("get_lead", id=created.data["id"])
    assert got.ok and got.data["lead"]["intent"] == "cotizacion"


def test_sheets_append_y_query():
    tools = build_tools(["sheets"])
    tools["sheets"].run("append_row", table="leads", row={"x": 1})
    q = tools["sheets"].run("query", table="leads")
    assert len(q.data["rows"]) == 1


def test_mask_email_y_telefono():
    assert mask("juan@dominio.cl").endswith("@dominio.cl")
    assert "@" in mask("juan@dominio.cl")
    assert mask("+56998761234").endswith("1234")


def test_default_mock_tools_tiene_todos():
    tools = default_mock_tools()
    assert {"whatsapp", "email", "crm", "sheets", "http"} <= set(tools)
