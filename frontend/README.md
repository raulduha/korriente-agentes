# Frontend — Korriente Agentes (Next.js)

SaaS moderno: landing con hero, "cómo funciona" paso a paso, **demo interactiva** del
clasificador de leads (funciona offline), precios con límites, FAQ y CTA. Más un
**panel** (`/dashboard`) con uso y límites por cliente, leído del backend.

```bash
npm install
npm run dev        # http://localhost:3000  (landing)  ·  /dashboard (panel)
npm test           # tests reales (Vitest) de la lógica pura
```

El panel requiere el backend FastAPI en `http://localhost:8000`
(`NEXT_PUBLIC_API_URL` para cambiarlo). La landing y su demo NO necesitan backend.

## Estructura
```
app/
  page.tsx           Landing SaaS (server component)
  dashboard/page.tsx Panel de uso/límites (client)
  layout.tsx         Nav + footer
  globals.css        Estilos (tema claro moderno, sin Tailwind para build simple)
components/
  LiveDemo.tsx       Demo interactiva del clasificador (client)
lib/
  demo.ts            Clasificador determinista que espeja al agente backend
  format.ts          Helpers de formato/estado de uso
  plans.ts           Datos de planes (fallback)
  api.ts             Cliente del backend
  *.test.ts          Tests (Vitest) — 18 casos
```

## Tests
`npm test` corre Vitest sobre `lib/*.test.ts` (lógica pura: formato y clasificador).
Ya verificados en verde. La demo de la landing usa exactamente esa lógica, así que lo
que ves en pantalla es lo que está testeado.
