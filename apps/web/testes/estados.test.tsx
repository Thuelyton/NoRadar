import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EstadoCarregando, EstadoErro, EstadoVazio } from "@/componentes/estados";

describe("EstadoCarregando", () => {
  it("anuncia o carregamento para leitores de tela", () => {
    render(<EstadoCarregando />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando painel…");
  });

  it("aceita rótulo configurável (M1)", () => {
    render(<EstadoCarregando rotulo="Carregando fila…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando fila…");
    expect(screen.getByRole("status")).not.toHaveTextContent("Carregando painel…");
  });
});

describe("EstadoVazio", () => {
  it("mostra mensagem padrão quando não há orçamentos", () => {
    render(<EstadoVazio />);
    expect(screen.getByRole("heading", { name: "Nenhum orçamento por aqui" })).toBeInTheDocument();
  });

  it("aceita mensagem customizada", () => {
    render(<EstadoVazio mensagem="Tudo limpo por aqui" />);
    expect(screen.getByRole("heading", { name: "Tudo limpo por aqui" })).toBeInTheDocument();
  });
});

describe("EstadoErro", () => {
  it("expõe a mensagem de erro com papel de alerta", () => {
    render(<EstadoErro mensagem="A API respondeu com erro (HTTP 500)." />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("A API respondeu com erro (HTTP 500).")).toBeInTheDocument();
  });

  it("aceita título configurável (M1)", () => {
    render(<EstadoErro titulo="Não foi possível carregar a fila" mensagem="Falha" />);
    expect(
      screen.getByRole("heading", { name: "Não foi possível carregar a fila" }),
    ).toBeInTheDocument();
  });

  it("usa título genérico do painel por padrão", () => {
    render(<EstadoErro mensagem="Falha" />);
    expect(
      screen.getByRole("heading", { name: "Não foi possível carregar o painel" }),
    ).toBeInTheDocument();
  });

  it("executa a ação de tentar novamente ao clicar", async () => {
    const aoTentarNovamente = vi.fn();
    render(<EstadoErro mensagem="Falha" aoTentarNovamente={aoTentarNovamente} />);

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(aoTentarNovamente).toHaveBeenCalledTimes(1);
  });

  it("não mostra botão de nova tentativa quando não há ação", () => {
    render(<EstadoErro mensagem="Falha" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
