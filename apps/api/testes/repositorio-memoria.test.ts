import { describe, expect, it } from "vitest";
import {
  RepositorioOrcamentosMemoria,
} from "../src/dados/repositorio-memoria.js";
import { ORCAMENTOS_FICTICIOS } from "../src/dados/dados-ficticios.js";
import {
  aplicarResultado,
  calcularResumo,
  ordenarPorUrgencia,
  statusAposDesfecho,
} from "../src/dominio/repositorio-orcamentos.js";

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

  it("registra resultado, atualiza o item e recalcula o resumo", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    const antes = await repo.resumo();

    const resultado = await repo.registrarResultado("orc-001", {
      desfecho: "fechou",
      canal: "whatsapp",
      data: "2026-10-15",
    });

    expect(resultado.situacao).toBe("registrado");
    if (resultado.situacao !== "registrado") return;
    expect(resultado.orcamento.status).toBe("fechado");
    expect(resultado.orcamento.ultimoContato).toEqual({
      canal: "whatsapp",
      data: "2026-10-15",
      statusEnvio: "enviado",
    });
    expect(resultado.resumo.valorRecuperado).toBe(antes.valorRecuperado + 3180);

    const fila = await repo.fila();
    expect(fila.some((o) => o.id === "orc-001")).toBe(false);
  });

  it("discrimina id inexistente como nao_encontrado (sem alterar estado)", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    expect(
      await repo.registrarResultado("orc-999", { desfecho: "fechou", canal: "telefone" }),
    ).toEqual({ situacao: "nao_encontrado" });
  });

  it("recusa registro em orçamento fora da fila como ineligivel (sem alterar estado)", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    const antes = await repo.resumo();

    // orc-004 está fechado — existe, mas não é elegível para follow-up.
    const resultado = await repo.registrarResultado("orc-004", {
      desfecho: "fechou",
      canal: "whatsapp",
    });

    expect(resultado.situacao).toBe("ineligivel");
    if (resultado.situacao === "ineligivel") {
      expect(resultado.orcamento.status).toBe("fechado");
    }
    // Nada foi registrado: o resumo não mudou.
    expect(await repo.resumo()).toEqual(antes);
  });

  it("reinicialização segura restaura o estado base sem compartilhar referências", async () => {
    const repo = new RepositorioOrcamentosMemoria();

    await repo.registrarResultado("orc-001", { desfecho: "fechou", canal: "whatsapp" });
    await repo.registrarResultado("orc-007", { desfecho: "recusou", canal: "telefone" });
    expect((await repo.fila()).length).toBe(4);

    await repo.reinicializar();

    const restaurado = (await repo.listar()).find((o) => o.id === "orc-001");
    expect(restaurado?.status).toBe("em_followup");
    expect(restaurado?.ultimoContato?.canal).toBe("whatsapp");
    expect((await repo.fila()).length).toBe(6);
    expect((await repo.resumo()).valorRecuperado).toBe(8240);

    // Cópias frescas: mutar o orçamento restaurado não contamina a base nem a próxima reinicialização.
    const primeiro = (await repo.listar())[0]!;
    expect(primeiro).not.toBe(ORCAMENTOS_FICTICIOS[0]);
  });

  it("reinicializar não contamina a base fictícia exportada", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    await repo.registrarResultado("orc-001", { desfecho: "recusou", canal: "telefone" });
    await repo.reinicializar();

    const base = ORCAMENTOS_FICTICIOS.find((o) => o.id === "orc-001");
    expect(base?.status).toBe("em_followup");
    expect(base?.ultimoContato?.canal).toBe("whatsapp");
  });

  it("não contamina os dados fictícios base nem outras instâncias", async () => {
    const repo = new RepositorioOrcamentosMemoria();
    await repo.registrarResultado("orc-001", { desfecho: "recusou", canal: "telefone" });

    const base = ORCAMENTOS_FICTICIOS.find((o) => o.id === "orc-001");
    expect(base?.status).toBe("em_followup");

    const outra = new RepositorioOrcamentosMemoria();
    const daOutra = (await outra.listar()).find((o) => o.id === "orc-001");
    expect(daOutra?.status).toBe("em_followup");
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

describe("ordenarPorUrgencia (função pura)", () => {
  it("ordena por dias decrescentes e desempata por valor decrescente", () => {
    const base = ORCAMENTOS_FICTICIOS;
    const ordenados = ordenarPorUrgencia(base);
    for (let i = 1; i < ordenados.length; i++) {
      const a = ordenados[i - 1]!;
      const b = ordenados[i]!;
      expect(
        a.diasSemResposta > b.diasSemResposta ||
          (a.diasSemResposta === b.diasSemResposta && a.valor >= b.valor),
      ).toBe(true);
    }
  });

  it("desempata por valor quando os dias são iguais", () => {
    const orcamentos = [
      { ...ORCAMENTOS_FICTICIOS[0]!, id: "a", diasSemResposta: 5, valor: 100 },
      { ...ORCAMENTOS_FICTICIOS[1]!, id: "b", diasSemResposta: 5, valor: 900 },
    ];
    expect(ordenarPorUrgencia(orcamentos).map((o) => o.id)).toEqual(["b", "a"]);
  });

  it("não altera a lista original", () => {
    const original = [...ORCAMENTOS_FICTICIOS];
    ordenarPorUrgencia(original);
    expect(original.map((o) => o.id)).toEqual(ORCAMENTOS_FICTICIOS.map((o) => o.id));
  });
});

describe("statusAposDesfecho (função pura)", () => {
  const caso = (desfecho: Parameters<typeof statusAposDesfecho>[0]) =>
    statusAposDesfecho(desfecho, "enviado");

  it("mapeia cada desfecho para o status esperado", () => {
    expect(caso("fechou")).toBe("fechado");
    expect(caso("recusou")).toBe("recusado");
    expect(caso("pediu_alteracao")).toBe("em_followup");
    expect(caso("reativado_manutencao")).toBe("respondido");
    expect(caso("sem_retorno")).toBe("em_followup");
  });
});

describe("aplicarResultado (função pura)", () => {
  it("devolve nova cópia sem mutar o orçamento original", () => {
    const original = ORCAMENTOS_FICTICIOS[0]!;
    const atualizado = aplicarResultado(original, {
      desfecho: "fechou",
      canal: "telefone",
      data: "2026-10-15",
    });
    expect(atualizado).not.toBe(original);
    expect(original.status).toBe("em_followup");
    expect(atualizado.status).toBe("fechado");
    expect(atualizado.aguardandoFollowUp).toBe(false);
  });
});
