import { esquemaPainel, type Painel } from "@radar/shared";

export type ModoSimulacao = "vazio" | "erro" | "lento";

export class ErroAoCarregarPainel extends Error {
  readonly codigo: string;

  constructor(mensagem: string, codigo = "erro_desconhecido") {
    super(mensagem);
    this.name = "ErroAoCarregarPainel";
    this.codigo = codigo;
  }
}

const URL_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

const TIMEOUT_MS = 10_000;

export interface OpcoesBuscaPainel {
  simular?: ModoSimulacao;
  sinal?: AbortSignal;
  /** Sobrescreve a URL base (usado em testes). */
  urlBase?: string;
}

/**
 * Busca o painel na API e valida a resposta com o schema compartilhado.
 * Qualquer resposta fora do contrato vira erro — a interface nunca renderiza
 * dado que não passou na validação.
 */
export async function buscarPainel(opcoes: OpcoesBuscaPainel = {}): Promise<Painel> {
  const base = (opcoes.urlBase ?? URL_BASE).replace(/\/$/, "");
  const url = new URL(`${base}/api/painel`);
  if (opcoes.simular) url.searchParams.set("simular", opcoes.simular);

  const controlador = new AbortController();
  const tempo = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  opcoes.sinal?.addEventListener("abort", () => controlador.abort());

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      signal: controlador.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ErroAoCarregarPainel(
      "Não foi possível falar com a API do Radar. Verifique se ela está em execução.",
      "api_inacessivel",
    );
  } finally {
    clearTimeout(tempo);
  }

  if (!resposta.ok) {
    let codigo = `http_${resposta.status}`;
    let mensagem = `A API respondeu com erro (HTTP ${resposta.status}).`;
    try {
      const corpo = (await resposta.json()) as { erro?: { codigo?: string; mensagem?: string } };
      if (corpo.erro?.codigo) codigo = corpo.erro.codigo;
      if (corpo.erro?.mensagem) mensagem = corpo.erro.mensagem;
    } catch {
      // corpo não-JSON: mantém a mensagem genérica
    }
    throw new ErroAoCarregarPainel(mensagem, codigo);
  }

  const dados: unknown = await resposta.json();
  const validado = esquemaPainel.safeParse(dados);
  if (!validado.success) {
    throw new ErroAoCarregarPainel(
      "A resposta da API não corresponde ao contrato esperado.",
      "schema_invalido",
    );
  }

  return validado.data;
}
