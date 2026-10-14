import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { OrcamentoRepository } from "./dominio/repositorio-orcamentos.js";
import { registrarRotasPainel } from "./rotas/painel.js";

export interface OpcoesApp {
  repositorio: OrcamentoRepository;
  /** Nível de log do Fastify (passe "silent" nos testes). */
  nivelLog?: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
}

/**
 * Monta a aplicação HTTP sem escutá-la.
 * Separar montagem de escuta permite testar com `app.inject()` sem rede.
 */
export async function criarApp(opcoes: OpcoesApp): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: opcoes.nivelLog ?? "info" } });

  // Em desenvolvimento a web roda em outra porta. Em produção, restringir ao domínio real.
  await app.register(cors, {
    origin: process.env.CORS_ORIGENS?.split(",") ?? ["http://localhost:3000"],
  });

  await registrarRotasPainel(app, opcoes.repositorio);

  app.setErrorHandler((erro, _req, reply) => {
    app.log.error(erro);
    reply.code(500).send({
      erro: {
        codigo: "erro_interno",
        mensagem: "Falha inesperada ao processar a requisição.",
      },
    });
  });

  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({
      erro: { codigo: "nao_encontrado", mensagem: "Rota inexistente." },
    });
  });

  return app;
}
