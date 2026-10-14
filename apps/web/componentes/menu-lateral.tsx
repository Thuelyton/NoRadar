const ITENS = [
  { rotulo: "Painel", href: "#painel", ativo: true, emBreve: false },
  { rotulo: "Fila de follow-up", href: "#fila", ativo: false, emBreve: true },
  { rotulo: "Orçamentos", href: "#orcamentos", ativo: false, emBreve: true },
  { rotulo: "Clientes", href: "#clientes", ativo: false, emBreve: true },
  { rotulo: "Resultados", href: "#resultados", ativo: false, emBreve: true },
  { rotulo: "Configurações", href: "#config", ativo: false, emBreve: true },
];

export function MenuLateral() {
  return (
    <aside
      className="flex h-full w-full flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 md:w-60 md:shrink-0"
      aria-label="Navegação principal"
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-zinc-950"
        >
          R
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Radar</p>
          <p className="text-[11px] text-zinc-400">Recuperação de orçamentos</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {ITENS.map((item) => (
          <a
            key={item.rotulo}
            href={item.href}
            aria-current={item.ativo ? "page" : undefined}
            aria-disabled={item.emBreve || undefined}
            className={[
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              item.ativo
                ? "bg-emerald-500/15 font-medium text-emerald-300"
                : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
              item.emBreve ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            <span>{item.rotulo}</span>
            {item.emBreve && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                em breve
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="border-t border-zinc-800 px-5 py-4 text-[11px] leading-relaxed text-zinc-500">
        Fase 1 — produto em <span className="text-amber-400">validação de mercado</span>.
        Nenhuma integração real configurada.
      </div>
    </aside>
  );
}
