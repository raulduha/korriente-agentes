"""Parsea el payload de 360dialog / Cloud API a un dict normalizado (SPEC-005)."""
from __future__ import annotations


def parse_payload(raw: dict) -> dict:
    """Devuelve un dict con type='message'|'status'|'unknown'."""
    try:
        value = raw["entry"][0]["changes"][0]["value"]
    except (KeyError, IndexError, TypeError):
        return {"type": "unknown"}

    phone_number_id = value.get("metadata", {}).get("phone_number_id", "")

    if "statuses" in value:
        s = value["statuses"][0]
        return {
            "type": "status",
            "message_id": s.get("id"),
            "status": s.get("status"),
            "phone_number_id": phone_number_id,
        }

    if "messages" in value:
        m = value["messages"][0]
        msg_type = m.get("type", "unknown")
        text = m.get("text", {}).get("body") if msg_type == "text" else None
        return {
            "type": "message",
            "message_id": m.get("id"),
            "from_number": m.get("from"),
            "phone_number_id": phone_number_id,
            "msg_type": msg_type,
            "text": text,
            "timestamp": m.get("timestamp"),
        }

    return {"type": "unknown"}
