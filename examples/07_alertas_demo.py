"""Demo SPEC-008: consumo cruzando 80% y 100% con alertas idempotentes.

Corre sin red ni claves reales.
"""
from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)) + "/backend")

from app.alerts.service import AlertService
from app.core.storage import InMemoryUsageStore
from app.core.limits import LimitsService
from app.jobs.monthly_reset import run_monthly_reset


def main():
    store = InMemoryUsageStore()
    sent = []

    def _notifier(tenant_id: str, threshold: int, message: str):
        sent.append({"tenant_id": tenant_id, "threshold": threshold})
        print(f"  📬 ALERTA a {tenant_id!r}: {threshold}% — {message}")

    alerts = AlertService(store=store, notifier=_notifier)
    limits = LimitsService(store=store)
    limits.set_plan("pyme-demo", "starter")

    print("\n=== SPEC-008 Demo: Alertas de uso ===\n")

    # Simula uso creciente
    print("[1] Uso al 50% → sin alerta")
    alerts.check_and_notify("pyme-demo", usage_ratio=0.50)

    print("[2] Uso al 82% → alerta 80%")
    alerts.check_and_notify("pyme-demo", usage_ratio=0.82)

    print("[3] Uso al 88% → idempotente, no reenvía")
    alerts.check_and_notify("pyme-demo", usage_ratio=0.88)

    print("[4] Uso al 100% → alerta 100%")
    alerts.check_and_notify("pyme-demo", usage_ratio=1.00)

    print(f"\n    Total alertas enviadas: {len(sent)}")

    print("\n[5] Reset mensual → rearma umbrales")
    run_monthly_reset(limits, alerts, ["pyme-demo"])

    print("[6] Uso al 85% después del reset → alerta 80% de nuevo")
    alerts.check_and_notify("pyme-demo", usage_ratio=0.85)

    print(f"\n    Total alertas enviadas: {len(sent)}")
    print("\n✓ Demo completado sin red ni claves reales.\n")


if __name__ == "__main__":
    main()
