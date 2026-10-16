import type { FastifyInstance } from "fastify";
import {
  esquemaFilaFollowUp,
  esquemaRegistroResultado,
  esquemaResultadoRegistrado,
  type FilaFollowUp,
} from "@radar/shared";
import type { OrcamentoRepository } from "../dominio/repositorio-orcamentos.js";
import { AVISO_DADOS_FICTICIOS, PERIODO_DEMO } from "../dados/dados-ficticios.js";

/**
 * Fila de follow-up (demonstração com dados fictícios).
 *
 *   GET  /api/fila                          -> orçamentos pendentes em ordem de urgência
 *   POST /api/orcamentos/:id/resultados     -> registra o resultado SIMULADO de um follow-up
 *   POST /api/demonstracao/reinicializar    -> reinicializa com segurança os dados fictícios
 *
 * O registro altera o estado em memória desta instância da API para que a
 * demonstração mostre o fluxo completo (fila -> resultado -> indicadores
 * recalculados). Nada é persistido e nenhuma mensagem é enviada.
 * Um registro só é aceito em orçamentos ELEGÍVEIS (na fila); id inexistente
 * responde 404 e orçamento fora da fila responde 409 — nunca 200 silencioso.
 */
export async function registrarRotasFila(
  app: FastifyInstance,
  repositorio: OrcamentoRepository,
): Promise<void> {
  app.get<{ Querystring: { simular?: string } }>("/api/fila", async (req, reply) => {
    const simular = req.query.simular;

    if (simular !== undefined && !["vazio", "erro", "lento"].includes(simular)) {
      return reply.code(400).send({
        erro: {
          codigo: "parametro_invalido",
          mensagem: "Use ?simular=vazio, ?simular=erro ou ?simular=lento.",
        },
      });
    }

    if (simular === "erro") {
      return reply.code(500).send({
        erro: {
          codigo: "falha_simulada",
          mensagem: "Falha proposital para demonstrar o estado de erro da interface.",
        },
      });
    }
    if (simular === "lento") {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    const itens = simular === "vazio" ? [] : await repositorio.fila();
    const resumo =
      simular === "vazio"
        ? {
            orcamentosPendentes: 0,
            contatosRealizados: 0,
            valorRecuperado: 0,
            orcamentosRegistrados: 0,
            taxaConversaoPercentual: 0,
            periodo: PERIODO_DEMO,
          }
        : await repositorio.resumo();

    const payload: FilaFollowUp = {
      fonte: "dados_ficticios",
      aviso: AVISO_DADOS_FICTICIOS,
      itens,
      resumo,
    };

    const resultado = esquemaFilaFollowUp.safeParse(payload);
    if (!resultado.success) {
      req.log.error({ issues: resultado.error.issues }, "payload da fila invalido");
      return reply.code(500).send({
        erro: {
          codigo: "payload_invalido",
          mensagem: "O payload da fila não passou na validação de schema.",
        },
      });
    }

    return resultado.data;
  });

  app.post<{ Params: { id: string }; Body: unknown }>(
    "/api/orcamentos/:id/resultados",
    async (req, reply) => {
      const corpo = esquemaRegistroResultado.safeParse(req.body);
      if (!corpo.success) {
        return reply.code(400).send({
          erro: {
            codigo: "registro_invalido",
            mensagem:
              "Corpo inválido. Esperado: { desfecho, canal, data?, observacao? }.",
          },
        });
      }

      const registro = await repositorio.registrarResultado(req.params.id, {
        ...corpo.data,
        data: corpo.data.data ?? new Date().toISOString().slice(0, 10),
      });

      if (registro.situacao === "nao_encontrado") {
        return reply.code(404).send({
          erro: {
            codigo: "orcamento_nao_encontrado",
            mensagem: `Nenhum orçamento com id "${req.params.id}".`,
          },
        });
      }

      if (registro.situacao === "ineligivel") {
        return reply.code(409).send({
          erro: {
            codigo: "orcamento_ineligivel",
            mensagem:
              "Este orçamento não está aguardando follow-up; registre resultado apenas de itens da fila.",
          },
        });
      }

      const payload = {
        fonte: "dados_ficticios",
        orcamento: registro.orcamento,
        resumo: registro.resumo,
      };
      const validado = esquemaResultadoRegistrado.safeParse(payload);
      if (!validado.success) {
        req.log.error({ issues: validado.error.issues }, "payload de resultado invalido");
        return reply.code(500).send({
          erro: {
            codigo: "payload_invalido",
            mensagem: "O payload do resultado não passou na validação de schema.",
          },
        });
      }

      return validado.data;
    },
  );

  /**
   * Reinicialização segura da demonstração: descarta os registros feitos na
   * sessão e devolve a fila restaurada (cópias defensivas da base fictícia).
   */
  app.post("/api/demonstracao/reinicializar", async (req, reply) => {
    await repositorio.reinicializar();

    const payload: FilaFollowUp = {
      fonte: "dados_ficticios",
      aviso: AVISO_DADOS_FICTICIOS,
      itens: await repositorio.fila(),
      resumo: await repositorio.resumo(),
    };

    const resultado = esquemaFilaFollowUp.safeParse(payload);
    if (!resultado.success) {
      req.log.error({ issues: resultado.error.issues }, "payload de reinicio invalido");
      return reply.code(500).send({
        erro: {
          codigo: "payload_invalido",
          mensagem: "O payload da fila reiniciada não passou na validação de schema.",
        },
      });
    }

    return resultado.data;
  });
}
