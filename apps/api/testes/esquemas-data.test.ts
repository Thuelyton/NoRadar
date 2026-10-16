import { describe, expect, it } from "vitest";
import {
  esquemaOrcamento,
  esquemaRegistroResultado,
  esquemaResumoPainel,
  FAIXA_DATA_PLAUSIVEL,
} from "@radar/shared";

/**
 * Regressão M5: todas as datas que cruzam a fronteira API <-> Web precisam
 * ter formato AAAA-MM-DD, existir no calendário e estar dentro da faixa
 * plausível (2000-01-01 a 2100-12-31).
 */
describe("faixa plausível de datas nos schemas compartilhados", () => {
  it("aceita data válida dentro da faixa", () => {
    const resultado = esquemaRegistroResultado.safeParse({
      desfecho: "fechou",
      canal: "whatsapp",
      data: "2026-10-16",
    });
    expect(resultado.success).toBe(true);
  });

  it("aceita data futura plausível (validade pode estar no futuro)", () => {
    const resultado = esquemaRegistroResultado.safeParse({
      desfecho: "pediu_alteracao",
      canal: "telefone",
      data: "2100-06-01",
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita dia inexistente no calendário (2026-02-30)", () => {
    const resultado = esquemaRegistroResultado.safeParse({
      desfecho: "fechou",
      canal: "whatsapp",
      data: "2026-02-30",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita data antes da faixa plausível (1999)", () => {
    const resultado = esquemaRegistroResultado.safeParse({
      desfecho: "fechou",
      canal: "whatsapp",
      data: "1999-05-05",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita data depois da faixa plausível (2101)", () => {
    const resultado = esquemaRegistroResultado.safeParse({
      desfecho: "fechou",
      canal: "whatsapp",
      data: "2101-01-01",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita formato fora de AAAA-MM-DD", () => {
    const resultado = esquemaRegistroResultado.safeParse({
      desfecho: "fechou",
      canal: "whatsapp",
      data: "16/10/2026",
    });
    expect(resultado.success).toBe(false);
  });

  it("aplica a mesma regra ao orçamento (dataEnvio/dataValidade)", () => {
    const base = {
      id: "orc-x",
      cliente: { nome: "Cliente", telefone: "(11) 9****-0000" },
      servico: "Serviço",
      valor: 100,
      dataEnvio: "2026-10-01",
      dataValidade: "2026-10-30",
      diasSemResposta: 1,
      status: "enviado",
      responsavel: "Vendedor",
      ultimoContato: null,
      aguardandoFollowUp: true,
    };

    expect(esquemaOrcamento.safeParse(base).success).toBe(true);
    expect(
      esquemaOrcamento.safeParse({ ...base, dataEnvio: "2026-13-01" }).success,
    ).toBe(false);
    expect(
      esquemaOrcamento.safeParse({ ...base, dataValidade: "1975-01-01" }).success,
    ).toBe(false);
  });

  it("aplica a mesma regra ao período do resumo", () => {
    expect(
      esquemaResumoPainel.safeParse({
        orcamentosPendentes: 0,
        contatosRealizados: 0,
        valorRecuperado: 0,
        orcamentosRegistrados: 0,
        taxaConversaoPercentual: 0,
        periodo: { inicio: "1999-01-01", fim: "2026-01-31" },
      }).success,
    ).toBe(false);
  });

  it("expõe a faixa adotada para consulta", () => {
    expect(FAIXA_DATA_PLAUSIVEL).toEqual({ minimo: "2000-01-01", maximo: "2100-12-31" });
  });
});
