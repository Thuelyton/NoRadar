import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartaoIndicador } from "@/componentes/cartao-indicador";

describe("CartaoIndicador", () => {
  it("renderiza título, valor e descrição", () => {
    render(
      <CartaoIndicador
        titulo="Orçamentos pendentes"
        valor="6"
        descricao="Aguardando retorno do cliente"
      />,
    );

    expect(screen.getByText("Orçamentos pendentes")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Aguardando retorno do cliente")).toBeInTheDocument();
  });

  it("marca o valor como demonstrativo para não ser lido como resultado real", () => {
    render(
      <CartaoIndicador titulo="Valor recuperado" valor="R$ 8.240" descricao="Simulação" />,
    );
    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("permite ocultar a marcação de demonstração quando o dado for real", () => {
    render(
      <CartaoIndicador titulo="X" valor="1" descricao="Y" demonstrativo={false} />,
    );
    expect(screen.queryByText("demo")).not.toBeInTheDocument();
  });
});
