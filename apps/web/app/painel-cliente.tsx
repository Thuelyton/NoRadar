"use client";

import { useCallback, useEffect, useState } from "react";
import type { Painel } from "@radar/shared";
import { buscarPainel, ErroAoCarregarPainel, type ModoSimulacao } from "@/lib/api";
import { formatarMoeda } from "@/lib/formatadores";
import { CartaoIndicador } from "@/componentes/cartao-indicador";
import { AvisoDadosFicticios } from "@/componentes/aviso-ficticios";
import { EstadoCarregando, EstadoErro, EstadoVazio } from "@/componentes/estados";
import { TabelaOrcamentos } from "@/componentes/tabela-orcamentos";

type Estado = "carregando" | "pronto" | "vazio" | "erro";

const DEMONSTRACOES: { rotulo: string; modo?: ModoSimulacao }[] = [
  { rotulo: "Dados" },
  { rotulo: "Carregando", modo: "lento" },
  { rotulo: "Vazio", modo: "vazio" },
  { rotulo: "Erro", modo: "erro" },
];

export function PainelCliente() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [dados, setDados] = useState<Painel | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string>("");
  const [modo, setModo] = useState<ModoSimulacao | undefined>(undefined);

  const carregar = useCallback(async (simulacao?: ModoSimulacao) => {
    setEstado("carregando");
    const controlador = new AbortController();
    try {
      const painel = await buscarPainel({ simular: simulacao, sinal: controlador.signal });
      setDados(painel);
      setEstado(painel.orcamentos.length === 0 ? "vazio" : "pronto");
    } catch (erro) {
      if (controlador.signal.aborted) return;
      setMensagemErro(
        erro instanceof ErroAoCarregarPainel || erro instanceof Error
          ? erro.message
          : "Falha inesperada ao carregar o painel.",
      );
      setEstado("erro");
    }
  }, []);

  useEffect(() => {
    void carregar(modo);
  }, [carregar, modo]);

  const recarregar = () => {
    void carregar(modo);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Painel</h1>
          <p className="text-sm text-zinc-500">
            Visão geral dos orçamentos e do acompanhamento de retorno.
          </p>
        </div>
        <button
          type="button"
          onClick={recarregar}
          disabled={estado === "carregando"}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estado === "carregando" ? "Carregando…" : "Recarregar"}
        </button>
      </header>

      <AvisoDadosFicticios aviso={dados?.aviso} />

      <section aria-label="Demonstrar estados da interface" className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Demonstrar estados:</span>
        {DEMONSTRACOES.map((item) => (
          <button
            key={item.rotulo}
            type="button"
            onClick={() => setModo(item.modo)}
            aria-pressed={(item.modo ?? undefined) === modo}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              (item.modo ?? undefined) === modo
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50",
            ].join(" ")}
          >
            {item.rotulo}
          </button>
        ))}
      </section>

      {estado === "carregando" && <EstadoCarregando />}

      {estado === "erro" && <EstadoErro mensagem={mensagemErro} aoTentarNovamente={recarregar} />}

      {estado === "vazio" && <EstadoVazio />}

      {estado === "pronto" && dados && (
        <div className="space-y-5">
          <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CartaoIndicador
              titulo="Orçamentos pendentes"
              valor={String(dados.resumo.orcamentosPendentes)}
              descricao="Aguardando retorno do cliente"
              tom="amber"
            />
            <CartaoIndicador
              titulo="Contatos realizados"
              valor={String(dados.resumo.contatosRealizados)}
              descricao="Orçamentos com acompanhamento registrado"
            />
            <CartaoIndicador
              titulo="Valor recuperado"
              valor={formatarMoeda(dados.resumo.valorRecuperado)}
              descricao="Simulação com dados fictícios — não é receita real"
              tom="emerald"
            />
            <CartaoIndicador
              titulo="Taxa de conversão do follow-up"
              valor={`${dados.resumo.taxaConversaoPercentual.toLocaleString("pt-BR")}%`}
              descricao={`${dados.resumo.orcamentosRegistrados} orçamentos registrados no período`}
            />
          </section>

          <section id="orcamentos" aria-label="Lista de orçamentos">
            <TabelaOrcamentos orcamentos={dados.orcamentos} />
          </section>
        </div>
      )}
    </div>
  );
}
