"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilaFollowUp, Orcamento, RegistroResultado } from "@radar/shared";
import {
  buscarFila,
  ErroAoCarregarPainel,
  reiniciarDemonstracao,
  registrarResultado,
  type ModoSimulacao,
} from "@/lib/api";
import {
  formatarDias,
  formatarData,
  formatarMoeda,
  ROTULOS_CANAL,
  ROTULOS_DESFECHO,
} from "@/lib/formatadores";
import { AvisoDadosFicticios } from "@/componentes/aviso-ficticios";
import { CartaoIndicador } from "@/componentes/cartao-indicador";
import { EstadoCarregando, EstadoErro, EstadoVazio } from "@/componentes/estados";
import { DesfechosItemFila } from "@/componentes/item-fila";

type Estado = "carregando" | "pronto" | "vazio" | "erro";

const DEMONSTRACOES: { rotulo: string; modo?: ModoSimulacao }[] = [
  { rotulo: "Dados" },
  { rotulo: "Carregando", modo: "lento" },
  { rotulo: "Vazio", modo: "vazio" },
  { rotulo: "Erro", modo: "erro" },
];

export function FilaCliente() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [fila, setFila] = useState<FilaFollowUp | null>(null);
  const [mensagemErro, setMensagemErro] = useState("");
  const [registrando, setRegistrando] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [modo, setModo] = useState<ModoSimulacao | undefined>(undefined);

  const tratarFalha = useCallback((erro: unknown) => {
    setMensagemErro(
      erro instanceof ErroAoCarregarPainel || erro instanceof Error
        ? erro.message
        : "Falha inesperada ao carregar a fila.",
    );
    setEstado("erro");
  }, []);

  const carregar = useCallback(
    async (simulacao?: ModoSimulacao) => {
      setEstado("carregando");
      setFeedback(null);
      const controlador = new AbortController();
      try {
        const dados = await buscarFila({ simular: simulacao, sinal: controlador.signal });
        setFila(dados);
        setEstado(dados.itens.length === 0 ? "vazio" : "pronto");
      } catch (erro) {
        if (controlador.signal.aborted) return;
        tratarFalha(erro);
      }
    },
    [tratarFalha],
  );

  useEffect(() => {
    void carregar(modo);
  }, [carregar, modo]);

  // A1: a fila esvaziada APÓS os registros também é estado vazio — não pode
  // renderizar uma lista sem itens nem travar em "pronto" sem conteúdo.
  const semItens = fila !== null && fila.itens.length === 0;
  const mostrarVazio =
    (estado === "vazio" && semItens) || (estado === "pronto" && semItens);

  const reiniciar = async () => {
    setEstado("carregando");
    setFeedback(null);
    setModo(undefined);
    try {
      const restaurada = await reiniciarDemonstracao();
      setFila(restaurada);
      setEstado(restaurada.itens.length === 0 ? "vazio" : "pronto");
      setFeedback("Demonstração reiniciada: dados fictícios restaurados (simulação).");
    } catch (erro) {
      tratarFalha(erro);
    }
  };

  const aoRegistrar = async (
    orcamento: Orcamento,
    desfecho: RegistroResultado["desfecho"],
    canal: RegistroResultado["canal"],
  ) => {
    setRegistrando(orcamento.id);
    setFeedback(null);
    try {
      const resultado = await registrarResultado(orcamento.id, { desfecho, canal });
      // O servidor devolve o orçamento atualizado e o resumo recalculado —
      // a interface só espelha: itens que continuam pendentes ficam na fila.
      setFila((atual) =>
        atual
          ? {
              ...atual,
              itens: resultado.orcamento.aguardandoFollowUp
                ? atual.itens.map((o) =>
                    o.id === resultado.orcamento.id ? resultado.orcamento : o,
                  )
                : atual.itens.filter((o) => o.id !== resultado.orcamento.id),
              resumo: resultado.resumo,
            }
          : atual,
      );
      setFeedback(
        `"${resultado.orcamento.cliente.nome}" registrado como ${ROTULOS_DESFECHO[desfecho] ?? desfecho} (simulação).`,
      );
    } catch (erro) {
      // Ex.: HTTP 409 (orçamento fora da fila) chega aqui com a mensagem padronizada.
      setFeedback(
        erro instanceof Error ? erro.message : "Falha ao registrar o resultado (simulação).",
      );
    } finally {
      setRegistrando(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Fila de follow-up</h1>
          <p className="text-sm text-zinc-500">
            Orçamentos que precisam de retorno, do mais urgente para o menos urgente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void carregar(modo)}
          disabled={estado === "carregando"}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estado === "carregando" ? "Carregando…" : "Recarregar"}
        </button>
      </header>

      <AvisoDadosFicticios aviso={fila?.aviso} />

      {/* B1: controles de demonstração — simulação de estados + reinício seguro. */}
      <section
        aria-label="Demonstrar estados da fila"
        className="flex flex-wrap items-center gap-2"
      >
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
        <button
          type="button"
          onClick={() => void reiniciar()}
          disabled={estado === "carregando"}
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reiniciar demonstração
        </button>
      </section>

      {estado === "carregando" && <EstadoCarregando rotulo="Carregando fila…" />}

      {estado === "erro" && (
        <EstadoErro
          titulo="Não foi possível carregar a fila"
          mensagem={mensagemErro}
          aoTentarNovamente={() => void carregar(modo)}
        />
      )}

      {fila && (estado === "pronto" || estado === "vazio") && (
        <div className="space-y-5">
          <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CartaoIndicador
              titulo="Na fila agora"
              valor={String(fila.itens.length)}
              descricao="Aguardando retorno do cliente"
              tom="amber"
            />
            <CartaoIndicador
              titulo="Contatos realizados"
              valor={String(fila.resumo.contatosRealizados)}
              descricao="Orçamentos com acompanhamento registrado"
            />
            <CartaoIndicador
              titulo="Valor recuperado"
              valor={formatarMoeda(fila.resumo.valorRecuperado)}
              descricao="Simulação com dados fictícios — não é receita real"
              tom="emerald"
            />
            <CartaoIndicador
              titulo="Taxa de conversão do follow-up"
              valor={`${fila.resumo.taxaConversaoPercentual.toLocaleString("pt-BR")}%`}
              descricao={`${fila.resumo.orcamentosRegistrados} orçamentos registrados no período`}
            />
          </section>

          {feedback && (
            <p
              role="status"
              className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900"
            >
              {feedback}
            </p>
          )}

          {mostrarVazio ? (
            <EstadoVazio
              mensagem={
                estado === "pronto"
                  ? "Fila concluída nesta demonstração"
                  : "Nenhum orçamento na fila"
              }
              descricao={
                estado === "pronto"
                  ? "Todos os orçamentos da fila receberam um resultado simulado. Use “Reiniciar demonstração” para trazer os dados fictícios de volta."
                  : "A fila está vazia nesta demonstração. Use “Reiniciar demonstração” para recarregar os dados fictícios."
              }
            />
          ) : (
            <ul className="space-y-3">
              {fila.itens.map((orcamento, indice) => (
                <li
                  key={orcamento.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium text-zinc-900">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                          {indice + 1}
                        </span>
                        {orcamento.cliente.nome}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">{orcamento.servico}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Enviado há {formatarDias(orcamento.diasSemResposta)} ·{" "}
                        {formatarMoeda(orcamento.valor)} · responsável: {orcamento.responsavel}
                        {orcamento.ultimoContato &&
                          ` · último contato: ${formatarData(orcamento.ultimoContato.data)} (${ROTULOS_CANAL[orcamento.ultimoContato.canal] ?? orcamento.ultimoContato.canal})`}
                      </p>
                    </div>
                    <DesfechosItemFila
                      idOrcamento={orcamento.id}
                      nomeCliente={orcamento.cliente.nome}
                      desabilitado={registrando !== null}
                      aoRegistrar={(desfecho, canal) =>
                        void aoRegistrar(
                          orcamento,
                          desfecho as RegistroResultado["desfecho"],
                          canal as RegistroResultado["canal"],
                        )
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-zinc-500">
            Registrar um resultado é uma <strong>simulação</strong>: o item sai da fila e os
            indicadores são recalculados apenas nesta sessão de demonstração. Nenhuma mensagem é
            enviada e nada é persistido.
          </p>
        </div>
      )}
    </div>
  );
}
