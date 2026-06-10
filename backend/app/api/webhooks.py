"""Webhooks de canales entrantes (SPEC-005 + SPEC-006)."""
from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from ..agents import build_agent
from ..api.whatsapp_parser import parse_payload
from ..core.config import settings
from ..core.dedup import SeenMessages
from ..core.limits import LimitsService
from ..core.security import verify_signature
from ..core.tenant_registry import TenantRegistry
from ..llm.base import LLMProvider
from ..runtime.memory import Memory
from ..runtime.types import Message
from .deps import get_limits, get_llm, get_memory

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Singletons de Fase 1 (path de DB viene de config)
_registry: TenantRegistry | None = None
_dedup: SeenMessages | None = None


def _get_registry() -> TenantRegistry:
    global _registry
    if _registry is None:
        _registry = TenantRegistry(settings.wa_registry_db)
    return _registry


def _get_dedup() -> SeenMessages:
    global _dedup
    if _dedup is None:
        _dedup = SeenMessages(settings.dedup_db)
    return _dedup


# ── Webhook WhatsApp (SPEC-005) ──────────────────────────────────────────────

@router.get("/whatsapp")
def wa_challenge(
    request: Request,
) -> Response:
    """Caso 1/2: verificación de challenge de Meta."""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge", "")
    if mode == "subscribe" and token == settings.wa_verify_token:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="verify_token inválido")


@router.post("/whatsapp")
async def wa_inbound(
    request: Request,
    background_tasks: BackgroundTasks,
    llm: LLMProvider = Depends(get_llm),
    limits: LimitsService = Depends(get_limits),
    memory: Memory = Depends(get_memory),
) -> dict:
    """Casos 3–9: recibe mensajes reales de WhatsApp."""
    raw_body = await request.body()

    # Caso 4/4b — firma HMAC
    sig = request.headers.get("X-Hub-Signature-256", "")
    if not verify_signature(raw_body, sig, settings.wa_app_secret):
        logger.warning("wa_inbound: firma inválida rechazada")
        raise HTTPException(status_code=403, detail="Firma inválida")

    # Parseo
    try:
        import json
        payload = json.loads(raw_body)
    except Exception:
        return {"status": "ok", "detail": "payload ignorado (no es JSON)"}

    parsed = parse_payload(payload)

    # Caso 9 — malformado o desconocido: ack y ya
    if parsed["type"] == "unknown":
        return {"status": "ok", "detail": "payload ignorado"}

    # Caso 8 — callback de estado: registrar y salir
    if parsed["type"] == "status":
        logger.info("wa_status: %s %s", parsed.get("message_id"), parsed.get("status"))
        return {"status": "ok", "detail": "status registrado"}

    # Caso 5 — phone_number_id no registrado
    phone_id = parsed.get("phone_number_id", "")
    tenant_info = _get_registry().resolve(phone_id)
    if tenant_info is None:
        logger.warning("wa_inbound: phone_number_id no registrado: %s", phone_id)
        return {"status": "ok", "detail": "tenant no registrado"}

    # Caso 6 — dedup
    msg_id = parsed.get("message_id", "")
    dedup = _get_dedup()
    if dedup.seen(msg_id):
        logger.info("wa_inbound: mensaje duplicado ignorado: %s", msg_id)
        return {"status": "ok", "detail": "duplicado"}
    dedup.mark(msg_id)

    # Caso 7 — no-texto: respuesta de cortesía + escala (en background)
    if parsed.get("msg_type") != "text":
        background_tasks.add_task(
            _handle_non_text,
            tenant_info=tenant_info,
            sender=parsed.get("from_number", ""),
            llm=llm, limits=limits, memory=memory,
        )
        return {"status": "ok", "detail": "non-text escalado"}

    # Caso 3 — mensaje de texto normal: 200 inmediato, procesa en background
    background_tasks.add_task(
        _run_agent,
        text=parsed["text"],
        sender=parsed.get("from_number", ""),
        tenant_info=tenant_info,
        llm=llm, limits=limits, memory=memory,
    )
    return {"status": "ok"}


def _run_agent(
    *, text: str, sender: str, tenant_info: dict,
    llm: LLMProvider, limits: LimitsService, memory: Memory,
) -> None:
    try:
        agent = build_agent(
            tenant_info["agent_key"],
            llm=llm, limits=limits, memory=memory,
        )
        msg = Message(
            text=text,
            channel="whatsapp",
            sender=sender,
            tenant_id=tenant_info["tenant_id"],
        )
        agent.handle(msg)
    except Exception:
        logger.exception("wa_inbound: error en background task")


def _handle_non_text(
    *, tenant_info: dict, sender: str,
    llm: LLMProvider, limits: LimitsService, memory: Memory,
) -> None:
    try:
        agent = build_agent(
            tenant_info["agent_key"],
            llm=llm, limits=limits, memory=memory,
        )
        msg = Message(
            text="[mensaje no-texto recibido]",
            channel="whatsapp",
            sender=sender,
            tenant_id=tenant_info["tenant_id"],
            meta={"non_text": True},
        )
        agent.handle(msg)
    except Exception:
        logger.exception("wa_inbound: error manejando non-text")


# ── Webhook Flow (SPEC-006) ──────────────────────────────────────────────────

@router.post("/flow")
async def flow_payment(
    request: Request,
) -> dict:
    """Recibe confirmaciones de pago de Flow.cl."""
    from ..billing.flow import FlowClient
    from ..billing.service import BillingService, PaymentEvent
    from .deps import get_store

    raw_body = await request.body()
    sig = request.headers.get("X-Flow-Signature", "")

    flow_client = FlowClient(mock=False, webhook_secret=settings.flow_webhook_secret)
    if not flow_client.verify_signature(raw_body, sig):
        logger.warning("flow_payment: firma inválida rechazada")
        raise HTTPException(status_code=403, detail="Firma inválida")

    try:
        import json
        data = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="JSON inválido")

    svc = BillingService(store=get_store())
    event = PaymentEvent(
        payment_id=str(data.get("paymentId", "")),
        tenant_id=str(data.get("tenantId", "")),
        plan_key=str(data.get("planKey", "starter")),
        status=str(data.get("status", "")),
    )
    svc.apply_payment_event(event)
    return {"status": "ok"}


# ── Webhook interno/testing (mantiene compatibilidad) ────────────────────────

class InboundMessage(BaseModel):
    tenant_id: str
    agent_key: str
    text: str
    sender: str
    channel: str = "whatsapp"
    meta: dict = {}


@router.post("/message")
def inbound_message(
    payload: InboundMessage,
    llm: LLMProvider = Depends(get_llm),
    limits: LimitsService = Depends(get_limits),
    memory: Memory = Depends(get_memory),
) -> dict:
    """Endpoint interno para tests y demos (no es el canal real)."""
    agent = build_agent(payload.agent_key, llm=llm, limits=limits, memory=memory)
    message = Message(
        text=payload.text,
        channel=payload.channel,
        sender=payload.sender,
        tenant_id=payload.tenant_id,
        meta=payload.meta,
    )
    trace = agent.handle(message)
    return trace.as_dict()
