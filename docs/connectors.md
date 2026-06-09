# Catálogo de conectores (Tools)

Cada conector hereda de `app/tools/base.py:Tool`, tiene un **modo mock** (para tests y
demos sin claves), declara su `cost_per_call` (USD) y enmascara PII en logs.

| Conector        | `name`        | Acciones principales                       | Costo aprox.        | Casos de éxito donde aplica |
|-----------------|---------------|--------------------------------------------|---------------------|-----------------------------|
| WhatsApp        | `whatsapp`    | `send_message`, `send_template`            | US$0,03–0,10 / conv | Leads, atención al cliente, cobranza |
| Email (SMTP/IMAP)| `email`      | `send`, `fetch`                            | ~US$0               | Outreach, recordatorios, notas |
| CRM             | `crm`         | `create_lead`, `update_lead`, `get_lead`   | ~US$0 (API cliente) | Lead scoring, pipeline |
| Sheets/Airtable | `sheets`      | `append_row`, `update_row`, `query`        | ~US$0               | Logging, reporting, base de datos liviana |
| HTTP genérico   | `http`        | `request`                                  | ~US$0               | Cualquier API REST del cliente |
| (Fase 2) Vector | `vectordb`    | `upsert`, `search`                         | self-host           | RAG sobre documentos del cliente |

## Contrato de un Tool

```python
class Tool(ABC):
    name: str
    cost_per_call: float = 0.0     # USD; el runtime lo suma al uso

    @abstractmethod
    def run(self, action: str, **params) -> ToolResult: ...
```

`ToolResult` = `{ ok: bool, data: dict, cost_usd: float, error: str | None }`.

## Modo mock
Cada conector acepta `mock=True`. En ese modo:
- No hace llamadas de red.
- Devuelve respuestas deterministas y realistas (definidas en el propio conector).
- Suma `cost_per_call` igual, para que las pruebas de límites sean realistas.

Esto permite que `examples/` y `tests/` corran **sin claves y sin gastar dinero**.

## Conectores por caso de éxito (Playbook)

- **Atención al cliente / leads** (TechFlow, Klarna): `whatsapp` + `crm` + `sheets`.
- **Documentación / operaciones** (notas clínicas, actas): `http` (sistema del cliente)
  + `sheets` + `email`.
- **Supply chain** (General Mills): `http` (TMS/ERP) + `sheets` + HITL para excepciones.
- **Cobranza**: `whatsapp` + `email` + `sheets`/`crm` + HITL para montos altos.

## Cómo agregar un conector nuevo
1. Crea la spec del feature en `specs/` si introduce capacidades nuevas.
2. Crea `app/tools/<nombre>.py` heredando de `Tool`, con modo mock.
3. Escribe pruebas en `tests/tools/test_<nombre>.py` (usa el modo mock).
4. Regístralo en `app/tools/registry.py`.
5. Documenta acciones y costo aquí.
