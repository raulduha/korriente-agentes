# Ejemplos pre-hechos y probados

Todos corren con el **MockLLMProvider** y conectores en modo mock: **no gastan dinero
ni necesitan claves**. Sirven como guía viva de cómo usar la fábrica.

```bash
cd backend && pip install -e ".[dev]"     # una vez
python ../examples/01_lead_classifier_demo.py
python ../examples/02_cobranza_demo.py
python ../examples/03_limits_demo.py
```

- `01_lead_classifier_demo.py` — clasifica varios mensajes de WhatsApp y muestra qué
  responde, qué deriva a humano y cuánto costó cada corrida.
- `02_cobranza_demo.py` — procesa una lista de facturas y muestra cuáles se recuerdan
  solas y cuáles escalan (monto alto, disputa, intentos agotados).
- `03_limits_demo.py` — demuestra el budget cap y el límite de conversaciones: cómo el
  sistema protege a la PyME de gastar de más.

Para usar un proveedor real, exporta `KORRIENTE_LLM_PROVIDER=openai` (o `anthropic`) y
la API key correspondiente, e instala el extra (`pip install -e ".[openai]"`).
