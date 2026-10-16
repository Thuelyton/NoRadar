import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MenuLateral } from "@/componentes/menu-lateral";

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children?: ReactNode } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("MenuLateral", () => {
  it("habilita a navegação real para Painel e Fila de follow-up", () => {
    usePathnameMock.mockReturnValue("/");
    render(<MenuLateral />);

    const painel = screen.getByRole("link", { name: /Painel/ });
    const fila = screen.getByRole("link", { name: /Fila de follow-up/ });
    expect(painel).toHaveAttribute("href", "/");
    expect(fila).toHaveAttribute("href", "/fila");
    expect(fila).not.toHaveAttribute("aria-disabled");
    expect(within(fila).queryByText("em breve")).not.toBeInTheDocument();
  });

  it("marca como atual a página aberta", () => {
    usePathnameMock.mockReturnValue("/fila");
    render(<MenuLateral />);

    expect(screen.getByRole("link", { name: /Fila de follow-up/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Painel/ })).not.toHaveAttribute("aria-current");
  });

  it("mantém os itens futuros desabilitados com o selo 'em breve' (não são links)", () => {
    usePathnameMock.mockReturnValue("/");
    render(<MenuLateral />);

    // M2: item "em breve" é um botão DESABILITADO — não navega nem recebe clique.
    const clientes = screen.getByRole("button", { name: /Clientes/ });
    expect(clientes).toBeDisabled();
    expect(clientes).toHaveAttribute("aria-disabled", "true");
    expect(clientes.textContent).toContain("em breve");
    expect(screen.queryByRole("link", { name: /Clientes/ })).not.toBeInTheDocument();
    expect(clientes).not.toHaveAttribute("href");
  });

  it("nenhum item 'em breve' é link clicável", () => {
    usePathnameMock.mockReturnValue("/");
    render(<MenuLateral />);

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/", "/fila"]);
  });

  it("o rodapé usa contraste AA sobre o fundo escuro (zinc-400)", () => {
    usePathnameMock.mockReturnValue("/");
    const { container } = render(<MenuLateral />);

    const rodape = container.querySelector("aside > div:last-child");
    expect(rodape?.className).toContain("text-zinc-400");
    expect(rodape?.className).not.toContain("text-zinc-500");
  });
});
