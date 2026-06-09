"""Demo: clasificador y respondedor de leads WhatsApp (con LLM simulado).

Corre: python examples/01_lead_classifier_demo.py
"""
from _common import jdump, line

from app.agents import build_agent
from app.core.limits import LimitsService
from app.llm.providers.mock import MockLLMProvider
from app.runtime.types import Message


def router(system: str, user: str) -> str:
    u = user.lower()
    if "cuánto" in u or "precio" in u or "plan" in u:
        return jdump(intent="cotizacion", confidence=0.9,
                     reply="¡Hola! Tenemos planes a tu medida. ¿Me das tu nombre y empresa?")
    if "hora" in u or "abren" in u:
        return jdump(intent="consulta", confidence=0.95,
                     reply="Atendemos de lunes a viernes de 9 a 18 h.")
    if "pésimo" in u or "esperando" in u:
        return jdump(intent="reclamo", confidence=0.92, reply="")
    if "http" in u or "gana plata" in u:
        return jdump(intent="spam", confidence=0.98, reply="")
    return jdump(intent="consulta", confidence=0.4, reply="")


def main() -> None:
    limits = LimitsService()
    limits.set_plan("demo-pyme", "starter")
    agent = build_agent("lead-classifier-whatsapp",
                        llm=MockLLMProvider(router=router), limits=limits)

    mensajes = [
        "Hola, cuánto cuesta el plan mensual?",
        "A qué hora abren los sábados?",
        "Llevo 3 días esperando y nadie responde, pésimo servicio",
        "Gana plata fácil click aquí http://bit.ly/x",
        "hola q tal",  # baja confianza -> humano
    ]

    for texto in mensajes:
        trace = agent.handle(Message(text=texto, channel="whatsapp",
                                     sender="+56998761234", tenant_id="demo-pyme"))
        line()
        print(f"Cliente : {texto}")
        print(f"Intent  : {trace.data.get('intent')} (conf {trace.data.get('confidence')})")
        print(f"Humano? : {'SÍ -> ' + next((s['reason'] for s in trace.steps if s['kind']=='escalate'), '') if trace.escalated_to_human else 'no'}")
        print(f"Respuesta: {trace.output or '(no se responde)'}")
        print(f"Costo    : US$ {trace.cost_usd:.5f}")

    line()
    print("Uso del mes:", limits.snapshot("demo-pyme"))


if __name__ == "__main__":
    main()
