import type { Orcamento, ResumoPainel } from "@radar/shared";
import {
  calcularResumo,
  type OrcamentoRepository,
} from "../dominio/repositorio-orcamentos.js";
import { ORCAMENTOS_FICTICIOS, PERIODO_DEMO } from "./dados-ficticios.js";

export interface OpcoesRepositorioMemoria {
  orcamentos?: Orcamento[];
  /** Latência simulada em ms (0 = imediato). */
  atrasoMs?: number;
}

/**
 * Implementação em memória do contrato `OrcamentoRepository`.
 * Dados fictícios, sem banco de dados (decisão D2 — 2026-10-14).
 *
 * Ordenação igual à prevista na fila diária (arquitetura.md, seção 4.3):
 * 1) mais dias sem resposta primeiro; 2) maior valor primeiro.
 */
export class RepositorioOrcamentosMemoria implements OrcamentoRepository {
  private readonly orcamentos: Orcamento[];
  private readonly atrasoMs: number;

  constructor(opcoes: OpcoesRepositorioMemoria = {}) {
    this.orcamentos = opcoes.orcamentos ?? ORCAMENTOS_FICTICIOS;
    this.atrasoMs = opcoes.atrasoMs ?? 0;
  }

  private async esperar(): Promise<void> {
    if (this.atrasoMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.atrasoMs));
    }
  }

  async listar(): Promise<Orcamento[]> {
    await this.esperar();
    return [...this.orcamentos].sort(
      (a, b) => b.diasSemResposta - a.diasSemResposta || b.valor - a.valor,
    );
  }

  async resumo(): Promise<ResumoPainel> {
    await this.esperar();
    return calcularResumo(this.orcamentos, PERIODO_DEMO);
  }
}
