"""Demo SPEC-006: ciclo de billing pago → activo → falla → moroso → suspendido.

Corre sin red ni claves reales: FlowClient en mock.
"""
from __future__ import annotations

import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)) + "/backend")

from app.billing.service import BillingService, PaymentEvent
from app.billing.flow import FlowClient
from app.core.storage import InMemoryUsageStore
from app.jobs.dunning import run_dunning


def main():
    store = InMemoryUsageStore()
    svc = BillingService(store=store, grace_days=5)

    print("\n=== SPEC-006 Demo: Billing / activación por pago ===\n")

    # 1. Provisiona tenant
    svc.provision("pyme-demo", "starter")
    t = svc.get_tenant("pyme-demo")
    print(f"[1] Provision → estado: {t.estado}")  # trial

    # 2. Pago OK → activo
    t = svc.apply_payment_event(PaymentEvent(
        payment_id="pay-001", tenant_id="pyme-demo", plan_key="starter", status="ACCEPTED"
    ))
    print(f"[2] Pago OK → estado: {t.estado}")  # activo

    # 3. Mismo payment_id (idempotencia)
    t = svc.apply_payment_event(PaymentEvent(
        payment_id="pay-001", tenant_id="pyme-demo", plan_key="starter", status="ACCEPTED"
    ))
    print(f"[3] Mismo pago (idempotente) → estado: {t.estado}")  # activo

    # 4. Pago fallido → moroso
    t = svc.apply_payment_event(PaymentEvent(
        payment_id="pay-002", tenant_id="pyme-demo", plan_key="starter", status="FAILED"
    ))
    print(f"[4] Pago FAILED → estado: {t.estado}")  # moroso

    # 5. Dunning dentro de gracia (4 días) → sigue moroso
    run_dunning(svc, now=datetime.utcnow() + timedelta(days=4))
    print(f"[5] Dunning 4 días → estado: {svc.get_tenant('pyme-demo').estado}")  # moroso

    # 6. Dunning pasada la gracia (6 días) → suspendido
    run_dunning(svc, now=datetime.utcnow() + timedelta(days=6))
    print(f"[6] Dunning 6 días → estado: {svc.get_tenant('pyme-demo').estado}")  # suspendido

    # 7. Reactivación manual
    svc.manual_override("pyme-demo", "activo", reason="cliente avisó retraso", by="raul")
    print(f"[7] Override manual → estado: {svc.get_tenant('pyme-demo').estado}")  # activo

    # 8. Verificar firma de Flow mock
    import hashlib, hmac
    secret = "demo_flow_secret"
    body = b'{"paymentId":"pay-999","status":"ACCEPTED"}'
    sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    flow = FlowClient(mock=True, webhook_secret=secret)
    print(f"[8] Firma válida: {flow.verify_signature(body, sig)}")  # True
    print(f"    Firma inválida: {flow.verify_signature(body, 'bad')}")  # False

    print("\n✓ Demo completado sin red ni claves reales.\n")


if __name__ == "__main__":
    main()
