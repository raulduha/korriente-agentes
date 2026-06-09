"""Demo: cobranza y recordatorios de pago (con LLM simulado).

Corre: python examples/02_cobranza_demo.py
"""
from _common import jdump, line

from app.agents import build_agent
from app.core.limits import LimitsService
from app.llm.providers.mock import MockLLMProvider
from app.runtime.types import Message


def router(system: str, user: str) -> str:
    return jdump(
        message="Estimado/a, le recordamos cordialmente el pago de su factura. "
                "Quedamos atentos. ¡Muchas gracias!",
        next_touch_days=4,
    )


def main() -> None:
    limits = LimitsService()
    limits.set_plan("demo-pyme", "growth")
    agent = build_agent("cobranza-recordatorios",
                        llm=MockLLMProvider(router=router), limits=limits)

    facturas = [
        {"id": "F-1001", "customer": "Comercial Andes", "contact": "+56998761234",
         "amount": 120_000, "due_in_days": 3, "attempts": 0, "status": "pending", "channel": "whatsapp"},
        {"id": "F-1002", "customer": "Distribuidora Sur", "contact": "pagos@sur.cl",
         "amount": 80_000, "due_in_days": -6, "attempts": 1, "status": "pending", "channel": "email"},
        {"id": "F-1003", "customer": "Constructora Maule", "contact": "+56977770000",
         "amount": 4_500_000, "due_in_days": -10, "attempts": 0, "status": "pending", "channel": "whatsapp"},
        {"id": "F-1004", "customer": "Servicios Norte", "contact": "+56966660000",
         "amount": 60_000, "due_in_days": -2, "attempts": 3, "status": "pending", "channel": "whatsapp"},
        {"id": "F-1005", "customer": "Importadora Centro", "contact": "+56955550000",
         "amount": 200_000, "due_in_days": -1, "attempts": 0, "status": "disputed", "channel": "whatsapp"},
    ]

    for inv in facturas:
        trace = agent.handle(Message(text="cobranza", channel="system", sender="cron",
                                     tenant_id="demo-pyme", meta={"invoice": inv}))
        line()
        print(f"Factura {inv['id']} — {inv['customer']} — ${inv['amount']:,} CLP")
        accion = trace.data.get("action", "—")
        if trace.escalated_to_human:
            reason = next((s["reason"] for s in trace.steps if s["kind"] == "escalate"), "")
            print(f"  -> ESCALA A HUMANO ({reason})")
        else:
            print(f"  -> {accion} por {inv['channel']}")
        print(f"  Costo: US$ {trace.cost_usd:.5f}")

    line()
    print("Uso del mes:", limits.snapshot("demo-pyme"))


if __name__ == "__main__":
    main()
