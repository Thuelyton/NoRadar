import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MenuLateral } from "@/componentes/menu-lateral";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar — Painel (demonstração)",
  description:
    "Painel demonstrativo do Radar com dados fictícios. Produto em validação de mercado.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col md:flex-row">
          <MenuLateral />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
