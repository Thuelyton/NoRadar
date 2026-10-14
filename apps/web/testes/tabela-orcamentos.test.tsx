import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { TabelaOrcamentos } from "@/componentes/tabela-orcamentos";
import type { Orcamento } from "@radar/shared";

const orcamentos: Orcamento[] = [
  {
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
  },
  {
    id: "orc-002",
    cliente: { nome: "Oficina do Zé", telefone: "(11) 9****-2222" },
    servico: "Limpeza e carga de gás",
    valor: 640,
    dataEnvio: "2026-10-07",
    dataValidade: "2026-10-20",
    diasSemResposta: 7,
    status: "enviado",
    responsavel: "Marcos",
    ultimoContato: null,
    aguardandoFollowUp: true,
  },
];

describe("TabelaOrcamentos", () => {
  it("renderiza uma linha por orçamento", () => {
    const { container } = render(<TabelaOrcamentos orcamentos={orcamentos} />);
    const linhas = container.querySelectorAll("tbody tr");
    expect(linhas).toHaveLength(2);
  });

  it("mostra cliente, valor formatado e status legível", () => {
    const { container } = render(<TabelaOrcamentos orcamentos={orcamentos} />);
    const primeiraLinha = container.querySelector("tbody tr");
    expect(primeiraLinha).toBeTruthy();
    const celulas = within(primeiraLinha as HTMLElement);

    expect(celulas.getByText("Clima Conforto Manutenção")).toBeInTheDocument();
    expect(celulas.getByText("R$ 3.180")).toBeInTheDocument();
    expect(celulas.getByText("Em follow-up")).toBeInTheDocument();
  });

  it("exibe travessão quando não houve contato", () => {
    const { container } = render(<TabelaOrcamentos orcamentos={[orcamentos[1]!]} />);
    expect(container.textContent).toContain("—");
  });

  it("destaca orçamentos aguardando follow-up", () => {
    const { container } = render(<TabelaOrcamentos orcamentos={[orcamentos[0]!]} />);
    const celulaDias = container.querySelector("tbody tr td:nth-child(5)");
    expect(celulaDias?.className).toContain("text-amber-700");
  });
});
