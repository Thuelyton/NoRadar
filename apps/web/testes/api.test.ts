import { afterEach, describe, expect, it, vi } from "vitest";
import { buscarPainel, ErroAoCarregarPainel } from "@/lib/api";

const painelValido = {
  fonte: "dados_ficticios",
  aviso: "Dados fictícios.",
  resumo: {
    orcamentosPendentes: 1,
    contatosRealizados: 2,
    valorRecuperado: 3,
    orcamentosRegistrados: 4,
    taxaConversaoPercentual: 50,
    periodo: { inicio: "2026-01-01", fim: "2026-01-31" },
  },
  orcamentos: [],
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

describe("buscarPainel", () => {
  it("retorna o payload quando ele valida no schema", async () => {
    responderCom(painelValido);
    const painel = await buscarPainel({ urlBase: "http://api.teste" });
    expect(painel.fonte).toBe("dados_ficticios");
    expect(painel.resumo.orcamentosRegistrados).toBe(4);
  });

  it("falha com código http_ quando a API devolve erro", async () => {
    responderCom({ erro: { codigo: "falha_simulada", mensagem: "Falha proposital." } }, 500);
    await expect(buscarPainel({ urlBase: "http://api.teste" })).rejects.toMatchObject({
      codigo: "falha_simulada",
    });
  });

  it("falha quando o payload não respeita o contrato", async () => {
    responderCom({ fonte: "invented", resumo: {}, orcamentos: "nao-e-lista" });
    const promessa = buscarPainel({ urlBase: "http://api.teste" });
    await expect(promessa).rejects.toBeInstanceOf(ErroAoCarregarPainel);
    await expect(buscarPainel({ urlBase: "http://api.teste" })).rejects.toMatchObject({
      codigo: "schema_invalido",
    });
  });

  it("falha quando a API está inacessível", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    await expect(buscarPainel({ urlBase: "http://api.teste" })).rejects.toMatchObject({
      codigo: "api_inacessivel",
    });
  });

  it("envia o modo de simulação quando informado", async () => {
    const busca = vi.fn(
      async (): Promise<Response> =>
        new Response(JSON.stringify(painelValido), { status: 200 }),
    );
    vi.stubGlobal("fetch", busca);

    await buscarPainel({ urlBase: "http://api.teste", simular: "vazio" });
    expect(busca).toHaveBeenCalledTimes(1);
    const urlChamada = String((busca.mock.calls.at(0) as unknown[])[0]);
    expect(urlChamada).toContain("simular=vazio");
  });
});
