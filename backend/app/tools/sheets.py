"""Conector Sheets/Airtable (logging, reporting, base liviana). Costo ~0.

En modo mock guarda filas en memoria, agrupadas por 'table'.
"""
from __future__ import annotations

from collections import defaultdict

from .base import Tool, ToolResult


class SheetsTool(Tool):
    name = "sheets"
    cost_per_call = 0.0

    def __init__(self, *, mock: bool = True, **config):
        super().__init__(mock=mock, **config)
        self._tables: dict[str, list[dict]] = defaultdict(list)

    def run(self, action: str, **params) -> ToolResult:
        table = params.get("table", "default")
        if action == "append_row":
            row = params.get("row", {})
            self._tables[table].append(row)
            self.sent.append({"action": "append_row", "table": table})
            return ToolResult(ok=True, data={"table": table, "rows": len(self._tables[table])})
        if action == "query":
            return ToolResult(ok=True, data={"rows": list(self._tables[table])})
        if action == "update_row":
            idx = params.get("index", -1)
            rows = self._tables[table]
            if 0 <= idx < len(rows):
                rows[idx].update(params.get("fields", {}))
                return ToolResult(ok=True, data={"index": idx})
            return ToolResult(ok=False, error="Índice fuera de rango")
        return self._unknown(action)
