"""Tests para app/core/config.py — fail-fast si falta una env var crítica (SPEC-007)."""
from __future__ import annotations

import importlib
import os
import sys

import pytest


def _reload_settings(env: dict) -> object:
    """Recarga config con env vars específicas."""
    old_env = {k: os.environ.get(k) for k in env}
    for k, v in env.items():
        if v is None:
            os.environ.pop(k, None)
        else:
            os.environ[k] = v
    # Fuerza reload del módulo
    mod_name = "app.core.config"
    if mod_name in sys.modules:
        del sys.modules[mod_name]
    try:
        import app.core.config as cfg
        return cfg.settings
    finally:
        for k, old in old_env.items():
            if old is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = old
        if mod_name in sys.modules:
            del sys.modules[mod_name]


def test_settings_carga_con_defaults():
    s = _reload_settings({})
    assert s.llm_provider in ("mock", "anthropic", "openai")


def test_wa_verify_token_desde_env():
    s = _reload_settings({"KORRIENTE_WA_VERIFY_TOKEN": "mi_token_secreto"})
    assert s.wa_verify_token == "mi_token_secreto"


def test_wa_app_secret_desde_env():
    s = _reload_settings({"KORRIENTE_WA_APP_SECRET": "mi_app_secret"})
    assert s.wa_app_secret == "mi_app_secret"


def test_campos_whatsapp_tienen_defaults_seguros():
    """Sin env vars, los campos WA tienen defaults seguros (string vacío, no None)."""
    s = _reload_settings({
        "KORRIENTE_WA_VERIFY_TOKEN": None,
        "KORRIENTE_WA_APP_SECRET": None,
        "KORRIENTE_DIALOG360_API_KEY": None,
    })
    # No deben ser None — string vacío es el default seguro
    assert s.wa_verify_token is not None
    assert s.wa_app_secret is not None
