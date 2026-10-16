/**
 * Tipos de domínio do Radar.
 *
 * ⚠️ IMPORTANTE (Fase 1 — Portão de Decisão ABERTO):
 * Estes tipos descrevem o produto planejado. Nada aqui representa resultado real:
 * o Radar ainda NÃO recuperou nenhuma venda nem receita.
 * Os dados que trafegam hoje são fictícios (ver apps/api/src/dados/dados-ficticios.ts).
 */

/** Status do orçamento no funil de recuperação. */
export const STATUS_ORCAMENTO = [
  "enviado",
  "em_followup",
  "respondido",
  "fechado",
  "recusado",
  "expirado",
] as const;
export type StatusOrcamento = (typeof STATUS_ORCAMENTO)[number];

/** Desfecho registrado pelo vendedor ao acompanhar o orçamento. */
export const DESFECHO_RESULTADO = [
  "fechou",
  "recusou",
  "pediu_alteracao",
  "sem_retorno",
  "reativado_manutencao",
] as const;
export type DesfechoResultado = (typeof DESFECHO_RESULTADO)[number];

/** Status de entrega de uma mensagem (espelha os status do canal oficial no futuro). */
export const STATUS_ENVIO = ["pendente", "enviado", "entregue", "lido", "falhou"] as const;
export type StatusEnvio = (typeof STATUS_ENVIO)[number];

export const CANAIS_CONTATO = ["whatsapp", "telefone", "email", "presencial"] as const;
export type CanalContato = (typeof CANAIS_CONTATO)[number];

/** Marca toda resposta da API para que a interface nunca confunda dado real com fictício. */
export const FONTE_DADOS = "dados_ficticios" as const;
export type FonteDados = typeof FONTE_DADOS;

export interface ClienteReferencia {
  nome: string;
  /** Telefone mascarado nos dados fictícios. */
  telefone: string;
}

export interface UltimoContato {
  canal: CanalContato;
  /** Data no formato AAAA-MM-DD. */
  data: string;
  statusEnvio: StatusEnvio;
}

export interface Orcamento {
  id: string;
  cliente: ClienteReferencia;
  servico: string;
  /** Valor em reais (BRL). */
  valor: number;
  /** Data de envio do orçamento ao cliente, AAAA-MM-DD. */
  dataEnvio: string;
  /** Data de validade combinada, AAAA-MM-DD. */
  dataValidade: string;
  /** Dias corridos desde o envio até a data de referência do painel. */
  diasSemResposta: number;
  status: StatusOrcamento;
  responsavel: string;
  ultimoContato: UltimoContato | null;
  /** Indica orçamento que ainda não teve nenhum contato de acompanhamento. */
  aguardandoFollowUp: boolean;
}

export interface ResumoPainel {
  orcamentosPendentes: number;
  contatosRealizados: number;
  /** Soma dos orçamentos fechados após follow-up. NÃO é receita real do Radar. */
  valorRecuperado: number;
  orcamentosRegistrados: number;
  taxaConversaoPercentual: number;
  periodo: { inicio: string; fim: string };
}

export interface Painel {
  fonte: FonteDados;
  aviso: string;
  resumo: ResumoPainel;
  orcamentos: Orcamento[];
}

/** Registro do resultado de um follow-up (entrada do vendedor). */
export interface RegistroResultado {
  desfecho: DesfechoResultado;
  canal: CanalContato;
  /** Data do registro, AAAA-MM-DD. A API preenche com hoje se omitida. */
  data?: string;
  /** Observação livre do vendedor (até 300 caracteres). */
  observacao?: string;
}

/** Payload da fila de follow-up. */
export interface FilaFollowUp {
  fonte: FonteDados;
  aviso: string;
  /** Orçamentos aguardando retorno, ordenados por urgência. */
  itens: Orcamento[];
  /** Indicadores recalculados considerando os resultados registrados. */
  resumo: ResumoPainel;
}

/** Resposta ao registrar o resultado de um follow-up. */
export interface ResultadoRegistrado {
  fonte: FonteDados;
  orcamento: Orcamento;
  /** Resumo recalculado após o registro — os indicadores nunca ficam defasados. */
  resumo: ResumoPainel;
}

/** Erro padronizado da API. */
export interface ErroApi {
  erro: {
    codigo: string;
    mensagem: string;
  };
}
