"""Webhooks de canales (entrada de mensajes) -> corre el agente correspondiente."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..agents import build_agent
from ..core.limits import LimitsService
from ..llm.base import LLMProvider
from ..runtime.memory import Memory
from ..runtime.types import Message
from .deps import get_limits, get_llm, get_memory

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


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
