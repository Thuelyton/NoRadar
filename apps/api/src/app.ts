import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { OrcamentoRepository } from "./dominio/repositorio-orcamentos.js";
import { registrarRotasPainel } from "./rotas/painel.js";
import { registrarRotasFila } from "./rotas/fila.js";

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
  await registrarRotasFila(app, opcoes.repositorio);

  app.setErrorHandler((erro: FastifyError, _req, reply) => {
    app.log.error(erro);

    // A3: JSON malformado (ou vazio) com content-type application/json é um
    // erro do CLIENTE — responde 400 padronizado, nunca 500 genérico.
    const codigoFastify = typeof erro.code === "string" ? erro.code : "";
    const jsonMalformado =
      codigoFastify === "FST_ERR_CTP_INVALID_JSON_BODY" ||
      codigoFastify === "FST_ERR_CTP_EMPTY_JSON_BODY";

    if (erro.statusCode === 400) {
      return reply.code(400).send({
        erro: {
          codigo: jsonMalformado ? "json_invalido" : "requisicao_invalida",
          mensagem: jsonMalformado
            ? "Corpo JSON malformado. Envie um JSON válido com content-type application/json."
            : "Requisição inválida. Verifique o corpo, os parâmetros e o cabeçalho content-type.",
        },
      });
    }

    return reply.code(500).send({
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
