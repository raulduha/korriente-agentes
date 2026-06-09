"""Utilidades del runtime."""
from app.runtime.types import parse_json


def test_parse_json_directo():
    assert parse_json('{"a": 1}') == {"a": 1}


def test_parse_json_con_fences_y_ruido():
    text = 'Claro, aquí tienes:\n```json\n{"intent": "spam", "confidence": 0.9}\n```'
    out = parse_json(text)
    assert out["intent"] == "spam"


def test_parse_json_invalido_devuelve_vacio():
    assert parse_json("no hay json aquí") == {}
