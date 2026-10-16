import type {
  DesfechoResultado,
  Orcamento,
  RegistroResultado,
  ResumoPainel,
  StatusOrcamento,
} from "@radar/shared";

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
  /** Lista apenas os orçamentos aguardando follow-up, em ordem de urgência. */
  fila(): Promise<Orcamento[]>;
  /** Agrega os indicadores demonstrativos do painel. */
  resumo(): Promise<ResumoPainel>;
  /**
   * Registra o resultado simulado de um follow-up. A situação discriminada
   * permite à rota responder 404 (id inexistente), 409 (orçamento existente,
   * porém fora da fila — não elegível para follow-up) ou 200 (registrado).
   */
  registrarResultado(id: string, registro: RegistroResultado): Promise<ResultadoRegistro>;
  /**
   * Reinicialização SEGURA dos dados da demonstração: restaura o estado base
   * com cópias defensivas, sem compartilhar referências com a base original.
   */
  reinicializar(): Promise<void>;
}

/**
 * Resultado do registro, discriminado pela situação:
 * - `registrado`: orçamento existente e ELEGÍVEL teve o resultado aplicado;
 * - `nao_encontrado`: nenhum orçamento com o id informado (resposta HTTP 404);
 * - `ineligivel`: orçamento existe, mas não está na fila — não pode receber
 *   registro de resultado (resposta HTTP 409).
 */
export type ResultadoRegistro =
  | { situacao: "registrado"; orcamento: Orcamento; resumo: ResumoPainel }
  | { situacao: "nao_encontrado" }
  | { situacao: "ineligivel"; orcamento: Orcamento };

/**
 * Ordenação da fila diária (arquitetura.md, seção 4.3):
 * 1) mais dias sem resposta primeiro; 2) maior valor primeiro.
 * Função pura para ser testável sem banco e sem HTTP.
 */
export function ordenarPorUrgencia(orcamentos: Orcamento[]): Orcamento[] {
  return [...orcamentos].sort(
    (a, b) => b.diasSemResposta - a.diasSemResposta || b.valor - a.valor,
  );
}

/** Status que ainda precisam de retorno e por isso entram na fila. */
export function estaNaFila(orcamento: Orcamento): boolean {
  return orcamento.status === "enviado" || orcamento.status === "em_followup";
}

/**
 * Mapeia o desfecho registrado pelo vendedor para o novo status do orçamento.
 * `sem_retorno` e `pediu_alteracao` mantêm o item na fila; os demais o retiram.
 */
export function statusAposDesfecho(
  desfecho: DesfechoResultado,
  atual: StatusOrcamento,
): StatusOrcamento {
  switch (desfecho) {
    case "fechou":
      return "fechado";
    case "recusou":
      return "recusado";
    case "pediu_alteracao":
      return "em_followup";
    case "reativado_manutencao":
      return "respondido";
    case "sem_retorno":
      // Segunda tentativa sem resposta: continua na fila, mais urgente no status.
      return atual === "enviado" ? "em_followup" : atual;
  }
}

/** Aplica o resultado a um orçamento, imutavelmente (devolve uma nova cópia). */
export function aplicarResultado(
  orcamento: Orcamento,
  registro: RegistroResultado,
): Orcamento {
  const status = statusAposDesfecho(registro.desfecho, orcamento.status);
  return {
    ...orcamento,
    status,
    aguardandoFollowUp: estaNaFila({ ...orcamento, status }),
    ultimoContato: {
      canal: registro.canal,
      data: registro.data ?? new Date().toISOString().slice(0, 10),
      statusEnvio: "enviado",
    },
  };
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
