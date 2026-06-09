"""Helpers compartidos por los ejemplos. Hace importable el paquete `app`."""
from __future__ import annotations

import json
import os
import sys

# Permite correr los ejemplos sin instalar el paquete: agrega backend/ al path.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))


def jdump(**kwargs) -> str:
    return json.dumps(kwargs, ensure_ascii=False)


def line():
    print("-" * 72)
