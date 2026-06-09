"""Conector CRM genérico (lead scoring / pipeline). Costo ~0 (API del cliente).

En modo mock mantiene un CRM en memoria, suficiente para probar el flujo end-to-end.
"""
from __future__ import annotations

from .base import Tool, ToolResult, mask


class CRMTool(Tool):
    name = "crm"
    cost_per_call = 0.0

    def __init__(self, *, mock: bool = True, **config):
        super().__init__(mock=mock, **config)
        self._leads: dict[str, dict] = {}  # store mock por id

    def run(self, action: str, **params) -> ToolResult:
        if action == "create_lead":
            lead_id = f"lead-{len(self._leads) + 1}"
            lead = {
                "id": lead_id,
                "contact": params.get("contact", ""),
                "intent": params.get("intent"),
                "priority": params.get("priority", "media"),
                "notes": params.get("notes", ""),
            }
            self._leads[lead_id] = lead
            self.sent.append({"action": "create_lead", "id": lead_id})
            return ToolResult(ok=True, data={"id": lead_id, "contact_masked": mask(lead["contact"])})
        if action == "update_lead":
            lead_id = params.get("id", "")
            if lead_id not in self._leads:
                return ToolResult(ok=False, error=f"Lead no existe: {lead_id}")
            self._leads[lead_id].update(params.get("fields", {}))
            return ToolResult(ok=True, data={"id": lead_id})
        if action == "get_lead":
            lead_id = params.get("id", "")
            lead = self._leads.get(lead_id)
            return ToolResult(ok=bool(lead), data={"lead": lead}, error=None if lead else "no existe")
        return self._unknown(action)
