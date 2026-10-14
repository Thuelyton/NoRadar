import { describe, expect, it } from "vitest";
import { formatarDias, formatarMoeda } from "@/lib/formatadores";
import { formatarData } from "@/lib/formatadores";

describe("formatadores", () => {
  it("formata moeda em reais", () => {
    // O Intl usa espaço não-quebrável (U+00A0) entre o símbolo e o número.
    expect(formatarMoeda(3180).replace(/\u00a0/g, " ")).toBe("R$ 3.180");
  });

  it("formata data ISO para pt-BR", () => {
    expect(formatarData("2026-10-14")).toBe("14/10/2026");
  });

  it("devolve a entrada quando a data é inválida", () => {
    expect(formatarData("abc")).toBe("abc");
  });

  it("pluraliza dias", () => {
    expect(formatarDias(0)).toBe("hoje");
    expect(formatarDias(1)).toBe("1 dia");
    expect(formatarDias(9)).toBe("9 dias");
  });
});
