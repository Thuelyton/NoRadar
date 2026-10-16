"use client";

import { useState } from "react";
import { CANAIS_CONTATO, DESFECHO_RESULTADO } from "@radar/shared";
import { ROTULOS_CANAL, ROTULOS_DESFECHO } from "@/lib/formatadores";

export interface DesfechosItemFilaProps {
  idOrcamento: string;
  nomeCliente: string;
  desabilitado: boolean;
  aoRegistrar: (desfecho: string, canal: string) => void;
}

/**
 * Seletor de resultado simulado de um item da fila.
 * Cada clique envia o registro para a API — a fila e os indicadores são
 * atualizados com a resposta do servidor, nunca com otimismo local.
 */
export function DesfechosItemFila({
  idOrcamento,
  nomeCliente,
  desabilitado,
  aoRegistrar,
}: DesfechosItemFilaProps) {
  const [desfecho, setDesfecho] = useState<string>("sem_retorno");
  const [canal, setCanal] = useState<string>("whatsapp");

  const rotulo = `Registrar resultado de ${nomeCliente}`;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={rotulo}
      data-testid={`desfechos-${idOrcamento}`}
    >
      <label className="sr-only" htmlFor={`desfecho-${idOrcamento}`}>
        Resultado
      </label>
      <select
        id={`desfecho-${idOrcamento}`}
        value={desfecho}
        onChange={(evento) => setDesfecho(evento.target.value)}
        disabled={desabilitado}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-700"
      >
        {DESFECHO_RESULTADO.map((opcao) => (
          <option key={opcao} value={opcao}>
            {ROTULOS_DESFECHO[opcao] ?? opcao}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor={`canal-${idOrcamento}`}>
        Canal do contato
      </label>
      <select
        id={`canal-${idOrcamento}`}
        value={canal}
        onChange={(evento) => setCanal(evento.target.value)}
        disabled={desabilitado}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-700"
      >
        {CANAIS_CONTATO.map((opcao) => (
          <option key={opcao} value={opcao}>
            {ROTULOS_CANAL[opcao] ?? opcao}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => aoRegistrar(desfecho, canal)}
        disabled={desabilitado}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Registrar (simulado)
      </button>
    </div>
  );
}
