import { z } from "zod";
import {
  CANAIS_CONTATO,
  DESFECHO_RESULTADO,
  STATUS_ENVIO,
  STATUS_ORCAMENTO,
} from "./tipos.js";

/**
 * Schemas Zod: única fonte de validação dos dados que cruzam a fronteira
 * API <-> Web. Servem também como documentação executável do contrato.
 */

/** Faixa de datas plausível para o domínio (evita 0001-01-01 ou 9999-12-31 por engano). */
export const FAIXA_DATA_PLAUSIVEL = {
  minimo: "2000-01-01",
  maximo: "2100-12-31",
} as const;

/** Confere se a data existe no calendário (rejeita 2026-02-30, por exemplo). */
function existeNoCalendario(valor: string): boolean {
  const [ano, mes, dia] = valor.split("-").map(Number);
  if (!ano || !mes || !dia) return false;
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

function instante(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/**
 * Data no formato AAAA-MM-DD, que exista no calendário e esteja dentro da
 * faixa plausível (2000-01-01 a 2100-12-31). Aplicada a TODAS as datas que
 * cruzam a fronteira API <-> Web, inclusive a data de um registro de resultado.
 */
export const dataIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "data esperada no formato AAAA-MM-DD")
  .refine(existeNoCalendario, "data inexistente no calendário")
  .refine(
    (valor) =>
      instante(valor) >= instante(FAIXA_DATA_PLAUSIVEL.minimo) &&
      instante(valor) <= instante(FAIXA_DATA_PLAUSIVEL.maximo),
    `data fora da faixa plausível (${FAIXA_DATA_PLAUSIVEL.minimo} a ${FAIXA_DATA_PLAUSIVEL.maximo})`,
  );

export const esquemaStatusOrcamento = z.enum(STATUS_ORCAMENTO);
export const esquemaDesfecho = z.enum(DESFECHO_RESULTADO);
export const esquemaStatusEnvio = z.enum(STATUS_ENVIO);
export const esquemaCanal = z.enum(CANAIS_CONTATO);

export const esquemaCliente = z.object({
  nome: z.string().min(1),
  telefone: z.string().min(1),
});

export const esquemaUltimoContato = z.object({
  canal: esquemaCanal,
  data: dataIso,
  statusEnvio: esquemaStatusEnvio,
});

export const esquemaOrcamento = z.object({
  id: z.string().min(1),
  cliente: esquemaCliente,
  servico: z.string().min(1),
  valor: z.number().nonnegative(),
  dataEnvio: dataIso,
  dataValidade: dataIso,
  diasSemResposta: z.number().int().nonnegative(),
  status: esquemaStatusOrcamento,
  responsavel: z.string().min(1),
  ultimoContato: esquemaUltimoContato.nullable(),
  aguardandoFollowUp: z.boolean(),
});

export const esquemaResumoPainel = z.object({
  orcamentosPendentes: z.number().int().nonnegative(),
  contatosRealizados: z.number().int().nonnegative(),
  valorRecuperado: z.number().nonnegative(),
  orcamentosRegistrados: z.number().int().nonnegative(),
  taxaConversaoPercentual: z.number().nonnegative(),
  periodo: z.object({ inicio: dataIso, fim: dataIso }),
});

export const esquemaPainel = z.object({
  fonte: z.literal("dados_ficticios"),
  aviso: z.string(),
  resumo: esquemaResumoPainel,
  orcamentos: z.array(esquemaOrcamento),
});

export const esquemaRegistroResultado = z.object({
  desfecho: esquemaDesfecho,
  canal: esquemaCanal,
  data: dataIso.optional(),
  observacao: z.string().max(300).optional(),
});

export const esquemaFilaFollowUp = z.object({
  fonte: z.literal("dados_ficticios"),
  aviso: z.string(),
  itens: z.array(esquemaOrcamento),
  resumo: esquemaResumoPainel,
});

export const esquemaResultadoRegistrado = z.object({
  fonte: z.literal("dados_ficticios"),
  orcamento: esquemaOrcamento,
  resumo: esquemaResumoPainel,
});

export const esquemaErroApi = z.object({
  erro: z.object({
    codigo: z.string().min(1),
    mensagem: z.string().min(1),
  }),
});

export type OrcamentoValidado = z.infer<typeof esquemaOrcamento>;
export type ResumoPainelValidado = z.infer<typeof esquemaResumoPainel>;
export type PainelValidado = z.infer<typeof esquemaPainel>;
export type RegistroResultadoValidado = z.infer<typeof esquemaRegistroResultado>;
export type FilaFollowUpValidada = z.infer<typeof esquemaFilaFollowUp>;
export type ResultadoRegistradoValidado = z.infer<typeof esquemaResultadoRegistrado>;
