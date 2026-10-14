import type { Orcamento, ResumoPainel } from "@radar/shared";

/**
 * Contrato de acesso a orçamentos.
 *
 * Motivo da existência: a decisão D2 (2026-10-14) determinou que, nesta fase,
 * a camada de dados é MOCKADA. Qualquer código que precise de orçamentos deve
 * depender desta interface — e não da implementação — para que a troca por
 * PostgreSQL/Drizzle (Fase 2/3) não altere as rotas nem a interface web.
 */
export interface OrcamentoRepository {
  /** Lista os orçamentos do período, ordenados por urgência de follow-up. */
  listar(): Promise<Orcamento[]>;
  /** Agrega os indicadores demonstrativos do painel. */
  resumo(): Promise<ResumoPainel>;
}

/**
 * Calcula o resumo do painel a partir de uma lista de orçamentos.
 * Função pura (sem I/O) para ser testável sem banco e sem HTTP.
 *
 * ⚠️ "valorRecuperado" é uma SIMULAÇÃO com dados fictícios.
 * O Radar ainda não recuperou receita real — produto em validação de mercado.
 */
export function calcularResumo(
  orcamentos: Orcamento[],
  periodo: { inicio: string; fim: string },
): ResumoPainel {
  const pendentes = orcamentos.filter(
    (o) => o.status === "enviado" || o.status === "em_followup",
  );
  const comContato = orcamentos.filter((o) => o.ultimoContato !== null);
  const fechados = orcamentos.filter(
    (o) => o.status === "fechado" && o.ultimoContato !== null,
  );

  const taxa =
    comContato.length === 0
      ? 0
      : Math.round((fechados.length / comContato.length) * 1000) / 10;

  return {
    orcamentosPendentes: pendentes.length,
    contatosRealizados: comContato.length,
    valorRecuperado: fechados.reduce((total, o) => total + o.valor, 0),
    orcamentosRegistrados: orcamentos.length,
    taxaConversaoPercentual: taxa,
    periodo,
  };
}
