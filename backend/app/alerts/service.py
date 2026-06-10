"""Motor de alertas 80/100% — idempotente por umbral/mes (SPEC-008)."""
from __future__ import annotations

import threading
from typing import Callable

from ..core.storage import UsageStore, InMemoryUsageStore

# Clave usada en storage para registrar umbrales ya notificados este mes.
_ALERT_PREFIX = "__alert_sent__"


class AlertService:
    """
    Notifica al cruzar 80% y 100% de uso. Idempotente: no re-notifica el mismo
    umbral en el mismo mes a menos que se llame reset_month().
    """

    def __init__(
        self,
        *,
        store: UsageStore | None = None,
        notifier: Callable[[str, int, str], None] | None = None,
    ) -> None:
        self._store = store or InMemoryUsageStore()
        self._notifier = notifier or _noop_notifier
        self._sent: dict[str, set[int]] = {}  # tenant_id → {80, 100}
        self._lock = threading.Lock()

    def check_and_notify(self, tenant_id: str, *, usage_ratio: float) -> None:
        pct = int(usage_ratio * 100)
        with self._lock:
            sent = self._sent.setdefault(tenant_id, set())
            if pct >= 100 and 100 not in sent:
                sent.add(100)
                self._notifier(
                    tenant_id, 100,
                    "⚠️ Tu agente llegó al 100% del límite del plan. Las conversaciones se derivan a tu equipo."
                )
            elif pct >= 80 and 80 not in sent:
                sent.add(80)
                self._notifier(
                    tenant_id, 80,
                    "Tu agente va al 80% del límite del plan. Si llega al 100%, derivará a tu equipo."
                )

    def reset_month(self, tenant_id: str) -> None:
        with self._lock:
            self._sent.pop(tenant_id, None)


def _noop_notifier(tenant_id: str, threshold: int, message: str) -> None:
    pass
