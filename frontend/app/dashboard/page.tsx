"use client";

import { useEffect, useState } from "react";
import { getPlans, getUsage, type Plan, type Usage } from "@/lib/api";
import { clp, barColor, usageLabel } from "@/lib/format";

function Bar({ label, used, limit, pct }: { label: string; used: number; limit: number; pct: number | null }) {
  const p = pct ?? 0;
  const state = barColor(pct);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
        <span style={{ color: "var(--muted)" }}>{label}</span>
        <span style={{ fontWeight: 600 }}>
          {used.toLocaleString("es-CL")} / {limit === -1 ? "∞" : limit.toLocaleString("es-CL")}
          {pct !== null && ` · ${pct}%`}
        </span>
      </div>
      <div className={`bar ${state === "ok" ? "" : state}`}>
        <span style={{ width: `${Math.min(100, p)}%` }} />
      </div>
      <div style={{ fontSize: 12, color: state === "danger" ? "var(--danger)" : state === "warn" ? "var(--warn)" : "var(--muted)" }}>
        {usageLabel(pct)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [usage, setUsage] = useState<Usage | null>(null);
  const [tenant, setTenant] = useState("demo-pyme");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => setErr("Backend no disponible. Levanta FastAPI en :8000 (uvicorn app.main:app --reload)."));
  }, []);

  const loadUsage = () =>
    getUsage(tenant)
      .then((u) => { setUsage(u); setErr(null); })
      .catch(() => { setUsage(null); setErr(`Sin uso para "${tenant}". Corre los ejemplos o envía un mensaje al webhook.`); });

  return (
    <section>
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <div className="kicker">Panel</div>
          <h2 style={{ margin: "6px 0 0" }}>Uso y límites por cliente</h2>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Cada cliente (tenant) tiene su plan, su consumo y su tope de gasto.
          </p>
        </div>

        {err && <div className="card" style={{ marginBottom: 16, color: "var(--warn)" }}>{err}</div>}

        <div className="dash-grid">
          <div className="card">
            <div className="field" style={{ marginBottom: 16 }}>
              <input value={tenant} onChange={(e) => setTenant(e.target.value)} placeholder="tenant_id (ej: demo-pyme)" />
              <button className="btn btn-primary" onClick={loadUsage}>Ver uso</button>
            </div>
            {usage ? (
              <>
                <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
                  Plan actual: <b style={{ color: "var(--ink)" }}>{usage.plan}</b>
                </div>
                <Bar label="Conversaciones" {...usage.conversations} />
                <Bar label="Acciones de IA" {...usage.llm_actions} />
                <Bar label="Gasto (USD)" used={usage.budget_usd.used} limit={usage.budget_usd.limit} pct={usage.budget_usd.pct} />
              </>
            ) : (
              <p style={{ color: "var(--muted)", margin: 0 }}>Ingresa un tenant y pulsa “Ver uso”.</p>
            )}
          </div>

          {Object.keys(plans).length > 0 && (
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Planes disponibles</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                {Object.entries(plans).map(([k, p]) => (
                  <div key={k} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{clp(p.monthly_clp)}<span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}> /mes</span></div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                      {p.included_conversations === -1 ? "∞" : p.included_conversations.toLocaleString("es-CL")} conv · tope US${p.budget_cap_usd}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
