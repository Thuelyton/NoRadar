import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { esquemaPainel, type Orcamento } from "@radar/shared";
import { criarApp } from "../src/app.js";
import { RepositorioOrcamentosMemoria } from "../src/dados/repositorio-memoria.js";
import type { OrcamentoRepository } from "../src/dominio/repositorio-orcamentos.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await criarApp({
    repositorio: new RepositorioOrcamentosMemoria(),
    nivelLog: "silent",
  });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /api/saude", () => {
  it("responde ok e deixa explícito que a fonte é mockada", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/saude" });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { status: string; fonte_de_dados: string };
    expect(corpo.status).toBe("ok");
    expect(corpo.fonte_de_dados).toContain("mockada");
  });
});

describe("GET /api/painel", () => {
  it("responde 200 com payload que valida no schema compartilhado", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/painel" });
    expect(resposta.statusCode).toBe(200);

    const corpo = resposta.json();
    const validado = esquemaPainel.safeParse(corpo);
    expect(validado.success).toBe(true);
    expect(corpo.fonte).toBe("dados_ficticios");
    expect(corpo.orcamentos.length).toBeGreaterThan(0);
    expect(corpo.aviso).toContain("fictícios");
  });

  it("demonstra o estado vazio", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/painel?simular=vazio" });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { orcamentos: unknown[]; resumo: { valorRecuperado: number } };
    expect(corpo.orcamentos).toEqual([]);
    expect(corpo.resumo.valorRecuperado).toBe(0);
  });

  it("demonstra o estado de erro com corpo padronizado", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/painel?simular=erro" });
    expect(resposta.statusCode).toBe(500);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("falha_simulada");
  });

  it("rejeita parâmetro de simulação desconhecido", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/painel?simular=xpto" });
    expect(resposta.statusCode).toBe(400);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("parametro_invalido");
  });

  it("retorna 404 padronizado para rota inexistente", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/inexistente" });
    expect(resposta.statusCode).toBe(404);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("nao_encontrado");
  });

  it("usa o repositório injetado (prova de desacoplamento da camada de dados)", async () => {
    const repositorioFake: OrcamentoRepository = {
      listar: async (): Promise<Orcamento[]> => [],
      resumo: async () => ({
        orcamentosPendentes: 1,
        contatosRealizados: 2,
        valorRecuperado: 3,
        orcamentosRegistrados: 4,
        taxaConversaoPercentual: 50,
        periodo: { inicio: "2026-01-01", fim: "2026-01-31" },
      }),
    };

    const appComFake = await criarApp({ repositorio: repositorioFake, nivelLog: "silent" });
    await appComFake.ready();

    const resposta = await appComFake.inject({ method: "GET", url: "/api/painel" });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { orcamentos: unknown[]; resumo: { orcamentosRegistrados: number } };
    expect(corpo.orcamentos).toEqual([]);
    expect(corpo.resumo.orcamentosRegistrados).toBe(4);

    await appComFake.close();
  });
});
