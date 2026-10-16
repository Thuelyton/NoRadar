import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buscarFila,
  reiniciarDemonstracao,
  registrarResultado,
  ErroAoCarregarPainel,
  ErroAoRegistrarResultado,
} from "@/lib/api";

const filaValida = {
  fonte: "dados_ficticios",
  aviso: "Dados fictícios.",
  itens: [
    {
      id: "orc-001",
      cliente: { nome: "Clima Conforto", telefone: "(11) 9****-1111" },
      servico: "Instalação de split",
      valor: 3180,
      dataEnvio: "2026-10-05",
      dataValidade: "2026-10-24",
      diasSemResposta: 9,
      status: "em_followup",
      responsavel: "Marcos",
      ultimoContato: { canal: "whatsapp", data: "2026-10-11", statusEnvio: "entregue" },
      aguardandoFollowUp: true,
    },
  ],
  resumo: {
    orcamentosPendentes: 1,
    contatosRealizados: 2,
    valorRecuperado: 3,
    orcamentosRegistrados: 4,
    taxaConversaoPercentual: 50,
    periodo: { inicio: "2026-01-01", fim: "2026-01-31" },
  },
};

const resultadoValido = {
  fonte: "dados_ficticios",
  orcamento: filaValida.itens[0],
  resumo: filaValida.resumo,
};

function responderCom(corpo: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(corpo), { status })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buscarFila", () => {
  it("retorna o payload quando ele valida no schema", async () => {
    responderCom(filaValida);
    const fila = await buscarFila({ urlBase: "http://api.teste" });
    expect(fila.itens).toHaveLength(1);
    expect(fila.itens[0]?.id).toBe("orc-001");
  });

  it("falha quando o payload não respeita o contrato", async () => {
    responderCom({ fonte: "invented", itens: "nao-e-lista" });
    await expect(buscarFila({ urlBase: "http://api.teste" })).rejects.toMatchObject({
      codigo: "schema_invalido",
    });
  });

  it("propaga o erro padronizado da API", async () => {
    responderCom({ erro: { codigo: "falha_simulada", mensagem: "Falha proposital." } }, 500);
    await expect(buscarFila({ urlBase: "http://api.teste" })).rejects.toBeInstanceOf(
      ErroAoCarregarPainel,
    );
  });

  it("envia o modo de simulação quando informado", async () => {
    const busca = vi.fn(
      async (): Promise<Response> => new Response(JSON.stringify(filaValida), { status: 200 }),
    );
    vi.stubGlobal("fetch", busca);

    await buscarFila({ urlBase: "http://api.teste", simular: "vazio" });
    const urlChamada = String((busca.mock.calls.at(0) as unknown[])[0]);
    expect(urlChamada).toContain("simular=vazio");
  });
});

describe("registrarResultado", () => {
  it("envia POST com o corpo serializado e valida a resposta", async () => {
    const busca = vi.fn(
      async (): Promise<Response> => new Response(JSON.stringify(resultadoValido), { status: 200 }),
    );
    vi.stubGlobal("fetch", busca);

    const resultado = await registrarResultado(
      "orc-001",
      { desfecho: "fechou", canal: "whatsapp" },
      { urlBase: "http://api.teste" },
    );

    expect(resultado.orcamento.id).toBe("orc-001");
    expect(busca).toHaveBeenCalledTimes(1);

    const chamada = busca.mock.calls.at(0) as unknown as [URL, RequestInit];
    const [url, init] = chamada;
    expect(String(url)).toContain("/api/orcamentos/orc-001/resultados");
    expect(init.method).toBe("POST");
    const cabecalhos = init.headers as Record<string, string>;
    expect(cabecalhos["content-type"]).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual({ desfecho: "fechou", canal: "whatsapp" });
  });

  it("falha quando a resposta não respeita o contrato", async () => {
    responderCom({ fonte: "invented" });
    await expect(
      registrarResultado("orc-001", { desfecho: "fechou", canal: "telefone" }, { urlBase: "http://api.teste" }),
    ).rejects.toMatchObject({ codigo: "schema_invalido" });
  });

  it("propaga erro da API com a classe própria", async () => {
    responderCom({ erro: { codigo: "orcamento_nao_encontrado", mensagem: "Não existe." } }, 404);
    const promessa = registrarResultado(
      "orc-999",
      { desfecho: "fechou", canal: "telefone" },
      { urlBase: "http://api.teste" },
    );
    await expect(promessa).rejects.toBeInstanceOf(ErroAoRegistrarResultado);
    await expect(
      registrarResultado("orc-999", { desfecho: "fechou", canal: "telefone" }, { urlBase: "http://api.teste" }),
    ).rejects.toMatchObject({ codigo: "orcamento_nao_encontrado" });
  });

  it("propaga o conflito 409 de orçamento não elegível (A2)", async () => {
    responderCom(
      { erro: { codigo: "orcamento_ineligivel", mensagem: "Fora da fila." } },
      409,
    );
    await expect(
      registrarResultado("orc-004", { desfecho: "fechou", canal: "whatsapp" }, { urlBase: "http://api.teste" }),
    ).rejects.toMatchObject({ codigo: "orcamento_ineligivel" });
  });
});

describe("reiniciarDemonstracao", () => {
  it("faz POST na rota de reinício e valida a fila restaurada", async () => {
    const busca = vi.fn(
      async (): Promise<Response> => new Response(JSON.stringify(filaValida), { status: 200 }),
    );
    vi.stubGlobal("fetch", busca);

    const restaurada = await reiniciarDemonstracao({ urlBase: "http://api.teste" });
    expect(restaurada.itens).toHaveLength(1);

    const chamada = busca.mock.calls.at(0) as unknown as [URL, RequestInit];
    const [url, init] = chamada;
    expect(String(url)).toContain("/api/demonstracao/reinicializar");
    expect(init.method).toBe("POST");
  });

  it("falha quando a resposta restaurada não respeita o contrato", async () => {
    responderCom({ fonte: "invented" });
    await expect(reiniciarDemonstracao({ urlBase: "http://api.teste" })).rejects.toMatchObject({
      codigo: "schema_invalido",
    });
  });

  it("propaga erro padronizado da API", async () => {
    responderCom({ erro: { codigo: "erro_interno", mensagem: "Falha." } }, 500);
    await expect(reiniciarDemonstracao({ urlBase: "http://api.teste" })).rejects.toBeInstanceOf(
      ErroAoCarregarPainel,
    );
  });
});
