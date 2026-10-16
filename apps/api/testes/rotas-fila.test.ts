import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { esquemaFilaFollowUp, esquemaResultadoRegistrado } from "@radar/shared";
import { criarApp } from "../src/app.js";
import { RepositorioOrcamentosMemoria } from "../src/dados/repositorio-memoria.js";

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

describe("GET /api/fila", () => {
  it("responde 200 com payload que valida no schema compartilhado", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila" });
    expect(resposta.statusCode).toBe(200);

    const corpo = resposta.json();
    const validado = esquemaFilaFollowUp.safeParse(corpo);
    expect(validado.success).toBe(true);
    expect(corpo.fonte).toBe("dados_ficticios");
    expect(corpo.aviso).toContain("fictícios");
  });

  it("inclui apenas orçamentos pendentes (enviado ou em_followup)", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila" });
    const corpo = resposta.json() as { itens: { status: string }[] };
    const statuses = new Set(corpo.itens.map((i) => i.status));
    expect([...statuses].every((s) => s === "enviado" || s === "em_followup")).toBe(true);
    expect(corpo.itens.length).toBe(6); // base fictícia: 6 pendentes
  });

  it("ordena por urgência: mais dias primeiro, empate por maior valor", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila" });
    const corpo = resposta.json() as { itens: { diasSemResposta: number; valor: number }[] };

    for (let i = 1; i < corpo.itens.length; i++) {
      const anterior = corpo.itens[i - 1]!;
      const atual = corpo.itens[i]!;
      const ordenado =
        anterior.diasSemResposta > atual.diasSemResposta ||
        (anterior.diasSemResposta === atual.diasSemResposta &&
          anterior.valor >= atual.valor);
      expect(ordenado).toBe(true);
    }
  });

  it("demonstra o estado vazio com resumo zerado", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila?simular=vazio" });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { itens: unknown[]; resumo: { valorRecuperado: number } };
    expect(corpo.itens).toEqual([]);
    expect(corpo.resumo.valorRecuperado).toBe(0);
  });

  it("demonstra o estado de erro com corpo padronizado", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila?simular=erro" });
    expect(resposta.statusCode).toBe(500);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("falha_simulada");
  });

  it("rejeita parâmetro de simulação desconhecido", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila?simular=xpto" });
    expect(resposta.statusCode).toBe(400);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("parametro_invalido");
  });
});

