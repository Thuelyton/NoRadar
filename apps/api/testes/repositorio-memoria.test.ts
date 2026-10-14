import { describe, expect, it } from "vitest";
import {
  RepositorioOrcamentosMemoria,
} from "../src/dados/repositorio-memoria.js";
import { ORCAMENTOS_FICTICIOS } from "../src/dados/dados-ficticios.js";
import { calcularResumo } from "../src/dominio/repositorio-orcamentos.js";

describe("RepositorioOrcamentosMemoria", () => {
  it("retorna os orçamentos fictícios cadastrados", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    const orcamentos = await repo.listar();
    expect(orcamentos).toHaveLength(ORCAMENTOS_FICTICIOS.length);
  });

  it("ordena por urgência de follow-up (mais dias sem resposta primeiro)", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    const orcamentos = await repo.listar();
    const dias = orcamentos.map((o) => o.diasSemResposta);
    expect(dias).toEqual([...dias].sort((a, b) => b - a));
  });

  it("calcula o resumo coerente com a base fictícia", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    const resumo = await repo.resumo();

    expect(resumo.orcamentosRegistrados).toBe(12);
    expect(resumo.orcamentosPendentes).toBe(6); // enviado + em_followup
    expect(resumo.contatosRealizados).toBe(8); // orçamentos com algum contato
    // fechados com contato: 4.750 + 1.450 + 2.040
    expect(resumo.valorRecuperado).toBe(8240);
    expect(resumo.taxaConversaoPercentual).toBe(37.5);
  });

  it("respeita a latência simulada", async () => {
    const repo = new RepositorioOrcamentosMemoria({ atrasoMs: 60 });
    const inicio = Date.now();
    await repo.listar();
    expect(Date.now() - inicio).toBeGreaterThanOrEqual(55);
  });

  it("funciona com uma base vazia (estado vazio sem quebra)", async () => {
    const repo = new RepositorioOrcamentosMemoria({ orcamentos: [] });
    expect(await repo.listar()).toEqual([]);
    const resumo = await repo.resumo();
    expect(resumo.valorRecuperado).toBe(0);
    expect(resumo.taxaConversaoPercentual).toBe(0);
  });
});

describe("calcularResumo (função pura)", () => {
  const periodo = { inicio: "2026-01-01", fim: "2026-01-31" };

  it("retorna zeros quando não há orçamentos", () => {
    const resumo = calcularResumo([], periodo);
    expect(resumo).toEqual({
      orcamentosPendentes: 0,
      contatosRealizados: 0,
      valorRecuperado: 0,
      orcamentosRegistrados: 0,
      taxaConversaoPercentual: 0,
      periodo,
    });
  });

  it("não conta como recuperado orçamento fechado SEM contato registrado", () => {
    const orcamentoFechadoSemContato = {
      ...ORCAMENTOS_FICTICIOS[0]!,
      id: "x",
      status: "fechado" as const,
      ultimoContato: null,
      valor: 1000,
    };
    const resumo = calcularResumo([orcamentoFechadoSemContato], periodo);
    expect(resumo.valorRecuperado).toBe(0);
    expect(resumo.contatosRealizados).toBe(0);
  });

  it("não conta orçamento fechado sem contato na taxa de conversão", () => {
    const base = ORCAMENTOS_FICTICIOS.map((o) => ({ ...o }));
    const resumo = calcularResumo(base, periodo);
    const fechadosComContato = base.filter(
      (o) => o.status === "fechado" && o.ultimoContato !== null,
    ).length;
    const comContato = base.filter((o) => o.ultimoContato !== null).length;
    expect(resumo.taxaConversaoPercentual).toBe(
      Math.round((fechadosComContato / comContato) * 1000) / 10,
    );
  });
});
