"""SPEC-002: cobranza con seguridad primero (nunca envía sobre el umbral)."""
from app.agents import build_agent
from app.runtime.types import Message
from tests.conftest import j, make_mock_llm


def cobranza_router(system: str, user: str) -> str:
    return j(
        message="Hola, le recordamos cordialmente el pago de su factura. ¡Muchas gracias!",
        next_touch_days=4,
    )


def make_agent(limits):
    return build_agent("cobranza-recordatorios", llm=make_mock_llm(router=cobranza_router),
                       limits=limits)


def invoice_msg(limits=None, **invoice):
    base = {"id": "F-1", "customer": "Juan Pérez", "contact": "+56998761234",
            "amount": 150_000, "due_in_days": 3, "attempts": 0,
            "status": "pending", "channel": "whatsapp"}
    base.update(invoice)
    return Message(text="cobranza", channel="system", sender="cron",
                   tenant_id="pyme-1", meta={"invoice": base})


def test_caso1_prevencimiento_envia(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(due_in_days=3, amount=150_000))
    assert trace.data["action"] == "recordatorio_enviado"
    assert "whatsapp" in trace.tools_used
    assert not trace.escalated_to_human


def test_caso2_vencida_monto_bajo_envia_y_agenda(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(due_in_days=-5, amount=90_000))
    assert trace.data["action"] == "recordatorio_enviado"
    assert trace.data["next_touch_days"] == 4


def test_caso3_monto_alto_no_envia_y_escala(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(amount=3_000_000, due_in_days=-2))
    assert trace.escalated_to_human
    assert trace.data["action"] == "borrador_para_humano"
    assert trace.data["draft"]            # preparó borrador
    assert "whatsapp" not in trace.tools_used  # pero NO lo envió
    assert trace.output is None


def test_caso4_disputa_detiene_sin_llamar_llm(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(status="disputed"))
    assert trace.escalated_to_human
    assert trace.llm_calls == 0           # ni siquiera gasta en redactar


def test_caso5_max_intentos_escala(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(attempts=3))
    assert trace.escalated_to_human
    assert any(s.get("reason") == "max_intentos" for s in trace.steps)


def test_factura_pagada_se_omite(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(status="paid"))
    assert trace.output is None
    assert not trace.escalated_to_human
    assert trace.llm_calls == 0


def test_canal_email_usa_email(limits):
    agent = make_agent(limits)
    trace = agent.handle(invoice_msg(channel="email", contact="juan@empresa.cl"))
    assert "email" in trace.tools_used
    assert "whatsapp" not in trace.tools_used


def test_umbral_configurable_por_cliente(limits):
    agent = make_agent(limits)
    m = invoice_msg(amount=500_000)
    m.meta["amount_threshold"] = 300_000   # umbral más bajo para este cliente
    trace = agent.handle(m)
    assert trace.escalated_to_human         # 500k > 300k → humano
