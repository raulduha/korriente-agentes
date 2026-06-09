"""SPEC-001: los 5 casos de la tabla de comportamiento esperado."""
import pytest

from app.agents import build_agent
from app.runtime.types import Message
from tests.conftest import j, make_mock_llm


def lead_router(system: str, user: str) -> str:
    u = user.lower()
    if "contrato" in u:  # sensible aunque sea consulta clara
        return j(intent="cotizacion", confidence=0.92, reply="Con gusto te ayudo con eso.")
    if "cuánto" in u or "precio" in u or "plan" in u or "cuanto" in u:
        return j(intent="cotizacion", confidence=0.9,
                 reply="¡Hola! Tenemos planes a tu medida. ¿Me das tu nombre y empresa?")
    if "hora" in u or "abren" in u or "ubicad" in u:
        return j(intent="consulta", confidence=0.95,
                 reply="Atendemos de lunes a viernes de 9 a 18 h.")
    if "pésimo" in u or "esperando" in u or "reclamo" in u or "malo" in u:
        return j(intent="reclamo", confidence=0.9, reply="")
    if "gana plata" in u or "http" in u or "click aquí" in u:
        return j(intent="spam", confidence=0.98, reply="")
    return j(intent="consulta", confidence=0.3, reply="")  # baja confianza


def make_agent(limits):
    return build_agent("lead-classifier-whatsapp", llm=make_mock_llm(router=lead_router),
                       limits=limits)


def msg(text):
    return Message(text=text, channel="whatsapp", sender="+56998761234", tenant_id="pyme-1")


def test_caso1_cotizacion_responde_y_crea_lead_alta(limits):
    agent = make_agent(limits)
    trace = agent.handle(msg("Hola, cuánto cuesta el plan?"))
    assert trace.data["intent"] == "cotizacion"
    assert not trace.escalated_to_human
    assert "whatsapp" in trace.tools_used and "crm" in trace.tools_used
    # lead con prioridad alta
    leads = list(agent.tools["crm"]._leads.values())
    assert leads and leads[0]["priority"] == "alta"


def test_caso2_consulta_responde_automatico(limits):
    agent = make_agent(limits)
    trace = agent.handle(msg("A qué hora abren?"))
    assert trace.data["intent"] == "consulta"
    assert not trace.escalated_to_human
    assert "9 a 18" in (trace.output or "")


def test_caso3_reclamo_escala_a_humano(limits):
    agent = make_agent(limits)
    trace = agent.handle(msg("Llevo 3 días esperando y nadie responde, pésimo servicio"))
    assert trace.data["intent"] == "reclamo"
    assert trace.escalated_to_human
    # se manda mensaje de contención por WhatsApp
    assert any(s["kind"] == "tool" and s["tool"] == "whatsapp" for s in trace.steps)


def test_caso4_spam_no_responde_ni_crea_lead(limits):
    agent = make_agent(limits)
    trace = agent.handle(msg("Gana plata fácil, click aquí http://bit.ly/x"))
    assert trace.data["intent"] == "spam"
    assert trace.output is None
    assert not trace.escalated_to_human
    assert "crm" not in trace.tools_used  # no se ensucia el CRM con spam


def test_caso5_baja_confianza_escala(limits):
    agent = make_agent(limits)
    trace = agent.handle(msg("hmmm no sé bien jeje"))
    assert trace.escalated_to_human
    assert any(s.get("reason") == "baja_confianza" for s in trace.steps)


def test_tema_sensible_escala_aunque_confianza_alta(limits):
    agent = make_agent(limits)
    trace = agent.handle(msg("Quiero revisar una cláusula de mi contrato"))
    assert trace.data["confidence"] >= 0.9
    assert trace.escalated_to_human


def test_consume_uso_y_costo(limits):
    agent = make_agent(limits)
    agent.handle(msg("cuánto cuesta?"))
    u = limits.get_usage("pyme-1")
    assert u.conversations == 1
    assert u.llm_actions == 1
    assert u.cost_usd > 0


def test_si_plan_al_tope_no_gasta_y_deriva(limits):
    limits.record("pyme-1", conversations=800)  # tope starter
    agent = make_agent(limits)
    trace = agent.handle(msg("cuánto cuesta el plan?"))
    assert trace.blocked
    assert trace.escalated_to_human
    assert trace.llm_calls == 0  # no se llamó al LLM: no se gastó