describe("POST /api/orcamentos/:id/resultados", () => {
  it("registra um fechamento e recalcula os indicadores", async () => {
    // orc-002 (R$ 640) está na fila; fechá-lo deve aumentar o valor recuperado.
    const antes = await app.inject({ method: "GET", url: "/api/fila" });
    const valorAntes = (antes.json() as { resumo: { valorRecuperado: number } }).resumo
      .valorRecuperado;

    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-002/resultados",
      payload: { desfecho: "fechou", canal: "whatsapp" },
    });
    expect(resposta.statusCode).toBe(200);

    const corpo = resposta.json();
    expect(esquemaResultadoRegistrado.safeParse(corpo).success).toBe(true);
    expect(corpo.orcamento.id).toBe("orc-002");
    expect(corpo.orcamento.status).toBe("fechado");
    expect(corpo.orcamento.aguardandoFollowUp).toBe(false);
    expect(corpo.orcamento.ultimoContato?.canal).toBe("whatsapp");
    expect(corpo.resumo.valorRecuperado).toBe(valorAntes + 640);
  });

  it("retira o item da fila após o fechamento", async () => {
    const resposta = await app.inject({ method: "GET", url: "/api/fila" });
    const corpo = resposta.json() as { itens: { id: string }[] };
    expect(corpo.itens.some((i) => i.id === "orc-002")).toBe(false);
  });

  it("mantém na fila quem teve sem_retorno (continua pendente)", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-007/resultados",
      payload: { desfecho: "sem_retorno", canal: "telefone" },
    });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { orcamento: { status: string; aguardandoFollowUp: boolean } };
    expect(corpo.orcamento.status).toBe("em_followup");
    expect(corpo.orcamento.aguardandoFollowUp).toBe(true);

    const fila = await app.inject({ method: "GET", url: "/api/fila" });
    const itens = (fila.json() as { itens: { id: string }[] }).itens;
    expect(itens.some((i) => i.id === "orc-007")).toBe(true);
  });

  it("registra recusa e retira da fila", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-008/resultados",
      payload: { desfecho: "recusou", canal: "whatsapp", observacao: "Preço acima do orçado." },
    });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { orcamento: { status: string; aguardandoFollowUp: boolean } };
    expect(corpo.orcamento.status).toBe("recusado");
    expect(corpo.orcamento.aguardandoFollowUp).toBe(false);
  });

  it("respeita a data informada no registro", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-011/resultados",
      payload: { desfecho: "pediu_alteracao", canal: "email", data: "2026-10-01" },
    });
    expect(resposta.statusCode).toBe(200);
    const corpo = resposta.json() as { orcamento: { ultimoContato: { data: string } | null } };
    expect(corpo.orcamento.ultimoContato?.data).toBe("2026-10-01");
  });

  it("rejeita corpo fora do contrato (desfecho desconhecido)", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-001/resultados",
      payload: { desfecho: "sumiuu", canal: "whatsapp" },
    });
    expect(resposta.statusCode).toBe(400);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("registro_invalido");
  });

  it("rejeita corpo sem os campos obrigatórios", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-001/resultados",
      payload: { canal: "whatsapp" },
    });
    expect(resposta.statusCode).toBe(400);
  });

  it("responde 404 para id inexistente", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-999/resultados",
      payload: { desfecho: "fechou", canal: "telefone" },
    });
    expect(resposta.statusCode).toBe(404);
    const corpo = resposta.json() as { erro: { codigo: string } };
    expect(corpo.erro.codigo).toBe("orcamento_nao_encontrado");
  });

  it("responde 409 para orçamento existente mas fora da fila (não elegível)", async () => {
    // orc-004 existe (status fechado) — registrar resultado sobre ele mascararia o estado real.
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-004/resultados",
      payload: { desfecho: "fechou", canal: "whatsapp" },
    });
    expect(resposta.statusCode).toBe(409);
    const corpo = resposta.json() as { erro: { codigo: string; mensagem: string } };
    expect(corpo.erro.codigo).toBe("orcamento_ineligivel");
    expect(corpo.erro.mensagem.length).toBeGreaterThan(0);
  });

  it("o 409 não altera a fila nem os indicadores", async () => {
    const antes = await app.inject({ method: "GET", url: "/api/fila" });
    await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-012/resultados", // expirado: existe, fora da fila
      payload: { desfecho: "fechou", canal: "telefone" },
    });
    const depois = await app.inject({ method: "GET", url: "/api/fila" });
    expect(depois.json()).toEqual(antes.json());
  });

  it("responde 400 json_invalido para JSON malformado", async () => {
    const resposta = await app.inject({
      method: "POST",
      url: "/api/orcamentos/orc-001/resultados",
      headers: { "content-type": "application/json" },
      payload: "{ desfecho: ",
    });
    expect(resposta.statusCode).toBe(400);
    const corpo = resposta.json() as { erro: { codigo: string; mensagem: string } };
    expect(corpo.erro.codigo).toBe("json_invalido");
    expect(corpo.erro.mensagem).toContain("JSON");
  });
});

describe("POST /api/demonstracao/reinicializar", () => {
  it("restaura os dados fictícios após registros na sessão", async () => {
    const appLocal = await criarApp({
      repositorio: new RepositorioOrcamentosMemoria(),
      nivelLog: "silent",
    });
    await appLocal.ready();

    // Consome a demonstração: registra um fechamento e esvazia parcialmente a fila.
    await appLocal.inject({
      method: "POST",
      url: "/api/orcamentos/orc-002/resultados",
      payload: { desfecho: "fechou", canal: "whatsapp" },
    });
    const aposRegistro = await appLocal.inject({ method: "GET", url: "/api/fila" });
    expect((aposRegistro.json() as { itens: unknown[] }).itens).toHaveLength(5);

    const resposta = await appLocal.inject({
      method: "POST",
      url: "/api/demonstracao/reinicializar",
    });
    expect(resposta.statusCode).toBe(200);

    const corpo = resposta.json();
    expect(esquemaFilaFollowUp.safeParse(corpo).success).toBe(true);
    expect((corpo.itens as unknown[]).length).toBe(6); // base fictícia: 6 pendentes
    expect(corpo.resumo.valorRecuperado).toBe(8240);
    expect((corpo.itens as { id: string }[]).some((i) => i.id === "orc-002")).toBe(true);

    await appLocal.close();
  });
});
