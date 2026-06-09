import { describe, it, expect } from "vitest";
import { clp, pct, barColor, usageLabel } from "./format";

describe("clp", () => {
  it("formatea miles en es-CL", () => {
    expect(clp(290000)).toBe("$290.000");
  });
  it("trata -1 como ilimitado", () => {
    expect(clp(-1)).toBe("∞");
  });
});

describe("pct", () => {
  it("calcula porcentaje con 1 decimal", () => {
    expect(pct(400, 800)).toBe(50);
    expect(pct(1, 3)).toBe(33.3);
  });
  it("devuelve null si es ilimitado", () => {
    expect(pct(10, -1)).toBeNull();
  });
  it("evita división por cero", () => {
    expect(pct(5, 0)).toBe(0);
  });
});

describe("barColor", () => {
  it("ok bajo 80%", () => expect(barColor(50)).toBe("ok"));
  it("warn entre 80 y 100", () => expect(barColor(80)).toBe("warn"));
  it("danger al 100% o más", () => expect(barColor(100)).toBe("danger"));
  it("ok si null (ilimitado)", () => expect(barColor(null)).toBe("ok"));
});

describe("usageLabel", () => {
  it("avisa cuando está al tope", () => {
    expect(usageLabel(100)).toMatch(/humano/i);
  });
  it("ok cuando hay holgura", () => {
    expect(usageLabel(10)).toBe("OK");
  });
});
