import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FilaFollowUp, ResultadoRegistrado } from "@radar/shared";
import { FilaCliente } from "@/app/fila/fila-cliente";

const { buscarFilaMock, registrarResultadoMock, reiniciarDemonstracaoMock } = vi.hoisted(() => ({
  buscarFilaMock: vi.fn(),
  registrarResultadoMock: vi.fn(),
  reiniciarDemonstracaoMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  buscarFila: buscarFilaMock,
  registrarResultado: registrarResultadoMock,
  reiniciarDemonstracao: reiniciarDemonstracaoMock,
  ErroAoCarregarPainel: class ErroAoCarregarPainel extends Error {
    codigo: string;
    constructor(mensagem: string, codigo = "erro_desconhecido") {
      super(mensagem);
      this.name = "ErroAoCarregarPainel";
      this.codigo = codigo;
    }
  },
  ErroAoRegistrarResultado: class ErroAoRegistrarResultado extends Error {
    codigo: string;
    constructor(mensagem: string, codigo = "erro_desconhecido") {
      super(mensagem);
      this.name = "ErroAoRegistrarResultado";
      this.codigo = codigo;
    }
  },
}));

const orcamento = {
  id: "orc-001",
  cliente: { nome: "Clima Conforto Manutenção", telefone: "(11) 9****-1111" },
  servico: "Instalação de split 18.000 BTUs",
  valor: 3180,
  dataEnvio: "2026-10-05",
  dataValidade: "2026-10-24",
  diasSemResposta: 9,
  status: "em_followup",
  responsavel: "Marcos",
  ultimoContato: { canal: "whatsapp", data: "2026-10-11", statusEnvio: "entregue" },
  aguardandoFollowUp: true,
} as const;

const fila: FilaFollowUp = {
  fonte: "dados_ficticios",
  aviso: "Dados fictícios para demonstração.",
  itens: [orcamento],
  resumo: {
    orcamentosPendentes: 1,
    contatosRealizados: 2,
    valorRecuperado: 8240,
    orcamentosRegistrados: 12,
    taxaConversaoPercentual: 37.5,
    periodo: { inicio: "2026-01-01", fim: "2026-01-31" },
  },
};

