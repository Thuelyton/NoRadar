/** Estados da interface: carregando, vazio e erro. */

export function EstadoCarregando() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Carregando painel…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-zinc-200" />
            <div className="mt-4 h-7 w-20 rounded bg-zinc-200" />
            <div className="mt-3 h-3 w-32 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
      <div className="mt-6 h-72 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="h-3 w-40 rounded bg-zinc-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export interface EstadoVazioProps {
  mensagem?: string;
  descricao?: string;
}

export function EstadoVazio({
  mensagem = "Nenhum orçamento por aqui",
  descricao = "Quando a empresa registrar orçamentos, eles aparecem nesta lista.",
}: EstadoVazioProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <p className="text-3xl" aria-hidden="true">
        🗂️
      </p>
      <h3 className="mt-3 text-base font-semibold text-zinc-900">{mensagem}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">{descricao}</p>
    </div>
  );
}

export interface EstadoErroProps {
  mensagem: string;
  aoTentarNovamente?: () => void;
}

export function EstadoErro({ mensagem, aoTentarNovamente }: EstadoErroProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
    >
      <p className="text-3xl" aria-hidden="true">
        ⚠️
      </p>
      <h3 className="mt-3 text-base font-semibold text-rose-900">
        Não foi possível carregar o painel
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-rose-700">{mensagem}</p>
      {aoTentarNovamente && (
        <button
          type="button"
          onClick={aoTentarNovamente}
          className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
