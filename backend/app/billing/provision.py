"""CLI de provisioning de tenants.

Uso:
    python -m app.billing.provision --tenant-id pyme-1 --plan starter
"""
from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))


def main():
    parser = argparse.ArgumentParser(description="Provisiona un tenant en Korriente.")
    parser.add_argument("--tenant-id", required=True, help="ID único del tenant (ej: pyme-cliente-1)")
    parser.add_argument("--plan", required=True, choices=["starter", "growth", "pro", "enterprise"])
    args = parser.parse_args()

    db = os.getenv("KORRIENTE_DB", ":memory:")
    from app.billing.service import BillingService
    from app.core.storage import SQLiteUsageStore, InMemoryUsageStore

    store = SQLiteUsageStore(db) if db != ":memory:" else InMemoryUsageStore()
    svc = BillingService(store=store)
    t = svc.provision(args.tenant_id, args.plan)
    print(f"Tenant provisionado: {t.tenant_id!r} | plan={t.plan_key} | estado={t.estado}")


if __name__ == "__main__":
    main()
