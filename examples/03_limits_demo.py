"""Demo: cómo los límites protegen a la PyME de gastar de más.

Corre: python examples/03_limits_demo.py
"""
from _common import line

from app.agents import build_agent
from app.core.limits import LimitsService
from app.llm.providers.mock import MockLLMProvider
from app.runtime.types import Message


def main() -> None:
    limits = LimitsService()
    limits.set_plan("demo-pyme", "starter")  # 800 conversaciones / mes

    agent = build_agent(
        "lead-classifier-whatsapp",
        llm=MockLLMProvider(default='{"intent":"consulta","confidence":0.9,"reply":"¡Hola!"}'),
        limits=limits,
    )

    def enviar():
        return agent.handle(Message(text="hola, consulta", channel="whatsapp",
                                    sender="+56990001111", tenant_id="demo-pyme"))

    # Simulamos que ya se usaron 639 conversaciones este mes.
    limits.record("demo-pyme", conversations=639)

    line()
    t = enviar()  # llega a 640 = 80% -> aviso
    print(f"Conversación 640: near_limit={t.near_limit}  (aviso al 80%)")

    # Saltamos al tope.
    limits.record("demo-pyme", conversations=159)  # total 799
    t = enviar()  # 800 = tope exacto, aún permitido
    print(f"Conversación 800: bloqueada={t.blocked}")

    t = enviar()  # 801 -> bloqueado, deriva a humano, NO gasta
    line()
    print(f"Conversación 801: bloqueada={t.blocked}  deriva_humano={t.escalated_to_human}  "
          f"llm_calls={t.llm_calls}")
    print("→ La PyME no recibe una factura sorpresa: al tope se deriva a humano.")
    line()
    print("Uso final:", limits.snapshot("demo-pyme"))


if __name__ == "__main__":
    main()