beforeEach(() => {
  buscarFilaMock.mockResolvedValue(fila);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("FilaCliente", () => {
  it("mostra o estado de carregando enquanto busca a fila", () => {
    buscarFilaMock.mockReturnValue(new Promise(() => {}));
    render(<FilaCliente />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza os itens da fila com o aviso de dados fictícios", async () => {
    render(<FilaCliente />);

    await waitFor(() => {
      expect(screen.getByText("Clima Conforto Manutenção")).toBeInTheDocument();
    });
    expect(screen.getByText("Dados fictícios para demonstração.")).toBeInTheDocument();
    expect(screen.getByText("Na fila agora")).toBeInTheDocument();
    // Não é receita real: o cartão deixa a limitação explícita.
    expect(
      screen.getByText("Simulação com dados fictícios — não é receita real"),
    ).toBeInTheDocument();
  });

  it("registra um resultado, remove o item da fila e aplica o resumo recalculado", async () => {
    const usuario = userEvent.setup();
    const resultado: ResultadoRegistrado = {
      fonte: "dados_ficticios",
      orcamento: { ...orcamento, status: "fechado", aguardandoFollowUp: false },
      resumo: { ...fila.resumo, valorRecuperado: 11420 },
    };
    registrarResultadoMock.mockResolvedValue(resultado);

    render(<FilaCliente />);
    await waitFor(() => expect(screen.getByText("Clima Conforto Manutenção")).toBeInTheDocument());

    const grupo = screen.getByRole("group", {
      name: "Registrar resultado de Clima Conforto Manutenção",
    });
    await usuario.selectOptions(within(grupo).getByRole("combobox", { name: "Resultado" }), "fechou");
    await usuario.click(within(grupo).getByRole("button", { name: "Registrar (simulado)" }));

    await waitFor(() => {
      expect(registrarResultadoMock).toHaveBeenCalledWith("orc-001", {
        desfecho: "fechou",
        canal: "whatsapp",
      });
    });
    await waitFor(() => {
      expect(screen.queryByText("Clima Conforto Manutenção")).not.toBeInTheDocument();
    });
    // Indicador espelha o resumo devolvido pelo servidor, não cálculo local.
    expect(screen.getByText("R$ 11.420")).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toContain("Cliente fechou");
  });

  it("mostra o estado vazio quando a fila não tem itens", async () => {
    buscarFilaMock.mockResolvedValue({ ...fila, itens: [] });
    render(<FilaCliente />);
    await waitFor(() => {
      expect(screen.getByText("Nenhum orçamento na fila")).toBeInTheDocument();
    });
  });

  it("mostra o estado vazio após registrar o último item da fila (A1)", async () => {
    const usuario = userEvent.setup();
    const resultado: ResultadoRegistrado = {
      fonte: "dados_ficticios",
      orcamento: { ...orcamento, status: "fechado", aguardandoFollowUp: false },
      resumo: { ...fila.resumo, orcamentosPendentes: 0, valorRecuperado: 11420 },
    };
    registrarResultadoMock.mockResolvedValue(resultado);

    render(<FilaCliente />);
    await waitFor(() => expect(screen.getByText("Clima Conforto Manutenção")).toBeInTheDocument());

    const grupo = screen.getByRole("group", {
      name: "Registrar resultado de Clima Conforto Manutenção",
    });
    await usuario.selectOptions(within(grupo).getByRole("combobox", { name: "Resultado" }), "fechou");
    await usuario.click(within(grupo).getByRole("button", { name: "Registrar (simulado)" }));

    // A1: a fila esvaziada vira estado vazio — sem lista "pronta" sem itens.
    await waitFor(() => {
      expect(screen.getByText("Fila concluída nesta demonstração")).toBeInTheDocument();
    });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    // Os indicadores continuam visíveis, espelhando o resumo do servidor.
    expect(screen.getByText("R$ 11.420")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument(); // "Na fila agora"
  });

  it("oferece controles de demonstração na fila (B1)", async () => {
    render(<FilaCliente />);
    await waitFor(() => expect(screen.getByText("Clima Conforto Manutenção")).toBeInTheDocument());

    const secao = screen.getByRole("region", { name: "Demonstrar estados da fila" });
    expect(within(secao).getByRole("button", { name: "Dados" })).toBeInTheDocument();
    expect(within(secao).getByRole("button", { name: "Carregando" })).toBeInTheDocument();
    expect(within(secao).getByRole("button", { name: "Vazio" })).toBeInTheDocument();
    expect(within(secao).getByRole("button", { name: "Erro" })).toBeInTheDocument();
    expect(within(secao).getByRole("button", { name: "Reiniciar demonstração" })).toBeInTheDocument();
  });

  it("simula o estado vazio pelo controle de demonstração", async () => {
    const usuario = userEvent.setup();
    buscarFilaMock.mockImplementation(
      async (opcoes?: { simular?: string }) =>
        opcoes?.simular === "vazio" ? { ...fila, itens: [] } : fila,
    );
    render(<FilaCliente />);
    await waitFor(() => expect(screen.getByText("Clima Conforto Manutenção")).toBeInTheDocument());

    const secao = screen.getByRole("region", { name: "Demonstrar estados da fila" });
    await usuario.click(within(secao).getByRole("button", { name: "Vazio" }));

    await waitFor(() => {
      expect(buscarFilaMock).toHaveBeenCalledWith(expect.objectContaining({ simular: "vazio" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Nenhum orçamento na fila")).toBeInTheDocument();
    });
  });

  it("reinicia a demonstração e restaura os dados fictícios (B1/M4)", async () => {
    const usuario = userEvent.setup();
    // Começa vazio (simulado) e o reinício devolve os dados.
    buscarFilaMock.mockResolvedValueOnce({ ...fila, itens: [] });
    reiniciarDemonstracaoMock.mockResolvedValue(fila);

    render(<FilaCliente />);
    await waitFor(() => {
      expect(screen.getByText("Nenhum orçamento na fila")).toBeInTheDocument();
    });

    await usuario.click(screen.getByRole("button", { name: "Reiniciar demonstração" }));

    await waitFor(() => {
      expect(reiniciarDemonstracaoMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByText("Clima Conforto Manutenção")).toBeInTheDocument();
    });
    expect(screen.getByRole("status").textContent).toContain("Demonstração reiniciada");
  });

  it("mostra títulos de erro e carregamento próprios da rota (M1)", async () => {
    buscarFilaMock.mockRejectedValueOnce(new Error("API em manutenção."));
    render(<FilaCliente />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Não foi possível carregar a fila" })).toBeInTheDocument();
    });

    buscarFilaMock.mockReturnValue(new Promise(() => {}));
    render(<FilaCliente />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando fila…");
  });

  it("mostra o estado de erro quando a API falha", async () => {
    buscarFilaMock.mockRejectedValue(new Error("API em manutenção."));
    render(<FilaCliente />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("API em manutenção.")).toBeInTheDocument();
  });
});
