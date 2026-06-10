"""Tests para app/api/whatsapp_parser.py — normalización del payload de 360dialog."""
from __future__ import annotations

import pytest

from app.api.whatsapp_parser import parse_payload


# Payload de texto real de 360dialog / Cloud API
TEXT_PAYLOAD = {
    "object": "whatsapp_business_account",
    "entry": [{
        "id": "WABA_ID",
        "changes": [{
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {"display_phone_number": "+56912345678", "phone_number_id": "111222333"},
                "contacts": [{"profile": {"name": "Juan Pérez"}, "wa_id": "56987654321"}],
                "messages": [{
                    "from": "56987654321",
                    "id": "wamid.ABC123",
                    "timestamp": "1717000000",
                    "text": {"body": "Hola, quiero información"},
                    "type": "text",
                }],
            },
            "field": "messages",
        }],
    }],
}

STATUS_PAYLOAD = {
    "object": "whatsapp_business_account",
    "entry": [{
        "id": "WABA_ID",
        "changes": [{
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {"display_phone_number": "+56912345678", "phone_number_id": "111222333"},
                "statuses": [{
                    "id": "wamid.DEF456",
                    "status": "delivered",
                    "timestamp": "1717000001",
                    "recipient_id": "56987654321",
                }],
            },
            "field": "messages",
        }],
    }],
}

IMAGE_PAYLOAD = {
    "object": "whatsapp_business_account",
    "entry": [{
        "id": "WABA_ID",
        "changes": [{
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {"display_phone_number": "+56912345678", "phone_number_id": "111222333"},
                "contacts": [{"profile": {"name": "Ana"}, "wa_id": "56911111111"}],
                "messages": [{
                    "from": "56911111111",
                    "id": "wamid.IMG789",
                    "timestamp": "1717000002",
                    "image": {"mime_type": "image/jpeg", "id": "img-id"},
                    "type": "image",
                }],
            },
            "field": "messages",
        }],
    }],
}


def test_texto_normalizado():
    result = parse_payload(TEXT_PAYLOAD)
    assert result["type"] == "message"
    assert result["message_id"] == "wamid.ABC123"
    assert result["phone_number_id"] == "111222333"
    assert result["from_number"] == "56987654321"
    assert result["text"] == "Hola, quiero información"
    assert result["msg_type"] == "text"


def test_status_detectado():
    result = parse_payload(STATUS_PAYLOAD)
    assert result["type"] == "status"
    assert result["status"] == "delivered"
    assert result["message_id"] == "wamid.DEF456"
    assert result["phone_number_id"] == "111222333"


def test_imagen_detectada():
    result = parse_payload(IMAGE_PAYLOAD)
    assert result["type"] == "message"
    assert result["msg_type"] == "image"
    assert result["text"] is None


def test_payload_vacio_devuelve_unknown():
    result = parse_payload({})
    assert result["type"] == "unknown"


def test_payload_sin_messages_ni_statuses():
    payload = {
        "object": "whatsapp_business_account",
        "entry": [{"id": "X", "changes": [{"value": {"messaging_product": "whatsapp"}, "field": "messages"}]}]
    }
    result = parse_payload(payload)
    assert result["type"] == "unknown"
