// Cliente del backend FastAPI de Korriente Agentes.
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Plan = {
  name: string;
  setup_clp: number;
  monthly_clp: number;
  max_agents: number;
  included_conversations: number;
  included_llm_actions: number;
  budget_cap_usd: number;
};

export type Usage = {
  tenant_id: string;
  plan: string;
  conversations: { used: number; limit: number; pct: number | null };
  llm_actions: { used: number; limit: number; pct: number | null };
  budget_usd: { used: number; limit: number; pct: number | null };
};

export async function getPlans(): Promise<Record<string, Plan>> {
  const r = await fetch(`${API}/dashboard/plans`, { cache: "no-store" });
  if (!r.ok) throw new Error("No se pudo cargar planes");
  return r.json();
}

export async function getUsage(tenantId: string): Promise<Usage> {
  const r = await fetch(`${API}/dashboard/tenants/${tenantId}/usage`, { cache: "no-store" });
  if (!r.ok) throw new Error("Tenant sin uso o inexistente");
  return r.json();
}
