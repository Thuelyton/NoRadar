const TONS = {
  slate: "border-zinc-200 bg-white",
  amber: "border-amber-200 bg-amber-50/60",
  emerald: "border-emerald-200 bg-emerald-50/60",
} as const;

export interface CartaoIndicadorProps {
  titulo: string;
  valor: string;
  descricao: string;
  tom?: keyof typeof TONS;
  /** Marcado como dado fictício para não ser lido como resultado real. */
  demonstrativo?: boolean;
}

export function CartaoIndicador({
  titulo,
  valor,
  descricao,
  tom = "slate",
  demonstrativo = true,
}: CartaoIndicadorProps) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${TONS[tom]}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-600">{titulo}</h3>
        {demonstrativo && (
          <span
            className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500"
            title="Valor de demonstração, não é resultado real do Radar"
          >
            demo
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">{valor}</p>
      <p className="mt-1 text-xs text-zinc-500">{descricao}</p>
    </article>
  );
}
