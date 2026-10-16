import type { Metadata } from "next";
import { FilaCliente } from "./fila-cliente";

// M3: metadata específica da rota — o título do painel não serve para a fila.
export const metadata: Metadata = {
  title: "Radar — Fila de follow-up (demonstração)",
  description:
    "Fila de follow-up demonstrativa do Radar, com dados fictícios. Produto em validação de mercado — nenhuma venda ou receita real.",
};

export default function PaginaFila() {
  return <FilaCliente />;
}
