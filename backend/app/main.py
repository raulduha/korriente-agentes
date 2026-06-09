"""App FastAPI de Korriente Agentes."""
from __future__ import annotations

from fastapi import FastAPI

from .api import dashboard, webhooks

app = FastAPI(
    title="Korriente Agentes",
    description="Fábrica de agentes de IA para PyMEs chilenas.",
    version="0.1.0",
)

app.include_router(webhooks.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "service": "korriente-agentes"}
