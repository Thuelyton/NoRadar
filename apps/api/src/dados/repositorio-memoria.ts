import type { Orcamento, RegistroResultado, ResumoPainel } from "@radar/shared";
import {
  aplicarResultado,
  calcularResumo,
  estaNaFila,
  ordenarPorUrgencia,
  type OrcamentoRepository,
  type ResultadoRegistro,
} from "../dominio/repositorio-orcamentos.js";
import { ORCAMENTOS_FICTICIOS, PERIODO_DEMO } from "./dados-ficticios.js";

export interface OpcoesRepositorioMemoria {
  orcamentos?: Orcamento[];
  /** Latência simulada em ms (0 = imediato). */
  atrasoMs?: number;
}

/** Cópia profunda defensiva de um orçamento. */
function copiarOrcamento(orcamento: Orcamento): Orcamento {
  return {
    ...orcamento,
    cliente: { ...orcamento.cliente },
    ultimoContato: orcamento.ultimoContato ? { ...orcamento.ultimoContato } : null,
  };
}

/**
 * Implementação em memória do contrato `OrcamentoRepository`.
 * Dados fictícios, sem banco de dados (decisão D2 — 2026-10-14).
 *
 * Os registros de resultado ALTERAM o estado desta instância (fila simulada),
 * mas o estado é uma cópia defensiva dos dados fictícios: duas instâncias
 * nunca compartilham mutações, e o arquivo de dados base nunca é alterado.
 * `reinicializar()` restaura o estado inicial com cópias frescas da base.
 */
export class RepositorioOrcamentosMemoria implements OrcamentoRepository {
  /** Base congelada (cópia defensiva) usada pela reinicialização segura. */
  private readonly base: Orcamento[];
  private readonly orcamentos: Orcamento[];
  private readonly atrasoMs: number;

  constructor(opcoes: OpcoesRepositorioMemoria = {}) {
    const base = opcoes.orcamentos ?? ORCAMENTOS_FICTICIOS;
    // Cópia profunda defensiva: registrar resultado nunca contamina outras
    // instâncias nem o array-exportado ORCAMENTOS_FICTICIOS.
    this.base = base.map(copiarOrcamento);
    this.orcamentos = this.base.map(copiarOrcamento);
    this.atrasoMs = opcoes.atrasoMs ?? 0;
  }

  private async esperar(): Promise<void> {
    if (this.atrasoMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.atrasoMs));
    }
  }

  async listar(): Promise<Orcamento[]> {
    await this.esperar();
    return ordenarPorUrgencia(this.orcamentos);
  }

  async fila(): Promise<Orcamento[]> {
    await this.esperar();
    return ordenarPorUrgencia(this.orcamentos.filter(estaNaFila));
  }

  async resumo(): Promise<ResumoPainel> {
    await this.esperar();
    return calcularResumo(this.orcamentos, PERIODO_DEMO);
  }

  async registrarResultado(
    id: string,
    registro: RegistroResultado,
  ): Promise<ResultadoRegistro> {
    await this.esperar();
    const indice = this.orcamentos.findIndex((o) => o.id === id);
    if (indice === -1) return { situacao: "nao_encontrado" };

    const atual = this.orcamentos[indice]!;
    // Só orçamentos aguardando follow-up são elegíveis para registro.
    // Registraro sobre um item fora da fila mascararia o estado real da demo.
    if (!estaNaFila(atual)) return { situacao: "ineligivel", orcamento: atual };

    const atualizado = aplicarResultado(atual, registro);
    this.orcamentos[indice] = atualizado;

    return { situacao: "registrado", orcamento: atualizado, resumo: await this.resumo() };
  }

  async reinicializar(): Promise<void> {
    await this.esperar();
    // Cópias frescas da base: nada do que foi registrado vaza para a reinicialização.
    this.orcamentos.splice(0, this.orcamentos.length, ...this.base.map(copiarOrcamento));
  }
}
