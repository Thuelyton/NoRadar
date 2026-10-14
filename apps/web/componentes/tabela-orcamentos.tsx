import type { Orcamento } from "@radar/shared";
import {
  CORES_STATUS,
  formatarDias,
  formatarMoeda,
  ROTULOS_STATUS,
  formatarData,
} from "@/lib/formatadores";

export interface TabelaOrcamentosProps {
  orcamentos: Orcamento[];
}

export function TabelaOrcamentos({ orcamentos }: TabelaOrcamentosProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="border-b border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-900">
          Orçamentos <span className="font-normal text-zinc-500">(dados fictícios)</span>
        </caption>
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
            <th scope="col" className="px-4 py-3 font-medium">Serviço</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Valor</th>
            <th scope="col" className="px-4 py-3 font-medium">Enviado em</th>
            <th scope="col" className="px-4 py-3 font-medium">Sem resposta</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Último contato</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orcamentos.map((orcamento) => (
            <tr key={orcamento.id} className="hover:bg-zinc-50">
              <th scope="row" className="px-4 py-3 font-medium text-zinc-900">
                {orcamento.cliente.nome}
                <span className="block text-xs font-normal text-zinc-500">
                  {orcamento.responsavel}
                </span>
              </th>
              <td className="px-4 py-3 text-zinc-700">{orcamento.servico}</td>
              <td className="px-4 py-3 text-right tabular-nums text-zinc-900">
                {formatarMoeda(orcamento.valor)}
              </td>
              <td className="px-4 py-3 text-zinc-700">{formatarData(orcamento.dataEnvio)}</td>
              <td
                className={[
                  "px-4 py-3 tabular-nums",
                  orcamento.aguardandoFollowUp ? "font-medium text-amber-700" : "text-zinc-700",
                ].join(" ")}
              >
                {formatarDias(orcamento.diasSemResposta)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${CORES_STATUS[orcamento.status] ?? "bg-zinc-100 text-zinc-700"}`}
                >
                  {ROTULOS_STATUS[orcamento.status] ?? orcamento.status}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {orcamento.ultimoContato
                  ? `${formatarData(orcamento.ultimoContato.data)} · ${orcamento.ultimoContato.canal}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
