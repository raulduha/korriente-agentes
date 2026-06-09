// Datos de planes (fallback estático si el backend no está arriba).
// Debe coincidir con docs/pricing.md y backend/app/core/pricing.py.

export interface PlanCard {
  key: string;
  name: string;
  monthly_clp: number;
  setup_clp: number;
  max_agents: number;
  included_conversations: number;
  budget_cap_usd: number;
  target: string;
  highlight?: boolean;
}

export const PLANS_FALLBACK: PlanCard[] = [
  {
    key: "starter",
    name: "Starter",
    monthly_clp: 290_000,
    setup_clp: 490_000,
    max_agents: 1,
    included_conversations: 800,
    budget_cap_usd: 60,
    target: "PyME 10–50, primer agente",
  },
  {
    key: "growth",
    name: "Growth",
    monthly_clp: 590_000,
    setup_clp: 990_000,
    max_agents: 3,
    included_conversations: 2_500,
    budget_cap_usd: 180,
    target: "Empresa 50–200, proceso crítico",
    highlight: true,
  },
  {
    key: "pro",
    name: "Pro",
    monthly_clp: 1_190_000,
    setup_clp: 1_900_000,
    max_agents: 6,
    included_conversations: 8_000,
    budget_cap_usd: 500,
    target: "Varios procesos, multicanal",
  },
];
