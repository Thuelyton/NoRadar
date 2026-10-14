/** Formatação pt-BR usada na interface. */

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatarMoeda(valor: number): string {
  return formatoMoeda.format(valor);
}

/** Recebe data ISO (AAAA-MM-DD) e devolve dd/mm/aaaa. */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return iso;
  return formatoData.format(new Date(Date.UTC(ano, mes - 1, dia)));
}

export function formatarDias(dias: number): string {
  if (dias === 0) return "hoje";
  if (dias === 1) return "1 dia";
  return `${dias} dias`;
}

export const ROTULOS_STATUS: Record<string, string> = {
  enviado: "Enviado",
  em_followup: "Em follow-up",
  respondido: "Respondido",
  fechado: "Fechado",
  recusado: "Recusado",
  expirado: "Expirado",
};

/** Classes Tailwind por status (usadas em tabelas e cartões). */
export const CORES_STATUS: Record<string, string> = {
  enviado: "bg-slate-100 text-slate-700",
  em_followup: "bg-amber-100 text-amber-800",
  respondido: "bg-sky-100 text-sky-800",
  fechado: "bg-emerald-100 text-emerald-800",
  recusado: "bg-rose-100 text-rose-800",
  expirado: "bg-zinc-200 text-zinc-700",
};
