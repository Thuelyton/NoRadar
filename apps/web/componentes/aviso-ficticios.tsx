export function AvisoDadosFicticios({ aviso }: { aviso?: string }) {
  return (
    <p
      role="note"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"
    >
      <span className="font-semibold">Demonstração:</span>{" "}
      {aviso ??
        "Dados fictícios para demonstração. Nenhuma venda ou receita real foi recuperada pelo Radar — o produto está em validação de mercado."}
    </p>
  );
}
