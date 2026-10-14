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

const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data esperada no formato AAAA-MM-DD");

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

export const esquemaErroApi = z.object({
  erro: z.object({
    codigo: z.string().min(1),
    mensagem: z.string().min(1),
  }),
});

export type OrcamentoValidado = z.infer<typeof esquemaOrcamento>;
export type ResumoPainelValidado = z.infer<typeof esquemaResumoPainel>;
export type PainelValidado = z.infer<typeof esquemaPainel>;
