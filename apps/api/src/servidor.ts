import { criarApp } from "./app.js";
import { RepositorioOrcamentosMemoria } from "./dados/repositorio-memoria.js";

/**
 * Ponto de entrada da API.
 * Hoje usa repositório em memória com dados fictícios (decisão D2).
 * A troca por PostgreSQL/Drizzle acontece sem alterar este arquivo além do
 * construtor do repositório — as rotas dependem da interface, não da classe.
 */
async function main(): Promise<void> {
  const porta = Number(process.env.API_PORTA ?? 3001);
  const host = process.env.API_HOST ?? "127.0.0.1";

  const app = await criarApp({
    repositorio: new RepositorioOrcamentosMemoria(),
  });

  try {
    await app.listen({ port: porta, host });
    app.log.info(
      "Radar API no ar — fonte de dados MOCKADA, nenhuma integração externa configurada.",
    );
  } catch (erro) {
    app.log.error(erro);
    process.exit(1);
  }
}

void main();
