import type { FastifyInstance } from "fastify";
import { esquemaPainel, type Painel } from "@radar/shared";
import type { OrcamentoRepository } from "../dominio/repositorio-orcamentos.js";
import { AVISO_DADOS_FICTICIOS, PERIODO_DEMO } from "../dados/dados-ficticios.js";

/**
 * Modos de demonstração dos estados da interface.
 * São OPÇÕES DE DEMO, não comportamento de produção.
 *
 *   ?simular=vazio  -> lista vazia (demonstra estado "vazio")
 *   ?simular=erro   -> falha 500 (demonstra estado de erro)
 *   ?simular=lento  -> 2,5 s de latência (demonstra estado de carregamento)
 */
const MODOS = new Set(["vazio", "erro", "lento"]);

export async function registrarRotasPainel(
  app: FastifyInstance,
  repositorio: OrcamentoRepository,
): Promise<void> {
  app.get("/api/saude", async () => ({
    status: "ok",
    servico: "radar-api",
    ambiente: process.env.NODE_ENV ?? "development",
    fonte_de_dados: "mockada (decisao D2 — 2026-10-14)",
    integracoes_configuradas: [],
  }));

  app.get<{ Querystring: { simular?: string } }>("/api/painel", async (req, reply) => {
    const simular = req.query.simular;

    if (simular !== undefined && !MODOS.has(simular)) {
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

    const orcamentos = simular === "vazio" ? [] : await repositorio.listar();
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

    const payload: Painel = {
      fonte: "dados_ficticios",
      aviso: AVISO_DADOS_FICTICIOS,
      resumo,
      orcamentos,
    };

    const resultado = esquemaPainel.safeParse(payload);
    if (!resultado.success) {
      // Defesa: se o payload violar o contrato, falha alto em vez de servir dado quebrado.
      req.log.error({ issues: resultado.error.issues }, "payload do painel invalido");
      return reply.code(500).send({
        erro: {
          codigo: "payload_invalido",
          mensagem: "O payload do painel não passou na validação de schema.",
        },
      });
    }

    return resultado.data;
  });
}
